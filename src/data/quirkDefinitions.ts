/**
 * Appearance & Quirks - d66 Table
 * Roll 2d6 and read as tens/ones (11-66)
 * Victorian Streetwise character quirks and appearance traits
 */

export const QUIRK_DEFINITIONS: Record<string, string> = {
  // 1X - Physical Appearance
  '11': 'Carries a battered pocket watch that no longer works',
  '12': 'Wears mismatched boots - one too large, one too small',
  '13': 'Has a distinctive limp from an old injury',
  '14': 'Always wears a faded red scarf, regardless of weather',
  '15': 'Missing a front tooth, whistles when speaking',
  '16': 'Unusually tall and gangly, always hunched over',

  // 2X - Facial Features & Hair
  '21': 'Wears thick, cracked spectacles held together with wire',
  '22': 'Has a prominent scar across their left cheek',
  '23': 'Sports a patchy, poorly-maintained mustache',
  '24': 'Hair is perpetually matted and unkempt',
  '25': 'Has mismatched eyes - one blue, one brown',
  '26': 'Constantly squints, even in dim light',

  // 3X - Clothing & Accessories
  '27': 'Proudly wears a lopsided bowler hat',
  '28': 'Never seen without their threadbare grey overcoat',
  '29': 'Wears too many layers, regardless of temperature',
  '30': 'Always has a grimy neckerchief around their throat',
  '31': 'Keeps a lucky rabbit\'s foot on a chain',
  '32': 'Wears fingerless gloves with holes in them',

  // 4X - Mannerisms & Habits
  '33': 'Constantly fidgets with a bent coin',
  '34': 'Speaks in theatrical whispers, even when unnecessary',
  '35': 'Laughs at inappropriate moments',
  '36': 'Always eating something - bread crusts, apple cores',
  '41': 'Taps their nose knowingly when making a point',
  '42': 'Mutters calculations under their breath',

  // 5X - Speech & Voice
  '43': 'Speaks with an exaggerated posh accent (poorly faked)',
  '44': 'Has a distinctive raspy voice from years of shouting',
  '45': 'Rarely speaks above a whisper',
  '46': 'Peppers speech with unnecessary foreign words',
  '51': 'Has a nervous stammer that worsens under pressure',
  '52': 'Speaks in rhyming couplets when excited',

  // 6X - Peculiarities
  '53': 'Collects odd buttons and keeps them in pockets',
  '54': 'Refuses to step on cracks in the pavement',
  '55': 'Always knows what time it is, despite no visible timepiece',
  '56': 'Sleeps with their eyes partially open',
  '61': 'Can\'t resist petting any dog they encounter',
  '62': 'Carries a small notebook, constantly scribbling observations',
  '63': 'Has an irrational fear of pigeons',
  '64': 'Always positions themselves near exits',
  '65': 'Hums old music hall tunes absentmindedly',
  '66': 'Keeps a small dried flower pressed in a book'
};

// Helper function to get a quirk description by d66 roll
export function getQuirkByRoll(roll: number): string | undefined {
  return QUIRK_DEFINITIONS[roll.toString()];
}

// Helper function to get all quirk entries as an array
export function getAllQuirks(): Array<{ id: string; text: string }> {
  return Object.entries(QUIRK_DEFINITIONS)
    .map(([id, text]) => ({ id, text }))
    .sort((a, b) => parseInt(a.id) - parseInt(b.id));
}
