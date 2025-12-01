/**
 * Turn Management Service
 * Manages the turn counter and resetting all actions for a new turn
 */

import OBR from '@owlbear-rodeo/sdk';
import { resetAllPlayersTurnActions } from './turnTrackingService';
import { resetAllNPCTurnActions } from './npcService';

const TURN_COUNTER_KEY = 'streetwise.turnCounter';

/**
 * Get current turn counter
 */
export async function getTurnCounter(): Promise<number> {
  const metadata = await OBR.room.getMetadata();
  return (metadata[TURN_COUNTER_KEY] as number) || 0;
}

/**
 * Start a new turn - increments counter and resets all PC/NPC actions
 */
export async function startNewTurn(): Promise<void> {
  const metadata = await OBR.room.getMetadata();
  const currentTurn = (metadata[TURN_COUNTER_KEY] as number) || 0;
  const players = await OBR.party.getPlayers();
  const npcs = (metadata['streetwise.npcs'] as Array<{ id: string; [key: string]: unknown }>) || [];

  const updates: Record<string, unknown> = {
    [TURN_COUNTER_KEY]: currentTurn + 1
  };

  // Reset all player turn actions
  for (const player of players) {
    updates[`streetwise.turnActions.${player.id}`] = {
      quick: [false, false],
      slow: false
    };
  }

  // Reset all NPC turn actions
  const resetNPCs = npcs.map(npc => ({
    ...npc,
    turnActions: { quick: [false, false], slow: false }
  }));
  updates['streetwise.npcs'] = resetNPCs;

  // Single atomic update
  await OBR.room.setMetadata(updates);
}

/**
 * Reset turn counter (called when starting new initiative round)
 */
export async function resetTurnCounter(): Promise<void> {
  await OBR.room.setMetadata({
    [TURN_COUNTER_KEY]: 0
  });
}
