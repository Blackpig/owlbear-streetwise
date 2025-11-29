import React, { useEffect, useState } from 'react';
import type { DiceRollMessage, ScenePanicMessage, PlayerAssistanceMessage } from '../../types/broadcast';
import { HelpingHandsIcon } from '../Icons/Icons';
import './RollNotification.css';

interface RollNotificationProps {
  message: DiceRollMessage | ScenePanicMessage | PlayerAssistanceMessage;
  onDismiss: () => void;
}

export const RollNotification: React.FC<RollNotificationProps> = ({ message, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in
    setTimeout(() => setIsVisible(true), 10);

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for fade-out animation before calling onDismiss
      setTimeout(onDismiss, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (message.type === 'STREETWISE_ROLL') {
    const roll = message as DiceRollMessage;
    return (
      <div className={`roll-notification ${isVisible ? 'visible' : ''}`}>
        <div className="notification-header">
          <span className="player-name">{roll.playerName}</span>
          <span className="character-name">({roll.characterName})</span>
          <button className="dismiss-btn" onClick={() => setIsVisible(false)}>✕</button>
        </div>
        <div className="notification-body">
          <div className="skill-name">{roll.skillName}</div>
          <div className="roll-results">
            <span className={`result-item ${roll.results.successes > 0 ? 'success' : 'failure'}`}>
              {roll.results.successes} success{roll.results.successes !== 1 ? 'es' : ''}
            </span>
            {roll.results.banes > 0 && (
              <span className="result-item bane">
                {roll.results.banes} bane{roll.results.banes !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="dice-pool">
            Pool: {roll.dicePool.regular} + {roll.dicePool.strain} strain
            {roll.pushed && <span className="pushed-badge">PUSHED</span>}
          </div>
        </div>
      </div>
    );
  }

  if (message.type === 'SCENE_PANIC') {
    const panic = message as ScenePanicMessage;
    return (
      <div className={`roll-notification panic-notification ${isVisible ? 'visible' : ''}`}>
        <div className="notification-header">
          <span className="panic-title">⚠️ SCENE PANIC</span>
          <button className="dismiss-btn" onClick={() => setIsVisible(false)}>✕</button>
        </div>
        <div className="notification-body">
          <div className="character-name">{panic.characterName}</div>
          <div className="panic-roll">
            Rolled {panic.roll} + Strain = {panic.total}
          </div>
          <div className="panic-effect">{panic.effect}</div>
          {panic.strainIncrease > 0 && (
            <div className="strain-increase">+{panic.strainIncrease} Strain</div>
          )}
        </div>
      </div>
    );
  }

  if (message.type === 'PLAYER_ASSISTANCE') {
    const assistance = message as PlayerAssistanceMessage;
    return (
      <div className={`roll-notification assistance-notification ${isVisible ? 'visible' : ''}`}>
        <div className="notification-header">
          <span className="assistance-title">
            <HelpingHandsIcon /> Player Assistance
          </span>
          <button className="dismiss-btn" onClick={() => setIsVisible(false)}>✕</button>
        </div>
        <div className="notification-body">
          <div className="assistance-from">
            <strong>{assistance.fromCharacterName}</strong> ({assistance.fromPlayerName})
          </div>
          <div className="assistance-text">is helping</div>
          <div className="assistance-to">
            <strong>{assistance.toCharacterName}</strong> ({assistance.toPlayerName})
          </div>
          <div className="assistance-bonus">+1 die on next roll</div>
        </div>
      </div>
    );
  }

  return null;
};
