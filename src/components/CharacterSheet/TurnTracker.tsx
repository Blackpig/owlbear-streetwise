import React, { useState } from 'react';
import OBR from '@owlbear-rodeo/sdk';
import { useOBR } from '../../contexts/OBRContext';
import { drawInitiative, swapInitiative } from '../../services/initiativePoolService';
import { QuickActionIcon, SlowActionIcon, SwapIcon } from '../Icons/Icons';
import './TurnTracker.css';

interface TurnTrackerProps {
  canEdit: boolean;
}

interface SwapTarget {
  id: string;
  name: string;
  initiative: number;
  isNPC: boolean;
}

export const TurnTracker: React.FC<TurnTrackerProps> = ({ canEdit }) => {
  // Get turn tracking data from OBR context (shows tracked player's data)
  const {
    initiative,
    turnActions,
    updateTurnActions,
    initiativeRoundActive,
    playerId,
    isViewingSelf,
    allPlayers,
    npcs
  } = useOBR();

  const [drawing, setDrawing] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapTargets, setSwapTargets] = useState<SwapTarget[]>([]);
  const [swapping, setSwapping] = useState(false);

  // Calculate how many checkboxes have been checked (not actions, but checkboxes)
  const quickActionsCount = turnActions.quick.filter(Boolean).length;
  const slowActionsCount = turnActions.slow ? 1 : 0;
  const totalChecked = quickActionsCount + slowActionsCount;

  // Disable any unchecked box only when 2 boxes are already checked
  const shouldDisableUnchecked = totalChecked >= 2;

  // Handle quick action toggle
  const handleQuickToggle = (index: 0 | 1) => {
    if (!canEdit) return;

    const newQuick: [boolean, boolean] = [...turnActions.quick] as [boolean, boolean];
    newQuick[index] = !newQuick[index];

    updateTurnActions({
      quick: newQuick,
      slow: turnActions.slow
    });
  };

  // Handle slow action toggle
  const handleSlowToggle = () => {
    if (!canEdit) return;

    updateTurnActions({
      quick: turnActions.quick,
      slow: !turnActions.slow
    });
  };

  // Handle drawing initiative
  const handleDrawInitiative = async () => {
    if (!canEdit || drawing) return;

    setDrawing(true);
    try {
      await drawInitiative(playerId);
    } catch (error) {
      console.error('Failed to draw initiative:', error);
    } finally {
      setDrawing(false);
    }
  };

  // Reset actions for new turn
  const handleResetActions = () => {
    if (!canEdit) return;
    updateTurnActions({
      quick: [false, false],
      slow: false
    });
  };

  // Handle opening swap modal and loading available targets
  const handleOpenSwapModal = async () => {
    if (!initiative || !canEdit || !isViewingSelf) return;

    const metadata = await OBR.room.getMetadata();
    const targets: SwapTarget[] = [];

    // Add PCs with higher initiative
    for (const player of allPlayers) {
      const playerInitiative = (metadata[`streetwise.initiative.${player.id}`] as number | null) ?? null;
      if (playerInitiative !== null && playerInitiative > initiative && player.id !== playerId) {
        const character = metadata[`com.streetwise.character-sheet/character/${player.id}`] as { name?: string } | undefined;
        const characterName = character?.name || player.name;
        targets.push({
          id: player.id,
          name: characterName,
          initiative: playerInitiative,
          isNPC: false
        });
      }
    }

    // Add NPCs with higher initiative
    for (const npc of npcs) {
      if (npc.initiative !== null && npc.initiative > initiative) {
        targets.push({
          id: npc.id,
          name: npc.name,
          initiative: npc.initiative,
          isNPC: true
        });
      }
    }

    // Sort by initiative (lowest to highest)
    targets.sort((a, b) => a.initiative - b.initiative);

    setSwapTargets(targets);
    setShowSwapModal(true);
  };

  // Handle swapping initiative
  const handleSwap = async (targetId: string) => {
    if (swapping) return;

    setSwapping(true);
    try {
      await swapInitiative(playerId, targetId);
      setShowSwapModal(false);
    } catch (error) {
      console.error('Failed to swap initiative:', error);
    } finally {
      setSwapping(false);
    }
  };

  return (
    <div className="turn-tracker">
      {/* Initiative Display */}
      <div className="turn-tracker__initiative">
        <label className="turn-tracker__initiative-label">Initiative:</label>
        {initiative !== null ? (
          // Show drawn initiative value with swap button
          <div className="turn-tracker__initiative-with-swap">
            <span className="turn-tracker__initiative-value">{initiative}</span>
            {canEdit && isViewingSelf && initiativeRoundActive && (
              <button
                className="turn-tracker__swap-btn"
                onClick={handleOpenSwapModal}
                title="Swap Initiative"
              >
                <SwapIcon />
              </button>
            )}
          </div>
        ) : initiativeRoundActive && canEdit && isViewingSelf ? (
          // Show draw button for players who haven't drawn yet
          <button
            className="turn-tracker__draw-btn"
            onClick={handleDrawInitiative}
            disabled={drawing}
          >
            {drawing ? 'Drawing...' : 'Draw'}
          </button>
        ) : (
          // Show placeholder
          <span className="turn-tracker__initiative-placeholder">—</span>
        )}
      </div>

      {/* Quick Actions */}
      <div className="turn-tracker__action-row">
        <QuickActionIcon />
        <span className="turn-tracker__action-label">Quick:</span>
        <div className="turn-tracker__checkboxes">
          {[0, 1].map((index) => {
            const isChecked = turnActions.quick[index as 0 | 1];
            const isDisabled = !canEdit || (!isChecked && shouldDisableUnchecked);

            return (
              <label
                key={index}
                className={`turn-action-checkbox ${isChecked ? 'checked' : ''} ${isDisabled ? 'disabled' : ''} ${!canEdit ? 'read-only' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={isDisabled}
                  onChange={() => handleQuickToggle(index as 0 | 1)}
                />
                <div className="turn-action-checkbox__mark" />
              </label>
            );
          })}
        </div>
      </div>

      {/* Slow Actions */}
      <div className="turn-tracker__action-row">
        <SlowActionIcon />
        <span className="turn-tracker__action-label">Slow:</span>
        <div className="turn-tracker__checkboxes">
          <label
            className={`turn-action-checkbox ${turnActions.slow ? 'checked' : ''} ${(!canEdit || (!turnActions.slow && shouldDisableUnchecked)) ? 'disabled' : ''} ${!canEdit ? 'read-only' : ''}`}
          >
            <input
              type="checkbox"
              checked={turnActions.slow}
              disabled={!canEdit || (!turnActions.slow && shouldDisableUnchecked)}
              onChange={handleSlowToggle}
            />
            <div className="turn-action-checkbox__mark" />
          </label>
        </div>
      </div>

      {/* Reset Button - only for editable mode */}
      {canEdit && totalChecked > 0 && (
        <button
          className="turn-tracker__reset"
          onClick={handleResetActions}
          title="Reset actions for new turn"
        >
          Reset
        </button>
      )}

      {/* Swap Initiative Modal */}
      {showSwapModal && (
        <>
          <div className="turn-tracker__swap-backdrop" onClick={() => setShowSwapModal(false)} />
          <div className="turn-tracker__swap-modal">
            <h3>Swap Initiative</h3>
            <p>Select a character to swap initiative with:</p>
            {swapTargets.length === 0 ? (
              <div className="turn-tracker__swap-empty">
                No characters with higher initiative available.
              </div>
            ) : (
              <div className="turn-tracker__swap-list">
                {swapTargets.map((target) => (
                  <button
                    key={target.id}
                    className="turn-tracker__swap-target"
                    onClick={() => handleSwap(target.id)}
                    disabled={swapping}
                  >
                    <span className="turn-tracker__swap-target-initiative">{target.initiative}</span>
                    <span className="turn-tracker__swap-target-name">
                      {target.name}
                      {target.isNPC && <span className="turn-tracker__swap-target-badge">NPC</span>}
                    </span>
                  </button>
                ))}
              </div>
            )}
            <button
              className="turn-tracker__swap-cancel"
              onClick={() => setShowSwapModal(false)}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
};
