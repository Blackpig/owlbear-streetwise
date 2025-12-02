import React, { useState, useEffect } from 'react';
import OBR from '@owlbear-rodeo/sdk';
import { useOBR } from '../../contexts/OBRContext';
import { performRoll, pushRoll, checkScenePanic, calculateNewStrain } from '../../utils/diceRoller';
import { DiceRoller3D } from '../Dice3D/DiceRoller3D';
import { broadcastDiceRoll, broadcastScenePanic } from '../../services/broadcastService';
import { addAssistance, broadcastAssistance, clearAssistance, withdrawAssistance } from '../../services/assistanceService';
import { addToSceneChallenge, checkSceneChallengeResolution } from '../../services/sceneChallengeService';
import type { DiceRoll } from '../../types/dice';
import './DiceRollerOBR.css';

interface DiceRollerOBRProps {
  attribute: number;
  skill: number;
  skillName: string;
  characterName: string;
  modifier?: number;
  canPushTwice?: boolean;
  activeTalents?: string[];
  talentDescription?: string;
  isAttributeRoll?: boolean;
  onClose: () => void;
}

export const DiceRollerOBR: React.FC<DiceRollerOBRProps> = ({
  attribute,
  skill,
  skillName,
  characterName,
  modifier = 0,
  canPushTwice = false,
  activeTalents = [],
  talentDescription = '',
  isAttributeRoll = false,
  onClose
}) => {
  const { sceneStrain, updateSceneStrain, assistanceDice, allPlayers, playerId, helpingInfo, sceneChallenge } = useOBR();
  const [currentRoll, setCurrentRoll] = useState<DiceRoll | null>(null);
  const [panicMessage, setPanicMessage] = useState<string>('');
  const [isRolling, setIsRolling] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [characterNames, setCharacterNames] = useState<Record<string, string>>({});
  const [contributeToChallenge, setContributeToChallenge] = useState(false);
  const [challengeResolutionMessage, setChallengeResolutionMessage] = useState<string>('');

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

  const handleRoll = async () => {
    // Reset rolling state first
    setIsRolling(false);

    const roll = performRoll({
      attribute,
      skill,
      modifier: modifier + assistanceDice, // Include assistance dice
      strainPoints: sceneStrain,
      canPushTwice
    });

    // Show dice immediately with rolling animation
    setCurrentRoll(roll);
    setPanicMessage('');

    // Clear assistance after using it
    if (assistanceDice > 0) {
      await clearAssistance(playerId);
    }

    // Trigger animation after a tiny delay to ensure reset
    setTimeout(() => {
      setIsRolling(true);
    }, 10);

    // Stop rolling animation after 1000ms
    setTimeout(async () => {
      setIsRolling(false);

      // Broadcast the roll result to all players
      const player = await OBR.player.getName();
      await broadcastDiceRoll(player, characterName, skillName, roll);

      // Add to scene challenge if opted in
      if (contributeToChallenge && sceneChallenge.active) {
        const totalBanes = roll.regularBanes + roll.strainBanes;
        await addToSceneChallenge(roll.successes, totalBanes);

        // Check for resolution (with updated totals)
        const updatedChallenge = {
          ...sceneChallenge,
          successes: sceneChallenge.successes + roll.successes,
          banes: sceneChallenge.banes + totalBanes
        };
        const resolution = checkSceneChallengeResolution(updatedChallenge);
        if (resolution) {
          let message = '';
          if (resolution === 'success') {
            message = `🎉 SCENE CHALLENGE COMPLETE! The party succeeded!`;
          } else if (resolution === 'failure') {
            message = `⚠️ SCENE CHALLENGE FAILED! Too many banes accumulated.`;
          } else if (resolution === 'partial') {
            message = `⚖️ SCENE CHALLENGE PARTIAL SUCCESS! Both success and failure reached.`;
          }
          setChallengeResolutionMessage(message);
        }
      }
    }, 1010);
  };

  const handlePush = async () => {
    if (!currentRoll || !currentRoll.canPush) return;

    // Reset rolling state first
    setIsRolling(false);

    const pushedRoll = pushRoll(currentRoll, canPushTwice);

    // Use a Promise to ensure state update completes before animation
    await new Promise(resolve => {
      setCurrentRoll(pushedRoll);
      setTimeout(resolve, 50); // Give React time to update and re-render
    });

    // Trigger animation after state has settled
    setIsRolling(true);

    // Stop rolling animation after 1000ms
    setTimeout(async () => {
      setIsRolling(false);

      // Broadcast the pushed roll result to all players
      const player = await OBR.player.getName();
      await broadcastDiceRoll(player, characterName, skillName, pushedRoll);

      // Add to scene challenge if opted in (pushed rolls also count)
      if (contributeToChallenge && sceneChallenge.active) {
        const totalBanes = pushedRoll.regularBanes + pushedRoll.strainBanes;
        await addToSceneChallenge(pushedRoll.successes, totalBanes);

        // Check for resolution (with updated totals)
        const updatedChallenge = {
          ...sceneChallenge,
          successes: sceneChallenge.successes + pushedRoll.successes,
          banes: sceneChallenge.banes + totalBanes
        };
        const resolution = checkSceneChallengeResolution(updatedChallenge);
        if (resolution) {
          let message = '';
          if (resolution === 'success') {
            message = `🎉 SCENE CHALLENGE COMPLETE! The party succeeded!`;
          } else if (resolution === 'failure') {
            message = `⚠️ SCENE CHALLENGE FAILED! Too many banes accumulated.`;
          } else if (resolution === 'partial') {
            message = `⚖️ SCENE CHALLENGE PARTIAL SUCCESS! Both success and failure reached.`;
          }
          setChallengeResolutionMessage(message);
        }
      }
    }, 1010);

    // Update scene strain
    const newStrain = calculateNewStrain(sceneStrain, pushedRoll);
    await updateSceneStrain(newStrain);

    // Check for panic
    const panic = checkScenePanic(pushedRoll, sceneStrain);
    if (panic.triggered) {
      let message = `SCENE PANIC! Rolled ${panic.roll} + ${sceneStrain} Strain = ${panic.total}\n${panic.effect}`;

      if (panic.strainIncrease && panic.strainIncrease > 0) {
        await updateSceneStrain(newStrain + panic.strainIncrease);
        message += `\n+${panic.strainIncrease} additional Strain!`;
      }

      setPanicMessage(message);

      // Broadcast the scene panic to all players
      await broadcastScenePanic(
        characterName,
        panic.roll!,
        panic.total!,
        panic.effect!,
        panic.strainIncrease!
      );
    }
  };

  const handleHelpPlayer = async (targetPlayerId: string) => {
    // Find the target player info
    const targetPlayer = allPlayers.find(p => p.id === targetPlayerId);
    if (!targetPlayer) return;

    // Add assistance dice to target player and track who is helping
    await addAssistance(playerId, targetPlayerId, targetPlayer.name, 1);

    // Broadcast the assistance
    await broadcastAssistance(
      characterName,
      targetPlayerId,
      targetPlayer.name,
      targetPlayer.name // We don't have character name for other players, use player name
    );

    // Close help dialog
    setShowHelpDialog(false);
  };

  const handleWithdrawHelp = async () => {
    await withdrawAssistance(playerId);
  };

  const maxPushes = canPushTwice ? 2 : 1;
  // Calculate how many times this roll has been pushed
  const timesPushed = currentRoll && currentRoll.pushed ? (currentRoll.originalRoll?.pushed ? 2 : 1) : 0;
  const remainingPushes = maxPushes - timesPushed;

  // Check if there are any dice worth pushing (values 2-5)
  const hasPushableDice = currentRoll ?
    [...currentRoll.results.regular, ...currentRoll.results.strain].some(die => die !== 1 && die !== 6) :
    false;

  return (
    <div className="dice-roller-obr">
      <div className="dice-roller-header">
        <div className="dice-roller-header-content">
          <h2>{skillName}</h2>
          <div className="dice-roller-pool">
            Pool: {attribute}
            {!isAttributeRoll && ` + ${skill}`}
            {modifier !== 0 && ` ${modifier > 0 ? '+' : ''}${modifier}`}
            {assistanceDice > 0 && ` +${assistanceDice} help`}
            {' '}+ {sceneStrain} Strain
          </div>
        </div>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      {activeTalents.length > 0 && (
        <div className="dice-roller-talents">
          <div className="talent-indicator">
            <span className="talent-icon">✨</span>
            <strong>Active Talents:</strong> {activeTalents.join(', ')}
          </div>
          {talentDescription && (
            <div className="talent-description">{talentDescription}</div>
          )}
          {canPushTwice && (
            <div className="talent-push-info">Can push dice rolls twice!</div>
          )}
        </div>
      )}

      {!currentRoll ? (
        <>
          {sceneChallenge.active && (
            <div className="scene-challenge-opt-in">
              <label className="scene-challenge-checkbox">
                <input
                  type="checkbox"
                  checked={contributeToChallenge}
                  onChange={(e) => setContributeToChallenge(e.target.checked)}
                />
                <span>Contribute to Scene Challenge</span>
              </label>
              {sceneChallenge.description && (
                <div className="scene-challenge-description">
                  {sceneChallenge.description}
                </div>
              )}
            </div>
          )}
          <button className="roll-btn" onClick={handleRoll} disabled={isRolling}>
            {isRolling ? 'Rolling...' : 'Roll Dice'}
          </button>
        </>
      ) : (
        <>
          <DiceRoller3D
            regularDice={currentRoll.results.regular}
            strainDice={currentRoll.results.strain}
            isRolling={isRolling}
            lockedDice={currentRoll.lockedDice}
          />

          <div className="dice-results">
            {(() => {
              const totalBanes = currentRoll.regularBanes + currentRoll.strainBanes;

              // Format: N [R/P] where N=total, R=original, P=pushed
              const formatBreakdown = (total: number, original?: number, pushed?: number) => {
                if (original !== undefined && pushed !== undefined) {
                  return `${total} [${original}/${pushed}]`;
                }
                return `${total}`;
              };

              return (
                <>
                  <div className="result-row">
                    <span className="result-label">Successes:</span>
                    <span className={`result-value ${currentRoll.successes > 0 ? 'success' : 'failure'}`}>
                      {formatBreakdown(
                        currentRoll.successes,
                        currentRoll.originalSuccesses,
                        currentRoll.pushedSuccesses
                      )}
                    </span>
                  </div>

                  <div className="result-row">
                    <span className="result-label">Banes:</span>
                    <span className={`result-value ${totalBanes > 0 ? 'bane' : ''}`}>
                      {formatBreakdown(
                        totalBanes,
                        currentRoll.originalBanes,
                        currentRoll.pushedBanes
                      )}
                      {currentRoll.strainBanes > 0 && (
                        <span className="result-warning"> ({currentRoll.strainBanes} on Strain!)</span>
                      )}
                    </span>
                  </div>

                  {currentRoll.pushed && (
                    <div className="result-pushed-badge">Pushed Roll</div>
                  )}
                </>
              );
            })()}
          </div>

          {currentRoll.canPush && hasPushableDice && (
            <button className="push-btn" onClick={handlePush}>
              Push Roll ({remainingPushes} {remainingPushes === 1 ? 'push' : 'pushes'} remaining)
            </button>
          )}

          {/* Help Another Player button - show if roll has successes */}
          {currentRoll.successes > 0 && !helpingInfo && (
            <button className="help-btn" onClick={() => setShowHelpDialog(true)}>
              Help Another Player
            </button>
          )}

          {/* Withdraw Help button - show if already helping someone */}
          {helpingInfo && (
            <button className="help-btn withdraw-help-btn" onClick={handleWithdrawHelp}>
              Withdraw Help from {helpingInfo.targetPlayerName}
            </button>
          )}

          {/* Player Selector Dialog */}
          {showHelpDialog && (
            <div className="help-dialog">
              <h3>Help Another Player</h3>
              <p>Select a player to give them +1 die on their next roll:</p>
              <div className="player-list">
                {allPlayers.filter(p => p.id !== playerId).length > 0 ? (
                  allPlayers
                    .filter(p => p.id !== playerId)
                    .map(player => (
                      <button
                        key={player.id}
                        className="player-option"
                        onClick={() => handleHelpPlayer(player.id)}
                      >
                        {characterNames[player.id] || player.name}
                      </button>
                    ))
                ) : (
                  <div className="no-players-message">
                    No other players in the room to help.
                  </div>
                )}
              </div>
              <button className="cancel-btn" onClick={() => setShowHelpDialog(false)}>
                Cancel
              </button>
            </div>
          )}

          {panicMessage && (
            <div className="panic-alert">
              {panicMessage.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          )}

          {challengeResolutionMessage && (
            <div className="challenge-resolution-alert">
              {challengeResolutionMessage}
            </div>
          )}

          <button className="roll-again-btn" onClick={handleRoll} disabled={isRolling}>
            {isRolling ? 'Rolling...' : 'Roll Again'}
          </button>
        </>
      )}
    </div>
  );
};
