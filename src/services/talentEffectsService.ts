/**
 * Talent Effects Service
 * Processes character talents and returns applicable effects for rolls
 */

import type { Character } from '../types/character';
import { TALENT_DEFINITIONS } from '../data/talentDefinitions';
import { SKILLS } from '../types/character';

export interface TalentEffect {
  activeTalents: string[];
  effectiveAttribute: 'strength' | 'agility' | 'wits' | 'empathy';
  attributeSwapped: boolean;
  rollModifier: number;
  maxPushes: number;
  description: string;
}

/**
 * Get all applicable talent effects for a skill roll
 */
export function getTalentEffects(
  character: Character,
  skillId: string
): TalentEffect {
  const skill = SKILLS[skillId];
  const baseAttribute = skill.attribute;
  const talents = character.talents;

  const result: TalentEffect = {
    activeTalents: [],
    effectiveAttribute: baseAttribute,
    attributeSwapped: false,
    rollModifier: 0,
    maxPushes: 1,
    description: ''
  };

  // Check each talent the character has
  for (const talentName of talents) {
    const talent = TALENT_DEFINITIONS[talentName];
    if (!talent) continue;

    // Handle attribute swaps
    if (talent.mechanics.type === 'attribute-swap') {
      if (talent.mechanics.skill === skillId) {
        const newAttribute = talent.mechanics.attributeTo as typeof baseAttribute;
        const oldAttributeValue = character.attributes[baseAttribute];
        const newAttributeValue = character.attributes[newAttribute];

        // Always use the better attribute
        if (newAttributeValue > oldAttributeValue) {
          result.effectiveAttribute = newAttribute;
          result.attributeSwapped = true;
          result.activeTalents.push(talentName);
        }
      }
    }

    // Handle double-push talents
    if (talent.mechanics.type === 'double-push') {
      const appliesToSkill = talent.mechanics.skill === skillId;
      const appliesToAttribute = talent.mechanics.attributeFrom === baseAttribute;

      if (appliesToSkill || appliesToAttribute) {
        result.maxPushes = 2;
        result.activeTalents.push(talentName);
      }
    }

    // Handle roll modifiers
    if (talent.mechanics.type === 'roll-modification') {
      if (talent.mechanics.skill === skillId) {
        result.rollModifier += 1;
        result.activeTalents.push(talentName);
      }
    }
  }

  // Build description
  if (result.activeTalents.length > 0) {
    const descriptions: string[] = [];

    if (result.attributeSwapped) {
      descriptions.push(
        `Using ${result.effectiveAttribute.charAt(0).toUpperCase() + result.effectiveAttribute.slice(1)} instead of ${baseAttribute.charAt(0).toUpperCase() + baseAttribute.slice(1)}`
      );
    }

    if (result.maxPushes > 1) {
      descriptions.push('Can push twice');
    }

    if (result.rollModifier > 0) {
      descriptions.push(`+${result.rollModifier} dice`);
    }

    result.description = descriptions.join(', ');
  }

  return result;
}

/**
 * Get a list of all talents currently active for display purposes
 */
export function getActiveTalentsForSkill(
  character: Character,
  skillId: string
): string[] {
  const effects = getTalentEffects(character, skillId);
  return effects.activeTalents;
}

/**
 * Check if a talent allows double push for a specific context
 */
export function canPushTwice(
  character: Character,
  skillId: string
): boolean {
  const effects = getTalentEffects(character, skillId);
  return effects.maxPushes > 1;
}

/**
 * Get the effective attribute value for a skill, considering talents
 */
export function getEffectiveAttributeValue(
  character: Character,
  skillId: string
): number {
  const effects = getTalentEffects(character, skillId);
  return character.attributes[effects.effectiveAttribute];
}

/**
 * Calculate the total dice pool for a skill roll including talents
 */
export function calculateDicePool(
  character: Character,
  skillId: string,
  additionalModifier: number = 0
): {
  total: number;
  attribute: number;
  skill: number;
  modifier: number;
  talentModifier: number;
  conditionPenalty: number;
  effectiveAttribute: string;
} {
  const skillValue = character.skills[skillId as keyof Character['skills']];
  const effects = getTalentEffects(character, skillId);
  const attributeValue = character.attributes[effects.effectiveAttribute];
  const conditionPenalty = character.conditions.length;
  const talentModifier = effects.rollModifier;

  const total = Math.max(
    1,
    attributeValue + skillValue + additionalModifier + talentModifier - conditionPenalty
  );

  return {
    total,
    attribute: attributeValue,
    skill: skillValue,
    modifier: additionalModifier,
    talentModifier,
    conditionPenalty,
    effectiveAttribute: effects.effectiveAttribute
  };
}
