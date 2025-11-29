// Streetwise Assistance Service - Manage player assistance bonus dice
import OBR from '@owlbear-rodeo/sdk';
import type { PlayerAssistanceMessage } from '../types/broadcast';

export interface HelpingInfo {
  targetPlayerId: string;
  targetPlayerName: string;
}

export interface AssistanceData {
  count: number;
  helpers: string[]; // Player IDs of who is helping
}

/**
 * Get assistance bonus dice for a player
 */
export async function getAssistance(playerId: string): Promise<number> {
  try {
    const metadata = await OBR.room.getMetadata();
    const assistanceKey = `streetwise.assistance.${playerId}`;
    const data = metadata[assistanceKey] as AssistanceData | number | undefined;

    // Handle legacy number format or new object format
    if (typeof data === 'number') {
      return data;
    }
    return data?.count || 0;
  } catch (error) {
    console.error('Failed to get assistance:', error);
    return 0;
  }
}

/**
 * Get who this player is currently helping
 */
export async function getHelpingInfo(playerId: string): Promise<HelpingInfo | null> {
  try {
    const metadata = await OBR.room.getMetadata();
    const helpingKey = `streetwise.helping.${playerId}`;
    return (metadata[helpingKey] as HelpingInfo) || null;
  } catch (error) {
    console.error('Failed to get helping info:', error);
    return null;
  }
}

/**
 * Add assistance bonus dice to a player and track who is helping
 */
export async function addAssistance(
  fromPlayerId: string,
  toPlayerId: string,
  toPlayerName: string,
  bonusDice: number = 1
): Promise<void> {
  try {
    const metadata = await OBR.room.getMetadata();
    const assistanceKey = `streetwise.assistance.${toPlayerId}`;
    const helpingKey = `streetwise.helping.${fromPlayerId}`;

    // Get current assistance data
    const currentData = metadata[assistanceKey] as AssistanceData | number | undefined;
    let currentCount = 0;
    let currentHelpers: string[] = [];

    if (typeof currentData === 'number') {
      currentCount = currentData;
    } else if (currentData) {
      currentCount = currentData.count;
      currentHelpers = currentData.helpers;
    }

    // Add new helper if not already in list
    const updatedHelpers = currentHelpers.includes(fromPlayerId)
      ? currentHelpers
      : [...currentHelpers, fromPlayerId];

    await OBR.room.setMetadata({
      [assistanceKey]: {
        count: currentCount + bonusDice,
        helpers: updatedHelpers
      } as AssistanceData,
      [helpingKey]: {
        targetPlayerId: toPlayerId,
        targetPlayerName: toPlayerName
      } as HelpingInfo
    });
  } catch (error) {
    console.error('Failed to add assistance:', error);
  }
}

/**
 * Withdraw assistance (remove bonus dice and clear helping tracking)
 */
export async function withdrawAssistance(fromPlayerId: string): Promise<void> {
  try {
    const helpingInfo = await getHelpingInfo(fromPlayerId);
    if (!helpingInfo) return;

    const metadata = await OBR.room.getMetadata();
    const assistanceKey = `streetwise.assistance.${helpingInfo.targetPlayerId}`;
    const helpingKey = `streetwise.helping.${fromPlayerId}`;

    // Get current assistance data
    const currentData = metadata[assistanceKey] as AssistanceData | number | undefined;
    let currentCount = 0;
    let currentHelpers: string[] = [];

    if (typeof currentData === 'number') {
      currentCount = currentData;
    } else if (currentData) {
      currentCount = currentData.count;
      currentHelpers = currentData.helpers;
    }

    // Remove this helper from the list
    const updatedHelpers = currentHelpers.filter(id => id !== fromPlayerId);

    await OBR.room.setMetadata({
      [assistanceKey]: {
        count: Math.max(0, currentCount - 1),
        helpers: updatedHelpers
      } as AssistanceData,
      [helpingKey]: null
    });
  } catch (error) {
    console.error('Failed to withdraw assistance:', error);
  }
}

/**
 * Clear assistance bonus dice for a player (after they use it)
 * Also clears the "helping" info for all players who were helping
 */
export async function clearAssistance(playerId: string): Promise<void> {
  try {
    const metadata = await OBR.room.getMetadata();
    const assistanceKey = `streetwise.assistance.${playerId}`;

    // Get current assistance data to find who was helping
    const currentData = metadata[assistanceKey] as AssistanceData | number | undefined;
    let helpers: string[] = [];

    if (typeof currentData === 'object' && currentData) {
      helpers = currentData.helpers;
    }

    // Build metadata updates to clear assistance and all helpers' helping info
    const updates: Record<string, any> = {
      [assistanceKey]: { count: 0, helpers: [] } as AssistanceData
    };

    // Clear helping info for each helper
    for (const helperId of helpers) {
      const helpingKey = `streetwise.helping.${helperId}`;
      updates[helpingKey] = null;
    }

    await OBR.room.setMetadata(updates);
  } catch (error) {
    console.error('Failed to clear assistance:', error);
  }
}

/**
 * Broadcast player assistance to all players
 */
export async function broadcastAssistance(
  fromCharacterName: string,
  toPlayerId: string,
  toPlayerName: string,
  toCharacterName: string
): Promise<void> {
  try {
    const fromPlayerId = await OBR.player.getId();
    const fromPlayerName = await OBR.player.getName();

    const message: PlayerAssistanceMessage = {
      type: 'PLAYER_ASSISTANCE',
      fromPlayerId,
      fromPlayerName,
      fromCharacterName,
      toPlayerId,
      toPlayerName,
      toCharacterName,
      timestamp: Date.now()
    };

    await OBR.broadcast.sendMessage("com.streetwise/rolls", message);
  } catch (error) {
    console.error('Failed to broadcast assistance:', error);
  }
}
