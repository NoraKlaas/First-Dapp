import React from 'react';

const LoadingSpinner = ({ 
  message = 'Loading...', 
  size = 'medium', 
  overlay = false,
  className = '',
  show = true 
}) => {
  
  if (!show) {
    return null;
  }

  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'spinner-small';
      case 'large':
        return 'spinner-large';
      case 'medium':
      default:
        return 'spinner-medium';
    }
  };

  const spinnerContent = (
    <div className={`loading-spinner ${getSizeClass()} ${className}`}>
      <div className="spinner-container">
        <div className="spinner">
          <div className="spinner-circle"></div>
          <div className="spinner-circle"></div>
          <div className="spinner-circle"></div>
          <div className="spinner-circle"></div>
        </div>
        
        {message && (
          <p className="loading-message">{message}</p>
        )}
      </div>
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-overlay">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

// Specialized loading components for common use cases
export const TransactionLoading = ({ action = 'Processing', transactionHash }) => {
  return (
    <LoadingSpinner 
      message={
        <div className="transaction-loading">
          <div>{action} transaction...</div>
          {transactionHash && (
            <div className="tx-hash">
              <small>TX: {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}</small>
            </div>
          )}
          <div className="tx-note">
            <small>Please wait for blockchain confirmation</small>
          </div>
        </div>
      }
      size="large"
      className="transaction-spinner"
    />
  );
};

export const WalletConnectionLoading = () => {
  return (
    <LoadingSpinner 
      message="Connecting to wallet..."
      size="medium"
      className="wallet-spinner"
    />
  );
};

export const ContractLoading = ({ action = 'Loading contract data' }) => {
  return (
    <LoadingSpinner 
      message={`${action}...`}
      size="medium"
      className="contract-spinner"
    />
  );
};

export const VotingLoading = ({ animalName }) => {
  return (
    <LoadingSpinner 
      message={
        <div className="voting-loading">
          <div>Casting vote{animalName ? ` for ${animalName}` : ''}...</div>
          <div className="voting-note">
            <small>Please confirm the transaction in your wallet</small>
          </div>
        </div>
      }
      size="large"
      className="voting-spinner"
    />
  );
};

export const PageLoading = ({ message = 'Loading application...' }) => {
  return (
    <LoadingSpinner 
      message={message}
      size="large"
      overlay={true}
      className="page-spinner"
    />
  );
};

export default LoadingSpinner;