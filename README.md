# StellarSplit (Level 1 - White Belt Submission)

StellarSplit is a Web3 split bill application built on the Stellar Testnet. It allows users to calculate their share of a bill and send a multi-operation transaction (99% to the Host, 1% micro-fee to the Platform) using the Freighter Wallet.

This project was built to complete the **Level 1 - White Belt** challenge.

## Features Completed
- [x] Set up the Freighter wallet on Stellar Testnet
- [x] Implement wallet connect and disconnect functionality
- [x] Fetch and display the connected wallet's XLM balance
- [x] Send an XLM transaction on the Stellar Testnet (Multi-operation: Split Share + Platform Fee)
- [x] Show transaction feedback (Success with Hash / Error messages)

## Tech Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- `@stellar/stellar-sdk`
- `@stellar/freighter-api`
- `lucide-react` (Icons)

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

5. **Test the Application**:
   - Ensure you have the **Freighter Wallet** extension installed in your browser.
   - Switch your Freighter Network to **Testnet**.
   - Fund your wallet using the Freighter faucet if your balance is 0.
   - Click "Connect Freighter Wallet" on the app.
   - Enter a Total Bill, Number of People, and a Host Wallet Address (use another testnet address).
   - Click "Pay Share Now", approve the transaction in Freighter, and view the success link on Stellar Expert!

## Screenshots

### 1. Wallet Connected State
> *(Replace this with your screenshot of the connected wallet showing public key)*
> `![Wallet Connected](./screenshots/wallet-connected.png)`

### 2. Balance Displayed
> *(Replace this with your screenshot of the balance shown in the UI)*
> `![Balance Displayed](./screenshots/balance-displayed.png)`

### 3. Successful Testnet Transaction
> *(Replace this with your screenshot of Freighter wallet approving the transaction)*
> `![Transaction Approval](./screenshots/transaction-approval.png)`

### 4. Transaction Result Shown to User
> *(Replace this with your screenshot of the success notification and Transaction Hash link)*
> `![Transaction Result](./screenshots/transaction-result.png)`

---
Built with 🩵 for the Stellar Ecosystem.
