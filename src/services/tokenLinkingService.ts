// Token Linking Service - Link characters to map tokens
import OBR from '@owlbear-rodeo/sdk';
import type { Character } from '../types/character';

/**
 * Link a character to a selected token on the map
 * Stores character metadata on the token
 * Players only - can link their own character to a selected token
 */
export async function linkCharacterToToken(character: Character): Promise<string | null> {
  try {
    // Get the currently selected items on the map
    const selection = await OBR.player.getSelection();

    if (!selection || selection.length === 0) {
      throw new Error('Please select a token on the map first');
    }

    if (selection.length > 1) {
      throw new Error('Please select only one token');
    }

    const tokenId = selection[0];

    // Get the token item
    const items = await OBR.scene.items.getItems([tokenId]);
    const token = items[0];

    if (!token) {
      throw new Error('Token not found');
    }

    // Check if it's an image (token) type
    if (token.type !== 'IMAGE') {
      throw new Error('Selected item is not a token');
    }

    // Update token with character info
    await OBR.scene.items.updateItems([tokenId], (items) => {
      return items.map(item => ({
        ...item,
        metadata: {
          ...item.metadata,
          'streetwise.characterId': character.id,
          'streetwise.characterName': character.name
        }
      }));
    });

    return tokenId;
  } catch (error) {
    console.error('Error linking character to token:', error);
    throw error;
  }
}

/**
 * Unlink a character from its token
 * Removes character metadata from the token
 * Players only - can unlink their own character
 */
export async function unlinkCharacterFromToken(tokenId: string): Promise<void> {
  try {
    // Get the token item
    const items = await OBR.scene.items.getItems([tokenId]);

    if (items.length === 0) {
      throw new Error('Token not found on map');
    }

    // Remove character metadata from token
    await OBR.scene.items.updateItems([tokenId], (items) => {
      return items.map(item => {
        const { metadata } = item;
        const { 'streetwise.characterId': _, 'streetwise.characterName': __, ...rest } = metadata;
        return {
          ...item,
          metadata: rest
        };
      });
    });
  } catch (error) {
    console.error('Error unlinking character from token:', error);
    throw error;
  }
}

/**
 * Check if a token still exists on the map
 */
export async function checkTokenExists(tokenId: string): Promise<boolean> {
  try {
    const items = await OBR.scene.items.getItems([tokenId]);
    return items.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Get token name for display
 */
export async function getTokenName(tokenId: string): Promise<string | null> {
  try {
    const items = await OBR.scene.items.getItems([tokenId]);

    if (items.length === 0) {
      return null;
    }

    return items[0].name || 'Token';
  } catch (error) {
    return null;
  }
}
