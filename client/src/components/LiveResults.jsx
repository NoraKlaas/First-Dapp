import React from 'react';
import { ANIMALS } from '../utils/constants.js';

const LiveResults = ({ 
  votes, 
  totalVotes, 
  winner, 
  isTie, 
  votesForDisplay, 
  votingActive, 
  isLoading,
  getAnimalById,
  onRefresh 
}) => {
  
  const winningAnimal = getAnimalById(winner.winner);
  
  const getBarWidth = (animalVotes) => {
    if (totalVotes === 0) return '0%';
    return `${(animalVotes / totalVotes) * 100}%`;
  };

  const getResultClass = (animalId) => {
    let className = 'result-row';
    
    if (totalVotes > 0 && votes[animalId] === winner.winningVotes && winner.winningVotes > 0) {
      className += ' winner';
    }
    
    return className;
  };

  const renderWinnerSection = () => {
    if (totalVotes === 0) {
      return (
        <div className="winner-section no-votes">
          <h4>No votes cast yet</h4>
          <p>Be the first to vote!</p>
        </div>
      );
    }

    if (isTie) {
      const tiedAnimals = votes
        .map((voteCount, index) => ({ id: index, votes: voteCount }))
        .filter(animal => animal.votes === winner.winningVotes)
        .map(animal => getAnimalById(animal.id));

      return (
        <div className="winner-section tie">
          <h4>Current Tie</h4>
          <div className="tied-animals">
            {tiedAnimals.map((animal) => (
              <div key={animal.id} className="tied-animal">
                <img src={animal.image} alt={animal.name} className="winner-image small" />
                <span>{animal.name}</span>
              </div>
            ))}
          </div>
          <p>{winner.winningVotes} votes each</p>
        </div>
      );
    }

    return (
      <div className="winner-section">
        <h4>{votingActive ? 'Current Leader' : 'Winner'}</h4>
        <div className="winner-display">
          <img 
            src={winningAnimal.image} 
            alt={winningAnimal.name} 
            className="winner-image"
          />
          <div className="winner-info">
            <h3>{winningAnimal.name}</h3>
            <p>{winner.winningVotes} votes ({votesForDisplay[winner.winner]?.percentage || '0%'})</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="live-results">
      <div className="results-header">
        <h3>Live Results</h3>
        <div className="results-meta">
          <span className="total-votes">Total Votes: {totalVotes}</span>
          {onRefresh && (
            <button 
              onClick={onRefresh}
              disabled={isLoading}
              className="refresh-button"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          )}
        </div>
      </div>

      {renderWinnerSection()}

      <div className="results-breakdown">
        <h4>Vote Breakdown</h4>
        <div className="results-list">
          {ANIMALS.map((animal) => (
            <div key={animal.id} className={getResultClass(animal.id)}>
              <div className="animal-info">
                <img 
                  src={animal.image} 
                  alt={animal.name} 
                  className="animal-image small"
                />
                <span className="animal-name">{animal.name}</span>
              </div>
              
              <div className="vote-data">
                <div className="vote-bar-container">
                  <div 
                    className="vote-bar"
                    style={{ width: getBarWidth(votes[animal.id]) }}
                  ></div>
                </div>
                
                <div className="vote-stats">
                  <span className="vote-count">{votes[animal.id]}</span>
                  <span className="vote-percentage">
                    {votesForDisplay[animal.id]?.percentage || '0%'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {totalVotes === 0 && (
        <div className="no-results">
          <p>No votes have been cast yet. {votingActive ? 'Start voting to see results!' : 'Wait for voting to begin.'}</p>
        </div>
      )}

      <div className="results-footer">
        <p className="update-info">
          Results update automatically when new votes are cast.
        </p>
        {votingActive && (
          <p className="voting-active-note">
            Voting is currently active. Results may change as more votes are cast.
          </p>
        )}
      </div>
    </div>
  );
};

export default LiveResults;