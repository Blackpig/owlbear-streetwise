/**
 * Scene Challenge Service
 * Manages scene challenges where players collectively work toward a goal
 */

import OBR, { type Player } from '@owlbear-rodeo/sdk';

export interface SceneChallenge {
  active: boolean;
  target: number;
  description?: string;
  successes: number;
  banes: number;
}

const SCENE_CHALLENGE_KEY = 'streetwise.sceneChallenge';

/**
 * Start a new scene challenge
 * This also resets initiative for a new scene
 */
export async function startSceneChallenge(target: number, description?: string): Promise<void> {
  let players = await OBR.party.getPlayers();

  // Ensure current player (GM) is included in the list
  const currentPlayerId = await OBR.player.getId();
  const hasCurrentPlayer = players.some(p => p.id === currentPlayerId);
  if (!hasCurrentPlayer) {
    // Construct current player manually with required Player properties
    const currentPlayer: Player = {
      id: currentPlayerId,
      name: await OBR.player.getName(),
      color: await OBR.player.getColor(),
      role: await OBR.player.getRole(),
      connectionId: await OBR.player.getConnectionId(),
      syncView: false,
      metadata: {}
    };
    players = [...players, currentPlayer];
  }

  const updates: Record<string, unknown> = {
    [SCENE_CHALLENGE_KEY]: {
      active: true,
      target,
      description,
      successes: 0,
      banes: 0
    } as SceneChallenge,
    // Reset initiative for new scene
    'streetwise.initiativeRound.pool': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    'streetwise.initiativeRound.active': true,
    'streetwise.npcs': [], // Clear NPCs
    'streetwise.turnCounter': 1,
    // Reset strain for new scene
    'streetwise.strain': 0
  };

  // Reset all player initiatives and turn actions (including GM)
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
 * End the current scene challenge
 */
export async function endSceneChallenge(): Promise<void> {
  await OBR.room.setMetadata({
    [SCENE_CHALLENGE_KEY]: {
      active: false,
      target: 0,
      successes: 0,
      banes: 0
    } as SceneChallenge,
    // Reset strain when ending scene
    'streetwise.strain': 0
  });
}

/**
 * Get current scene challenge state
 */
export async function getSceneChallenge(): Promise<SceneChallenge> {
  const metadata = await OBR.room.getMetadata();
  return (metadata[SCENE_CHALLENGE_KEY] as SceneChallenge) || {
    active: false,
    target: 0,
    successes: 0,
    banes: 0
  };
}

/**
 * Add successes and banes from a roll to the scene challenge
 */
export async function addToSceneChallenge(successes: number, banes: number): Promise<void> {
  const challenge = await getSceneChallenge();

  if (!challenge.active) {
    return;
  }

  const newSuccesses = challenge.successes + successes;
  const newBanes = challenge.banes + banes;

  await OBR.room.setMetadata({
    [SCENE_CHALLENGE_KEY]: {
      ...challenge,
      successes: newSuccesses,
      banes: newBanes
    } as SceneChallenge
  });
}

/**
 * Check if the scene challenge has been resolved
 * Returns: 'success', 'failure', 'partial', or null if not resolved
 */
export function checkSceneChallengeResolution(challenge: SceneChallenge): 'success' | 'failure' | 'partial' | null {
  if (!challenge.active) {
    return null;
  }

  const successReached = challenge.successes >= challenge.target;
  const failureReached = challenge.banes >= challenge.target;

  if (successReached && failureReached) {
    return 'partial';
  } else if (successReached) {
    return 'success';
  } else if (failureReached) {
    return 'failure';
  }

  return null;
}
