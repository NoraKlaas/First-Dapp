// Quick diagnostic tool to verify network and contract deployment
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, DEFAULT_NETWORK_ID } from './constants.js';

export const diagnoseNetworkIssue = async () => {
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    recommendations: []
  };

  try {
    // Check 1: Wallet provider
    if (!window.ethereum) {
      results.checks.walletProvider = {
        passed: false,
        message: 'No wallet provider found'
      };
      results.recommendations.push('Install MetaMask or another Web3 wallet');
      return results;
    }

    results.checks.walletProvider = {
      passed: true,
      message: 'Wallet provider available'
    };

    // Check 2: Current network
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    const currentChainId = Number(network.chainId);
    
    results.checks.currentNetwork = {
      passed: true,
      message: `Connected to chain ID: ${currentChainId}`,
      details: {
        chainId: currentChainId,
        name: network.name
      }
    };

    // Check 3: Expected network
    const onCorrectNetwork = currentChainId === DEFAULT_NETWORK_ID;
    results.checks.networkMatch = {
      passed: onCorrectNetwork,
      message: onCorrectNetwork 
        ? `Correct network: Sepolia (${DEFAULT_NETWORK_ID})`
        : `Wrong network! Expected Sepolia (${DEFAULT_NETWORK_ID}), got ${currentChainId}`,
      details: {
        expected: DEFAULT_NETWORK_ID,
        actual: currentChainId
      }
    };

    if (!onCorrectNetwork) {
      results.recommendations.push(`Switch to Sepolia testnet (Chain ID: ${DEFAULT_NETWORK_ID}) in your wallet`);
    }

    // Check 4: Contract deployment (with different RPC attempts)
    const contractExists = await checkContractWithMultipleRPCs();
    results.checks.contractDeployment = contractExists;

    if (!contractExists.passed) {
      results.recommendations.push('Verify the contract is deployed on Sepolia testnet');
      results.recommendations.push('Check if you need to redeploy the contract');
      results.recommendations.push('Try switching to a different RPC endpoint');
    }

    // Check 5: Account connection
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    results.checks.accountConnection = {
      passed: accounts.length > 0,
      message: accounts.length > 0 ? 'Wallet connected' : 'No accounts connected',
      details: {
        accountCount: accounts.length,
        currentAccount: accounts[0] || null
      }
    };

    if (accounts.length === 0) {
      results.recommendations.push('Connect your wallet');
    }

  } catch (error) {
    results.checks.generalError = {
      passed: false,
      message: `Diagnostic failed: ${error.message}`,
      details: { error: error.message }
    };
    results.recommendations.push('Check browser console for detailed error information');
  }

  return results;
};

async function checkContractWithMultipleRPCs() {
  const rpcUrls = [
    // Use the default provider first
    null,
    // Backup RPC endpoints for Sepolia
    'https://rpc.sepolia.org',
    'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    'https://ethereum-sepolia.blockpi.network/v1/rpc/public'
  ];

  for (let i = 0; i < rpcUrls.length; i++) {
    try {
      let provider;
      
      if (rpcUrls[i] === null) {
        // Use the wallet provider
        provider = new ethers.BrowserProvider(window.ethereum);
      } else {
        // Use the RPC URL
        provider = new ethers.JsonRpcProvider(rpcUrls[i]);
      }

      const code = await provider.getCode(CONTRACT_ADDRESS);
      
      if (code && code !== '0x' && code !== '0x0') {
        return {
          passed: true,
          message: `Contract found using ${rpcUrls[i] || 'wallet provider'}`,
          details: {
            address: CONTRACT_ADDRESS,
            codeLength: code.length,
            rpcUsed: rpcUrls[i] || 'wallet provider'
          }
        };
      }
    } catch (error) {
      console.log(`RPC ${rpcUrls[i] || 'wallet provider'} failed:`, error.message);
      continue;
    }
  }

  return {
    passed: false,
    message: 'Contract not found on any RPC endpoint',
    details: {
      address: CONTRACT_ADDRESS,
      rpcsTried: rpcUrls.length
    }
  };
}

// Quick network switching helper
export const switchToSepolia = async () => {
  if (!window.ethereum) {
    throw new Error('No wallet provider found');
  }

  try {
    // Try to switch to Sepolia
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${DEFAULT_NETWORK_ID.toString(16)}` }], // Convert to hex
    });
    return { success: true, message: 'Switched to Sepolia testnet' };
  } catch (switchError) {
    // If the chain hasn't been added to user's wallet, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${DEFAULT_NETWORK_ID.toString(16)}`,
            chainName: 'Sepolia Testnet',
            nativeCurrency: {
              name: 'SepoliaETH',
              symbol: 'SEP',
              decimals: 18,
            },
            rpcUrls: ['https://rpc.sepolia.org'],
            blockExplorerUrls: ['https://sepolia.etherscan.io/'],
          }],
        });
        return { success: true, message: 'Added and switched to Sepolia testnet' };
      } catch (addError) {
        throw new Error(`Failed to add Sepolia network: ${addError.message}`);
      }
    }
    throw new Error(`Failed to switch network: ${switchError.message}`);
  }
};

// Check if we can reach Sepolia block explorer
export const testSepoliaConnectivity = async () => {
  try {
    const response = await fetch(`https://sepolia.etherscan.io/api?module=proxy&action=eth_getCode&address=${CONTRACT_ADDRESS}&tag=latest&apikey=YourApiKeyToken`);
    const data = await response.json();
    
    return {
      passed: data.result && data.result !== '0x',
      message: data.result && data.result !== '0x' 
        ? 'Contract verified on Sepolia Etherscan'
        : 'Contract not found on Sepolia Etherscan',
      details: {
        etherscanResult: data.result,
        contractUrl: `https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`
      }
    };
  } catch (error) {
    return {
      passed: false,
      message: `Etherscan connectivity test failed: ${error.message}`,
      details: { error: error.message }
    };
  }
};