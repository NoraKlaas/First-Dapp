import { useState, useEffect, useCallback } from 'react';
import { 
  connectWallet, 
  isWalletConnected, 
  getCurrentAddress,
  getNetworkInfo 
} from '../utils/contractServices.js';
import { formatAddress, getErrorMessage } from '../utils/helpers.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants.js';

export const useWallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [formattedAddress, setFormattedAddress] = useState('');
  const [networkInfo, setNetworkInfo] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Check if wallet is already connected on component mount
  const checkConnection = useCallback(async () => {
    try {
      const connected = await isWalletConnected();
      
      if (connected) {
        const address = await getCurrentAddress();
        const network = await getNetworkInfo();
        
        setIsConnected(true);
        setUserAddress(address);
        setFormattedAddress(formatAddress(address));
        setNetworkInfo(network);
      }
    } catch (err) {
      console.error('Failed to check wallet connection:', err);
      setError(getErrorMessage(err));
    }
  }, []);

  // Connect wallet function
  const connect = useCallback(async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    setError(null);
    
    try {
      const { signer } = await connectWallet();
      const address = await getCurrentAddress();
      const network = await getNetworkInfo();
      
      setIsConnected(true);
      setUserAddress(address);
      setFormattedAddress(formatAddress(address));
      setNetworkInfo(network);
      
      return { success: true, message: SUCCESS_MESSAGES.WALLET_CONNECTED };
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting]);

  // Disconnect wallet function
  const disconnect = useCallback(() => {
    setIsConnected(false);
    setUserAddress('');
    setFormattedAddress('');
    setNetworkInfo(null);
    setError(null);
  }, []);

  // Handle account changes
  const handleAccountsChanged = useCallback((accounts) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      // Re-check connection when accounts change
      checkConnection();
    }
  }, [disconnect, checkConnection]);

  // Handle network changes
  const handleChainChanged = useCallback(() => {
    // Reload the page when network changes to avoid issues
    window.location.reload();
  }, []);

  // Set up event listeners for wallet events
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      // Cleanup event listeners
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [handleAccountsChanged, handleChainChanged]);

  // Check connection on mount
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

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
    isConnected,
    userAddress,
    formattedAddress,
    networkInfo,
    isConnecting,
    error,
    connect,
    disconnect,
    checkConnection
  };
};