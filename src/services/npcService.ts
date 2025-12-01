/**
 * NPC Service
 * Manages NPCs for the GM's initiative tracker
 */

import OBR from '@owlbear-rodeo/sdk';
import type { TurnActions } from './turnTrackingService';

export interface NPC {
  id: string;
  name: string;
  initiative: number | null;
  turnActions: TurnActions;
}

const NPCS_KEY = 'streetwise.npcs';

/**
 * Get all NPCs
 */
export async function getAllNPCs(): Promise<NPC[]> {
  const metadata = await OBR.room.getMetadata();
  return (metadata[NPCS_KEY] as NPC[]) || [];
}

/**
 * Add a new NPC
 */
export async function addNPC(name: string): Promise<NPC> {
  const npcs = await getAllNPCs();
  const newNPC: NPC = {
    id: `npc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    initiative: null,
    turnActions: { quick: [false, false], slow: false }
  };

  npcs.push(newNPC);
  await OBR.room.setMetadata({ [NPCS_KEY]: npcs });
  return newNPC;
}

/**
 * Remove an NPC and return their initiative to the pool
 */
export async function removeNPC(npcId: string): Promise<void> {
  const metadata = await OBR.room.getMetadata();
  const npcs = (metadata[NPCS_KEY] as NPC[]) || [];
  const pool = (metadata['streetwise.initiativeRound.pool'] as number[]) || [];

  const npcToRemove = npcs.find(npc => npc.id === npcId);
  const filtered = npcs.filter(npc => npc.id !== npcId);

  const updates: Record<string, unknown> = {
    [NPCS_KEY]: filtered
  };

  // If NPC had an initiative value, return it to the pool
  if (npcToRemove?.initiative !== null && npcToRemove?.initiative !== undefined) {
    const newPool = [...pool, npcToRemove.initiative].sort((a, b) => a - b);
    updates['streetwise.initiativeRound.pool'] = newPool;
  }

  await OBR.room.setMetadata(updates);
}

/**
 * Update NPC initiative
 */
export async function updateNPCInitiative(npcId: string, initiative: number | null): Promise<void> {
  const npcs = await getAllNPCs();
  const npc = npcs.find(n => n.id === npcId);

  if (npc) {
    npc.initiative = initiative;
    await OBR.room.setMetadata({
      [NPCS_KEY]: npcs
    });
  }
}

/**
 * Update NPC turn actions
 */
export async function updateNPCTurnActions(npcId: string, actions: TurnActions): Promise<void> {
  const npcs = await getAllNPCs();
  const npc = npcs.find(n => n.id === npcId);

  if (npc) {
    npc.turnActions = actions;
    await OBR.room.setMetadata({
      [NPCS_KEY]: npcs
    });
  }
}

/**
 * Clear all NPCs
 */
export async function clearAllNPCs(): Promise<void> {
  await OBR.room.setMetadata({
    [NPCS_KEY]: []
  });
}

/**
 * Reset all NPC turn actions
 */
export async function resetAllNPCTurnActions(): Promise<void> {
  const npcs = await getAllNPCs();

  npcs.forEach(npc => {
    npc.turnActions = { quick: [false, false], slow: false };
  });

  await OBR.room.setMetadata({
    [NPCS_KEY]: npcs
  });
}
