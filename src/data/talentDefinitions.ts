/**
 * Talent definitions from Streetwise Core Rules
 * Each talent has a name, description, effect summary, and structured mechanics data
 */

export interface TalentMechanics {
  type: 'attribute-swap' | 'double-push' | 'damage-mitigation' | 'damage-transfer' |
        'question-ability' | 'healing' | 'contact-summon' | 'auto-escape' |
        'ally-benefit' | 'initiative-bonus' | 'condition-delay' | 'narrative-declaration' |
        'roll-modification' | 'special';
  skill?: string;
  attributeFrom?: string;
  attributeTo?: string;
  condition?: string;
  details?: string;
}

export interface TalentDefinition {
  name: string;
  description: string;
  effect: string;
  mechanics: TalentMechanics;
}

export const TALENT_DEFINITIONS: Record<string, TalentDefinition> = {
  'Fast Talk': {
    name: 'Fast Talk',
    description: 'You are excellent at talking your way out of a tight spot.',
    effect: 'Use Wits instead of Empathy when persuading someone of your innocence.',
    mechanics: {
      type: 'attribute-swap',
      skill: 'hoodwink',
      attributeFrom: 'empathy',
      attributeTo: 'wits',
      condition: 'when persuading someone of your innocence'
    }
  },

  'Light Fingered': {
    name: 'Light Fingered',
    description: 'Your fingers are quick and nimble, perfect for delicate work.',
    effect: 'Push Pinch rolls twice instead of once.',
    mechanics: {
      type: 'double-push',
      skill: 'pinch',
      condition: 'when executing particularly delicate pickpocketing, swiping or theft'
    }
  },

  'Stand Firm': {
    name: 'Stand Firm',
    description: 'You can brace yourself against inanimate impacts.',
    effect: 'Ignore the first Condition from inanimate hits, or reduce multiple Conditions by 1.',
    mechanics: {
      type: 'damage-mitigation',
      condition: 'when you have time to brace yourself and are hit by something inanimate',
      details: 'Ignore first Condition, or reduce number by 1 if multiple Conditions received'
    }
  },

  'Bodyguard': {
    name: 'Bodyguard',
    description: 'You can throw yourself in front of allies to protect them.',
    effect: 'Roll Scramble to take a hit meant for an ally in Short range.',
    mechanics: {
      type: 'damage-transfer',
      skill: 'scramble',
      condition: 'when someone in Short range is hit in close combat',
      details: 'One or more Successes means you take the hit instead'
    }
  },

  'Grim Determination': {
    name: 'Grim Determination',
    description: 'When you clench your jaw and dig deep, nothing can stop you.',
    effect: 'Push Strength-based rolls twice instead of once.',
    mechanics: {
      type: 'double-push',
      attributeFrom: 'strength',
      condition: 'when reaching deep inside to succeed against the odds'
    }
  },

  'Vital Clue': {
    name: 'Vital Clue',
    description: 'You have a knack for extracting maximum information from clues.',
    effect: 'Ask the GM one question about a clue after a successful Deduce check.',
    mechanics: {
      type: 'question-ability',
      skill: 'deduce',
      condition: 'when you examine an interesting clue and succeed on Deduce',
      details: 'Receive a truthful and useful answer'
    }
  },

  'Wrack Your Brains': {
    name: 'Wrack Your Brains',
    description: 'You can push your mental faculties to their limits.',
    effect: 'Push Wits-based rolls twice instead of once.',
    mechanics: {
      type: 'double-push',
      attributeFrom: 'wits',
      condition: 'when straining mental faculties to think of a solution or dredge up a memory'
    }
  },

  'Poultice & Patience': {
    name: 'Poultice & Patience',
    description: 'Given time and care, you can fully heal another character.',
    effect: 'Remove all Conditions from another character with at least an hour of work.',
    mechanics: {
      type: 'healing',
      skill: 'physick',
      condition: 'when you have time to prepare and work carefully',
      details: 'Takes at least an hour, cannot be used on yourself, must be outside combat, one recipient at a time'
    }
  },

  'Emergency Patch': {
    name: 'Emergency Patch',
    description: 'You can provide rapid healing in tense situations.',
    effect: 'Remove 1 Condition per Success when using Physick in a tense situation.',
    mechanics: {
      type: 'healing',
      skill: 'physick',
      condition: 'in the midst of a tense situation',
      details: 'Can only use once per scene'
    }
  },

  'I Know A Cove': {
    name: 'I Know A Cove',
    description: 'You always know someone who can help, for a price.',
    effect: 'Declare a contact who can help you when desperate.',
    mechanics: {
      type: 'contact-summon',
      condition: 'when desperate for help',
      details: 'GM must accept the contact but may determine what they want in return'
    }
  },

  'Gut Feeling': {
    name: 'Gut Feeling',
    description: 'You have a sixth sense for when trouble is brewing.',
    effect: 'Roll Notice using Empathy instead of Wits when detecting impending problems.',
    mechanics: {
      type: 'attribute-swap',
      skill: 'notice',
      attributeFrom: 'wits',
      attributeTo: 'empathy',
      condition: 'when trying to detect impending problems'
    }
  },

  'Gone In A Blink': {
    name: 'Gone In A Blink',
    description: 'In your element, you can vanish without a trace.',
    effect: 'Automatically slip away unnoticed in your chosen urban setting.',
    mechanics: {
      type: 'auto-escape',
      condition: 'when in your element in a chosen urban setting (sewers, crowds, rooftops, backalleys, etc.)',
      details: 'Escape must be physically possible; setting must be clear and specific'
    }
  },

  'Watch the Hands': {
    name: 'Watch the Hands',
    description: 'You can create distractions that give allies openings.',
    effect: 'Award an extra fast action to an ally for one round.',
    mechanics: {
      type: 'ally-benefit',
      condition: 'when you are the centre of attention',
      details: 'Create compelling distraction for ally of your choice'
    }
  },

  'Up and at \'em': {
    name: 'Up and at \'em',
    description: 'You are extremely light on your feet and quick to react.',
    effect: 'Roll two dice for initiative and use the highest result.',
    mechanics: {
      type: 'initiative-bonus',
      condition: 'when rolling initiative',
      details: 'Roll two dice and use highest'
    }
  },

  'Block Out The Pain': {
    name: 'Block Out The Pain',
    description: 'You can keep going when others would fall.',
    effect: 'Defer a Condition to next round, but take two Conditions when you do.',
    mechanics: {
      type: 'condition-delay',
      condition: 'when you have to keep going and can\'t afford to stop',
      details: 'Defer taking a Condition to next round; add a second Condition when you do'
    }
  },

  'I Saw \'Em Do It': {
    name: 'I Saw \'Em Do It',
    description: 'You can declare helpful details about what you witnessed.',
    effect: 'Declare a story detail that might aid you after a successful Notice roll.',
    mechanics: {
      type: 'narrative-declaration',
      skill: 'notice',
      condition: 'when trying to get a glimpse of hidden goings on and you succeed',
      details: 'Can be a small to medium inanimate object or scene feature; GM may question or tweak'
    }
  },

  'Catch The Gist': {
    name: 'Catch The Gist',
    description: 'You can pick up on conversations by reading body language.',
    effect: 'Roll Notice using Agility instead of Wits when eavesdropping.',
    mechanics: {
      type: 'attribute-swap',
      skill: 'notice',
      attributeFrom: 'wits',
      attributeTo: 'agility',
      condition: 'when straining to hear a secret conversation'
    }
  },

  'I Read That Somewhere': {
    name: 'I Read That Somewhere',
    description: 'Your knowledge of books gives you an edge in deduction.',
    effect: 'Add +1 modification to Deduce rolls based on book knowledge.',
    mechanics: {
      type: 'roll-modification',
      skill: 'deduce',
      condition: 'when trying to deduce connections by remembering something from books',
      details: '+1 modification to roll'
    }
  },

  'Lucky For You': {
    name: 'Lucky For You',
    description: 'Fortune favors you in games of chance.',
    effect: 'Special ability related to gambling and games of chance.',
    mechanics: {
      type: 'special',
      condition: 'in games of chance',
      details: 'Details to be determined (mentioned in Card Twister archetype)'
    }
  }
};
