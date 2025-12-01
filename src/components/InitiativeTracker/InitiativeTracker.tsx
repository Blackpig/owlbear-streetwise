import React, { useState, useEffect } from 'react';
import OBR from '@owlbear-rodeo/sdk';
import { useOBR } from '../../contexts/OBRContext';
import { addNPC, removeNPC, updateNPCTurnActions } from '../../services/npcService';
import { drawInitiativeForNPC, swapInitiative } from '../../services/initiativePoolService';
import { startNewTurn } from '../../services/turnManagementService';
import { QuickActionIcon, SlowActionIcon, ResetIcon, SwapIcon } from '../Icons/Icons';
import type { TurnActions } from '../../services/turnTrackingService';
import './InitiativeTracker.css';

interface InitiativeEntry {
  id: string;
  name: string;
  initiative: number | null;
  turnActions: TurnActions;
  isNPC: boolean;
}

interface SwapTarget {
  id: string;
  name: string;
  initiative: number;
  isNPC: boolean;
}

export const InitiativeTracker: React.FC = () => {
  const { allPlayers, npcs, turnCounter, initiativeRoundActive } = useOBR();
  const [newNPCName, setNewNPCName] = useState('');
  const [addingNPC, setAddingNPC] = useState(false);
  const [drawingForNPC, setDrawingForNPC] = useState<string | null>(null);
  const [startingNewTurn, setStartingNewTurn] = useState(false);
  const [playerData, setPlayerData] = useState<Record<string, { initiative: number | null; turnActions: TurnActions; characterName: string }>>({});
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapSourceId, setSwapSourceId] = useState<string | null>(null);
  const [swapTargets, setSwapTargets] = useState<SwapTarget[]>([]);
  const [swapping, setSwapping] = useState(false);

  // Load PC initiatives, turn actions, and character names from metadata
  useEffect(() => {
    const loadPlayerData = async () => {
      const metadata = await OBR.room.getMetadata();
      const data: Record<string, { initiative: number | null; turnActions: TurnActions; characterName: string }> = {};

      for (const player of allPlayers) {
        const initiative = (metadata[`streetwise.initiative.${player.id}`] as number | null) ?? null;
        const turnActions = (metadata[`streetwise.turnActions.${player.id}`] as TurnActions) || { quick: [false, false], slow: false };
        const character = metadata[`com.streetwise.character-sheet/character/${player.id}`] as { name?: string } | undefined;
        const characterName = character?.name || player.name;
        data[player.id] = { initiative, turnActions, characterName };
      }

      setPlayerData(data);
    };

    loadPlayerData();

    // Subscribe to metadata changes
    const unsubscribe = OBR.room.onMetadataChange(() => {
      loadPlayerData();
    });

    return () => {
      unsubscribe();
    };
  }, [allPlayers]);

  // Combine PCs and NPCs into single list
  const entries: InitiativeEntry[] = [
    // Players
    ...allPlayers.map(player => ({
      id: player.id,
      name: playerData[player.id]?.characterName || player.name,
      initiative: playerData[player.id]?.initiative ?? null,
      turnActions: playerData[player.id]?.turnActions || { quick: [false, false], slow: false },
      isNPC: false
    })),
    // NPCs
    ...npcs.map(npc => ({
      id: npc.id,
      name: npc.name,
      initiative: npc.initiative,
      turnActions: npc.turnActions,
      isNPC: true
    }))
  ];

  // Sort by initiative (null values at end)
  const sortedEntries = entries.sort((a, b) => {
    if (a.initiative === null && b.initiative === null) return 0;
    if (a.initiative === null) return 1;
    if (b.initiative === null) return -1;
    return a.initiative - b.initiative;
  });

  const handleAddNPC = async () => {
    if (!newNPCName.trim() || addingNPC) return;

    setAddingNPC(true);
    try {
      await addNPC(newNPCName.trim());
      setNewNPCName('');
    } catch (error) {
      console.error('Failed to add NPC:', error);
    } finally {
      setAddingNPC(false);
    }
  };

  const handleRemoveNPC = async (npcId: string) => {
    try {
      await removeNPC(npcId);
    } catch (error) {
      console.error('Failed to remove NPC:', error);
    }
  };

  const handleDrawForNPC = async (npcId: string) => {
    if (drawingForNPC) return;

    setDrawingForNPC(npcId);
    try {
      await drawInitiativeForNPC(npcId);
    } catch (error) {
      console.error('Failed to draw initiative for NPC:', error);
    } finally {
      setDrawingForNPC(null);
    }
  };

  const handleNPCActionToggle = async (npcId: string, actionType: 'quick1' | 'quick2' | 'slow', currentActions: TurnActions) => {
    let newActions: TurnActions;

    if (actionType === 'quick1') {
      newActions = {
        quick: [!currentActions.quick[0], currentActions.quick[1]],
        slow: currentActions.slow
      };
    } else if (actionType === 'quick2') {
      newActions = {
        quick: [currentActions.quick[0], !currentActions.quick[1]],
        slow: currentActions.slow
      };
    } else {
      newActions = {
        quick: currentActions.quick,
        slow: !currentActions.slow
      };
    }

    // Check if we're trying to check more than 2 actions
    const totalChecked = newActions.quick.filter(Boolean).length + (newActions.slow ? 1 : 0);
    if (totalChecked > 2) return;

    try {
      await updateNPCTurnActions(npcId, newActions);
    } catch (error) {
      console.error('Failed to update NPC actions:', error);
    }
  };

  const handleNewTurn = async () => {
    if (startingNewTurn) return;

    setStartingNewTurn(true);
    try {
      await startNewTurn();
    } catch (error) {
      console.error('Failed to start new turn:', error);
    } finally {
      setStartingNewTurn(false);
    }
  };

  const handleResetInitiative = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = async () => {
    try {
      const metadata = await OBR.room.getMetadata();
      const npcs = (metadata['streetwise.npcs'] as Array<{ id: string; initiative: number | null; turnActions: TurnActions }>) || [];

      const updates: Record<string, unknown> = {
        'streetwise.initiativeRound.pool': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        'streetwise.turnCounter': 1
      };

      // Reset all player initiatives and turn actions
      for (const player of allPlayers) {
        updates[`streetwise.initiative.${player.id}`] = null;
        updates[`streetwise.turnActions.${player.id}`] = {
          quick: [false, false],
          slow: false
        };
      }

      // Reset all NPC initiatives and turn actions (but keep the NPCs)
      const resetNPCs = npcs.map(npc => ({
        ...npc,
        initiative: null,
        turnActions: { quick: [false, false], slow: false }
      }));
      updates['streetwise.npcs'] = resetNPCs;

      await OBR.room.setMetadata(updates);
      setShowResetConfirm(false);
    } catch (error) {
      console.error('Failed to reset initiative:', error);
    }
  };

  // Handle opening swap modal
  const handleOpenSwapModal = async (entityId: string, currentInitiative: number) => {
    const metadata = await OBR.room.getMetadata();
    const targets: SwapTarget[] = [];

    // Add PCs with higher initiative
    for (const player of allPlayers) {
      const playerInitiative = (metadata[`streetwise.initiative.${player.id}`] as number | null) ?? null;
      if (playerInitiative !== null && playerInitiative > currentInitiative && player.id !== entityId) {
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
      if (npc.initiative !== null && npc.initiative > currentInitiative && npc.id !== entityId) {
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

    setSwapSourceId(entityId);
    setSwapTargets(targets);
    setShowSwapModal(true);
  };

  // Handle swapping initiative
  const handleSwap = async (targetId: string) => {
    if (swapping || !swapSourceId) return;

    setSwapping(true);
    try {
      await swapInitiative(swapSourceId, targetId);
      setShowSwapModal(false);
    } catch (error) {
      console.error('Failed to swap initiative:', error);
    } finally {
      setSwapping(false);
    }
  };

  return (
    <div className="initiative-tracker">
      {/* Header */}
      <div className="initiative-tracker__header">
        <h2>Initiative Tracker</h2>
        {initiativeRoundActive && (
          <div className="initiative-tracker__header-controls">
            <button
              className="initiative-tracker__reset-btn"
              onClick={handleResetInitiative}
              title="Reset Initiative Round"
            >
              <ResetIcon />
            </button>
            <button
              className="initiative-tracker__new-turn-btn"
              onClick={handleNewTurn}
              disabled={startingNewTurn}
              title="New Turn"
            >
              {startingNewTurn ? '...' : '+'}
            </button>
            <div className="initiative-tracker__turn-counter">
              Turn: <span>{turnCounter}</span>
            </div>
          </div>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <>
          <div className="initiative-tracker__modal-backdrop" onClick={() => setShowResetConfirm(false)} />
          <div className="initiative-tracker__modal">
            <h3>Reset Initiative Round?</h3>
            <p>This will reset the Scene initiative - All characters and NPCs will draw their initiative again.</p>
            <div className="initiative-tracker__modal-buttons">
              <button className="initiative-tracker__modal-btn initiative-tracker__modal-btn--confirm" onClick={confirmReset}>
                Continue
              </button>
              <button className="initiative-tracker__modal-btn initiative-tracker__modal-btn--cancel" onClick={() => setShowResetConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add NPC */}
      {initiativeRoundActive && (
        <div className="initiative-tracker__add-npc">
          <input
            type="text"
            placeholder="NPC Name"
            value={newNPCName}
            onChange={(e) => setNewNPCName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddNPC()}
            className="initiative-tracker__npc-input"
          />
          <button
            onClick={handleAddNPC}
            disabled={!newNPCName.trim() || addingNPC}
            className="initiative-tracker__btn initiative-tracker__btn--add-npc"
          >
            {addingNPC ? 'Adding...' : 'Add NPC'}
          </button>
        </div>
      )}

      {/* Initiative List */}
      {initiativeRoundActive ? (
        <div className="initiative-tracker__list">
          {sortedEntries.length === 0 ? (
            <div className="initiative-tracker__empty">
              No participants yet. Add NPCs or wait for players to join.
            </div>
          ) : (
            sortedEntries.map((entry) => (
              <div key={entry.id} className={`initiative-entry ${entry.isNPC ? 'npc' : 'pc'}`}>
                {/* Initiative Value */}
                <div className="initiative-entry__initiative">
                  {entry.initiative !== null ? (
                    <div className="initiative-entry__initiative-with-swap">
                      <span className="initiative-entry__initiative-value">{entry.initiative}</span>
                      <button
                        className="initiative-entry__swap-btn"
                        onClick={() => handleOpenSwapModal(entry.id, entry.initiative!)}
                        title="Swap Initiative"
                      >
                        <SwapIcon />
                      </button>
                    </div>
                  ) : entry.isNPC ? (
                    <button
                      className="initiative-entry__draw-btn"
                      onClick={() => handleDrawForNPC(entry.id)}
                      disabled={drawingForNPC === entry.id}
                    >
                      {drawingForNPC === entry.id ? '...' : 'Draw'}
                    </button>
                  ) : (
                    <span className="initiative-entry__placeholder">—</span>
                  )}
                </div>

                {/* Name */}
                <div className="initiative-entry__info">
                  <span className="initiative-entry__name">
                    {entry.name}
                    {entry.isNPC && <span className="initiative-entry__badge">NPC</span>}
                  </span>
                </div>

                {/* Actions */}
                <div className="initiative-entry__actions">
                  {/* Quick Actions */}
                  <div className="initiative-entry__action-group">
                    <QuickActionIcon />
                    {[0, 1].map((index) => {
                      const isChecked = entry.turnActions.quick[index as 0 | 1];
                      const totalChecked = entry.turnActions.quick.filter(Boolean).length + (entry.turnActions.slow ? 1 : 0);
                      const isDisabled = !entry.isNPC || (!isChecked && totalChecked >= 2);

                      return (
                        <label
                          key={index}
                          className={`initiative-action-checkbox ${isChecked ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isDisabled}
                            onChange={() => entry.isNPC && handleNPCActionToggle(entry.id, index === 0 ? 'quick1' : 'quick2', entry.turnActions)}
                          />
                          <div className="initiative-action-checkbox__mark" />
                        </label>
                      );
                    })}
                  </div>

                  {/* Slow Action */}
                  <div className="initiative-entry__action-group">
                    <SlowActionIcon />
                    {(() => {
                      const isChecked = entry.turnActions.slow;
                      const totalChecked = entry.turnActions.quick.filter(Boolean).length + (entry.turnActions.slow ? 1 : 0);
                      const isDisabled = !entry.isNPC || (!isChecked && totalChecked >= 2);

                      return (
                        <label
                          className={`initiative-action-checkbox ${isChecked ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isDisabled}
                            onChange={() => entry.isNPC && handleNPCActionToggle(entry.id, 'slow', entry.turnActions)}
                          />
                          <div className="initiative-action-checkbox__mark" />
                        </label>
                      );
                    })()}
                  </div>
                </div>

                {/* Remove NPC Button or Spacer */}
                {entry.isNPC ? (
                  <button
                    className="initiative-entry__remove"
                    onClick={() => handleRemoveNPC(entry.id)}
                    title="Remove NPC"
                  >
                    ×
                  </button>
                ) : (
                  <div className="initiative-entry__spacer"></div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="initiative-tracker__inactive">
          <p>No active initiative round.</p>
          <p>Click "Initiative" in the toolbar to start a new round.</p>
        </div>
      )}

      {/* Swap Initiative Modal */}
      {showSwapModal && (
        <>
          <div className="initiative-tracker__swap-backdrop" onClick={() => setShowSwapModal(false)} />
          <div className="initiative-tracker__swap-modal">
            <h3>Swap Initiative</h3>
            <p>Select a character to swap initiative with:</p>
            {swapTargets.length === 0 ? (
              <div className="initiative-tracker__swap-empty">
                No characters with higher initiative available.
              </div>
            ) : (
              <div className="initiative-tracker__swap-list">
                {swapTargets.map((target) => (
                  <button
                    key={target.id}
                    className="initiative-tracker__swap-target"
                    onClick={() => handleSwap(target.id)}
                    disabled={swapping}
                  >
                    <span className="initiative-tracker__swap-target-initiative">{target.initiative}</span>
                    <span className="initiative-tracker__swap-target-name">
                      {target.name}
                      {target.isNPC && <span className="initiative-tracker__swap-target-badge">NPC</span>}
                    </span>
                  </button>
                ))}
              </div>
            )}
            <button
              className="initiative-tracker__swap-cancel"
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
