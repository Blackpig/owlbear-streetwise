/**
 * Dark Secrets - Archetype-Specific
 * Official dark secrets from Streetwise Core Rules
 * Each archetype has 3 specific dark secrets
 */

import type { Archetype } from '../types/character';

// Artful Dodge (Wits) - Cunning thieves and con artists
const ARTFUL_DODGE_SECRETS: Record<string, string> = {
  '1': 'You betrayed a friend and they died instead of you',
  '2': 'You used to be a nark, feeding information to the Peelers',
  '3': 'You were brought up by the enemy'
};

// Brickyard Pug (Strength) - Street fighters and enforcers
const BRICKYARD_PUG_SECRETS: Record<string, string> = {
  '1': 'You threw a fight for money once and people know it',
  '2': 'You worry that one day your Strength will fail you, and what will you be then?',
  '3': 'You took money to help catch a kid you knew to be innocent'
};

// Bright Spark (Wits) - Inventors and tinkerers
const BRIGHT_SPARK_SECRETS: Record<string, string> = {
  '1': 'Your signature achievement wasn\'t your idea, you stole it from someone',
  '2': 'You solved a problem that helped a cruel enemy, something they did hurt people',
  '3': 'An experiment you were doing led to the death of a friend'
};

// Penny Physick (Empathy) - Street doctors and healers
const PENNY_PHYSICK_SECRETS: Record<string, string> = {
  '1': 'You gave someone the wrong treatment and they suffered or died as a result',
  '2': 'You once didn\'t treat someone when you could have saved them',
  '3': 'You were addicted to one of your medicines once and nearly died'
};

// Gutter Fixer (Empathy) - Deal makers and fixers
const GUTTER_FIXER_SECRETS: Record<string, string> = {
  '1': 'You fixed up a deal that led to the death of someone innocent',
  '2': 'You owe money to a vicious gang and if you don\'t repay it, you are dead',
  '3': 'You are caught up in a deal which might kill you, but you can\'t get out of it'
};

// Street Nose (Agility) - Scouts and lookouts
const STREET_NOSE_SECRETS: Record<string, string> = {
  '1': 'You know the real criminal in a terrible crime and haven\'t revealed them',
  '2': 'You overheard something about a friend, didn\'t tell them and they suffered',
  '3': 'You heard something you dearly wish you hadn\'t, and it eats away at you'
};

// Card Twister (Empathy) - Card sharps and gamblers
const CARD_TWISTER_SECRETS: Record<string, string> = {
  '1': 'You cheated the wrong person and it is coming back to haunt you',
  '2': 'Someone you loved was accused of cheating at cards and hanged for it',
  '3': 'The thing you are most proud of, the thing you tell everyone about, never happened'
};

export const DARK_SECRET_DEFINITIONS: Record<Archetype, Record<string, string>> = {
  'artful-dodge': ARTFUL_DODGE_SECRETS,
  'brickyard-pug': BRICKYARD_PUG_SECRETS,
  'bright-spark': BRIGHT_SPARK_SECRETS,
  'penny-physick': PENNY_PHYSICK_SECRETS,
  'gutter-fixer': GUTTER_FIXER_SECRETS,
  'street-nose': STREET_NOSE_SECRETS,
  'card-twister': CARD_TWISTER_SECRETS
};

// Helper function to get all dark secrets for an archetype as an array
export function getDarkSecretsForArchetype(archetype: Archetype): Array<{ id: string; text: string }> {
  const secrets = DARK_SECRET_DEFINITIONS[archetype] || {};
  return Object.entries(secrets)
    .map(([id, text]) => ({ id, text }))
    .sort((a, b) => parseInt(a.id) - parseInt(b.id));
}
