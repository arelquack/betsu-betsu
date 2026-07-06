import {
  isConnected,
  getAddress,
  signTransaction,
  isAllowed,
  setAllowed,
} from '@stellar/freighter-api';
import * as StellarSdk from '@stellar/stellar-sdk';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
const server = new StellarSdk.Horizon.Server(HORIZON_URL);

// Example Platform Fee Address for Testnet
export const PLATFORM_FEE_ADDRESS = 'GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFQJWENZAFAOSDZZOWKSA';

export async function checkFreighterInstalled(): Promise<boolean> {
  const result = await isConnected();
  return result.isConnected === true;
}

export async function connectWallet(): Promise<string | null> {
  try {
    const installed = await checkFreighterInstalled();
    if (installed) {
      const allowedRes = await isAllowed();
      if (!allowedRes.isAllowed) {
        await setAllowed();
      }
      const addressRes = await getAddress();
      if (addressRes.error) {
        console.error('Error getting address:', addressRes.error);
        return null;
      }
      return addressRes.address;
    }
    return null;
  } catch (error) {
    console.error('Error connecting wallet:', error);
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
  try {
    const payerAccount = await server.loadAccount(payerPublicKey);
    
    // Formatting amounts to 7 decimal places for Stellar
    const hostAmount = (totalXlm * 0.99).toFixed(7);
    const feeAmount = (totalXlm * 0.01).toFixed(7);

    const transaction = new StellarSdk.TransactionBuilder(payerAccount, {
      fee: '100', // BASE_FEE
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

    const signResult = await signTransaction(transaction.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE });
    if (signResult.error || !signResult.signedTxXdr) {
      throw new Error(signResult.error || 'Failed to sign transaction');
    }
    
    const transactionToSubmit = StellarSdk.TransactionBuilder.fromXDR(signResult.signedTxXdr, NETWORK_PASSPHRASE);
    const response = await server.submitTransaction(transactionToSubmit as any);
    
    return (response as any).hash;
  } catch (error) {
    console.error('Error during transaction:', error);
    throw error;
  }
}
