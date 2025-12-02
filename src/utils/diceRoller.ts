// Streetwise Dice Roller Logic

import type { DiceRoll, RollParameters, ScenePanicResult } from '../types/dice';
import { SCENE_PANIC_TABLE } from '../types/dice';

/**
 * Roll a single d6
 * Uses cryptographically secure random numbers for better randomness
 */
export function rollD6(): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return (array[0] % 6) + 1;
}

/**
 * Roll multiple d6s and return results array
 */
export function rollDice(count: number): number[] {
  const results: number[] = [];
  for (let i = 0; i < count; i++) {
    results.push(rollD6());
  }
  return results;
}

/**
 * Calculate dice pool size from parameters
 */
export function calculateDicePool(params: RollParameters): { regular: number, strain: number } {
  // Base pool = Attribute + Skill + Modifier
  let regularDice = params.attribute + params.skill + (params.modifier || 0);
  
  // Minimum 1 die (can't have negative or zero pool)
  if (regularDice < 1) {
    regularDice = 1;
  }
  
  return {
    regular: regularDice,
    strain: params.strainPoints
  };
}

/**
 * Count successes (6s) in dice results
 */
export function countSuccesses(dice: number[]): number {
  return dice.filter(d => d === 6).length;
}

/**
 * Count banes (1s) in dice results
 */
export function countBanes(dice: number[]): number {
  return dice.filter(d => d === 1).length;
}

/**
 * Perform initial roll
 */
export function performRoll(params: RollParameters): DiceRoll {
  const pool = calculateDicePool(params);
  
  // Roll all dice
  const regularResults = rollDice(pool.regular);
  const strainResults = rollDice(pool.strain);
  
  // Calculate outcomes
  const allDice = [...regularResults, ...strainResults];
  const successes = countSuccesses(allDice);
  const regularBanes = countBanes(regularResults);
  const strainBanes = countBanes(strainResults);
  const totalBanes = regularBanes + strainBanes;
  
  return {
    regularDice: pool.regular,
    strainDice: pool.strain,
    modifier: params.modifier || 0,
    results: {
      regular: regularResults,
      strain: strainResults
    },
    successes,
    regularBanes,
    strainBanes,
    totalBanes,
    pushed: false,
    canPush: true  // Can always push initial roll (unless talent says otherwise)
  };
}

/**
 * Push an existing roll (reroll non-6, non-1 dice)
 */
export function pushRoll(originalRoll: DiceRoll, canPushTwice: boolean = false): DiceRoll {
  if (!originalRoll.canPush) {
    throw new Error('Cannot push this roll');
  }

  // Process each die, keeping position but re-rolling 2-5s
  const finalRegular: number[] = [];
  const lockedRegular: boolean[] = [];

  for (const die of originalRoll.results.regular) {
    if (die === 1 || die === 6) {
      // Lock this die (keep original value)
      finalRegular.push(die);
      lockedRegular.push(true);
    } else {
      // Re-roll this die
      const newValue = rollD6();
      finalRegular.push(newValue);
      lockedRegular.push(false);
    }
  }

  const finalStrain: number[] = [];
  const lockedStrain: boolean[] = [];

  for (const die of originalRoll.results.strain) {
    if (die === 1 || die === 6) {
      // Lock this die (keep original value)
      finalStrain.push(die);
      lockedStrain.push(true);
    } else {
      // Re-roll this die
      finalStrain.push(rollD6());
      lockedStrain.push(false);
    }
  }

  // Calculate successes and banes from original vs new
  const originalSuccesses = originalRoll.successes;
  const originalTotalBanes = originalRoll.totalBanes;

  // Count new successes/banes from the re-rolled dice only
  const newRegularSuccesses = finalRegular.filter((d, i) => !lockedRegular[i] && d === 6).length;
  const newStrainSuccesses = finalStrain.filter((d, i) => !lockedStrain[i] && d === 6).length;
  const pushedSuccesses = newRegularSuccesses + newStrainSuccesses;

  const newRegularBanes = finalRegular.filter((d, i) => !lockedRegular[i] && d === 1).length;
  const newStrainBanes = finalStrain.filter((d, i) => !lockedStrain[i] && d === 1).length;
  const pushedBanes = newRegularBanes + newStrainBanes;

  // Total successes and banes
  const successes = originalSuccesses + pushedSuccesses;
  const regularBanes = countBanes(finalRegular);
  const strainBanes = countBanes(finalStrain);
  const totalBanes = originalTotalBanes + pushedBanes;

  // Determine if can push again (only if talent allows and not already pushed twice)
  const timesPushed = originalRoll.pushed ? 2 : 1;
  const canPushAgain = canPushTwice && timesPushed < 2;

  return {
    regularDice: originalRoll.regularDice,
    strainDice: originalRoll.strainDice,
    modifier: originalRoll.modifier,
    results: {
      regular: finalRegular,
      strain: finalStrain
    },
    lockedDice: {
      regular: lockedRegular,
      strain: lockedStrain
    },
    successes,
    regularBanes,
    strainBanes,
    totalBanes,
    originalSuccesses,
    pushedSuccesses,
    originalBanes: originalTotalBanes,
    pushedBanes,
    pushed: true,
    canPush: canPushAgain,
    originalRoll: originalRoll
  };
}

/**
 * Check if Scene Panic should trigger and calculate result
 */
export function checkScenePanic(roll: DiceRoll, currentStrain: number): ScenePanicResult {
  // Scene Panic only triggers if there are Banes on Strain dice
  if (roll.strainBanes === 0) {
    return { triggered: false };
  }
  
  // Roll d6 and add current strain
  const panicRoll = rollD6();
  const total = panicRoll + currentStrain;
  
  // Find matching entry in panic table
  let effect = '';
  let strainIncrease = 0;
  
  for (const entry of Object.values(SCENE_PANIC_TABLE)) {
    if (total >= entry.range[0] && total <= entry.range[1]) {
      effect = entry.effect;
      strainIncrease = entry.strainIncrease;
      break;
    }
  }
  
  return {
    triggered: true,
    roll: panicRoll,
    total,
    effect,
    strainIncrease
  };
}

/**
 * Calculate new Scene Strain after a push
 */
export function calculateNewStrain(currentStrain: number, roll: DiceRoll): number {
  // Strain increases by the total number of Banes rolled (from both rolls if pushed)
  return currentStrain + roll.totalBanes;
}

/**
 * Format roll for display/logging
 */
export function formatRollResult(roll: DiceRoll): string {
  const parts = [
    `Pool: ${roll.regularDice} regular`,
    roll.strainDice > 0 ? `+ ${roll.strainDice} strain` : null,
    roll.modifier !== 0 ? `(mod: ${roll.modifier > 0 ? '+' : ''}${roll.modifier})` : null
  ].filter(Boolean);
  
  const poolStr = parts.join(' ');
  const resultStr = `${roll.successes} success${roll.successes !== 1 ? 'es' : ''}`;
  const baneStr = roll.totalBanes > 0 ? `, ${roll.totalBanes} bane${roll.totalBanes !== 1 ? 's' : ''}` : '';
  const pushStr = roll.pushed ? ' (PUSHED)' : '';
  
  return `${poolStr} → ${resultStr}${baneStr}${pushStr}`;
}
