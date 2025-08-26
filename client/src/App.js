import React, { useEffect, useState } from 'react';
import './App.css';

// Import custom hooks
import { useWallet } from './hooks/useWallet.js';
import { useContract } from './hooks/useContract.js';
import { useVotingState } from './hooks/useVotingState.js';

// Import components
import WalletConnection from './components/WalletConnection.jsx';
import AdminControls from './components/AdminControls.jsx';
import VotingStatus from './components/VotingStatus.jsx';
import AnimalVotingButtons from './components/AnimalVotingButtons.jsx';
import LiveResults from './components/LiveResults.jsx';
// ErrorDisplay removed
import LoadingSpinner, { PageLoading } from './components/LoadingSpinner.jsx';
// ContractDiagnostics removed


function App() {
  // Global loading state
  const [isInitializing, setIsInitializing] = useState(true);

  // Wallet hook
  const {
    isConnected,
    userAddress,
    formattedAddress,
    networkInfo,
    isConnecting,
    error: walletError,
    connect: connectWallet,
    disconnect: disconnectWallet
  } = useWallet();

  // Contract hook
  const {
    isInitialized: isContractInitialized,
    isOwner,
    contractOwner,
    isLoading: contractLoading,
    error: contractError,
    healthCheck,
    initializationAttempts,
    canRetry,
    handleStartVoting,
    handleEndVoting,
    handleResetVoting,
    handleVote,
    retryInitialization,
    performHealthCheck
  } = useContract(userAddress, isConnected);

  // Voting state hook
  const {
    votingActive,
    currentRound,
    hasVoted,
    votes,
    totalVotes,
    winner,
    isTie,
    votesForDisplay,
    isLoading: votingLoading,
    error: votingError,
    lastUpdated,
    getAnimalById,
    getWinningAnimal,
    fetchVotingData,
    refreshVotes
  } = useVotingState(userAddress, isContractInitialized);

  // Debug logging removed

  // Handle initial app loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);


  // Handle wallet connection
  const handleWalletConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  // Handle wallet disconnection
  const handleWalletDisconnect = () => {
    try {
      disconnectWallet();
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
    }
  };

  // Handle voting with error management
  const handleVoteWithErrorHandling = async (animalId) => {
    try {
      const result = await handleVote(animalId);
      
      // Refresh voting data after successful vote
      if (result.success) {
        setTimeout(() => {
          fetchVotingData();
        }, 2000); // Wait for blockchain confirmation
      }
      
      return result;
    } catch (error) {
      console.error('Voting failed:', error);
      throw error;
    }
  };

  // Handle admin actions with error management
  const handleAdminAction = async (action) => {
    try {
      let result;
      
      switch (action) {
        case 'start':
          result = await handleStartVoting();
          break;
        case 'end':
          result = await handleEndVoting();
          break;
        case 'reset':
          result = await handleResetVoting();
          break;
        default:
          throw new Error('Unknown admin action');
      }
      
      // Refresh data after admin action
      if (result.success) {
        setTimeout(() => {
          fetchVotingData();
        }, 2000);
      }
      
      return result;
    } catch (error) {
      console.error('Admin action failed:', error);
      throw error;
    }
  };


  // Show initial loading screen
  if (isInitializing) {
    return <PageLoading message="Initializing Animal Voting DApp..." />;
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>Animal Voting DApp</h1>
        <p>Vote for your favorite animal on the blockchain</p>
      </header>

      <main className="app-main">
        {/* Global Error Display - Hidden */}

        {/* Wallet Connection Section */}
        <section className="wallet-section">
          <WalletConnection
            isConnected={isConnected}
            userAddress={userAddress}
            formattedAddress={formattedAddress}
            networkInfo={networkInfo}
            isConnecting={isConnecting}
            error={walletError}
            onConnect={handleWalletConnect}
            onDisconnect={handleWalletDisconnect}
          />
        </section>

        {/* Contract Diagnostics - Hidden */}

        {/* Main Content - Only show when wallet is connected */}
        {isConnected && (
          <>
            {/* Admin Controls - Only show for contract owner */}
            {isOwner && (
              <section className="admin-section">
                <AdminControls
                  isOwner={isOwner}
                  votingActive={votingActive}
                  currentRound={currentRound}
                  isLoading={contractLoading}
                  error={contractError}
                  onStartVoting={() => handleAdminAction('start')}
                  onEndVoting={() => handleAdminAction('end')}
                  onResetVoting={() => handleAdminAction('reset')}
                />
              </section>
            )}

            {/* Voting Status Section */}
            <section className="status-section">
              <VotingStatus
                votingActive={votingActive}
                currentRound={currentRound}
                totalVotes={totalVotes}
                hasVoted={hasVoted}
                isLoading={votingLoading}
                lastUpdated={lastUpdated}
                userAddress={userAddress}
              />
            </section>

            {/* Voting Buttons Section */}
            <section className="voting-section">
              <AnimalVotingButtons
                votingActive={votingActive}
                hasVoted={hasVoted}
                isLoading={contractLoading || votingLoading}
                userAddress={userAddress}
                onVote={handleVoteWithErrorHandling}
              />
            </section>

            {/* Results Section */}
            <section className="results-section">
              <LiveResults
                votes={votes}
                totalVotes={totalVotes}
                winner={winner}
                isTie={isTie}
                votesForDisplay={votesForDisplay}
                votingActive={votingActive}
                isLoading={votingLoading}
                getAnimalById={getAnimalById}
                onRefresh={refreshVotes}
              />
            </section>
          </>
        )}

        {/* Loading Overlay for Contract Operations */}
        {(contractLoading || votingLoading) && (
          <div className="loading-overlay">
            <LoadingSpinner
              message={
                contractLoading 
                  ? "Processing blockchain transaction..." 
                  : "Loading voting data..."
              }
              size="large"
            />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>Animal Voting DApp - Decentralized Voting on the Blockchain</p>
          <div className="footer-links">
            <span>Contract: {contractOwner ? `${contractOwner.slice(0, 6)}...${contractOwner.slice(-4)}` : 'Loading...'}</span>
            {networkInfo && (
              <span>Network: {networkInfo.name}</span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;