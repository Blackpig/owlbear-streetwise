/**
 * Turn Tracking Service
 * Manages initiative and turn actions in OBR room metadata
 * This allows the GM to see all players' initiatives and actions
 */

import OBR from '@owlbear-rodeo/sdk';

export interface TurnActions {
  quick: [boolean, boolean];
  slow: boolean;
}

export interface PlayerTurnData {
  initiative: number;
  actions?: TurnActions;
}

/**
 * Get a player's turn data from OBR metadata
 */
export async function getPlayerTurnData(playerId: string): Promise<PlayerTurnData> {
  const metadata = await OBR.room.getMetadata();
  const initiative = (metadata[`streetwise.initiative.${playerId}`] as number) ?? 0;
  const actions = metadata[`streetwise.turnActions.${playerId}`] as TurnActions | undefined;

  return {
    initiative,
    actions
  };
}

/**
 * Update a player's initiative
 */
export async function updatePlayerInitiative(playerId: string, initiative: number): Promise<void> {
  await OBR.room.setMetadata({
    [`streetwise.initiative.${playerId}`]: initiative
  });
}

/**
 * Update a player's turn actions
 */
export async function updatePlayerTurnActions(playerId: string, actions: TurnActions): Promise<void> {
  await OBR.room.setMetadata({
    [`streetwise.turnActions.${playerId}`]: actions
  });
}

/**
 * Reset a player's turn actions (for new turn)
 */
export async function resetPlayerTurnActions(playerId: string): Promise<void> {
  await updatePlayerTurnActions(playerId, {
    quick: [false, false],
    slow: false
  });
}

/**
 * Get all players' turn data (for GM initiative tracker)
 */
export async function getAllPlayersTurnData(): Promise<Record<string, PlayerTurnData>> {
  const metadata = await OBR.room.getMetadata();
  const players = await OBR.party.getPlayers();

  const result: Record<string, PlayerTurnData> = {};

  for (const player of players) {
    const initiative = (metadata[`streetwise.initiative.${player.id}`] as number) ?? 0;
    const actions = metadata[`streetwise.turnActions.${player.id}`] as TurnActions | undefined;

    result[player.id] = {
      initiative,
      actions
    };
  }

  return result;
}

/**
 * Reset all players' turn actions (for new round)
 */
export async function resetAllPlayersTurnActions(): Promise<void> {
  const players = await OBR.party.getPlayers();
  const updates: Record<string, TurnActions> = {};

  for (const player of players) {
    updates[`streetwise.turnActions.${player.id}`] = {
      quick: [false, false],
      slow: false
    };
  }

  await OBR.room.setMetadata(updates);
}
