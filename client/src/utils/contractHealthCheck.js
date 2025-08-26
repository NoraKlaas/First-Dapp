import { ethers } from 'ethers';
import { 
  CONTRACT_ADDRESS, 
  CONTRACT_ABI, 
  DEFAULT_NETWORK_ID, 
  SUPPORTED_NETWORKS 
} from './constants.js';
import { isValidAddress, compareAddresses } from './helpers.js';

// Health check results structure
export const createHealthCheckResult = (passed, message, details = {}) => ({
  passed,
  message: message.replace(/[^\w\s\-\.\,\:\(\)]/g, ''), // Remove emojis and special chars
  details,
  timestamp: new Date().toISOString()
});

// Check if MetaMask/Ethereum provider is available
export const checkWalletAvailability = () => {
  if (typeof window === 'undefined') {
    return createHealthCheckResult(false, 'Not running in browser environment');
  }
  
  if (!window.ethereum) {
    return createHealthCheckResult(false, 'MetaMask or compatible wallet not found');
  }
  
  return createHealthCheckResult(true, 'Wallet provider available', {
    isMetaMask: window.ethereum.isMetaMask,
    providerName: window.ethereum.isMetaMask ? 'MetaMask' : 'Unknown'
  });
};

// Check wallet connection status
export const checkWalletConnection = async () => {
  try {
    if (!window.ethereum) {
      return createHealthCheckResult(false, 'No wallet provider');
    }

    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    
    if (accounts.length === 0) {
      return createHealthCheckResult(false, 'Wallet not connected');
    }

    return createHealthCheckResult(true, 'Wallet connected', {
      accountsCount: accounts.length,
      currentAccount: accounts[0]
    });
  } catch (error) {
    return createHealthCheckResult(false, `Wallet connection check failed: ${error.message}`);
  }
};

// Check network compatibility
export const checkNetwork = async () => {
  try {
    if (!window.ethereum) {
      return createHealthCheckResult(false, 'No wallet provider');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);

    const isSupported = Object.keys(SUPPORTED_NETWORKS).includes(chainId.toString());
    const networkName = SUPPORTED_NETWORKS[chainId] || `Unknown (Chain ID: ${chainId})`;

    if (!isSupported) {
      return createHealthCheckResult(false, `Unsupported network: ${networkName}`, {
        currentChainId: chainId,
        supportedNetworks: SUPPORTED_NETWORKS
      });
    }

    return createHealthCheckResult(true, `Connected to ${networkName}`, {
      chainId,
      networkName,
      isCorrectNetwork: chainId === DEFAULT_NETWORK_ID
    });
  } catch (error) {
    return createHealthCheckResult(false, `Network check failed: ${error.message}`);
  }
};

// Check contract address validity
export const checkContractAddress = () => {
  if (!CONTRACT_ADDRESS) {
    return createHealthCheckResult(false, 'Contract address not configured');
  }

  if (!isValidAddress(CONTRACT_ADDRESS)) {
    return createHealthCheckResult(false, 'Invalid contract address format');
  }

  return createHealthCheckResult(true, 'Contract address is valid', {
    address: CONTRACT_ADDRESS
  });
};

// Check if contract exists and is deployed
export const checkContractDeployment = async () => {
  try {
    if (!window.ethereum) {
      return createHealthCheckResult(false, 'No wallet provider');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const code = await provider.getCode(CONTRACT_ADDRESS);

    if (code === '0x' || code === '0x0') {
      return createHealthCheckResult(false, 'Contract not deployed at address', {
        address: CONTRACT_ADDRESS,
        code
      });
    }

    return createHealthCheckResult(true, 'Contract is deployed', {
      address: CONTRACT_ADDRESS,
      codeSize: code.length
    });
  } catch (error) {
    return createHealthCheckResult(false, `Contract deployment check failed: ${error.message}`);
  }
};

// Check contract ABI compatibility
export const checkContractABI = async () => {
  try {
    if (!window.ethereum) {
      return createHealthCheckResult(false, 'No wallet provider');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    // Test essential functions
    const essentialFunctions = ['owner', 'isVotingActive', 'getCurrentRound'];
    const missingFunctions = [];

    for (const funcName of essentialFunctions) {
      if (typeof contract[funcName] !== 'function') {
        missingFunctions.push(funcName);
      }
    }

    if (missingFunctions.length > 0) {
      return createHealthCheckResult(false, 'ABI missing essential functions', {
        missingFunctions
      });
    }

    return createHealthCheckResult(true, 'Contract ABI is compatible', {
      functionsCount: CONTRACT_ABI.filter(item => item.type === 'function').length
    });
  } catch (error) {
    return createHealthCheckResult(false, `ABI compatibility check failed: ${error.message}`);
  }
};

// Check contract owner retrieval
export const checkContractOwner = async () => {
  try {
    if (!window.ethereum) {
      return createHealthCheckResult(false, 'No wallet provider');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    const owner = await contract.owner();

    if (!owner) {
      return createHealthCheckResult(false, 'Contract owner not found');
    }

    if (!isValidAddress(owner)) {
      return createHealthCheckResult(false, 'Invalid contract owner address');
    }

    return createHealthCheckResult(true, 'Contract owner retrieved successfully', {
      owner
    });
  } catch (error) {
    return createHealthCheckResult(false, `Contract owner check failed: ${error.message}`);
  }
};

// Check user permissions (if connected)
export const checkUserPermissions = async (userAddress) => {
  try {
    if (!userAddress) {
      return createHealthCheckResult(true, 'No user address provided (skipping permission check)');
    }

    if (!window.ethereum) {
      return createHealthCheckResult(false, 'No wallet provider');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    const owner = await contract.owner();
    const isOwner = compareAddresses(userAddress, owner);

    return createHealthCheckResult(true, 'User permissions checked', {
      userAddress,
      contractOwner: owner,
      isOwner,
      canStartVoting: isOwner,
      canEndVoting: isOwner,
      canResetVoting: isOwner,
      canVote: true // All users can vote
    });
  } catch (error) {
    return createHealthCheckResult(false, `User permission check failed: ${error.message}`);
  }
};

// Check voting state accessibility
export const checkVotingState = async () => {
  try {
    if (!window.ethereum) {
      return createHealthCheckResult(false, 'No wallet provider');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    const [votingActive, currentRound, votes] = await Promise.all([
      contract.isVotingActive(),
      contract.getCurrentRound(),
      contract.getAllVotes()
    ]);

    return createHealthCheckResult(true, 'Voting state accessible', {
      votingActive,
      currentRound: Number(currentRound),
      votes: votes.map(v => Number(v)),
      totalVotes: votes.reduce((sum, v) => sum + Number(v), 0)
    });
  } catch (error) {
    return createHealthCheckResult(false, `Voting state check failed: ${error.message}`);
  }
};

// Comprehensive health check
export const performFullHealthCheck = async (userAddress = null) => {
  const checks = {
    walletAvailability: null,
    walletConnection: null,
    network: null,
    contractAddress: null,
    contractDeployment: null,
    contractABI: null,
    contractOwner: null,
    userPermissions: null,
    votingState: null
  };

  try {
    // Run all checks
    checks.walletAvailability = checkWalletAvailability();
    checks.walletConnection = await checkWalletConnection();
    checks.network = await checkNetwork();
    checks.contractAddress = checkContractAddress();
    checks.contractDeployment = await checkContractDeployment();
    checks.contractABI = await checkContractABI();
    checks.contractOwner = await checkContractOwner();
    checks.userPermissions = await checkUserPermissions(userAddress);
    checks.votingState = await checkVotingState();

    // Calculate overall health
    const passedChecks = Object.values(checks).filter(check => check.passed).length;
    const totalChecks = Object.keys(checks).length;
    const healthPercentage = Math.round((passedChecks / totalChecks) * 100);

    // Determine critical failures
    const criticalChecks = ['walletAvailability', 'contractAddress', 'contractDeployment'];
    const criticalFailures = criticalChecks.filter(key => !checks[key].passed);

    const canInitialize = passedChecks >= totalChecks - 2; // Allow 2 non-critical failures
    const canVote = checks.votingState?.passed && checks.contractOwner?.passed;

    return {
      timestamp: new Date().toISOString(),
      overall: {
        healthy: criticalFailures.length === 0 && healthPercentage >= 80,
        canInitialize,
        canVote,
        healthPercentage,
        passedChecks,
        totalChecks,
        criticalFailures
      },
      checks
    };
  } catch (error) {
    return {
      timestamp: new Date().toISOString(),
      overall: {
        healthy: false,
        canInitialize: false,
        canVote: false,
        healthPercentage: 0,
        passedChecks: 0,
        totalChecks: Object.keys(checks).length,
        error: error.message
      },
      checks
    };
  }
};

// Quick health check for essential functionality
export const performQuickHealthCheck = async () => {
  try {
    const walletCheck = checkWalletAvailability();
    if (!walletCheck.passed) return walletCheck;

    const connectionCheck = await checkWalletConnection();
    if (!connectionCheck.passed) return connectionCheck;

    const contractCheck = await checkContractDeployment();
    if (!contractCheck.passed) return contractCheck;

    const ownerCheck = await checkContractOwner();
    if (!ownerCheck.passed) return ownerCheck;

    return createHealthCheckResult(true, 'All essential checks passed');
  } catch (error) {
    return createHealthCheckResult(false, `Quick health check failed: ${error.message}`);
  }
};