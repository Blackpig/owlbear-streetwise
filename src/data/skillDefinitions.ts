/**
 * Skill definitions from Streetwise Core Rules
 * Each skill has a name, associated attribute, description, and mechanics explanation
 */

export interface SkillDefinition {
  name: string;
  attribute: 'strength' | 'agility' | 'wits' | 'empathy';
  description: string;
  mechanics: string;
}

export const SKILL_DEFINITIONS: Record<string, SkillDefinition> = {
  burgle: {
    name: 'Burgle',
    attribute: 'wits',
    description: 'Lockpicking, sneaking into buildings, and petty theft.',
    mechanics: "Burgle is the skill to use for lockpicking, climbing up drainpipes and petty theft. It's all about helping yourself to what ain't nailed down!"
  },

  deduce: {
    name: 'Deduce',
    attribute: 'wits',
    description: 'Solving puzzles, reasoning, and connecting dots.',
    mechanics: 'Deduce is all about solving puzzles and connecting dots, reading the truth between the lines and noticing the tiny details.'
  },

  hoodwink: {
    name: 'Hoodwink',
    attribute: 'empathy',
    description: 'Deception, distraction, and lying.',
    mechanics: "You'll want to use Hoodwink when you need to deceive, charm, distract or lie, hoping that they won't see the truth until it's too late."
  },

  notice: {
    name: 'Notice',
    attribute: 'wits',
    description: 'Spotting clues, details, or hidden threats.',
    mechanics: "When you're trying to survey the scene, spot the figure disappearing round a corner or the shadow in the alleyway, Notice is the skill you'll need."
  },

  physick: {
    name: 'Physick',
    attribute: 'empathy',
    description: 'Physical healing and first aid.',
    mechanics: 'Patching up cuts and bruises, soothing a fever, or calming a panicked urchin, Physick keeps the Grim Reaper in the dark where he belongs.'
  },

  pinch: {
    name: 'Pinch',
    attribute: 'agility',
    description: 'Pickpocketing, sleight of hand, and swiping things.',
    mechanics: 'Use Pinch when you need nimble fingers for pickpocketing, sleight of hand, or swiping things without being noticed.'
  },

  scramble: {
    name: 'Scramble',
    attribute: 'agility',
    description: 'Running, climbing, and physical exertion.',
    mechanics: 'Scramble covers running, climbing, physical exertion, and getting yourself out of tight spots quickly.'
  },

  scrap: {
    name: 'Scrap',
    attribute: 'strength',
    description: 'Fighting and brawling.',
    mechanics: 'When fists fly and you need to stand your ground, Scrap is the skill for fighting and brawling.'
  },

  sneak: {
    name: 'Sneak',
    attribute: 'agility',
    description: 'Moving silently and hiding.',
    mechanics: 'Sneak is for moving silently, hiding in shadows, and staying out of sight when you need to avoid detection.'
  },

  streetwise: {
    name: 'Streetwise',
    attribute: 'wits',
    description: 'Navigating the streets and knowing the right contacts.',
    mechanics: 'Use Streetwise when navigating the streets, knowing the right contacts, understanding the criminal underworld, and finding your way through London.'
  },

  tinker: {
    name: 'Tinker',
    attribute: 'wits',
    description: 'Fixing, breaking, and understanding machinery.',
    mechanics: 'Tinker is for fixing, breaking, and understanding machinery and mechanical devices of all kinds.'
  }
};
