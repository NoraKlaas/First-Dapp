import React, { useState } from 'react';

const AdminControls = ({ 
  isOwner, 
  votingActive, 
  currentRound,
  isLoading, 
  error, 
  onStartVoting, 
  onEndVoting, 
  onResetVoting 
}) => {
  const [actionLoading, setActionLoading] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOwner) {
    return null;
  }

  const handleStartVoting = async () => {
    try {
      setActionLoading('starting');
      setSuccessMessage('');
      
      const result = await onStartVoting();
      
      if (result.success) {
        setSuccessMessage(result.message);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Failed to start voting:', err);
    } finally {
      setActionLoading('');
    }
  };

  const handleEndVoting = async () => {
    try {
      setActionLoading('ending');
      setSuccessMessage('');
      
      const result = await onEndVoting();
      
      if (result.success) {
        setSuccessMessage(result.message);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Failed to end voting:', err);
    } finally {
      setActionLoading('');
    }
  };

  const handleResetVoting = async () => {
    if (!window.confirm('Are you sure you want to reset the voting? This will clear all votes and start a new round.')) {
      return;
    }
    
    try {
      setActionLoading('resetting');
      setSuccessMessage('');
      
      const result = await onResetVoting();
      
      if (result.success) {
        setSuccessMessage(result.message);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Failed to reset voting:', err);
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div className="admin-controls">
      <div className="admin-header">
        <h3>Admin Controls</h3>
        <span className="round-indicator">Round {currentRound}</span>
      </div>
      
      <div className="admin-actions">
        {!votingActive ? (
          <div className="start-section">
            <button 
              onClick={handleStartVoting}
              disabled={isLoading || actionLoading === 'starting'}
              className="admin-button start-button"
            >
              {actionLoading === 'starting' ? 'Starting...' : 'Start Voting'}
            </button>
            
            <button 
              onClick={handleResetVoting}
              disabled={isLoading || actionLoading === 'resetting'}
              className="admin-button reset-button"
            >
              {actionLoading === 'resetting' ? 'Resetting...' : 'Reset Voting'}
            </button>
          </div>
        ) : (
          <div className="end-section">
            <button 
              onClick={handleEndVoting}
              disabled={isLoading || actionLoading === 'ending'}
              className="admin-button end-button"
            >
              {actionLoading === 'ending' ? 'Ending...' : 'End Voting'}
            </button>
          </div>
        )}
      </div>
      
      {successMessage && (
        <div className="admin-success">
          <p>{successMessage}</p>
        </div>
      )}
      
      {error && (
        <div className="admin-error">
          <p>{error}</p>
        </div>
      )}
      
      <div className="admin-info">
        <div className="status-row">
          <label>Voting Status:</label>
          <span className={`status ${votingActive ? 'active' : 'inactive'}`}>
            {votingActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        <div className="round-row">
          <label>Current Round:</label>
          <span className="round">{currentRound}</span>
        </div>
      </div>
      
      <div className="admin-note">
        <p>Note: Only the contract owner can perform these actions. All transactions require gas fees.</p>
      </div>
    </div>
  );
};

export default AdminControls;