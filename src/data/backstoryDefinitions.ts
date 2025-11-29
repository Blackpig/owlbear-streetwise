/**
 * Backstory Events - d66 Table
 * Roll 2d6 and read as tens/ones (11-66)
 * Victorian Streetwise character backstory events
 */

export const BACKSTORY_DEFINITIONS: Record<string, string> = {
  // 1X - Family & Origin
  '11': 'Orphaned at a young age, raised by the streets',
  '12': 'Ran away from a cruel master or guardian',
  '13': 'Parents died in a workhouse; you barely escaped the same fate',
  '14': 'Once had a respectable family, now fallen on hard times',
  '15': 'Abandoned as a baby, found by a kind-hearted stranger',
  '16': 'Family falsely accused of a crime; scattered to the winds',

  // 2X - Criminal Past
  '21': 'Did time in a youth detention facility',
  '22': 'Witnessed a murder and fled into the shadows',
  '23': 'Former pickpocket in a notorious gang',
  '24': 'Took the blame for someone else\'s crime',
  '25': 'Escaped from a brutal street gang',
  '26': 'Once worked as a lookout for burglars',

  // 3X - Loss & Betrayal
  '27': 'Lost a close friend or sibling to disease',
  '28': 'Betrayed by someone you trusted completely',
  '29': 'Fell in love with someone from the wrong side of the tracks',
  '30': 'Saved someone\'s life, but they never acknowledged it',
  '31': 'Watched your home burn down with no way to stop it',
  '32': 'Someone close to you was transported to the colonies',

  // 4X - Survival & Hardship
  '33': 'Lived through a brutal winter with nothing but rags',
  '34': 'Nearly died from hunger; survived by eating scraps',
  '35': 'Caught a terrible fever; recovered but forever changed',
  '36': 'Hid in the sewers for weeks to escape pursuit',
  '41': 'Stowed away on a ship; discovered and beaten',
  '42': 'Lived in a graveyard, sleeping among the tombstones',

  // 5X - Encounters & Discoveries
  '43': 'Accidentally stumbled upon a secret meeting of criminals',
  '44': 'Found a valuable item, but had to give it up to survive',
  '45': 'Met a mysterious stranger who changed your perspective',
  '46': 'Discovered a hidden talent during a moment of desperation',
  '51': 'Witnessed police corruption first-hand',
  '52': 'Saved by an unexpected act of kindness from a stranger',

  // 6X - Near Misses & Narrow Escapes
  '53': 'Nearly caught in a factory fire; escaped with seconds to spare',
  '54': 'Falsely arrested but managed to talk your way out',
  '55': 'Chased by a mob; barely escaped with your life',
  '56': 'Trapped in a collapsing building; dug yourself out',
  '61': 'Crossed paths with a dangerous criminal mastermind',
  '62': 'Discovered evidence of a dark secret about your family',
  '63': 'Rescued someone from drowning in the Thames',
  '64': 'Caught in the crossfire between rival gangs',
  '65': 'Accidentally poisoned; recovered but never forgot the pain',
  '66': 'Saved from certain death by a twist of fate'
};

// Helper function to get a backstory event by d66 roll
export function getBackstoryByRoll(roll: number): string | undefined {
  return BACKSTORY_DEFINITIONS[roll.toString()];
}

// Helper function to get all backstory entries as an array
export function getAllBackstoryEvents(): Array<{ id: string; text: string }> {
  return Object.entries(BACKSTORY_DEFINITIONS)
    .map(([id, text]) => ({ id, text }))
    .sort((a, b) => parseInt(a.id) - parseInt(b.id));
}
