# Betsu-Betsu (別々) - Level 3 Orange Belt Submission

Betsu-Betsu (formerly StellarSplit) is a Web3 split bill application built on the Stellar Testnet. It allows users to calculate their share of a bill and send a multi-operation transaction using `StellarWalletsKit`. 

This project was upgraded to complete the **Level 3 - Orange Belt** challenge, introducing advanced smart contract architecture, rigorous testing, and production-ready CI/CD pipelines.

## Features Completed
- [x] **Advanced Smart Contracts**: Implemented inter-contract communication. The primary `SplitTracker` seamlessly invokes a secondary `FeeVault` contract to securely deposit a 1% platform fee during each split.
- [x] **Smart Contract Testing**: Rigorous Rust unit tests covering state changes, cross-contract calls, and `require_auth` enforcement (`test_auth_enforcement`).
- [x] **Event Streaming & Real-Time Updates**: Integrated `rpcServer.getEvents()` to actively stream and display real-time ledger events directly in the Activity Feed UI.
- [x] **Frontend Testing Suite**: Configured **Jest** and **React Testing Library** with comprehensive assertions covering component states and successful/failed transaction flows.
- [x] **CI/CD Pipeline Setup**: Added a GitHub Actions workflow (`.github/workflows/ci.yml`) that automatically builds the WASM, runs Rust tests, installs Node dependencies, and executes the Next.js production build on every push to `main`.
- [x] **Multi-Wallet Support**: Interacts seamlessly with Freighter, Albedo, xBull, and LOBSTR via `@creit.tech/stellar-wallets-kit`.
- [x] **Production UI/UX**: Fully mobile-responsive interface utilizing Tailwind CSS grids, robust loading spinners, and graceful network error states (handling ISP RPC blocks gracefully).

## Tech Stack
- Next.js 16 (App Router)
- TypeScript & Tailwind CSS
- `@stellar/stellar-sdk` & `@creit.tech/stellar-wallets-kit`
- `soroban-sdk` (Rust Smart Contracts)
- **Jest & React Testing Library** (Frontend Testing)
- **GitHub Actions** (CI/CD)

## Smart Contract Details
- **Network**: Testnet
- **Primary Contract (SplitTracker)**: `CC47KRT7GVWUKUUHWENOV4USRXKIVHDLWRJM5FYAI4F5QFO7SRM5BF42`
- **Secondary Contract (FeeVault)**: `[Deployment Pending]` (Uses mock address locally or configures via `.env`)
- **Functions**: `record_split(payer, host, fee_vault, amount)`, `get_total_volume()`, `deposit_fee(contract_id, amount)`, `get_total_fees()`

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd stellar-monthly
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run tests**:
   ```bash
   # Run frontend UI tests
   npm run test
   
   # Run smart contract tests
   cd contracts && cargo test
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Navigate to [http://localhost:3000](http://localhost:3000)

## Testing the Application
- Connect your Stellar Wallet (Freighter, Albedo, etc.) on the **Testnet**.
- *Note: If you see "ISP Block Detected", turn on a VPN (like 1.1.1.1).*
- Observe the **Live Activity** feed streaming real-time events.
- Click "Pay Share Now" to execute the multi-operation transaction (Payment + InvokeHostFunction).

## Proof of Submission

### 🌐 Live Demo
- **Demo URL**: [Insert Vercel/Netlify Link Here]

### 📜 Smart Contracts
- **Primary Contract (SplitTracker) Address**: `CC47KRT7GVWUKUUHWENOV4USRXKIVHDLWRJM5FYAI4F5QFO7SRM5BF42`
- **Secondary Contract (FeeVault) Address**: `[Insert Deployment Address Here]`
- **Transaction Hash (Contract Interaction)**: `[Insert Transaction Hash Here]`

### 📸 Screenshots
#### Mobile Responsive UI
> *(Insert screenshot showing the UI beautifully wrapped on a mobile screen)*

#### CI/CD Pipeline Running
> *(Insert screenshot of GitHub Actions green checkmarks)*

#### Test Output (3+ Passing Tests)
> *(Insert screenshot of `cargo test` and `npm run test` passing successfully)*

### 🎥 Demo Video
- **Video Link**: [Insert YouTube/Loom Link Here (1-2 minutes)]

---
Built with 🩵 for the Stellar Ecosystem.
