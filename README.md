# 🔗 ClearLedger — Blockchain Fund Tracker

> A transparent, blockchain-powered government fund tracking system built on Ethereum (Sepolia Testnet). ClearLedger ensures every rupee of public funding is logged immutably on-chain, auditable by citizens, and flaggable by watchdogs.

---

## 📸 Overview

ClearLedger tracks fund disbursement across Indian government schemes (MGNREGA, Healthcare, Agriculture, Education) using:
- **Smart Contracts** on Ethereum Sepolia testnet
- **MetaMask** for wallet-based authentication
- **React + Vite** for a modern, responsive dashboard
- **Ethers.js** for on-chain interaction

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, TailwindCSS |
| Blockchain | Solidity, Ethereum (Sepolia Testnet) |
| Wallet | MetaMask |
| Web3 Library | Ethers.js v6 |
| IDE for Contract | Remix IDE |
| Maps | React-Leaflet |
| Charts | Recharts |
| Animations | Framer Motion |

---

## ⚙️ Prerequisites

Before running this project, ensure you have:

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9 or higher
- [MetaMask](https://metamask.io/) browser extension installed
- A free [Infura](https://infura.io/) account (for RPC access)
- Some **Sepolia test ETH** (free from a faucet)

---

## 🦊 MetaMask Setup

### Step 1 — Install MetaMask
1. Go to [https://metamask.io/download/](https://metamask.io/download/)
2. Install the browser extension (Chrome/Firefox/Edge)
3. Create a new wallet and **save your Secret Recovery Phrase securely**

### Step 2 — Switch to Sepolia Testnet
1. Open MetaMask
2. Click the network dropdown at the top (usually says "Ethereum Mainnet")
3. Click **"Show test networks"** → Toggle it ON
4. Select **"Sepolia"** from the network list

> If Sepolia is not listed, add it manually:
> - **Network Name:** Sepolia test network
> - **RPC URL:** `https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID`
> - **Chain ID:** `11155111`
> - **Currency Symbol:** `ETH`
> - **Block Explorer:** `https://sepolia.etherscan.io`

### Step 3 — Get Free Sepolia ETH (Test Funds)
You need test ETH to pay gas fees. Get some for free:

| Faucet | URL |
|---|---|
| Alchemy Faucet | https://sepoliafaucet.com/ |
| Infura Faucet | https://www.infura.io/faucet/sepolia |
| Chainlink Faucet | https://faucets.chain.link/sepolia |

Paste your MetaMask wallet address and request test ETH — it arrives in ~1 minute.

---

## 📝 Smart Contract Setup (Remix IDE)

### Step 1 — Open Remix
Go to [https://remix.ethereum.org/](https://remix.ethereum.org/)

### Step 2 — Create the Contract
1. In the file explorer (left panel), click the **"+"** icon
2. Name the file: `ClearLedger.sol`
3. Paste the following Solidity contract:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ClearLedger {
    enum Status { Pending, Approved, Rejected }

    struct Transaction {
        string fromEntity;
        string toEntity;
        uint256 amount;
        string scheme;
        string ipfsHash;
        uint8 signaturesReceived;
        bool flagged;
        uint256 timestamp;
    }

    Transaction[] public transactions;
    uint256 public transactionCount;
    uint256 public flaggedCount;

    event TransactionAdded(uint256 indexed id, string fromEntity, string toEntity, uint256 amount);
    event TransactionFlagged(uint256 indexed id);
    event SignatureAdded(uint256 indexed id, uint8 sigCount);

    function addTransaction(
        string memory _from,
        string memory _to,
        uint256 _amount,
        string memory _scheme,
        string memory _ipfsHash
    ) public {
        transactions.push(Transaction({
            fromEntity: _from,
            toEntity: _to,
            amount: _amount,
            scheme: _scheme,
            ipfsHash: _ipfsHash,
            signaturesReceived: 0,
            flagged: false,
            timestamp: block.timestamp
        }));
        emit TransactionAdded(transactionCount, _from, _to, _amount);
        transactionCount++;
    }

    function flagTransaction(uint256 _id) public {
        require(_id < transactionCount, "Invalid ID");
        transactions[_id].flagged = true;
        flaggedCount++;
        emit TransactionFlagged(_id);
    }

    function addSignature(uint256 _id) public {
        require(_id < transactionCount, "Invalid ID");
        transactions[_id].signaturesReceived++;
        emit SignatureAdded(_id, transactions[_id].signaturesReceived);
    }

    function getTransaction(uint256 _id) public view returns (
        string memory, string memory, uint256, string memory,
        string memory, uint8, bool, uint256
    ) {
        Transaction memory t = transactions[_id];
        return (t.fromEntity, t.toEntity, t.amount, t.scheme,
                t.ipfsHash, t.signaturesReceived, t.flagged, t.timestamp);
    }
}
```

### Step 3 — Compile the Contract
1. Click the **Solidity Compiler** tab (left sidebar — looks like `< >`)
2. Select compiler version **`0.8.0`** or higher
3. Click **"Compile ClearLedger.sol"**
4. You should see a green checkmark ✅

### Step 4 — Deploy to Sepolia
1. Click the **Deploy & Run Transactions** tab (left sidebar — looks like Ethereum logo)
2. Set **Environment** to: `Injected Provider - MetaMask`
3. MetaMask will pop up → **Connect** your wallet
4. Make sure MetaMask is on **Sepolia** network
5. Click **"Deploy"**
6. MetaMask will ask to confirm → Click **"Confirm"**
7. Wait ~15 seconds for the transaction to be mined

### Step 5 — Copy the Contract Address
1. After deployment, expand the contract in Remix's bottom panel
2. Copy the **contract address** (starts with `0x...`)
3. Paste it into `src/utils/contract.js` at line 3:
   ```js
   const CONTRACT_ADDRESS = "0xYourDeployedContractAddress";
   ```

---

## 🔐 Environment Variables

Sensitive configuration should never be hardcoded. Use a `.env` file:

### Step 1 — Create your `.env` file
```bash
cp .env.example .env
```

### Step 2 — Fill in your values
Open `.env` and replace the placeholder values:

```env
VITE_CONTRACT_ADDRESS=0xYourContractAddressHere
VITE_INFURA_PROJECT_ID=your_infura_project_id_here
VITE_ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

> ⚠️ **Never commit `.env` to GitHub.** It is already listed in `.gitignore`.

---

## 🚀 Running the Project Locally

### Step 1 — Clone the Repository
```bash
git clone https://github.com/Yashas40/blockchain.git
cd blockchain
```

### Step 2 — Install Dependencies
```bash
npm install
```

### Step 3 — Set Up Environment Variables
```bash
cp .env.example .env
# Then edit .env with your values
```

### Step 4 — Start the Development Server
```bash
npm run dev
```

### Step 5 — Open in Browser
Navigate to: **http://localhost:5173/**

Connect your MetaMask wallet when prompted — the app will auto-detect it.

---

## 🗂️ Project Structure

```
stitch_clearledger_blockchain_fund_tracker/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   ├── context/            # React context providers
│   ├── data/               # Static mock/real data
│   ├── pages/              # Route-level page components
│   │   ├── Login.jsx       # Wallet login screen
│   │   ├── Dashboard.jsx   # Fund overview dashboard
│   │   ├── FundLedger.jsx  # On-chain transaction ledger
│   │   ├── FundRelease.jsx # Submit new fund transactions
│   │   ├── Verify.jsx      # Verify & sign transactions
│   │   ├── FlagReport.jsx  # Flag suspicious transactions
│   │   ├── AuditExport.jsx # Export audit reports
│   │   ├── VillageMap.jsx  # Geographic fund map
│   │   └── AuditorReview.jsx # Auditor review panel
│   ├── utils/
│   │   └── contract.js     # Ethers.js contract interaction
│   ├── App.jsx             # Root app + routing
│   └── main.jsx            # Entry point
├── .env.example            # Template for environment variables
├── .gitignore              # Files excluded from Git
├── index.html              # HTML entry point
├── package.json            # Project dependencies
├── tailwind.config.js      # TailwindCSS config
└── vite.config.js          # Vite build config
```

---

## 🌐 Useful Commands

| Command | Description |
|---|---|
| `npm install` | Install all dependencies |
| `npm run dev` | Start dev server at localhost:5173 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

---

## 🔍 Verifying Transactions on Etherscan

After any on-chain transaction, you can verify it at:

**https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS**

Replace `YOUR_CONTRACT_ADDRESS` with your deployed contract address.

---

## 🧪 Testing the App

1. Login with MetaMask (Sepolia network)
2. Go to **Fund Release** → Submit a new transaction
3. Go to **Fund Ledger** → View all on-chain transactions
4. Go to **Verify** → Approve/sign a transaction
5. Go to **Flag Report** → Flag a suspicious transaction
6. Go to **Audit Export** → Download PDF audit report
7. Go to **Village Map** → See geographic fund distribution

---

## ❓ Troubleshooting

| Problem | Solution |
|---|---|
| MetaMask not detected | Install MetaMask extension and refresh the page |
| Wrong network error | Switch MetaMask to **Sepolia** testnet |
| Transaction fails | Check you have enough Sepolia ETH (get from faucet) |
| Contract not found | Verify the contract address in `src/utils/contract.js` |
| `npm install` fails | Ensure Node.js v18+ is installed: `node --version` |
| Port 5173 in use | Run `npm run dev -- --port 3000` to use a different port |

---

## 📄 License

MIT License — feel free to fork and build upon this project.

---

## 🙌 Acknowledgements

- [Ethereum Foundation](https://ethereum.org/) — Blockchain infrastructure
- [OpenZeppelin](https://openzeppelin.com/) — Solidity best practices
- [Infura](https://infura.io/) — Ethereum RPC provider
- [Remix IDE](https://remix.ethereum.org/) — In-browser Solidity IDE
- [MetaMask](https://metamask.io/) — Web3 wallet
