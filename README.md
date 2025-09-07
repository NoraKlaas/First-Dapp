# Animal Voting Dapp

A fully decentralized voting application built on Ethereum, allowing users to vote for their favorite animals in multiple rounds. This project demonstrates modern Web3 development practices with a complete smart contract backend and React frontend.

## Overview

Animal Voting Dapp is a comprehensive decentralized application that showcases:
- **Smart Contract Development** with Solidity
- **Modern Web3 Frontend** with React and Ethers.js
- **Professional Testing** with Hardhat and Viem
- **Multi-Network Support** including Sepolia testnet
- **Complete Dapp Architecture** from blockchain to user interface

The Dapp supports multiple voting rounds, administrative controls, and real-time result tracking.

## Key Features

### Smart Contract Features
- **Multi-Round Voting System**: Support for sequential voting rounds with automatic state management
- **Duplicate Vote Prevention**: Users can only vote once per round, with round-based tracking
- **Owner Administration**: Complete admin controls for starting, ending, and resetting voting sessions
- **Gas-Optimized Operations**: Efficient vote counting and result retrieval functions
- **Comprehensive Events**: Full event logging for vote tracking and analytics
- **Secure Access Control**: Owner-only functions with proper access modifiers

### Frontend Features
- **Modern React Architecture**: Component-based design with custom hooks for state management
- **Web3 Wallet Integration**: Seamless MetaMask connection with network detection
- **Real-Time Updates**: Live vote counting and result display
- **Responsive Design**: Mobile-friendly interface with CSS animations
- **Error Handling**: Comprehensive error management and user feedback
- **Admin Dashboard**: Special interface for contract owners to manage voting sessions
- **Multi-Network Support**: Automatic network detection and switching capabilities

### Developer Features
- **Comprehensive Testing Suite**: Full test coverage with Hardhat and Viem
- **Type-Safe Development**: TypeScript configuration for smart contracts
- **Professional Deployment**: Hardhat Ignition modules for contract deployment
- **Multiple Network Configuration**: Support for local, testnet, and mainnet deployment
- **Development Tools**: Complete toolchain for building and testing

## Architecture

### Smart Contract Layer (`Animal Voting/`)
```
contracts/
├── Voting.sol           # Main AnimalVoting smart contract

test/
├── Voting.ts           # Comprehensive test suite

ignition/modules/
└── Voting.ts           # Deployment module
```

### Frontend Layer (`client/`)
```
src/
├── components/         # React components
│   ├── WalletConnection.jsx      # Wallet integration
│   ├── AdminControls.jsx         # Owner controls
│   ├── VotingStatus.jsx          # Voting state display
│   ├── AnimalVotingButtons.jsx   # Vote submission
│   ├── LiveResults.jsx           # Real-time results
│   └── LoadingSpinner.jsx        # Loading states
├── hooks/              # Custom React hooks
│   ├── useWallet.js              # Wallet state management
│   ├── useContract.js            # Smart contract interaction
│   └── useVotingState.js         # Voting data management
├── utils/              # Utility functions
│   ├── contractServices.js       # Contract interaction layer
│   ├── constants.js              # App constants
│   └── helpers.js                # Helper functions
└── assets/animals/     # Animal images (Tiger, Zebra, Giraffe, Lynx, Leopard)
```

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- MetaMask browser extension
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd animal-voting-dapp
   ```

2. **Install smart contract dependencies**
   ```bash
   cd "Animal Voting"
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment setup**
   Create `.env` file in the `Animal Voting` directory:
   ```env
   SEPOLIA_RPC_URL=sepolia_rpc_url
   PRIVATE_KEY=your_wallet_private_key
   ```

### Development Workflow

1. **Start local blockchain**
   ```bash
   cd "Animal Voting"
   npx hardhat node
   ```

2. **Deploy contracts locally**
   ```bash
   npx hardhat ignition deploy ignition/modules/Voting.ts --network localhost
   ```

3. **Run tests**
   ```bash
   npm test
   ```

4. **Start frontend development server**
   ```bash
   cd ../client
   npm start
   ```

## Usage Guide

### For Voters
1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask connection
2. **Check Status**: View current voting round and your voting status
3. **Cast Vote**: Select your favorite animal and confirm the transaction
4. **View Results**: Monitor real-time vote counts and winner announcements

### For Administrators (Contract Owner)
1. **Start Voting**: Initialize a new voting session
2. **Monitor Progress**: Track votes and participation
3. **End Voting**: Close the current voting session
4. **Reset for New Round**: Clear votes and increment round number

## Testing

The project includes a comprehensive testing suite covering all smart contract functionality:

```bash
cd "Animal Voting"
npm test
```

**Test Coverage:**
-  Contract deployment and initialization
-  Voting session management (start/stop)
-  Vote casting and validation
-  Duplicate vote prevention
-  Winner determination logic
-  Multi-round functionality
-  Access control and permissions
-  Edge cases and error conditions

##  Deployment

### Local Development
```bash
npx hardhat ignition deploy ignition/modules/Voting.ts --network localhost
```

### Sepolia Testnet
```bash
npx hardhat ignition deploy ignition/modules/Voting.ts --network sepolia
```

### Production Deployment
1. Configure production network in `hardhat.config.ts`
2. Set up environment variables for mainnet
3. Deploy with appropriate gas settings

## Technical Stack

### Blockchain & Smart Contracts
- **Solidity** ^0.8.19 - Smart contract development
- **Hardhat** ^3.0.0 - Development framework
- **Viem** ^2.34.0 - Ethereum interaction library
- **TypeScript** - Type-safe development

### Frontend
- **React** ^19.1.1 - UI framework
- **Ethers.js** ^6.15.0 - Web3 library
- **React Toastify** - User notifications
- **CSS3** - Modern styling with animations

### Development Tools
- **Hardhat Toolbox** - Complete development suite
- **Hardhat Ignition** - Deployment management
- **Node Test Runner** - Built-in testing framework

## Smart Contract Security

The AnimalVoting contract implements several security measures:
- **Access Control**: Owner-only functions with `onlyOwner` modifier
- **Input Validation**: Proper validation for animal IDs and voting states
- **State Management**: Secure state transitions and round tracking
- **Reentrancy Protection**: Simple functions without external calls
- **Event Logging**: Comprehensive event emission for transparency

## Contract Functions

### Public Functions
- `vote(uint256 animal)` - Cast a vote for an animal (0-4)
- `getWinner()` - Get current winning animal and vote count
- `getAllVotes()` - Get all vote counts in a single call
- `isVotingActive()` - Check if voting is currently active
- `hasVotedThisRound(address user)` - Check if user has voted this round

### Owner Functions
- `startVoting()` - Begin a voting session
- `endVoting()` - End current voting session
- `resetVoting()` - Clear votes and start new round

### View Functions
- `getCurrentRound()` - Get current round number
- `votes(uint256 animal)` - Get votes for specific animal
- `owner()` - Get contract owner address

## Contributing

Contributions are welcome! Please consider the following:

1. **Fork the repository** and create a feature branch
2. **Write tests** for any new functionality
3. **Follow coding standards** established in the project
4. **Test thoroughly** on local network before submitting
5. **Submit a pull request** with detailed description

## License

This project is open source and available under the MIT License.

---

**Built with ❤️**

*Vote for your favorite animal and experience the future of decentralized decision-making!*
