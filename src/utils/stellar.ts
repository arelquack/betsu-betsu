import {
  StellarWalletsKit,
  Networks,
} from '@creit.tech/stellar-wallets-kit';
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { AlbedoModule } from '@creit.tech/stellar-wallets-kit/modules/albedo';

const FREIGHTER_ID = 'freighter';
import * as StellarSdk from '@stellar/stellar-sdk';
import { Contract, nativeToScVal, scValToNative, rpc } from '@stellar/stellar-sdk';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

export const server = new StellarSdk.Horizon.Server(HORIZON_URL);
export const rpcServer = new rpc.Server(RPC_URL);

export const PLATFORM_FEE_ADDRESS = 'GCL5GAEEOXL36MREN3QIIATAT732QPFOKHRKN7U56KOTPQIFXIDY3NYY';
export const CONTRACT_ADDRESS = 'CC47KRT7GVWUKUUHWENOV4USRXKIVHDLWRJM5FYAI4F5QFO7SRM5BF42';

let isKitInitialized = false;
export function initKit() {
    if (!isKitInitialized) {
        StellarWalletsKit.init({
            network: Networks.TESTNET,
            selectedWalletId: FREIGHTER_ID,
            modules: [
                new FreighterModule(),
                new AlbedoModule(),
            ],
        });
        isKitInitialized = true;
    }
}

export async function connectWallet(walletId: string = FREIGHTER_ID): Promise<string> {
    initKit();
    StellarWalletsKit.setWallet(walletId);
    try {
        const result = await StellarWalletsKit.getAddress();
        return result.address;
    } catch (e) {
        throw new Error("Wallet connection rejected or not found.");
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

    const contract = new Contract(CONTRACT_ADDRESS);
    const amountVal = Math.floor(totalXlm * 10000000);
    const invokeOp = contract.call("record_split",
      nativeToScVal(payerPublicKey, { type: "address" }),
      nativeToScVal(hostPublicKey, { type: "address" }),
      nativeToScVal(amountVal, { type: "i128" })
    );

    const transaction = new StellarSdk.TransactionBuilder(payerAccount, {
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
      .addOperation(invokeOp)
      .setTimeout(60)
      .build();

    const preparedTx = await rpcServer.prepareTransaction(transaction);
    
    let signedXdr: string;
    try {
        const result = await StellarWalletsKit.signTransaction(preparedTx.toXDR(), { 
            networkPassphrase: NETWORK_PASSPHRASE,
            address: payerPublicKey 
        });
        signedXdr = result.signedTxXdr || result as unknown as string;
    } catch (err) {
        throw new Error("Transaction rejected by user");
    }
    
    const transactionToSubmit = StellarSdk.TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
    const response = await rpcServer.sendTransaction(transactionToSubmit);
    
    if (response.status === 'ERROR') {
        throw new Error("Transaction failed to submit");
    }
    return response.hash;
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
        console.error("Failed to fetch total volume", e);
        return 0;
    }
}
