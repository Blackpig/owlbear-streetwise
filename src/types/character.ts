export interface Character {
  id: string;
  name: string;
  archetype: Archetype;
  gender?: string; // Optional gender for silhouette selection
  attributes: {
    strength: number;
    agility: number;
    wits: number;
    empathy: number;
  };
  skills: {
    burgle: number;
    deduce: number;
    hoodwink: number;
    notice: number;
    physick: number;
    pinch: number;
    scramble: number;
    scrap: number;
    sneak: number;
    streetwise: number;
    tinker: number;
  };
  conditions: Condition[];
  sleepDeprived?: boolean; // Sleep deprivation status
  talents: string[]; // Talent IDs
  quirks: string[]; // 1-2 appearance/personality quirks
  backstory: string[]; // 1-2 backstory events
  darkSecret: string;
  possessions: string; // Items carried
  notes: string; // Quick session notes
  extendedNotes: string; // Extended character history/background
  portrait?: string; // URL or base64 data URI
  linkedTokenId?: string; // OBR token ID this character is linked to
}

export type Condition = 'bruised' | 'hurt' | 'injured' | 'broken';

export type Archetype =
  | 'artful-dodge'
  | 'brickyard-pug'
  | 'bright-spark'
  | 'penny-physick'
  | 'gutter-fixer'
  | 'street-nose'
  | 'card-twister';

export interface Skill {
  id: string;
  name: string;
  attribute: 'strength' | 'agility' | 'wits' | 'empathy';
  description: string;
}

export const SKILLS: Record<string, Skill> = {
  burgle: { id: 'burgle', name: 'Burgle', attribute: 'wits', description: 'Lockpicking, sneaking into buildings, petty theft' },
  deduce: { id: 'deduce', name: 'Deduce', attribute: 'wits', description: 'Solving puzzles, reasoning, connecting dots' },
  hoodwink: { id: 'hoodwink', name: 'Hoodwink', attribute: 'empathy', description: 'Deception, distraction, and lying' },
  notice: { id: 'notice', name: 'Notice', attribute: 'wits', description: 'Spotting clues, details, or hidden threats' },
  physick: { id: 'physick', name: 'Physick', attribute: 'empathy', description: 'Physical healing and first aid' },
  pinch: { id: 'pinch', name: 'Pinch', attribute: 'agility', description: 'Pickpocketing, sleight of hand, swiping things' },
  scramble: { id: 'scramble', name: 'Scramble', attribute: 'agility', description: 'Running, climbing, physical exertion' },
  scrap: { id: 'scrap', name: 'Scrap', attribute: 'strength', description: 'Fighting and brawling' },
  sneak: { id: 'sneak', name: 'Sneak', attribute: 'agility', description: 'Moving silently and hiding' },
  streetwise: { id: 'streetwise', name: 'Streetwise', attribute: 'wits', description: 'Navigating the streets, knowing the right contacts' },
  tinker: { id: 'tinker', name: 'Tinker', attribute: 'wits', description: 'Fixing, breaking, understanding machinery' }
};
