// Streetwise Dice Roller Types

export interface DiceRoll {
  // Input parameters
  regularDice: number;      // Attribute + Skill + Modifiers
  strainDice: number;        // Scene Strain Points
  modifier: number;          // Situational modifier (can be negative)
  
  // Roll results
  results: {
    regular: number[];       // Array of regular die results
    strain: number[];        // Array of strain die results
  };

  // Locked dice info (for pushed rolls)
  lockedDice?: {
    regular: boolean[];      // True if die was locked (1 or 6), false if re-rolled
    strain: boolean[];       // True if die was locked (1 or 6), false if re-rolled
  };
  
  // Calculated outcomes
  successes: number;         // Total count of 6s
  regularBanes: number;      // Count of 1s on regular dice
  strainBanes: number;       // Count of 1s on strain dice
  totalBanes: number;        // Total 1s (for strain increase)

  // Breakdown for pushed rolls
  originalSuccesses?: number;  // Successes from original roll
  pushedSuccesses?: number;    // New successes from push
  originalBanes?: number;      // Banes from original roll
  pushedBanes?: number;        // New banes from push
  
  // Roll state
  pushed: boolean;           // Has this roll been pushed?
  canPush: boolean;          // Can this roll be pushed again?
  originalRoll?: DiceRoll;   // Reference to original roll (if this is pushed)
}

export interface RollParameters {
  attribute: number;
  skill: number;
  modifier?: number;
  strainPoints: number;
  canPushTwice?: boolean;    // For talents like "Light Fingered"
}

export interface ScenePanicResult {
  triggered: boolean;
  roll?: number;             // d6 roll
  total?: number;            // roll + strain
  effect?: string;           // Description from table
  strainIncrease?: number;   // Additional strain added
}

export const SCENE_PANIC_TABLE: Record<string, { range: [number, number], effect: string, strainIncrease: number }> = {
  'keep-it-together': {
    range: [1, 6],
    effect: 'Keep it together. You manage to stay calm. No effect.',
    strainIncrease: 0
  },
  'minor-complication': {
    range: [7, 8],
    effect: 'Minor complication. A guard is suspicious, the crowd is getting unsettled, you say the wrong thing.',
    strainIncrease: 1
  },
  'major-complication': {
    range: [9, 10],
    effect: 'Major Complication. You have been spotted, your quarry vanishes in the crowd, you are proved to be lying.',
    strainIncrease: 1
  },
  'escalation': {
    range: [11, 12],
    effect: 'Escalation. People are yelling for the Peelers, bruisers burst into the room, the alley is a dead end.',
    strainIncrease: 1
  },
  'chaos': {
    range: [13, Infinity],
    effect: 'Chaos. The Peelers arrive, a fight breaks out, a structure collapses, you are trapped.',
    strainIncrease: 0
  }
};
