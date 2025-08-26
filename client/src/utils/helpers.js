// Address formatting utilities
export const formatAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const isValidAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const compareAddresses = (addr1, addr2) => {
  if (!addr1 || !addr2) return false;
  return addr1.toLowerCase() === addr2.toLowerCase();
};

// Number formatting utilities
export const formatVoteCount = (count) => {
  if (count === undefined || count === null) return "0";
  return count.toString();
};

export const formatPercentage = (votes, total) => {
  if (!total || total === 0) return "0%";
  const percentage = (votes / total) * 100;
  return `${percentage.toFixed(1)}%`;
};

export const calculateTotalVotes = (votesArray) => {
  if (!Array.isArray(votesArray)) return 0;
  return votesArray.reduce((sum, votes) => sum + Number(votes), 0);
};

// Validation utilities
export const isValidAnimalId = (animalId) => {
  const id = Number(animalId);
  return Number.isInteger(id) && id >= 0 && id <= 4;
};

export const isValidRound = (round) => {
  const r = Number(round);
  return Number.isInteger(r) && r > 0;
};

// Error handling utilities
export const getErrorMessage = (error) => {
  if (!error) return "An unknown error occurred";
  
  // Check for common error patterns
  if (error.message) {
    const message = error.message.toLowerCase();
    
    if (message.includes("user rejected") || message.includes("user denied")) {
      return "Transaction was rejected by user";
    }
    
    if (message.includes("insufficient funds")) {
      return "Insufficient funds for transaction";
    }
    
    if (message.includes("voting not active")) {
      return "Voting is not currently active";
    }
    
    if (message.includes("already voted")) {
      return "You have already voted in this round";
    }
    
    if (message.includes("only owner")) {
      return "Only the contract owner can perform this action";
    }
    
    if (message.includes("invalid animal")) {
      return "Invalid animal selection";
    }
    
    // Return the original message if it's user-friendly
    if (error.message.length < 100) {
      return error.message;
    }
  }
  
  return "Transaction failed. Please try again";
};

// Contract interaction utilities
export const parseContractError = (error) => {
  // Extract revert reason from contract error
  if (error.data && error.data.message) {
    return error.data.message;
  }
  
  if (error.reason) {
    return error.reason;
  }
  
  return getErrorMessage(error);
};

// Array utilities for votes
export const getWinnerFromVotes = (votesArray) => {
  if (!Array.isArray(votesArray) || votesArray.length !== 5) {
    return { winner: 0, winningVotes: 0 };
  }
  
  let maxVotes = 0;
  let winner = 0;
  
  for (let i = 0; i < votesArray.length; i++) {
    const votes = Number(votesArray[i]);
    if (votes > maxVotes) {
      maxVotes = votes;
      winner = i;
    }
  }
  
  return { winner, winningVotes: maxVotes };
};

export const checkForTie = (votesArray) => {
  if (!Array.isArray(votesArray) || votesArray.length !== 5) {
    return false;
  }
  
  const { winningVotes } = getWinnerFromVotes(votesArray);
  
  if (winningVotes === 0) return false;
  
  const winnersCount = votesArray.filter(votes => Number(votes) === winningVotes).length;
  return winnersCount > 1;
};

// Loading state utilities
export const createLoadingState = (action) => {
  return {
    isLoading: true,
    action: action,
    message: `${action}...`
  };
};

export const clearLoadingState = () => {
  return {
    isLoading: false,
    action: null,
    message: null
  };
};

// Data transformation utilities
export const transformVotesForDisplay = (votesArray, animalsConfig) => {
  if (!Array.isArray(votesArray) || !Array.isArray(animalsConfig)) {
    return [];
  }
  
  const total = calculateTotalVotes(votesArray);
  
  return animalsConfig.map((animal, index) => ({
    ...animal,
    votes: Number(votesArray[index] || 0),
    percentage: formatPercentage(Number(votesArray[index] || 0), total)
  }));
};

// Local storage utilities (for caching non-sensitive data)
export const getCachedData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn("Failed to get cached data:", error);
    return null;
  }
};

export const setCachedData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn("Failed to cache data:", error);
  }
};

export const clearCachedData = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn("Failed to clear cached data:", error);
  }
};