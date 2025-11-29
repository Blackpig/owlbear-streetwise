import type { Character, Archetype, Condition } from '../types/character';

// Ideal JSON format for import/export
export interface CharacterJSON {
  schemaVersion: string;
  schemaType: string;
  id: string;
  name: string;
  archetype: Archetype;
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
  talents: string[];
  quirks: string[];
  backstory: string[];
  darkSecret: string;
  possessions: string;
  notes: string;
  extendedNotes: string;
  portrait?: string; // URL or base64 data URI
  sleepDeprived?: boolean;
  gender?: string;
}

// Legacy format (flat structure from other app)
interface LegacyCharacterJSON {
  id?: string;
  firstname?: string;
  lastname?: string;
  nickname?: string;
  archetypeid?: string;
  archetype?: string;
  attribute_strength?: string | number;
  attribute_agility?: string | number;
  attribute_wits?: string | number;
  attribute_empathy?: string | number;
  skill_burgle?: string | number;
  skill_deduce?: string | number;
  skill_hoodwink?: string | number;
  skill_notice?: string | number;
  skill_physick?: string | number;
  skill_pinch?: string | number;
  skill_scramble?: string | number;
  skill_scrap?: string | number;
  skill_sneak?: string | number;
  skill_streetwise?: string | number;
  skill_tinker?: string | number;
  talent1?: string;
  talent2?: string;
  secret1?: string;
  secret2?: string;
  quirk1?: string;
  quirk2?: string;
  backstory?: string;
  event1?: string;
  event2?: string;
  event3?: string;
  notes?: string;
  image?: string; // Legacy portrait field
  [key: string]: unknown; // Allow other fields
}

const ARCHETYPE_ID_MAP: Record<string, Archetype> = {
  'dodge': 'artful-dodge',
  'pug': 'brickyard-pug',
  'spark': 'bright-spark',
  'physick': 'penny-physick',
  'fixer': 'gutter-fixer',
  'nose': 'street-nose',
  'twister': 'card-twister'
};

const VALID_ARCHETYPES = new Set<string>([
  'artful-dodge',
  'brickyard-pug',
  'bright-spark',
  'penny-physick',
  'gutter-fixer',
  'street-nose',
  'card-twister'
]);

const VALID_CONDITIONS = new Set<Condition>(['bruised', 'hurt', 'injured', 'broken']);

const REQUIRED_SKILLS = [
  'burgle', 'deduce', 'hoodwink', 'notice', 'physick',
  'pinch', 'scramble', 'scrap', 'sneak', 'streetwise', 'tinker'
];

/**
 * Validate a character JSON object
 */
export function validateCharacterJSON(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid JSON: not an object'] };
  }

  const json = data as Partial<CharacterJSON>;

  // Check schema fields
  if (json.schemaVersion && json.schemaVersion !== '1.0') {
    errors.push(`Unsupported schema version: ${json.schemaVersion}`);
  }

  if (json.schemaType && json.schemaType !== 'streetwise-character') {
    errors.push(`Invalid schema type: ${json.schemaType}`);
  }

  // Check required fields
  if (!json.id || typeof json.id !== 'string') {
    errors.push('Missing or invalid id');
  }

  if (!json.name || typeof json.name !== 'string' || json.name.length === 0) {
    errors.push('Missing or invalid name');
  }

  if (!json.archetype || !VALID_ARCHETYPES.has(json.archetype)) {
    errors.push(`Invalid archetype: ${json.archetype}`);
  }

  // Validate attributes
  if (!json.attributes || typeof json.attributes !== 'object') {
    errors.push('Missing or invalid attributes object');
  } else {
    const attrs = json.attributes;
    for (const attr of ['strength', 'agility', 'wits', 'empathy']) {
      const value = (attrs as Record<string, unknown>)[attr];
      if (typeof value !== 'number' || value < 0 || value > 10 || !Number.isInteger(value)) {
        errors.push(`Invalid ${attr}: must be integer 0-10`);
      }
    }
  }

  // Validate skills
  if (!json.skills || typeof json.skills !== 'object') {
    errors.push('Missing or invalid skills object');
  } else {
    const skills = json.skills;
    for (const skill of REQUIRED_SKILLS) {
      const value = (skills as Record<string, unknown>)[skill];
      if (typeof value !== 'number' || value < 0 || value > 10 || !Number.isInteger(value)) {
        errors.push(`Invalid skill ${skill}: must be integer 0-10`);
      }
    }
  }

  // Validate conditions
  if (!Array.isArray(json.conditions)) {
    errors.push('Invalid conditions: must be array');
  } else {
    if (json.conditions.length > 4) {
      errors.push('Invalid conditions: max 4 conditions');
    }
    for (const condition of json.conditions) {
      if (!VALID_CONDITIONS.has(condition as Condition)) {
        errors.push(`Invalid condition: ${condition}`);
      }
    }
  }

  // Validate talents
  if (!Array.isArray(json.talents)) {
    errors.push('Invalid talents: must be array');
  }

  // Validate quirks (optional array)
  if (json.quirks !== undefined && !Array.isArray(json.quirks)) {
    errors.push('Invalid quirks: must be array');
  }

  // Validate backstory (optional array)
  if (json.backstory !== undefined && !Array.isArray(json.backstory)) {
    errors.push('Invalid backstory: must be array');
  }

  // Validate strings
  if (json.darkSecret !== undefined && typeof json.darkSecret !== 'string') {
    errors.push('Invalid darkSecret: must be string');
  }

  if (json.possessions !== undefined && typeof json.possessions !== 'string') {
    errors.push('Invalid possessions: must be string');
  }

  if (json.notes !== undefined && typeof json.notes !== 'string') {
    errors.push('Invalid notes: must be string');
  }

  if (json.extendedNotes !== undefined && typeof json.extendedNotes !== 'string') {
    errors.push('Invalid extendedNotes: must be string');
  }

  // Validate portrait (optional)
  if (json.portrait !== undefined && typeof json.portrait !== 'string') {
    errors.push('Invalid portrait: must be string (URL or data URI)');
  }

  // Validate sleepDeprived (optional boolean)
  if (json.sleepDeprived !== undefined && typeof json.sleepDeprived !== 'boolean') {
    errors.push('Invalid sleepDeprived: must be boolean');
  }

  // Validate gender (optional string)
  if (json.gender !== undefined && typeof json.gender !== 'string') {
    errors.push('Invalid gender: must be string');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Migrate legacy format to ideal format
 */
export function migrateLegacyCharacter(legacy: LegacyCharacterJSON): CharacterJSON {
  // Combine name fields
  const firstName = legacy.firstname || '';
  const lastName = legacy.lastname || '';
  const nickname = legacy.nickname || '';
  let name = firstName;
  if (nickname) {
    name += ` '${nickname}'`;
  }
  if (lastName) {
    name += ` ${lastName}`;
  }
  name = name.trim() || 'Unnamed Character';

  // Convert archetype ID
  const archetypeId = legacy.archetypeid || '';
  let archetype: Archetype = ARCHETYPE_ID_MAP[archetypeId] || 'artful-dodge';

  // If archetype field is already in new format, use it
  if (legacy.archetype && VALID_ARCHETYPES.has(legacy.archetype)) {
    archetype = legacy.archetype as Archetype;
  }

  // Parse attributes
  const parseNum = (val: string | number | undefined): number => {
    if (typeof val === 'number') return Math.max(0, Math.min(10, Math.floor(val)));
    if (typeof val === 'string') return Math.max(0, Math.min(10, Math.floor(parseInt(val) || 0)));
    return 0;
  };

  const attributes = {
    strength: parseNum(legacy.attribute_strength),
    agility: parseNum(legacy.attribute_agility),
    wits: parseNum(legacy.attribute_wits),
    empathy: parseNum(legacy.attribute_empathy)
  };

  // Parse skills
  const skills = {
    burgle: parseNum(legacy.skill_burgle),
    deduce: parseNum(legacy.skill_deduce),
    hoodwink: parseNum(legacy.skill_hoodwink),
    notice: parseNum(legacy.skill_notice),
    physick: parseNum(legacy.skill_physick),
    pinch: parseNum(legacy.skill_pinch),
    scramble: parseNum(legacy.skill_scramble),
    scrap: parseNum(legacy.skill_scrap),
    sneak: parseNum(legacy.skill_sneak),
    streetwise: parseNum(legacy.skill_streetwise),
    tinker: parseNum(legacy.skill_tinker)
  };

  // Combine talents
  const talents: string[] = [];
  if (legacy.talent1 && legacy.talent1.trim()) talents.push(legacy.talent1.trim());
  if (legacy.talent2 && legacy.talent2.trim()) talents.push(legacy.talent2.trim());

  // Extract quirks into array
  const quirks: string[] = [];
  if (legacy.quirk1 && legacy.quirk1.trim()) quirks.push(legacy.quirk1.trim());
  if (legacy.quirk2 && legacy.quirk2.trim()) quirks.push(legacy.quirk2.trim());

  // Extract backstory events into array (from both secret_ and event_ fields)
  const backstory: string[] = [];
  if (legacy.secret1 && legacy.secret1.trim()) backstory.push(legacy.secret1.trim());
  if (legacy.secret2 && legacy.secret2.trim()) backstory.push(legacy.secret2.trim());
  if (legacy.event1 && legacy.event1.trim()) backstory.push(legacy.event1.trim());
  if (legacy.event2 && legacy.event2.trim()) backstory.push(legacy.event2.trim());
  if (legacy.event3 && legacy.event3.trim()) backstory.push(legacy.event3.trim());

  // Dark secret is empty for legacy imports (not stored in legacy format)
  const darkSecret = '';

  // Quick notes
  const notes = legacy.notes && legacy.notes.trim() ? legacy.notes.trim() : '';

  // Extended notes (general backstory)
  const extendedNotes = legacy.backstory && legacy.backstory.trim() ? legacy.backstory.trim() : '';

  // Possessions
  const possessions = '';

  // Generate ID if needed
  let id = legacy.id || '';
  if (id.startsWith('#')) {
    id = 'char_' + id.substring(1);
  }
  if (!id) {
    id = 'char_' + Date.now();
  }

  // Handle portrait (optional)
  const portrait = legacy.image && legacy.image.trim() ? legacy.image.trim() : undefined;

  const result: CharacterJSON = {
    schemaVersion: '1.0',
    schemaType: 'streetwise-character',
    id,
    name,
    archetype,
    attributes,
    skills,
    conditions: [],
    talents,
    quirks,
    backstory,
    darkSecret,
    possessions,
    notes,
    extendedNotes
  };

  // Add portrait if present
  if (portrait) {
    result.portrait = portrait;
  }

  return result;
}

/**
 * Detect if JSON is legacy format
 */
function isLegacyFormat(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;

  // Legacy format has flat attributes like "attribute_strength"
  return (
    'attribute_strength' in obj ||
    'skill_burgle' in obj ||
    'firstname' in obj ||
    'archetypeid' in obj
  );
}

/**
 * Import character from JSON string
 */
export function importCharacter(jsonString: string): { success: boolean; character?: Character; errors?: string[] } {
  try {
    const data = JSON.parse(jsonString);

    // Detect and migrate legacy format
    let characterJSON: CharacterJSON;
    if (isLegacyFormat(data)) {
      characterJSON = migrateLegacyCharacter(data as LegacyCharacterJSON);
    } else {
      characterJSON = data as CharacterJSON;
    }

    // Validate
    const validation = validateCharacterJSON(characterJSON);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors
      };
    }

    // Convert to Character type (remove schema fields)
    const character: Character = {
      id: characterJSON.id,
      name: characterJSON.name,
      archetype: characterJSON.archetype,
      attributes: characterJSON.attributes,
      skills: characterJSON.skills,
      conditions: characterJSON.conditions,
      talents: characterJSON.talents,
      quirks: characterJSON.quirks || [],
      backstory: characterJSON.backstory || [],
      darkSecret: characterJSON.darkSecret || '',
      possessions: characterJSON.possessions || '',
      notes: characterJSON.notes || '',
      extendedNotes: characterJSON.extendedNotes || ''
    };

    // Add optional fields if present
    if (characterJSON.portrait) {
      character.portrait = characterJSON.portrait;
    }
    if (characterJSON.sleepDeprived !== undefined) {
      character.sleepDeprived = characterJSON.sleepDeprived;
    }
    if (characterJSON.gender) {
      character.gender = characterJSON.gender;
    }

    return {
      success: true,
      character
    };
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error parsing JSON']
    };
  }
}

/**
 * Export character to JSON string
 */
export function exportCharacter(character: Character): string {
  const characterJSON: CharacterJSON = {
    schemaVersion: '1.0',
    schemaType: 'streetwise-character',
    ...character
  };

  return JSON.stringify(characterJSON, null, 2);
}

/**
 * Download character as JSON file
 */
export function downloadCharacterJSON(character: Character): void {
  const jsonString = exportCharacter(character);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // Create filename from character name
  const filename = `${character.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_character.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
