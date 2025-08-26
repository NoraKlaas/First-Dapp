import { useState, useEffect, useCallback, useRef } from 'react';
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
import { 
  performFullHealthCheck, 
  performQuickHealthCheck,
  checkContractOwner as healthCheckOwner 
} from '../utils/contractHealthCheck.js';

export const useContract = (userAddress, isWalletConnected) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [contractOwner, setContractOwner] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [healthCheck, setHealthCheck] = useState(null);
  const [initializationAttempts, setInitializationAttempts] = useState(0);
  const [canRetry, setCanRetry] = useState(true);
  const attemptsRef = useRef(0);

  // Perform comprehensive contract health check
  const performHealthCheck = useCallback(async () => {
    try {
      const result = await performFullHealthCheck(userAddress);
      setHealthCheck(result);
      return result;
    } catch (err) {
      console.error('Health check failed:', err);
      const failedResult = {
        timestamp: new Date().toISOString(),
        overall: {
          healthy: false,
          canInitialize: false,
          canVote: false,
          healthPercentage: 0,
          error: err.message
        },
        checks: {}
      };
      setHealthCheck(failedResult);
      return failedResult;
    }
  }, [userAddress]);

  // Initialize contract with health checks and retry mechanism
  const initializeContract = useCallback(async (forceRetry = false) => {
    if (!isWalletConnected) {
      setIsInitialized(false);
      setIsOwner(false);
      setContractOwner('');
      setHealthCheck(null);
      setInitializationAttempts(0);
      setError(null);
      setCanRetry(true);
      attemptsRef.current = 0;
      return;
    }

    // Prevent excessive retry attempts
    if (!forceRetry && attemptsRef.current >= 3) {
      setError('Maximum initialization attempts reached. Please check your wallet connection and network.');
      setCanRetry(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Reset attempts counter if this is a fresh start (not a retry)
      if (forceRetry) {
        attemptsRef.current = 1;
        setInitializationAttempts(1);
      } else {
        // Increment attempt counter
        attemptsRef.current += 1;
        setInitializationAttempts(attemptsRef.current);
      }

      // Step 1: Quick health check
      console.log('Performing quick health check...');
      const quickCheck = await performQuickHealthCheck();
      if (!quickCheck.passed) {
        throw new Error(`Health check failed: ${quickCheck.message}`);
      }

      // Step 2: Perform full health check
      console.log('Performing full health check...');
      const fullCheck = await performHealthCheck();
      
      if (!fullCheck.overall.canInitialize) {
        const criticalErrors = fullCheck.overall.criticalFailures || [];
        throw new Error(`Contract initialization blocked. Critical failures: ${criticalErrors.join(', ') || 'Unknown'}`);
      }

      // Step 3: Initialize Web3 if health checks pass
      console.log('Initializing Web3...');
      await initializeWeb3();
      
      // Step 4: Get contract owner with verification
      console.log('Getting contract owner...');
      const ownerCheck = await healthCheckOwner();
      if (!ownerCheck.passed) {
        throw new Error(`Owner verification failed: ${ownerCheck.message}`);
      }

      const owner = ownerCheck.details.owner;
      
      // Step 5: Verify owner address
      if (!owner || owner === '0x0000000000000000000000000000000000000000') {
        throw new Error('Contract owner is zero address or undefined');
      }

      // Step 6: Set state if all checks pass
      setContractOwner(owner);
      setIsOwner(compareAddresses(userAddress, owner));
      setIsInitialized(true);
      setCanRetry(true);
      setInitializationAttempts(0); // Reset attempts on success
      attemptsRef.current = 0;
      
      console.log('Contract initialization successful:', {
        owner,
        isOwner: compareAddresses(userAddress, owner),
        userAddress,
        healthScore: fullCheck.overall.healthPercentage
      });
      
    } catch (err) {
      console.error('Failed to initialize contract:', err);
      setError(getErrorMessage(err));
      setIsInitialized(false);
      setIsOwner(false);
      
      // Allow retry if not at max attempts
      if (attemptsRef.current < 3) {
        setCanRetry(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isWalletConnected, userAddress, performHealthCheck]);

  // Manual retry function
  const retryInitialization = useCallback(() => {
    setInitializationAttempts(0);
    attemptsRef.current = 0;
    setCanRetry(true);
    setError(null);
    initializeContract(true);
  }, [initializeContract]);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWalletConnected, userAddress]);

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
    healthCheck,
    initializationAttempts,
    canRetry,
    handleStartVoting,
    handleEndVoting,
    handleResetVoting,
    handleVote,
    initializeContract,
    retryInitialization,
    performHealthCheck
  };
};