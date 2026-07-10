import {
  StellarWalletsKit,
  Networks,
} from '@creit.tech/stellar-wallets-kit';
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { AlbedoModule } from '@creit.tech/stellar-wallets-kit/modules/albedo';

import * as StellarSdk from '@stellar/stellar-sdk';
import { Contract, nativeToScVal, scValToNative, rpc } from '@stellar/stellar-sdk';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const RPC_URL = 'https://soroban-testnet.stellar.org/';
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

export const server = new StellarSdk.Horizon.Server(HORIZON_URL);
export const rpcServer = new rpc.Server(RPC_URL);

export const PLATFORM_FEE_ADDRESS = 'GCL5GAEEOXL36MREN3QIIATAT732QPFOKHRKN7U56KOTPQIFXIDY3NYY';
export const CONTRACT_ADDRESS = 'CC47KRT7GVWUKUUHWENOV4USRXKIVHDLWRJM5FYAI4F5QFO7SRM5BF42';

import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull';
import { LobstrModule } from '@creit.tech/stellar-wallets-kit/modules/lobstr';

let isKitInitialized = false;
export function initKit() {
    if (!isKitInitialized) {
        StellarWalletsKit.init({
            network: Networks.TESTNET,
            selectedWalletId: 'freighter',
            modules: [
                new FreighterModule(),
                new AlbedoModule(),
                new xBullModule(),
                new LobstrModule(),
            ],
        });
        isKitInitialized = true;
    }
}

export async function connectWallet(): Promise<string | null> {
    initKit();
    try {
        const result = await StellarWalletsKit.authModal();
        return result.address;
    } catch (e) {
        console.warn("Wallet connection cancelled or failed:", e);
        return null;
    }
}

export async function fetchBalance(publicKey: string): Promise<string> {
  try {
    const account = await server.loadAccount(publicKey);
    const xlmBalance = account.balances.find((b) => b.asset_type === 'native');
    return xlmBalance ? xlmBalance.balance : '0';
  } catch (error) {
    console.error('Error fetching balance:', error);
    return '0';
  }
}

export async function splitBillTransaction(
  payerPublicKey: string,
  hostPublicKey: string,
  totalXlm: number,
  platformFeeAddress: string = PLATFORM_FEE_ADDRESS
): Promise<string> {
  initKit();
  try {
    const payerAccount = await server.loadAccount(payerPublicKey);
    const hostAmount = (totalXlm * 0.99).toFixed(7);
    const feeAmount = (totalXlm * 0.01).toFixed(7);

    // --- TRANSACTION 1: XLM Payments ---
    const paymentTx = new StellarSdk.TransactionBuilder(payerAccount, {
      fee: '100000',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(StellarSdk.Operation.payment({
        destination: hostPublicKey,
        asset: StellarSdk.Asset.native(),
        amount: hostAmount,
      }))
      .addOperation(StellarSdk.Operation.payment({
        destination: platformFeeAddress,
        asset: StellarSdk.Asset.native(),
        amount: feeAmount,
      }))
      .setTimeout(60)
      .build();

    let signedPaymentXdr: string;
    try {
        const result = await StellarWalletsKit.signTransaction(paymentTx.toXDR(), { 
            networkPassphrase: NETWORK_PASSPHRASE,
            address: payerPublicKey 
        });
        signedPaymentXdr = result.signedTxXdr || result as unknown as string;
    } catch (err) {
        throw new Error("Payment transaction rejected by user");
    }
    
    const txToSubmit1 = StellarSdk.TransactionBuilder.fromXDR(signedPaymentXdr, NETWORK_PASSPHRASE);
    const response1 = await server.submitTransaction(txToSubmit1);
    if (!response1.successful) {
        throw new Error("Payment transaction failed to submit");
    }

    // --- TRANSACTION 2: Record Split in Soroban ---
    // Note: We need to reload the account because the sequence number has incremented!
    const updatedAccount = await server.loadAccount(payerPublicKey);
    const contract = new Contract(CONTRACT_ADDRESS);
    const amountVal = Math.floor(totalXlm * 10000000);
    
    // In Level 3 deployment, fee vault will be a separate deployed contract.
    // Fallback to CONTRACT_ADDRESS if not configured in .env to prevent local crash.
    const feeVaultAddress = process.env.NEXT_PUBLIC_FEE_VAULT_ADDRESS || CONTRACT_ADDRESS;
    
    const invokeOp = contract.call("record_split",
      nativeToScVal(payerPublicKey, { type: "address" }),
      nativeToScVal(hostPublicKey, { type: "address" }),
      nativeToScVal(feeVaultAddress, { type: "address" }),
      nativeToScVal(amountVal, { type: "i128" })
    );

    const invokeTx = new StellarSdk.TransactionBuilder(updatedAccount, {
      fee: '100000',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(invokeOp)
      .setTimeout(60)
      .build();

    const preparedInvokeTx = await rpcServer.prepareTransaction(invokeTx);
    
    let signedInvokeXdr: string;
    try {
        const result2 = await StellarWalletsKit.signTransaction(preparedInvokeTx.toXDR(), { 
            networkPassphrase: NETWORK_PASSPHRASE,
            address: payerPublicKey 
        });
        signedInvokeXdr = result2.signedTxXdr || result2 as unknown as string;
    } catch (err) {
        throw new Error("Smart contract transaction rejected by user");
    }
    
    const txToSubmit2 = StellarSdk.TransactionBuilder.fromXDR(signedInvokeXdr, NETWORK_PASSPHRASE);
    const response2 = await rpcServer.sendTransaction(txToSubmit2);
    
    if (response2.status === 'ERROR') {
        throw new Error("Smart contract transaction failed to submit");
    }
    return response2.hash;
  } catch (error) {
    console.error('Error during transaction:', error);
    throw error;
  }
}

export async function getTotalVolume(): Promise<number> {
    try {
        const contract = new Contract(CONTRACT_ADDRESS);
        const invokeOp = contract.call("get_total_volume");
        
        const account = new StellarSdk.Account('GCL5GAEEOXL36MREN3QIIATAT732QPFOKHRKN7U56KOTPQIFXIDY3NYY', '0');
        const transaction = new StellarSdk.TransactionBuilder(account, { fee: '100', networkPassphrase: NETWORK_PASSPHRASE })
            .addOperation(invokeOp)
            .setTimeout(30)
            .build();
            
        const simulated = await rpcServer.simulateTransaction(transaction);
        if (rpc.Api.isSimulationSuccess(simulated) && simulated.result) {
            const val = scValToNative(simulated.result.retval);
            return Number(val) / 10000000;
        }
        return 0;
    } catch(e) {
        console.warn("Failed to fetch total volume (likely ISP block)", e);
        return 0;
    }
}
