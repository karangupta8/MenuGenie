import { IOcrProvider, OcrResult, OcrProgress, OcrProviderCapabilities } from '../../../types/ocr';
import { preprocessImage } from '../imagePreprocessor';
import { getOcrConfig } from '../../../config/ocrConfig';

/**
 * Google Cloud Vision OCR Provider
 * Provides high-accuracy OCR using Google's Vision API
 */
export class GoogleVisionProvider implements IOcrProvider {
  name = 'google-vision' as const;

  capabilities: OcrProviderCapabilities = {
    name: 'Google Cloud Vision',
    requiresApiKey: true,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff'],
    maxFileSize: 20 * 1024 * 1024, // 20MB
    averageProcessingTime: 3000, // 3 seconds
    accuracy: 'high',
    offline: false,
  };

  /**
   * Check if provider is configured with valid API key
   */
  isConfigured(): boolean {
    const config = getOcrConfig();
    const apiKey = config.providers.googleVision.apiKey;
    return !!(apiKey && apiKey !== 'YOUR_GOOGLE_VISION_API_KEY_HERE');
  }

  /**
   * Validate configuration
   */
  validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = getOcrConfig();
    
    if (!config.providers.googleVision.apiKey || config.providers.googleVision.apiKey === 'YOUR_GOOGLE_VISION_API_KEY_HERE') {
      errors.push('Google Vision API key is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Process image using Google Cloud Vision API
   */
  async processImage(
    file: File, 
    onProgress?: (progress: OcrProgress) => void
  ): Promise<OcrResult> {
    const startTime = Date.now();
    const config = getOcrConfig();
    
    try {
      // Stage 1: Preprocessing
      onProgress?.({
        stage: 'preprocessing',
        progress: 10,
        message: 'Optimizing image for Google Vision...',
        provider: 'google-vision',
        estimatedTimeRemaining: 2500,
      });

      const preprocessedFile = await preprocessImage(file);

      // Stage 2: Convert to base64
      onProgress?.({
        stage: 'uploading',
        progress: 30,
        message: 'Preparing image for upload...',
        provider: 'google-vision',
        estimatedTimeRemaining: 2000,
      });

      const base64Image = await this.fileToBase64(preprocessedFile);

      // Stage 3: API Call
      onProgress?.({
        stage: 'processing',
        progress: 50,
        message: 'Processing with Google Vision AI...',
        provider: 'google-vision',
        estimatedTimeRemaining: 1500,
      });

      const response = await fetch(
        `${config.providers.googleVision.endpoint}?key=${config.providers.googleVision.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [{
              image: { content: base64Image },
              features: [{ type: 'TEXT_DETECTION' }],
            }],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Google Vision API error: ${errorData.error?.message || response.statusText}`);
      }

      // Stage 4: Process response
      onProgress?.({
        stage: 'postprocessing',
        progress: 90,
        message: 'Processing results...',
        provider: 'google-vision',
        estimatedTimeRemaining: 300,
      });

      const data = await response.json();
      const extractedText = data.responses[0]?.fullTextAnnotation?.text || '';
      const confidence = data.responses[0]?.fullTextAnnotation?.pages?.[0]?.confidence || 0;

      if (!extractedText) {
        throw new Error('No text detected in the image');
      }

      // Stage 5: Complete
      onProgress?.({
        stage: 'complete',
        progress: 100,
        message: 'Google Vision processing complete!',
        provider: 'google-vision',
        estimatedTimeRemaining: 0,
      });

      return {
        text: extractedText,
        confidence: confidence * 100,
        provider: 'google-vision',
        processingTime: Date.now() - startTime,
      };

    } catch (error) {
      throw new Error(`Google Vision OCR failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Convert File to base64 string
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  }
}