import React, { useState } from 'react';
import { ANIMALS } from '../utils/constants.js';

const AnimalVotingButtons = ({ 
  votingActive, 
  hasVoted, 
  isLoading, 
  userAddress, 
  onVote 
}) => {
  const [votingAnimal, setVotingAnimal] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const canVote = votingActive && !hasVoted && userAddress && !isLoading;

  const handleVote = async (animalId) => {
    if (!canVote) return;
    
    try {
      setVotingAnimal(animalId);
      setSuccessMessage('');
      
      const result = await onVote(animalId);
      
      if (result.success) {
        setSuccessMessage(result.message);
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err) {
      console.error('Failed to vote:', err);
    } finally {
      setVotingAnimal(null);
    }
  };

  const getButtonClass = (animalId) => {
    let className = 'animal-button';
    
    if (!canVote) {
      className += ' disabled';
    }
    
    if (votingAnimal === animalId) {
      className += ' voting';
    }
    
    return className;
  };

  const getButtonText = (animalId) => {
    if (votingAnimal === animalId) {
      return 'Voting...';
    }
    return `Vote for ${ANIMALS[animalId].name}`;
  };

  const getDisabledReason = () => {
    if (!userAddress) {
      return 'Connect your wallet to vote';
    }
    if (!votingActive) {
      return 'Voting is not active';
    }
    if (hasVoted) {
      return 'You have already voted in this round';
    }
    if (isLoading) {
      return 'Loading...';
    }
    return '';
  };

  if (!votingActive && !hasVoted) {
    return (
      <div className="animal-voting-buttons disabled-state">
        <h3>Animal Voting</h3>
        <p className="disabled-message">{getDisabledReason()}</p>
        
        <div className="animals-preview">
          {ANIMALS.map((animal) => (
            <div key={animal.id} className="animal-preview">
              <img 
                src={animal.image} 
                alt={animal.name}
                className="animal-image preview"
              />
              <span className="animal-name">{animal.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animal-voting-buttons">
      <h3>Choose Your Favorite Animal</h3>
      
      {!canVote && (
        <div className="voting-disabled">
          <p>{getDisabledReason()}</p>
        </div>
      )}
      
      <div className="animals-grid">
        {ANIMALS.map((animal) => (
          <div key={animal.id} className="animal-option">
            <button
              onClick={() => handleVote(animal.id)}
              disabled={!canVote}
              className={getButtonClass(animal.id)}
            >
              <div className="animal-content">
                <img 
                  src={animal.image} 
                  alt={animal.name}
                  className="animal-image"
                />
                <div className="animal-info">
                  <h4 className="animal-name">{animal.name}</h4>
                  <span className="vote-text">
                    {getButtonText(animal.id)}
                  </span>
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>
      
      {successMessage && (
        <div className="vote-success">
          <p>{successMessage}</p>
        </div>
      )}
      
      {hasVoted && (
        <div className="already-voted">
          <p>Vote cast successfully.</p>
        </div>
      )}
      
    </div>
  );
};

export default AnimalVotingButtons;