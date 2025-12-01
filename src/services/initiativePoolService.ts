/**
 * Initiative Pool Service
 * Manages the shared initiative pool (1-10) for drawing initiative values
 */

import OBR from '@owlbear-rodeo/sdk';

const INITIATIVE_POOL_KEY = 'streetwise.initiativeRound.pool';
const INITIATIVE_ROUND_ACTIVE_KEY = 'streetwise.initiativeRound.active';

export interface InitiativeRoundState {
  active: boolean;
  pool: number[];
}

/**
 * Start a new initiative round - resets pool to [1-10] and clears all player initiatives & NPCs
 */
export async function startInitiativeRound(): Promise<void> {
  const players = await OBR.party.getPlayers();

  const updates: Record<string, unknown> = {
    [INITIATIVE_POOL_KEY]: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    [INITIATIVE_ROUND_ACTIVE_KEY]: true,
    'streetwise.npcs': [], // Clear all NPCs
    'streetwise.turnCounter': 1 // Start turn counter at 1
  };

  // Clear all player initiatives and turn actions
  for (const player of players) {
    updates[`streetwise.initiative.${player.id}`] = null;
    updates[`streetwise.turnActions.${player.id}`] = {
      quick: [false, false],
      slow: false
    };
  }

  await OBR.room.setMetadata(updates);
}

/**
 * End the current initiative round
 */
export async function endInitiativeRound(): Promise<void> {
  await OBR.room.setMetadata({
    [INITIATIVE_ROUND_ACTIVE_KEY]: false
  });
}

/**
 * Get current initiative round state
 */
export async function getInitiativeRoundState(): Promise<InitiativeRoundState> {
  const metadata = await OBR.room.getMetadata();
  const pool = (metadata[INITIATIVE_POOL_KEY] as number[]) || [];
  const active = (metadata[INITIATIVE_ROUND_ACTIVE_KEY] as boolean) || false;

  return { active, pool };
}

/**
 * Draw a random initiative value from the pool for a player
 * Returns the drawn value, or null if pool is empty
 */
export async function drawInitiative(playerId: string): Promise<number | null> {
  const metadata = await OBR.room.getMetadata();
  const pool = (metadata[INITIATIVE_POOL_KEY] as number[]) || [];

  if (pool.length === 0) {
    return null;
  }

  // Pick random value from pool
  const randomIndex = Math.floor(Math.random() * pool.length);
  const drawnValue = pool[randomIndex];

  // Remove from pool
  const newPool = pool.filter((_, index) => index !== randomIndex);

  // Update metadata
  await OBR.room.setMetadata({
    [INITIATIVE_POOL_KEY]: newPool,
    [`streetwise.initiative.${playerId}`]: drawnValue
  });

  return drawnValue;
}

/**
 * Reset a player's initiative (GM override to allow redraw)
 * Returns the value back to the pool
 */
export async function resetPlayerInitiative(playerId: string): Promise<void> {
  const metadata = await OBR.room.getMetadata();
  const currentInitiative = metadata[`streetwise.initiative.${playerId}`] as number | null;

  if (currentInitiative === null || currentInitiative === undefined) {
    return; // Nothing to reset
  }

  const pool = (metadata[INITIATIVE_POOL_KEY] as number[]) || [];

  // Add value back to pool and sort
  const newPool = [...pool, currentInitiative].sort((a, b) => a - b);

  await OBR.room.setMetadata({
    [INITIATIVE_POOL_KEY]: newPool,
    [`streetwise.initiative.${playerId}`]: null
  });
}

/**
 * Check if a player has drawn their initiative
 */
export async function hasPlayerDrawnInitiative(playerId: string): Promise<boolean> {
  const metadata = await OBR.room.getMetadata();
  const initiative = metadata[`streetwise.initiative.${playerId}`];
  return initiative !== null && initiative !== undefined;
}

/**
 * Draw initiative for an NPC
 * NPCs are stored in the npcs array, not as individual metadata keys
 */
export async function drawInitiativeForNPC(npcId: string): Promise<number | null> {
  const metadata = await OBR.room.getMetadata();
  const pool = (metadata[INITIATIVE_POOL_KEY] as number[]) || [];
  const npcs = (metadata['streetwise.npcs'] as Array<{ id: string; initiative: number | null; [key: string]: unknown }>) || [];

  if (pool.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  const drawnValue = pool[randomIndex];
  const newPool = pool.filter((_, index) => index !== randomIndex);
  const updatedNPCs = npcs.map(npc =>
    npc.id === npcId ? { ...npc, initiative: drawnValue } : npc
  );

  await OBR.room.setMetadata({
    [INITIATIVE_POOL_KEY]: newPool,
    'streetwise.npcs': updatedNPCs
  });

  return drawnValue;
}

/**
 * Swap initiative between two entities (PC or NPC)
 * Entity IDs can be player IDs or NPC IDs with 'npc_' prefix
 */
export async function swapInitiative(entityId1: string, entityId2: string): Promise<void> {
  const metadata = await OBR.room.getMetadata();
  const npcs = (metadata['streetwise.npcs'] as Array<{ id: string; initiative: number | null; [key: string]: unknown }>) || [];

  // Determine if entities are NPCs or PCs
  const isNPC1 = entityId1.startsWith('npc_');
  const isNPC2 = entityId2.startsWith('npc_');

  // Get initiative values
  let initiative1: number | null;
  let initiative2: number | null;

  if (isNPC1) {
    const npc = npcs.find(n => n.id === entityId1);
    initiative1 = npc?.initiative ?? null;
  } else {
    initiative1 = (metadata[`streetwise.initiative.${entityId1}`] as number | null) ?? null;
  }

  if (isNPC2) {
    const npc = npcs.find(n => n.id === entityId2);
    initiative2 = npc?.initiative ?? null;
  } else {
    initiative2 = (metadata[`streetwise.initiative.${entityId2}`] as number | null) ?? null;
  }

  // Can't swap if either doesn't have initiative
  if (initiative1 === null || initiative2 === null) {
    return;
  }

  // Build updates
  const updates: Record<string, unknown> = {};

  if (isNPC1) {
    const updatedNPCs = npcs.map(npc =>
      npc.id === entityId1 ? { ...npc, initiative: initiative2 } : npc
    );
    updates['streetwise.npcs'] = updatedNPCs;
  } else {
    updates[`streetwise.initiative.${entityId1}`] = initiative2;
  }

  if (isNPC2) {
    // If we already updated NPCs array for entity1, merge the changes
    let npcArray = updates['streetwise.npcs'] as typeof npcs || npcs;
    npcArray = npcArray.map(npc =>
      npc.id === entityId2 ? { ...npc, initiative: initiative1 } : npc
    );
    updates['streetwise.npcs'] = npcArray;
  } else {
    updates[`streetwise.initiative.${entityId2}`] = initiative1;
  }

  await OBR.room.setMetadata(updates);
}
