import React, { useState, useEffect } from 'react';
import OBR from '@owlbear-rodeo/sdk';
import { useOBR } from '../../contexts/OBRContext';
import './PlayerSelector.css';

export const PlayerSelector: React.FC = () => {
  const { allPlayers, trackedPlayerId, playerId, setTrackedPlayer, isViewingSelf } = useOBR();
  const [isOpen, setIsOpen] = useState(false);
  const [characterNames, setCharacterNames] = useState<Record<string, string>>({});

  // Load character names from metadata
  useEffect(() => {
    const loadCharacterNames = async () => {
      const metadata = await OBR.room.getMetadata();
      const names: Record<string, string> = {};

      for (const player of allPlayers) {
        const character = metadata[`com.streetwise.character-sheet/character/${player.id}`] as { name?: string } | undefined;
        names[player.id] = character?.name || player.name;
      }

      setCharacterNames(names);
    };

    loadCharacterNames();

    // Subscribe to metadata changes
    const unsubscribe = OBR.room.onMetadataChange(() => {
      loadCharacterNames();
    });

    return () => {
      unsubscribe();
    };
  }, [allPlayers]);

  if (allPlayers.length === 0) {
    return null; // Not a GM or no players
  }

  const trackedPlayer = allPlayers.find(p => p.id === trackedPlayerId);
  const trackedCharacterName = characterNames[trackedPlayerId] || trackedPlayer?.name || 'Unknown';

  return (
    <div className="player-selector">
      <button
        className="player-selector__toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isViewingSelf ? 'Your Character' : trackedCharacterName}
        <span className="player-selector__arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="player-selector__dropdown">
          <div className="player-selector__header">Select Character</div>
          {allPlayers.map((player) => (
            <button
              key={player.id}
              className={`player-selector__item ${trackedPlayerId === player.id ? 'active' : ''}`}
              onClick={() => {
                setTrackedPlayer(player.id);
                setIsOpen(false);
              }}
            >
              {characterNames[player.id] || player.name}
              {player.id === playerId && ' (you)'}
              {player.id === trackedPlayerId && ' ✓'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
