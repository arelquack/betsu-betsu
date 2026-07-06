# Betsu-Betsu (別々) - Level 2 Yellow Belt Submission

Betsu-Betsu (formerly StellarSplit) is a Web3 split bill application built on the Stellar Testnet. It allows users to calculate their share of a bill and send a multi-operation transaction (99% to the Host, 1% micro-fee to the Platform) using `StellarWalletsKit`. Furthermore, it integrates a Soroban smart contract to track the total volume of splits recorded on the network.

This project was built to complete the **Level 2 - Yellow Belt** challenge.

## Features Completed
- [x] Integrate multiple wallets using `@creit.tech/stellar-wallets-kit` (Freighter & Albedo)
- [x] Handle 3 error types (Wallet not found, Connection rejected, Insufficient balance/Transaction rejected)
- [x] Deploy a Soroban smart contract to the testnet (`CC47KRT7GVWUKUUHWENOV4USRXKIVHDLWRJM5FYAI4F5QFO7SRM5BF42`)
- [x] Call contract functions from the frontend (`record_split` during payment)
- [x] Reading and writing data to a contract (`get_total_volume` and incrementing total)
- [x] Event listening and state synchronization (Live Network Stats via `ActivityFeed`)
- [x] Transaction status tracking (Pending/Success/Fail visible in UI)
- [x] Minimum 2+ meaningful commits

## Tech Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- `@stellar/stellar-sdk`
- `@creit.tech/stellar-wallets-kit`
- `soroban-sdk` (Rust Smart Contract)
- `lucide-react` (Icons)

## Smart Contract details
- **Network**: Testnet
- **Address**: `CC47KRT7GVWUKUUHWENOV4USRXKIVHDLWRJM5FYAI4F5QFO7SRM5BF42`
- **Functions**: `record_split(payer, host, amount)`, `get_total_volume()`

## Setup Instructions

1. **Clone the repository** (if not already local):
   ```bash
   git clone <your-repo-url>
   cd stellar-monthly
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Testing the Application
- Ensure you have a Stellar Wallet (Freighter or Albedo).
- Switch your Wallet Network to **Testnet** and fund it via friendbot.
- Connect your wallet.
- Observe the **Live Network Stats** syncing the total split volume from the smart contract.
- Enter a Total Bill, Number of People, and a Host Wallet Address.
- Click "Pay Share Now", approve the transaction in your wallet.
- The transaction will execute a `Payment` and an `InvokeHostFunction` (to `record_split`).
- After success, the Live Network Stats will update!

## Screenshots & Proofs

### 1. Wallet Options Available
> *(Replace this with screenshot showing Freighter & Albedo buttons)*

### 2. Transaction Hash of a Contract Call
> *(Replace this with a link/screenshot of a successful transaction hash verifiable on Stellar Explorer)*

---
Built with 🩵 for the Stellar Ecosystem.
