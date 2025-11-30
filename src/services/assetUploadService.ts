/**
 * Asset Upload Service
 * Handles uploading character portraits as tokens to Owlbear Rodeo assets
 */

import OBR, { buildImageUpload } from '@owlbear-rodeo/sdk';
import type { Character } from '../types/character';
import { createCircularToken, createTokenFile } from '../utils/tokenImageUtils';

export interface AssetUploadResult {
  success: boolean;
  assetUrl?: string;
  error?: string;
}

/**
 * Upload a character's portrait as a token to OBR assets
 * Processes the portrait into a 300x300 circular PNG token
 * Only available to GMs
 *
 * @param character Character with portrait to upload
 * @returns Promise with upload result
 */
export async function uploadCharacterTokenToAssets(
  character: Character
): Promise<AssetUploadResult> {
  try {
    // Verify portrait exists
    if (!character.portrait) {
      return {
        success: false,
        error: 'Character has no portrait to upload'
      };
    }

    // Process portrait into circular token
    const tokenBlob = await createCircularToken(character.portrait);
    const tokenFile = createTokenFile(tokenBlob, character.name);

    // Convert to array buffer and create new File (required for OBR security)
    const data = await tokenFile.arrayBuffer();
    const newFile = new File([data], tokenFile.name, { type: tokenFile.type });

    // Build image upload using OBR SDK
    const upload = buildImageUpload(newFile).build();

    // Upload to OBR assets
    // The uploadImages method opens a dialog for the GM to choose where to save
    // It returns void - success is indicated by not throwing an error
    await OBR.assets.uploadImages([upload]);

    return {
      success: true
    };
  } catch (error) {
    console.error('Failed to upload character token:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Check if the current user can upload assets (must be GM)
 */
export async function canUploadAssets(): Promise<boolean> {
  try {
    const role = await OBR.player.getRole();
    return role === 'GM';
  } catch (error) {
    console.error('Failed to check player role:', error);
    return false;
  }
}
