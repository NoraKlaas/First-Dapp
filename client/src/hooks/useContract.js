import { useState, useEffect, useCallback } from 'react';
import { 
  initializeWeb3,
  getContractOwner,
  startVoting,
  endVoting,
  resetVoting,
  vote
} from '../utils/contractServices.js';
import { compareAddresses, getErrorMessage, parseContractError } from '../utils/helpers.js';
import { SUCCESS_MESSAGES } from '../utils/constants.js';

export const useContract = (userAddress, isWalletConnected) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [contractOwner, setContractOwner] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize contract when wallet is connected
  const initializeContract = useCallback(async () => {
    if (!isWalletConnected) {
      setIsInitialized(false);
      setIsOwner(false);
      setContractOwner('');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await initializeWeb3();
      const owner = await getContractOwner();
      
      setContractOwner(owner);
      setIsOwner(compareAddresses(userAddress, owner));
      setIsInitialized(true);
      
    } catch (err) {
      console.error('Failed to initialize contract:', err);
      setError(getErrorMessage(err));
      setIsInitialized(false);
    } finally {
      setIsLoading(false);
    }
  }, [isWalletConnected, userAddress]);

  // Admin function: Start voting
  const handleStartVoting = useCallback(async () => {
    if (!isOwner) {
      throw new Error('Only contract owner can start voting');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await startVoting();
      
      return {
        success: true,
        message: SUCCESS_MESSAGES.VOTING_STARTED,
        transactionHash: result.transactionHash
      };
    } catch (err) {
      console.error('Failed to start voting:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isOwner]);

  // Admin function: End voting
  const handleEndVoting = useCallback(async () => {
    if (!isOwner) {
      throw new Error('Only contract owner can end voting');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await endVoting();
      
      return {
        success: true,
        message: SUCCESS_MESSAGES.VOTING_ENDED,
        transactionHash: result.transactionHash
      };
    } catch (err) {
      console.error('Failed to end voting:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isOwner]);

  // Admin function: Reset voting
  const handleResetVoting = useCallback(async () => {
    if (!isOwner) {
      throw new Error('Only contract owner can reset voting');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await resetVoting();
      
      return {
        success: true,
        message: SUCCESS_MESSAGES.VOTING_RESET,
        transactionHash: result.transactionHash
      };
    } catch (err) {
      console.error('Failed to reset voting:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isOwner]);

  // User function: Cast vote
  const handleVote = useCallback(async (animalId) => {
    if (!isWalletConnected) {
      throw new Error('Wallet not connected');
    }
    
    if (animalId < 0 || animalId > 4) {
      throw new Error('Invalid animal selection');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await vote(animalId);
      
      return {
        success: true,
        message: SUCCESS_MESSAGES.VOTE_CAST,
        transactionHash: result.transactionHash,
        animalId: result.animalId
      };
    } catch (err) {
      console.error('Failed to cast vote:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isWalletConnected]);

  // Update owner status when user address changes
  useEffect(() => {
    if (contractOwner && userAddress) {
      setIsOwner(compareAddresses(userAddress, contractOwner));
    } else {
      setIsOwner(false);
    }
  }, [userAddress, contractOwner]);

  // Initialize contract when wallet connection status changes
  useEffect(() => {
    initializeContract();
  }, [initializeContract]);

  // Clear error after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    isInitialized,
    isOwner,
    contractOwner,
    isLoading,
    error,
    handleStartVoting,
    handleEndVoting,
    handleResetVoting,
    handleVote,
    initializeContract
  };
};