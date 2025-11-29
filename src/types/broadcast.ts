// Streetwise OBR Broadcast Message Types

export interface DiceRollMessage {
  type: 'STREETWISE_ROLL';
  playerId: string;
  playerName: string;
  characterName: string;
  skillName: string;
  dicePool: {
    regular: number;
    strain: number;
  };
  results: {
    successes: number;
    banes: number;
    strainBanes: number;
  };
  pushed: boolean;
  panicTriggered?: boolean;
  timestamp: number;
}

export interface StrainChangeMessage {
  type: 'STRAIN_CHANGE';
  oldValue: number;
  newValue: number;
  delta: number;
  changedBy: string; // Player name who changed it
  timestamp: number;
}

export interface ScenePanicMessage {
  type: 'SCENE_PANIC';
  characterName: string;
  playerId: string;
  roll: number;
  total: number;
  effect: string;
  strainIncrease: number;
  timestamp: number;
}

export interface PlayerAssistanceMessage {
  type: 'PLAYER_ASSISTANCE';
  fromPlayerId: string;
  fromPlayerName: string;
  fromCharacterName: string;
  toPlayerId: string;
  toPlayerName: string;
  toCharacterName: string;
  timestamp: number;
}

export type BroadcastMessage =
  | DiceRollMessage
  | StrainChangeMessage
  | ScenePanicMessage
  | PlayerAssistanceMessage;
