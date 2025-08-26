// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AnimalVoting {
    address public owner;
    bool public votingActive;
    uint256 public currentRound = 1;
    
    // Current round votes for each animal (0-4)
    mapping(uint256 => uint256) public votes;
    
    // Track which round each address last voted in
    mapping(address => uint256) public lastVotedRound;
    
    // Events
    event VoteCast(address voter, uint256 animal, uint256 round);
    event VotingStarted(uint256 round);
    event VotingEnded(uint256 round);
    event VotingReset(uint256 newRound);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    // Start voting (owner only)
    function startVoting() external onlyOwner {
        require(!votingActive, "Already active");
        votingActive = true;
        emit VotingStarted(currentRound);
    }
    
    // Vote for an animal (0=Tiger, 1=Zebra, 2=Giraffe, 3=Lynx, 4=Leopard)
    function vote(uint256 animal) external {
        require(votingActive, "Voting not active");
        require(lastVotedRound[msg.sender] < currentRound, "Already voted this round");
        require(animal < 5, "Invalid animal");
        
        lastVotedRound[msg.sender] = currentRound;
        votes[animal]++;
        
        emit VoteCast(msg.sender, animal, currentRound);
    }
    
    // End voting manually (owner only)
    function endVoting() external onlyOwner {
        require(votingActive, "Voting not active");
        votingActive = false;
        emit VotingEnded(currentRound);
    }
    
    // Reset voting - clears votes and starts new round
    function resetVoting() external onlyOwner {
        require(!votingActive, "Cannot reset while voting is active");
        
        // Clear all votes for current round
        for (uint256 i = 0; i < 5; i++) {
            votes[i] = 0;
        }
        
        // Start new round (automatically allows everyone to vote again)
        currentRound++;
        
        emit VotingReset(currentRound);
    }
    
    // Get winner 
    function getWinner() external view returns (uint256 winner, uint256 winningVotes) {
        uint256 highest = 0;
        uint256 winningAnimal = 0;
        
        for (uint256 i = 0; i < 5; i++) {
            if (votes[i] > highest) {
                highest = votes[i];
                winningAnimal = i;
            }
        }
        
        return (winningAnimal, highest);
    }
    
    // Get all current votes in one call (gas efficient)
    function getAllVotes() external view returns (uint256[5] memory) {
        return [votes[0], votes[1], votes[2], votes[3], votes[4]];
    }
    
    // Check if voting is active
    function isVotingActive() external view returns (bool) {
        return votingActive;
    }
    
    // Check if user has voted this round
    function hasVotedThisRound(address user) external view returns (bool) {
        return lastVotedRound[user] >= currentRound;
    }
    
    // Get current round number
    function getCurrentRound() external view returns (uint256) {
        return currentRound;
    }
}