/**
 * Image utility functions for resizing and compressing character portraits
 */

export interface ImageProcessResult {
  dataUrl: string;
  sizeKB: number;
  width: number;
  height: number;
  wasResized: boolean;
  wasCompressed: boolean;
}

const MAX_DIMENSION = 400; // Max width/height in pixels
const TARGET_SIZE_KB = 100; // Target file size in KB
const WARNING_SIZE_KB = 150; // Warning threshold

/**
 * Process an image file: resize and compress
 */
export async function processImageFile(file: File): Promise<ImageProcessResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const result = resizeAndCompressImage(img, file.type);
        resolve(result);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Resize and compress an image element
 */
function resizeAndCompressImage(img: HTMLImageElement, mimeType: string): ImageProcessResult {
  let width = img.width;
  let height = img.height;
  let wasResized = false;

  // Calculate new dimensions if needed
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    wasResized = true;
    if (width > height) {
      height = Math.round((height * MAX_DIMENSION) / width);
      width = MAX_DIMENSION;
    } else {
      width = Math.round((width * MAX_DIMENSION) / height);
      height = MAX_DIMENSION;
    }
  }

  // Create canvas and draw resized image
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Use high-quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  // Determine output format (convert to JPEG for compression if not PNG/GIF)
  const outputMimeType = mimeType === 'image/png' || mimeType === 'image/gif'
    ? mimeType
    : 'image/jpeg';

  // Try different quality levels to hit target size
  let quality = 0.9;
  let dataUrl = canvas.toDataURL(outputMimeType, quality);
  let sizeKB = getBase64SizeKB(dataUrl);
  let wasCompressed = false;

  // Iteratively reduce quality if size is too large
  while (sizeKB > TARGET_SIZE_KB && quality > 0.5) {
    wasCompressed = true;
    quality -= 0.1;
    dataUrl = canvas.toDataURL(outputMimeType, quality);
    sizeKB = getBase64SizeKB(dataUrl);
  }

  // If still too large, try JPEG compression even for PNG
  if (sizeKB > TARGET_SIZE_KB && outputMimeType === 'image/png') {
    wasCompressed = true;
    quality = 0.85;
    dataUrl = canvas.toDataURL('image/jpeg', quality);
    sizeKB = getBase64SizeKB(dataUrl);

    while (sizeKB > TARGET_SIZE_KB && quality > 0.5) {
      quality -= 0.1;
      dataUrl = canvas.toDataURL('image/jpeg', quality);
      sizeKB = getBase64SizeKB(dataUrl);
    }
  }

  return {
    dataUrl,
    sizeKB,
    width,
    height,
    wasResized,
    wasCompressed: wasCompressed || quality < 0.9
  };
}

/**
 * Calculate size of base64 string in KB
 */
function getBase64SizeKB(base64String: string): number {
  // Remove data URL prefix if present
  const base64Data = base64String.split(',')[1] || base64String;

  // Calculate size: 4 base64 chars = 3 bytes
  const padding = (base64Data.match(/=/g) || []).length;
  const sizeBytes = (base64Data.length * 3) / 4 - padding;

  return sizeBytes / 1024;
}

/**
 * Validate image URL or data URI with security checks
 */
export function validateImageUrl(url: string): { valid: boolean; error?: string; sizeKB?: number } {
  if (!url || url.trim() === '') {
    return { valid: true }; // Empty is valid (optional field)
  }

  // Check if it's a data URI
  if (url.startsWith('data:')) {
    // Only allow image data URIs
    if (!url.startsWith('data:image/')) {
      return { valid: false, error: 'Only image data URIs are allowed' };
    }

    const sizeKB = getBase64SizeKB(url);

    if (sizeKB > 1000) {
      return {
        valid: false,
        error: `Image too large: ${Math.round(sizeKB)}KB (max 1MB)`,
        sizeKB
      };
    }

    return { valid: true, sizeKB };
  }

  // Check if it's a valid URL with safe protocol
  try {
    const urlObj = new URL(url);

    // Only allow http and https protocols
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return { valid: false, error: 'Only http:// and https:// URLs are allowed' };
    }

    // Check for common image file extensions
    const pathname = urlObj.pathname.toLowerCase();
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const hasImageExtension = imageExtensions.some(ext => pathname.endsWith(ext));

    if (!hasImageExtension) {
      return { valid: false, error: 'URL must point to an image file (.jpg, .png, .gif, .webp, etc.)' };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Check if size should trigger a warning
 */
export function shouldWarnAboutSize(sizeKB: number): boolean {
  return sizeKB > WARNING_SIZE_KB;
}

/**
 * Get a user-friendly description of the processing result
 */
export function getProcessingDescription(result: ImageProcessResult): string {
  const parts: string[] = [];

  if (result.wasResized) {
    parts.push(`resized to ${result.width}x${result.height}`);
  }

  if (result.wasCompressed) {
    parts.push('compressed');
  }

  if (parts.length === 0) {
    return `Image ready (${Math.round(result.sizeKB)}KB)`;
  }

  return `Image ${parts.join(' and ')} to ${Math.round(result.sizeKB)}KB`;
}
