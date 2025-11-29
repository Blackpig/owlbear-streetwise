/**
 * Token Image Processing Utilities
 * Converts character portraits into circular tokens for Owlbear Rodeo
 */

const TOKEN_SIZE = 300; // Standard Owlbear token size (300x300)

/**
 * Process a portrait image into a circular token
 * Matches Owlbear Rodeo character token format:
 * - 300x300 PNG
 * - Circular mask
 * - Transparent background
 *
 * @param imageUrl URL or data URI of the portrait
 * @returns Promise resolving to a Blob of the processed token image
 */
export async function createCircularToken(imageUrl: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = TOKEN_SIZE;
        canvas.height = TOKEN_SIZE;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Clear canvas with transparency
        ctx.clearRect(0, 0, TOKEN_SIZE, TOKEN_SIZE);

        // Create circular clipping path
        ctx.beginPath();
        ctx.arc(TOKEN_SIZE / 2, TOKEN_SIZE / 2, TOKEN_SIZE / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Calculate dimensions to crop to square and center
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;

        // Draw image (will be clipped to circle)
        ctx.drawImage(
          img,
          x, y, size, size,           // Source crop
          0, 0, TOKEN_SIZE, TOKEN_SIZE // Destination
        );

        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        }, 'image/png');
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
}

/**
 * Create a File object from a Blob for upload
 * @param blob Image blob
 * @param characterName Character name for filename
 * @returns File object ready for upload
 */
export function createTokenFile(blob: Blob, characterName: string): File {
  const sanitizedName = characterName.replace(/[^a-zA-Z0-9-_]/g, '_');
  const filename = `${sanitizedName}_token.png`;
  return new File([blob], filename, { type: 'image/png' });
}
