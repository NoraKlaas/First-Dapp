import React from 'react';

const WalletConnection = ({ 
  isConnected, 
  userAddress, 
  formattedAddress, 
  networkInfo, 
  isConnecting, 
  error, 
  onConnect, 
  onDisconnect 
}) => {
  
  const handleConnect = async () => {
    try {
      await onConnect();
    } catch (err) {
      console.error('Connection failed:', err);
    }
  };

  const handleDisconnect = () => {
    onDisconnect();
  };

  if (!isConnected) {
    return (
      <div className="wallet-connection">
        <div className="wallet-status">
          <h3>Connect Wallet</h3>
          
          <button 
            onClick={handleConnect}
            disabled={isConnecting}
            className="connect-button"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
          
          {/* Error messages hidden */}
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-connection connected">
      <div className="wallet-info">
        <div className="address-section">
          <label>Connected Address:</label>
          <span className="address" title={userAddress}>
            {formattedAddress}
          </span>
        </div>
        
        {networkInfo && (
          <div className="network-section">
            <label>Network:</label>
            <span className="network">
              {networkInfo.name} (Chain ID: {networkInfo.chainId})
            </span>
          </div>
        )}
        
        <button 
          onClick={handleDisconnect}
          className="disconnect-button"
        >
          Disconnect
        </button>
      </div>
      
      {/* Error messages hidden */}
    </div>
  );
};

export default WalletConnection;