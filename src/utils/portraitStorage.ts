/**
 * Portrait storage utilities - stores portraits in localStorage to avoid metadata size limits
 */

const PORTRAIT_STORAGE_KEY = 'streetwise.portraits';

interface PortraitCache {
  [playerId: string]: string; // playerId -> portrait (URL or base64)
}

/**
 * Save a portrait to localStorage
 */
export function savePortrait(playerId: string, portrait: string): void {
  try {
    const cache = getPortraitCache();
    cache[playerId] = portrait;
    localStorage.setItem(PORTRAIT_STORAGE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error saving portrait to localStorage:', error);
  }
}

/**
 * Load a portrait from localStorage
 */
export function loadPortrait(playerId: string): string | undefined {
  try {
    const cache = getPortraitCache();
    return cache[playerId];
  } catch (error) {
    console.error('Error loading portrait from localStorage:', error);
    return undefined;
  }
}

/**
 * Remove a portrait from localStorage
 */
export function removePortrait(playerId: string): void {
  try {
    const cache = getPortraitCache();
    delete cache[playerId];
    localStorage.setItem(PORTRAIT_STORAGE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error removing portrait from localStorage:', error);
  }
}

/**
 * Get the portrait cache from localStorage
 */
function getPortraitCache(): PortraitCache {
  try {
    const cached = localStorage.getItem(PORTRAIT_STORAGE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (error) {
    console.error('Error reading portrait cache:', error);
    return {};
  }
}

/**
 * Clear all portraits from localStorage
 */
export function clearAllPortraits(): void {
  try {
    localStorage.removeItem(PORTRAIT_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing portraits:', error);
  }
}
