// Portrait Upload Service - Upload portraits to Streetwise API
const API_URL = import.meta.env.VITE_PORTRAIT_API_URL;
const API_KEY = import.meta.env.VITE_PORTRAIT_API_KEY;

if (!API_URL || !API_KEY) {
  console.error('Portrait upload API configuration missing. Please check .env file.');
}

export interface PortraitUploadResult {
  success: boolean;
  url: string;
  characterId: string;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
}

/**
 * Upload a portrait to the Streetwise API
 * @param imageDataUri Base64 data URI of the image
 * @param characterId Unique character identifier
 * @param characterName Optional character name
 * @returns Promise with the uploaded portrait URL
 */
export async function uploadPortrait(
  imageDataUri: string,
  characterId: string,
  characterName?: string
): Promise<string> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({
        image: imageDataUri,
        characterId: characterId,
        characterName: characterName
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result: PortraitUploadResult = await response.json();

    if (!result.success || !result.url) {
      throw new Error('Upload succeeded but no URL returned');
    }

    return result.url;
  } catch (error) {
    console.error('Portrait upload failed:', error);
    throw error;
  }
}

/**
 * Check if a data URI is valid
 */
export function isValidDataUri(dataUri: string): boolean {
  return /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(dataUri);
}

/**
 * Check if a string is a valid HTTP(S) URL
 */
export function isValidUrl(url: string): boolean {
  return /^https?:\/\/.+/.test(url);
}
