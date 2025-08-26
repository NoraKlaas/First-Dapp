import React from 'react';

const ErrorDisplay = ({ 
  error, 
  onDismiss, 
  onRetry, 
  title = 'Error',
  className = '',
  showRetry = false 
}) => {
  
  if (!error) {
    return null;
  }

  const getErrorType = (errorMessage) => {
    const message = errorMessage.toLowerCase();
    
    if (message.includes('user rejected') || message.includes('user denied')) {
      return 'user-rejected';
    }
    
    if (message.includes('insufficient funds')) {
      return 'insufficient-funds';
    }
    
    if (message.includes('network')) {
      return 'network-error';
    }
    
    if (message.includes('wallet') || message.includes('metamask')) {
      return 'wallet-error';
    }
    
    if (message.includes('contract') || message.includes('revert')) {
      return 'contract-error';
    }
    
    return 'general-error';
  };

  const getErrorIcon = (errorType) => {
    switch (errorType) {
      case 'user-rejected':
        return 'REJECTED';
      case 'insufficient-funds':
        return 'NO FUNDS';
      case 'network-error':
        return 'NETWORK';
      case 'wallet-error':
        return 'WALLET';
      case 'contract-error':
        return 'CONTRACT';
      default:
        return 'ERROR';
    }
  };

  const getErrorSuggestion = (errorType) => {
    switch (errorType) {
      case 'user-rejected':
        return 'Please approve the transaction in your wallet to continue.';
      case 'insufficient-funds':
        return 'Please ensure you have enough ETH to cover the gas fees.';
      case 'network-error':
        return 'Please check your internet connection and try again.';
      case 'wallet-error':
        return 'Please check your wallet connection and try again.';
      case 'contract-error':
        return 'This transaction cannot be completed. Please check the voting status.';
      default:
        return 'Please try again or contact support if the issue persists.';
    }
  };

  const errorType = getErrorType(error);
  const errorIcon = getErrorIcon(errorType);
  const suggestion = getErrorSuggestion(errorType);

  return (
    <div className={`error-display ${errorType} ${className}`}>
      <div className="error-content">
        <div className="error-header">
          <span className="error-type">{errorIcon}</span>
          <h4 className="error-title">{title}</h4>
        </div>
        
        <div className="error-body">
          <p className="error-message">{error}</p>
          
          {suggestion && (
            <p className="error-suggestion">{suggestion}</p>
          )}
        </div>
        
        <div className="error-actions">
          {showRetry && onRetry && (
            <button 
              onClick={onRetry}
              className="retry-button"
            >
              Try Again
            </button>
          )}
          
          {onDismiss && (
            <button 
              onClick={onDismiss}
              className="dismiss-button"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
      
      {errorType === 'wallet-error' && (
        <div className="error-help">
          <details>
            <summary>Wallet troubleshooting</summary>
            <ul>
              <li>Make sure MetaMask is installed and unlocked</li>
              <li>Check that you're connected to the correct network</li>
              <li>Try refreshing the page and reconnecting</li>
              <li>Ensure your wallet has sufficient funds for gas fees</li>
            </ul>
          </details>
        </div>
      )}
      
      {errorType === 'network-error' && (
        <div className="error-help">
          <details>
            <summary>Network troubleshooting</summary>
            <ul>
              <li>Check your internet connection</li>
              <li>Try switching to a different RPC endpoint</li>
              <li>Wait a moment and try again (network may be congested)</li>
              <li>Check if the blockchain network is experiencing issues</li>
            </ul>
          </details>
        </div>
      )}
      
      {errorType === 'contract-error' && (
        <div className="error-help">
          <details>
            <summary>Contract troubleshooting</summary>
            <ul>
              <li>Check if voting is currently active</li>
              <li>Verify you haven't already voted in this round</li>
              <li>Ensure you have the correct permissions</li>
              <li>Wait for any pending transactions to complete</li>
            </ul>
          </details>
        </div>
      )}
    </div>
  );
};

export default ErrorDisplay;
