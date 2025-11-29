import React, { useState } from 'react';
import { useOBR } from '../../contexts/OBRContext';
import './PlayerSelector.css';

export const PlayerSelector: React.FC = () => {
  const { allPlayers, trackedPlayerId, playerId, setTrackedPlayer, isViewingSelf } = useOBR();
  const [isOpen, setIsOpen] = useState(false);

  if (allPlayers.length === 0) {
    return null; // Not a GM or no players
  }

  const trackedPlayer = allPlayers.find(p => p.id === trackedPlayerId);

  return (
    <div className="player-selector">
      <button
        className="player-selector__toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isViewingSelf ? 'Your Character' : `${trackedPlayer?.name || 'Unknown'}'s Character`}
        <span className="player-selector__arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="player-selector__dropdown">
          <div className="player-selector__header">Select Player</div>
          {allPlayers.map((player) => (
            <button
              key={player.id}
              className={`player-selector__item ${trackedPlayerId === player.id ? 'active' : ''}`}
              onClick={() => {
                setTrackedPlayer(player.id);
                setIsOpen(false);
              }}
            >
              {player.name}
              {player.id === playerId && ' (you)'}
              {player.id === trackedPlayerId && ' ✓'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
