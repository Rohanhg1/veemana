import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x4CdC1572832995e2433d5e3bE57a7baabED8b6eD";

const ABI = [
  "function addTransaction(string,string,uint256,string,string) public",
  "function flagTransaction(uint256) public",
  "function addSignature(uint256) public",
  "function getTransaction(uint256) public view returns (tuple(string,string,uint256,string,string,uint8,bool,uint256))",
  "function transactionCount() public view returns (uint256)",
  "function flaggedCount() public view returns (uint256)",
  "event TransactionAdded(uint256 indexed,string,string,uint256)",
  "event TransactionFlagged(uint256 indexed)",
  "event SignatureAdded(uint256 indexed,uint8)"
];

export async function connectWallet() {
  if (!window.ethereum) {
    alert("Please install MetaMask!");
    return null;
  }

  // FORCE switch to Sepolia before anything else
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }], // Sepolia
    });
  } catch (switchError) {
    // If Sepolia not added, add it
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0xaa36a7',
          chainName: 'Sepolia test network',
          nativeCurrency: {
            name: 'SepoliaETH',
            symbol: 'ETH',
            decimals: 18
          },
          rpcUrls: ['https://sepolia.infura.io/v3/'],
          blockExplorerUrls: ['https://sepolia.etherscan.io']
        }]
      });
    }
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  
  // Verify we're on Sepolia
  const network = await provider.getNetwork();
  console.log("Connected to network:", network.chainId.toString());
  
  if (network.chainId.toString() !== '11155111') {
    alert("Please switch MetaMask to Sepolia test network!");
    return null;
  }
  
  return { signer, address: accounts[0] };
}

export function getContract(signer) {
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
}

export async function submitTransaction(fromEntity, toEntity, amount, scheme, ipfsHash) {
  const { signer } = await connectWallet();
  const contract = getContract(signer);
  const tx = await contract.addTransaction(
    fromEntity, toEntity,
    ethers.parseUnits(amount.toString(), 0),
    scheme, ipfsHash
  );
  await tx.wait();
  return tx.hash;
}

export async function flagTransaction(txId) {
  const { signer } = await connectWallet();
  const contract = getContract(signer);
  const tx = await contract.flagTransaction(txId);
  await tx.wait();
  return tx.hash;
}

export async function addSignature(txId) {
  const { signer } = await connectWallet();
  const contract = getContract(signer);
  const tx = await contract.addSignature(txId);
  await tx.wait();
  return tx.hash;
}

export async function getAllTransactions() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  
  // Force Sepolia
  const network = await provider.getNetwork();
  if (network.chainId.toString() !== '11155111') {
    console.log("Wrong network - need Sepolia");
    return [];
  }
  
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS, 
    ABI, 
    provider
  );
  
  const count = await contract.transactionCount();
  const txs = [];
  for (let i = 0; i < count; i++) {
    const tx = await contract.getTransaction(i);
    txs.push({
      id: i,
      fromEntity: tx[0],
      toEntity: tx[1],
      amount: tx[2].toString(),
      scheme: tx[3],
      ipfsHash: tx[4],
      signaturesReceived: Number(tx[5]),
      flagged: tx[6],
      timestamp: new Date(Number(tx[7]) * 1000).toLocaleString(),
      status: tx[6] ? "frozen" : (Number(tx[5]) > 0 ? "approved" : "pending")
    });
  }
  return txs;
}
