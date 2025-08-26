import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './constants.js';
import { parseContractError } from './helpers.js';

// Contract instance variables
let provider = null;
let signer = null;
let contract = null;
let contractWithSigner = null;

// Initialize Web3 provider and contract
export const initializeWeb3 = async () => {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask not found. Please install MetaMask.");
    }

    // Create provider
    provider = new ethers.BrowserProvider(window.ethereum);
    
    // Get signer
    signer = await provider.getSigner();
    
    // Create contract instances
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    contractWithSigner = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    return { provider, signer, contract };
  } catch (error) {
    console.error("Failed to initialize Web3:", error);
    throw error;
  }
};

// Get current user address
export const getCurrentAddress = async () => {
  try {
    if (!signer) {
      throw new Error("Wallet not connected");
    }
    return await signer.getAddress();
  } catch (error) {
    console.error("Failed to get current address:", error);
    throw error;
  }
};

// Connect wallet
export const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask not found");
    }
    
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Initialize Web3 after connection
    const web3Data = await initializeWeb3();
    
    return web3Data;
  } catch (error) {
    console.error("Failed to connect wallet:", error);
    throw error;
  }
};

// Check if wallet is connected
export const isWalletConnected = async () => {
  try {
    if (!window.ethereum) return false;
    
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts.length > 0;
  } catch (error) {
    console.error("Failed to check wallet connection:", error);
    return false;
  }
};

// CONTRACT READ FUNCTIONS (No gas required)

export const getVotingStatus = async () => {
  try {
    if (!contract) throw new Error("Contract not initialized");
    return await contract.isVotingActive();
  } catch (error) {
    console.error("Failed to get voting status:", error);
    throw error;
  }
};

export const getCurrentRound = async () => {
  try {
    if (!contract) throw new Error("Contract not initialized");
    const round = await contract.getCurrentRound();
    return Number(round);
  } catch (error) {
    console.error("Failed to get current round:", error);
    throw error;
  }
};

export const getAllVotes = async () => {
  try {
    if (!contract) throw new Error("Contract not initialized");
    const votes = await contract.getAllVotes();
    return votes.map(vote => Number(vote));
  } catch (error) {
    console.error("Failed to get all votes:", error);
    throw error;
  }
};

export const getWinner = async () => {
  try {
    if (!contract) throw new Error("Contract not initialized");
    const [winner, winningVotes] = await contract.getWinner();
    return {
      winner: Number(winner),
      winningVotes: Number(winningVotes)
    };
  } catch (error) {
    console.error("Failed to get winner:", error);
    throw error;
  }
};

export const getContractOwner = async () => {
  try {
    if (!contract) throw new Error("Contract not initialized");
    return await contract.owner();
  } catch (error) {
    console.error("Failed to get contract owner:", error);
    throw error;
  }
};

export const hasUserVotedThisRound = async (userAddress) => {
  try {
    if (!contract) throw new Error("Contract not initialized");
    if (!userAddress) throw new Error("User address required");
    
    return await contract.hasVotedThisRound(userAddress);
  } catch (error) {
    console.error("Failed to check user vote status:", error);
    throw error;
  }
};

export const getVotingState = async (userAddress) => {
  try {
    if (!contract) throw new Error("Contract not initialized");
    
    const [
      votingActive,
      currentRound,
      allVotes,
      winner,
      owner,
      hasVoted
    ] = await Promise.all([
      getVotingStatus(),
      getCurrentRound(),
      getAllVotes(),
      getWinner(),
      getContractOwner(),
      userAddress ? hasUserVotedThisRound(userAddress) : false
    ]);
    
    return {
      votingActive,
      currentRound,
      votes: allVotes,
      winner,
      owner,
      hasVoted: hasVoted || false
    };
  } catch (error) {
    console.error("Failed to get voting state:", error);
    throw error;
  }
};

// CONTRACT WRITE FUNCTIONS (Require gas)

export const startVoting = async () => {
  try {
    if (!contractWithSigner) throw new Error("Signer not available");
    
    const tx = await contractWithSigner.startVoting();
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error("Failed to start voting:", error);
    throw new Error(parseContractError(error));
  }
};

export const endVoting = async () => {
  try {
    if (!contractWithSigner) throw new Error("Signer not available");
    
    const tx = await contractWithSigner.endVoting();
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error("Failed to end voting:", error);
    throw new Error(parseContractError(error));
  }
};

export const resetVoting = async () => {
  try {
    if (!contractWithSigner) throw new Error("Signer not available");
    
    const tx = await contractWithSigner.resetVoting();
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error("Failed to reset voting:", error);
    throw new Error(parseContractError(error));
  }
};

export const vote = async (animalId) => {
  try {
    if (!contractWithSigner) throw new Error("Signer not available");
    if (animalId < 0 || animalId > 4) throw new Error("Invalid animal ID");
    
    const tx = await contractWithSigner.vote(animalId);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      animalId
    };
  } catch (error) {
    console.error("Failed to vote:", error);
    throw new Error(parseContractError(error));
  }
};

// EVENT LISTENING

export const setupEventListeners = (callbacks) => {
  try {
    if (!contract) throw new Error("Contract not initialized");
    
    // Remove existing listeners
    contract.removeAllListeners();
    
    // VoteCast event
    if (callbacks.onVoteCast) {
      contract.on("VoteCast", (voter, animal, round, event) => {
        callbacks.onVoteCast({
          voter,
          animal: Number(animal),
          round: Number(round),
          transactionHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber
        });
      });
    }
    
    // VotingStarted event
    if (callbacks.onVotingStarted) {
      contract.on("VotingStarted", (round, event) => {
        callbacks.onVotingStarted({
          round: Number(round),
          transactionHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber
        });
      });
    }
    
    // VotingEnded event
    if (callbacks.onVotingEnded) {
      contract.on("VotingEnded", (round, event) => {
        callbacks.onVotingEnded({
          round: Number(round),
          transactionHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber
        });
      });
    }
    
    // VotingReset event
    if (callbacks.onVotingReset) {
      contract.on("VotingReset", (newRound, event) => {
        callbacks.onVotingReset({
          newRound: Number(newRound),
          transactionHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber
        });
      });
    }
    
    return true;
  } catch (error) {
    console.error("Failed to setup event listeners:", error);
    return false;
  }
};

export const removeEventListeners = () => {
  try {
    if (contract) {
      contract.removeAllListeners();
    }
    return true;
  } catch (error) {
    console.error("Failed to remove event listeners:", error);
    return false;
  }
};

// UTILITY FUNCTIONS

export const estimateGas = async (functionName, params = []) => {
  try {
    if (!contractWithSigner) throw new Error("Signer not available");
    
    let gasEstimate;
    
    switch (functionName) {
      case 'startVoting':
        gasEstimate = await contractWithSigner.startVoting.estimateGas();
        break;
      case 'endVoting':
        gasEstimate = await contractWithSigner.endVoting.estimateGas();
        break;
      case 'resetVoting':
        gasEstimate = await contractWithSigner.resetVoting.estimateGas();
        break;
      case 'vote':
        gasEstimate = await contractWithSigner.vote.estimateGas(params[0]);
        break;
      default:
        throw new Error("Unknown function name");
    }
    
    return Number(gasEstimate);
  } catch (error) {
    console.error("Failed to estimate gas:", error);
    // Return default gas limit if estimation fails
    return 100000;
  }
};

export const getNetworkInfo = async () => {
  try {
    if (!provider) throw new Error("Provider not available");
    
    const network = await provider.getNetwork();
    return {
      chainId: Number(network.chainId),
      name: network.name
    };
  } catch (error) {
    console.error("Failed to get network info:", error);
    throw error;
  }
};

// Export contract instances for direct access if needed
export const getContractInstances = () => {
  return {
    provider,
    signer,
    contract,
    contractWithSigner
  };
};