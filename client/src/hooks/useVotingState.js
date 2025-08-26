import { useState, useEffect, useCallback } from 'react';
import {
  getVotingState,
  getVotingStatus,
  getAllVotes,
  getWinner,
  getCurrentRound,
  hasUserVotedThisRound,
  setupEventListeners,
  removeEventListeners
} from '../utils/contractServices.js';
import { 
  transformVotesForDisplay, 
  calculateTotalVotes, 
  getWinnerFromVotes,
  checkForTie,
  getErrorMessage 
} from '../utils/helpers.js';
import { ANIMALS } from '../utils/constants.js';

export const useVotingState = (userAddress, isContractInitialized) => {
  // Core voting state
  const [votingActive, setVotingActive] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [hasVoted, setHasVoted] = useState(false);
  
  // Vote data
  const [votes, setVotes] = useState([0, 0, 0, 0, 0]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [winner, setWinner] = useState({ winner: 0, winningVotes: 0 });
  const [isTie, setIsTie] = useState(false);
  const [votesForDisplay, setVotesForDisplay] = useState([]);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch all voting data
  const fetchVotingData = useCallback(async () => {
    if (!isContractInitialized) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const state = await getVotingState(userAddress);
      
      setVotingActive(state.votingActive);
      setCurrentRound(state.currentRound);
      setVotes(state.votes);
      setWinner(state.winner);
      setHasVoted(state.hasVoted);
      
      // Calculate derived data
      const total = calculateTotalVotes(state.votes);
      setTotalVotes(total);
      
      const tie = checkForTie(state.votes);
      setIsTie(tie);
      
      const displayVotes = transformVotesForDisplay(state.votes, ANIMALS);
      setVotesForDisplay(displayVotes);
      
      setLastUpdated(new Date());
      
    } catch (err) {
      console.error('Failed to fetch voting data:', err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [isContractInitialized, userAddress]);

  // Refresh specific voting status
  const refreshVotingStatus = useCallback(async () => {
    if (!isContractInitialized) return;
    
    try {
      const active = await getVotingStatus();
      setVotingActive(active);
    } catch (err) {
      console.error('Failed to refresh voting status:', err);
    }
  }, [isContractInitialized]);

  // Refresh vote counts
  const refreshVotes = useCallback(async () => {
    if (!isContractInitialized) return;
    
    try {
      const newVotes = await getAllVotes();
      const newWinner = await getWinner();
      
      setVotes(newVotes);
      setWinner(newWinner);
      
      const total = calculateTotalVotes(newVotes);
      setTotalVotes(total);
      
      const tie = checkForTie(newVotes);
      setIsTie(tie);
      
      const displayVotes = transformVotesForDisplay(newVotes, ANIMALS);
      setVotesForDisplay(displayVotes);
      
      setLastUpdated(new Date());
      
    } catch (err) {
      console.error('Failed to refresh votes:', err);
    }
  }, [isContractInitialized]);

  // Refresh user vote status
  const refreshUserVoteStatus = useCallback(async () => {
    if (!isContractInitialized || !userAddress) return;
    
    try {
      const voted = await hasUserVotedThisRound(userAddress);
      setHasVoted(voted);
    } catch (err) {
      console.error('Failed to refresh user vote status:', err);
    }
  }, [isContractInitialized, userAddress]);

  // Refresh current round
  const refreshCurrentRound = useCallback(async () => {
    if (!isContractInitialized) return;
    
    try {
      const round = await getCurrentRound();
      setCurrentRound(round);
    } catch (err) {
      console.error('Failed to refresh current round:', err);
    }
  }, [isContractInitialized]);

  // Get animal data by ID
  const getAnimalById = useCallback((animalId) => {
    return ANIMALS.find(animal => animal.id === animalId) || ANIMALS[0];
  }, []);

  // Get current winning animal data
  const getWinningAnimal = useCallback(() => {
    return getAnimalById(winner.winner);
  }, [winner.winner, getAnimalById]);

  // Event handlers for real-time updates
  const setupEventHandlers = useCallback(() => {
    if (!isContractInitialized) return;
    
    const eventCallbacks = {
      onVoteCast: (eventData) => {
        console.log('Vote cast event:', eventData);
        refreshVotes();
        if (userAddress && eventData.voter.toLowerCase() === userAddress.toLowerCase()) {
          setHasVoted(true);
        }
      },
      
      onVotingStarted: (eventData) => {
        console.log('Voting started event:', eventData);
        setVotingActive(true);
        refreshCurrentRound();
      },
      
      onVotingEnded: (eventData) => {
        console.log('Voting ended event:', eventData);
        setVotingActive(false);
      },
      
      onVotingReset: (eventData) => {
        console.log('Voting reset event:', eventData);
        setCurrentRound(eventData.newRound);
        setVotes([0, 0, 0, 0, 0]);
        setTotalVotes(0);
        setWinner({ winner: 0, winningVotes: 0 });
        setHasVoted(false);
        setIsTie(false);
        setVotesForDisplay(transformVotesForDisplay([0, 0, 0, 0, 0], ANIMALS));
        setLastUpdated(new Date());
      }
    };
    
    setupEventListeners(eventCallbacks);
  }, [isContractInitialized, userAddress, refreshVotes, refreshCurrentRound]);

  // Initialize voting data when contract is ready
  useEffect(() => {
    if (isContractInitialized) {
      fetchVotingData();
      setupEventHandlers();
    }
    
    return () => {
      removeEventListeners();
    };
  }, [isContractInitialized, fetchVotingData, setupEventHandlers]);

  // Update user vote status when user address changes
  useEffect(() => {
    if (isContractInitialized && userAddress) {
      refreshUserVoteStatus();
    } else {
      setHasVoted(false);
    }
  }, [userAddress, currentRound, isContractInitialized, refreshUserVoteStatus]);

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
    // Core state
    votingActive,
    currentRound,
    hasVoted,
    
    // Vote data
    votes,
    totalVotes,
    winner,
    isTie,
    votesForDisplay,
    
    // Meta data
    isLoading,
    error,
    lastUpdated,
    
    // Utility functions
    getAnimalById,
    getWinningAnimal,
    
    // Refresh functions
    fetchVotingData,
    refreshVotingStatus,
    refreshVotes,
    refreshUserVoteStatus,
    refreshCurrentRound
  };
};