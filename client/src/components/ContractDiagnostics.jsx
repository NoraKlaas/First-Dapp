import React, { useState } from 'react';
import { switchToSepolia } from '../utils/networkDiagnostic.js';

const ContractDiagnostics = ({ 
  healthCheck, 
  isInitialized, 
  isLoading, 
  error, 
  canRetry,
  initializationAttempts,
  onRetry,
  onRefreshHealth
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);

  if (!healthCheck && !error && isInitialized) {
    return null; // Everything is working fine
  }

  const getOverallStatus = () => {
    if (isLoading) return 'checking';
    if (error) return 'error';
    if (!healthCheck) return 'unknown';
    if (healthCheck.overall?.healthy) return 'healthy';
    if (healthCheck.overall?.canInitialize) return 'warning';
    return 'critical';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return '#22c55e';
      case 'warning': return '#f59e0b';
      case 'error':
      case 'critical': return '#ef4444';
      case 'checking': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return 'OK';
      case 'warning': return 'WARN';
      case 'error':
      case 'critical': return 'ERROR';
      case 'checking': return 'CHECKING';
      default: return 'UNKNOWN';
    }
  };

  const status = getOverallStatus();

  const formatCheckName = (key) => {
    return key.replace(/([A-Z])/g, ' $1')
             .replace(/^./, str => str.toUpperCase())
             .replace(/([a-z])([A-Z])/g, '$1 $2');
  };

  const renderCheckResult = (key, check) => {
    if (!key || !check) return null;

    return (
      <div key={key} className="diagnostic-check">
        <div className="check-header">
          <span className={`check-status ${check.passed ? 'passed' : 'failed'}`}>
            {check.passed ? 'PASS' : 'FAIL'}
          </span>
          <span className="check-name">{formatCheckName(key)}</span>
        </div>
        <div className="check-message">{check.message}</div>
      </div>
    );
  };

  const handleSwitchToSepolia = async () => {
    setIsSwitchingNetwork(true);
    try {
      await switchToSepolia();
      setTimeout(() => {
        if (onRefreshHealth) onRefreshHealth();
      }, 2000);
    } catch (error) {
      console.error('Network switch failed:', error);
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  const renderQuickActions = () => {
    const actions = [];

    if (error?.includes('Contract not deployed') || 
        healthCheck?.checks?.contractDeployment?.passed === false) {
      actions.push(
        <button 
          key="switch-network"
          onClick={handleSwitchToSepolia}
          disabled={isSwitchingNetwork}
          className="diagnostic-action switch-network"
        >
          {isSwitchingNetwork ? 'Switching...' : 'Switch to Sepolia'}
        </button>
      );
    }

    if (canRetry && !isLoading) {
      actions.push(
        <button 
          key="retry"
          onClick={onRetry}
          className="diagnostic-action retry"
        >
          Retry Initialization
        </button>
      );
    }

    return actions.length > 0 ? (
      <div className="diagnostic-actions">
        {actions}
      </div>
    ) : null;
  };

  const getSuggestions = () => {
    if (!healthCheck || !healthCheck.checks) return [];

    const suggestions = [];
    const checks = healthCheck.checks;

    if (checks.walletAvailability && !checks.walletAvailability.passed) {
      suggestions.push('Install MetaMask or a compatible Web3 wallet');
    }

    if (checks.walletConnection && !checks.walletConnection.passed) {
      suggestions.push('Connect your wallet by clicking the connect button');
    }

    if (checks.network && !checks.network.passed) {
      suggestions.push('Switch to a supported network in your wallet');
    }

    if (checks.contractDeployment && !checks.contractDeployment.passed) {
      suggestions.push('Verify the contract address and ensure you\'re on the correct network');
    }

    if (checks.contractOwner && !checks.contractOwner.passed) {
      suggestions.push('The contract may not be properly deployed or accessible');
    }

    return suggestions;
  };

  return (
    <div className="contract-diagnostics">
      <div className="diagnostic-header">
        <div className="status-indicator">
          <span 
            className="status-badge" 
            style={{ 
              color: getStatusColor(status),
              backgroundColor: `${getStatusColor(status)}20`
            }}
          >
            {getStatusIcon(status)}
          </span>
          <h3>Contract Status</h3>
        </div>
        
        <button 
          className="toggle-details"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide' : 'Details'}
        </button>
      </div>

      <div className="diagnostic-summary">
        {isLoading && (
          <div className="status-message loading">
            Checking contract health...
          </div>
        )}

        {error && (
          <div className="status-message error">
            <strong>Error:</strong> {error}
            {initializationAttempts > 0 && (
              <div className="attempts-info">
                Attempts: {initializationAttempts}/3
              </div>
            )}
          </div>
        )}

        {healthCheck && !isLoading && (
          <div className={`status-message ${status}`}>
            <div className="health-score">
              Health Score: {healthCheck.overall?.healthPercentage || 0}%
            </div>
            
            {!healthCheck.overall?.healthy && (
              <div className="status-details">
                {healthCheck.overall?.canInitialize 
                  ? "Contract can be initialized but has some issues"
                  : "Contract initialization is blocked"
                }
              </div>
            )}
            
            {healthCheck.overall?.criticalFailures?.length > 0 && (
              <div className="critical-failures">
                <strong>Issues:</strong>
                <ul>
                  {healthCheck.overall.criticalFailures.map((failure, index) => (
                    <li key={index}>{formatCheckName(failure)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {renderQuickActions()}

      {showDetails && healthCheck && (
        <div className="diagnostic-details">
          <div className="checks-grid">
            {Object.entries(healthCheck.checks || {}).map(([key, check]) => 
              renderCheckResult(key, check)
            )}
          </div>
          
          <div className="diagnostic-contract-info">
            <p><strong>Contract:</strong> <code>0x06098349E55dd9C1587ab61813b23968624557a2</code></p>
            <p><strong>Network:</strong> Sepolia Testnet</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .contract-diagnostics {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
        }
        
        .diagnostic-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
        
        .toggle-details {
          background: none;
          border: 1px solid #cbd5e1;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        
        .diagnostic-summary .status-message {
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 8px;
        }
        
        .status-message.loading {
          background: #eff6ff;
          border: 1px solid #3b82f6;
          color: #1e40af;
        }
        
        .status-message.error, .status-message.critical {
          background: #fef2f2;
          border: 1px solid #f87171;
          color: #dc2626;
        }
        
        .status-message.warning {
          background: #fffbeb;
          border: 1px solid #f59e0b;
          color: #d97706;
        }
        
        .status-message.healthy {
          background: #f0fdf4;
          border: 1px solid #22c55e;
          color: #16a34a;
        }
        
        
        .diagnostic-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
        
        .diagnostic-action {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }
        
        .diagnostic-action.retry {
          background: #3b82f6;
          color: white;
        }
        
        .diagnostic-action.refresh {
          background: #6b7280;
          color: white;
        }
        
        .diagnostic-action:hover {
          opacity: 0.9;
        }
        
        .diagnostic-details {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
        }
        
        .checks-grid {
          display: grid;
          gap: 8px;
        }
        
        .diagnostic-check {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 12px;
        }
        
        .check-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }
        
        .check-status {
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: bold;
        }
        
        .check-status.passed {
          background: #22c55e;
          color: white;
        }
        
        .check-status.failed {
          background: #ef4444;
          color: white;
        }
        
        .check-message {
          margin-top: 4px;
          font-size: 14px;
          color: #6b7280;
        }
        
        .check-details {
          margin-top: 8px;
          background: #f8fafc;
          padding: 8px;
          border-radius: 4px;
          font-size: 12px;
          overflow-x: auto;
        }
        
        .diagnostic-suggestions {
          margin-top: 16px;
          background: #fffbeb;
          border: 1px solid #f59e0b;
          border-radius: 4px;
          padding: 12px;
        }
        
        .diagnostic-suggestions h4 {
          margin: 0 0 8px 0;
          color: #d97706;
        }
        
        .diagnostic-suggestions ul {
          margin: 0;
          padding-left: 20px;
        }
        
        .diagnostic-suggestions li {
          margin-bottom: 4px;
        }
        
        .diagnostic-timestamp {
          margin-top: 12px;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
        }
        
        .health-score {
          font-weight: bold;
          margin-bottom: 4px;
        }
        
        .attempts-info {
          font-size: 12px;
          margin-top: 4px;
          opacity: 0.8;
        }
        
        .critical-failures ul {
          margin: 4px 0 0 0;
          padding-left: 20px;
        }
        
        .expand-arrow {
          margin-left: auto;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
};

export default ContractDiagnostics;