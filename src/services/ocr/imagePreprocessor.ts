/**
 * Image preprocessing utilities for better OCR accuracy
 * Handles compression, format conversion, and optimization
 */

export interface PreprocessingOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: 'jpeg' | 'png' | 'webp';
}

const DEFAULT_OPTIONS: PreprocessingOptions = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 0.9,
  format: 'jpeg',
};

/**
 * Preprocess image for optimal OCR results
 * @param file Original image file
 * @param options Preprocessing options
 * @returns Optimized image file
 */
export async function preprocessImage(
  file: File, 
  options: Partial<PreprocessingOptions> = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        const { width: newWidth, height: newHeight } = calculateOptimalDimensions(
          img.width, 
          img.height, 
          opts.maxWidth, 
          opts.maxHeight
        );

        // Set canvas dimensions
        canvas.width = newWidth;
        canvas.height = newHeight;

        // Apply image enhancements for better OCR
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw and enhance image
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Convert to optimized format
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name, {
                type: `image/${opts.format}`,
                lastModified: Date.now(),
              });
              resolve(optimizedFile);
            } else {
              reject(new Error('Failed to create optimized image'));
            }
          },
          `image/${opts.format}`,
          opts.quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for preprocessing'));
    };

    // Load the image
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Calculate optimal dimensions for OCR processing
 */
function calculateOptimalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  // If image is already within limits, return original dimensions
  if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
    return { width: originalWidth, height: originalHeight };
  }

  // Calculate scaling factor
  const widthRatio = maxWidth / originalWidth;
  const heightRatio = maxHeight / originalHeight;
  const scaleFactor = Math.min(widthRatio, heightRatio);

  return {
    width: Math.round(originalWidth * scaleFactor),
    height: Math.round(originalHeight * scaleFactor),
  };
}

/**
 * Estimate file size after preprocessing
 */
export function estimateProcessedFileSize(
  originalSize: number,
  originalWidth: number,
  originalHeight: number,
  options: Partial<PreprocessingOptions> = {}
): number {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { width, height } = calculateOptimalDimensions(
    originalWidth,
    originalHeight,
    opts.maxWidth,
    opts.maxHeight
  );

  // Rough estimation based on pixel count and quality
  const pixelReduction = (width * height) / (originalWidth * originalHeight);
  const qualityFactor = opts.quality;
  
  return Math.round(originalSize * pixelReduction * qualityFactor);
}