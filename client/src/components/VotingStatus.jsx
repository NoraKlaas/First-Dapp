import React from 'react';

const VotingStatus = ({ 
  votingActive, 
  currentRound, 
  totalVotes, 
  hasVoted, 
  isLoading, 
  lastUpdated,
  userAddress 
}) => {
  
  const formatLastUpdated = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString();
  };

  const getStatusMessage = () => {
    if (!userAddress) {
      return 'Please connect your wallet to participate';
    }
    
    if (!votingActive) {
      return 'Voting is currently inactive. Please wait for the admin to start voting.';
    }
    
    if (hasVoted) {
      return 'Thank you for voting! You have already cast your vote in this round.';
    }
    
    return 'Voting is active! Choose your favorite animal below.';
  };

  const getStatusClass = () => {
    if (!userAddress) return 'no-wallet';
    if (!votingActive) return 'inactive';
    if (hasVoted) return 'voted';
    return 'active';
  };

  return (
    <div className="voting-status">
      <div className="status-header">
        <h2>Animal Voting Game</h2>
        <div className="status-indicator">
          <span className={`status-badge ${getStatusClass()}`}>
            {votingActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>
      </div>
      
      <div className="status-info">
        <div className="info-grid">
          <div className="info-item">
            <label>Round:</label>
            <span className="value">{currentRound}</span>
          </div>
          
          <div className="info-item">
            <label>Total Votes:</label>
            <span className="value">{totalVotes}</span>
          </div>
          
          <div className="info-item">
            <label>Your Status:</label>
            <span className={`value ${hasVoted ? 'voted' : 'not-voted'}`}>
              {!userAddress ? 'Not Connected' : hasVoted ? 'Voted' : 'Not Voted'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="status-message">
        <p className={`message ${getStatusClass()}`}>
          {getStatusMessage()}
        </p>
      </div>
      
      {isLoading && (
        <div className="status-loading">
          <p>Loading voting data...</p>
        </div>
      )}
      
      {lastUpdated && (
        <div className="last-updated">
          <small>Last updated: {formatLastUpdated(lastUpdated)}</small>
        </div>
      )}
      
      <div className="voting-rules">
        <h4>How to Vote:</h4>
        <ol>
          <li>Connect your wallet</li>
          <li>Wait for voting to become active</li>
          <li>Choose your favorite animal</li>
          <li>Confirm the transaction</li>
          <li>You can only vote once per round</li>
        </ol>
      </div>
    </div>
  );
};

export default VotingStatus;