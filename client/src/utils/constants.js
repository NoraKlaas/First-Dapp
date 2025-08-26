// Contract configuration
export const CONTRACT_ADDRESS = "0x06098349E55dd9C1587ab61813b23968624557a2";

// Contract ABI - only the functions we need
export const CONTRACT_ABI = [
  // Write functions
  {
    "inputs": [],
    "name": "startVoting",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "animal", "type": "uint256"}],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "endVoting",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "resetVoting",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Read functions
  {
    "inputs": [],
    "name": "isVotingActive",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllVotes",
    "outputs": [{"internalType": "uint256[5]", "name": "", "type": "uint256[5]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getWinner",
    "outputs": [
      {"internalType": "uint256", "name": "winner", "type": "uint256"},
      {"internalType": "uint256", "name": "winningVotes", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentRound",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "hasVotedThisRound",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Public state variables
  {
    "inputs": [],
    "name": "votingActive",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentRound",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "votes",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "address", "name": "voter", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "animal", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "round", "type": "uint256"}
    ],
    "name": "VoteCast",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "round", "type": "uint256"}
    ],
    "name": "VotingStarted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "round", "type": "uint256"}
    ],
    "name": "VotingEnded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "newRound", "type": "uint256"}
    ],
    "name": "VotingReset",
    "type": "event"
  }
];

// Animal configuration
export const ANIMALS = [
  {
    id: 0,
    name: "Tiger",
    image: "/src/assets/animals/tiger.png"
  },
  {
    id: 1,
    name: "Zebra", 
    image: "/src/assets/animals/zebra.png"
  },
  {
    id: 2,
    name: "Giraffe",
    image: "/src/assets/animals/giraffe.png"
  },
  {
    id: 3,
    name: "Lynx",
    image: "/src/assets/animals/lynx.png"
  },
  {
    id: 4,
    name: "Leopard",
    image: "/src/assets/animals/leopard.png"
  }
];

// Error messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: "Please connect your wallet to continue",
  VOTING_NOT_ACTIVE: "Voting is not currently active",
  ALREADY_VOTED: "You have already voted in this round",
  INVALID_ANIMAL: "Invalid animal selection",
  ONLY_OWNER: "Only the contract owner can perform this action",
  TRANSACTION_REJECTED: "Transaction was rejected by user",
  NETWORK_ERROR: "Network error occurred. Please try again",
  CONTRACT_ERROR: "Contract interaction failed",
  INSUFFICIENT_GAS: "Insufficient gas for transaction"
};

// Success messages
export const SUCCESS_MESSAGES = {
  VOTE_CAST: "Your vote has been cast successfully",
  VOTING_STARTED: "Voting has been started",
  VOTING_ENDED: "Voting has been ended", 
  VOTING_RESET: "Voting has been reset for a new round",
  WALLET_CONNECTED: "Wallet connected successfully"
};

// Network configuration (optional - adjust based on your needs)
export const SUPPORTED_NETWORKS = {
  1: "Ethereum Mainnet",
  5: "Goerli Testnet",
  11155111: "Sepolia Testnet",
  137: "Polygon Mainnet",
  80001: "Mumbai Testnet"
};

// Default network (adjust based on where your contract is deployed)
export const DEFAULT_NETWORK_ID = 11155111; // Sepolia testnet