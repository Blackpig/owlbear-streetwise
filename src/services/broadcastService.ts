// Streetwise Broadcast Service
import OBR from '@owlbear-rodeo/sdk';
import type { BroadcastMessage, DiceRollMessage, ScenePanicMessage } from '../types/broadcast';
import type { DiceRoll } from '../types/dice';

/**
 * Send a dice roll broadcast to all players
 */
export async function broadcastDiceRoll(
  playerName: string,
  characterName: string,
  skillName: string,
  roll: DiceRoll
): Promise<void> {
  try {
    const playerId = await OBR.player.getId();

    const message: DiceRollMessage = {
      type: 'STREETWISE_ROLL',
      playerId,
      playerName,
      characterName,
      skillName,
      dicePool: {
        regular: roll.regularDice,
        strain: roll.strainDice
      },
      results: {
        successes: roll.successes,
        banes: roll.totalBanes,
        strainBanes: roll.strainBanes
      },
      pushed: roll.pushed,
      panicTriggered: roll.strainBanes > 0,
      timestamp: Date.now()
    };

    await OBR.broadcast.sendMessage("com.streetwise/rolls", message);
  } catch (error) {
    console.error('Failed to broadcast dice roll:', error);
  }
}

/**
 * Send a scene panic broadcast to all players
 */
export async function broadcastScenePanic(
  characterName: string,
  panicRoll: number,
  total: number,
  effect: string,
  strainIncrease: number
): Promise<void> {
  try {
    const playerId = await OBR.player.getId();

    const message: ScenePanicMessage = {
      type: 'SCENE_PANIC',
      characterName,
      playerId,
      roll: panicRoll,
      total,
      effect,
      strainIncrease,
      timestamp: Date.now()
    };

    await OBR.broadcast.sendMessage("com.streetwise/rolls", message);
  } catch (error) {
    console.error('Failed to broadcast scene panic:', error);
  }
}

/**
 * Type guard to check if a message is a Streetwise broadcast message
 */
export function isBroadcastMessage(message: unknown): message is BroadcastMessage {
  return (
    message !== null &&
    typeof message === 'object' &&
    'type' in message &&
    (message.type === 'STREETWISE_ROLL' ||
      message.type === 'STRAIN_CHANGE' ||
      message.type === 'SCENE_PANIC' ||
      message.type === 'PLAYER_ASSISTANCE')
  );
}
