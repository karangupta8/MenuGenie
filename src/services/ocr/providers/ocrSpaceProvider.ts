import { IOcrProvider, OcrResult, OcrProgress, OcrProviderCapabilities } from '../../../types/ocr';
import { preprocessImage } from '../imagePreprocessor';
import { getOcrConfig } from '../../../config/ocrConfig';

/**
 * OCR.space API Provider
 * Provides cloud-based OCR with good accuracy and speed
 */
export class OcrSpaceProvider implements IOcrProvider {
  name = 'ocr-space' as const;

  capabilities: OcrProviderCapabilities = {
    name: 'OCR.space',
    requiresApiKey: true,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    averageProcessingTime: 4000, // 4 seconds
    accuracy: 'high',
    offline: false,
  };

  /**
   * Check if provider is configured with valid API key
   */
  isConfigured(): boolean {
    const config = getOcrConfig();
    const apiKey = config.providers.ocrSpace.apiKey;
    return !!(apiKey && apiKey !== 'YOUR_OCR_SPACE_API_KEY_HERE');
  }

  /**
   * Validate configuration
   */
  validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = getOcrConfig();
    
    if (!config.providers.ocrSpace.apiKey || config.providers.ocrSpace.apiKey === 'YOUR_OCR_SPACE_API_KEY_HERE') {
      errors.push('OCR.space API key is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Process image using OCR.space API
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
        message: 'Optimizing image for OCR.space...',
        provider: 'ocr-space',
        estimatedTimeRemaining: 3500,
      });

      const preprocessedFile = await preprocessImage(file);

      // Stage 2: Prepare form data
      onProgress?.({
        stage: 'uploading',
        progress: 30,
        message: 'Uploading to OCR.space...',
        provider: 'ocr-space',
        estimatedTimeRemaining: 3000,
      });

      const formData = new FormData();
      formData.append('file', preprocessedFile);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'true');
      formData.append('detectOrientation', 'true');
      formData.append('scale', 'true');

      // Stage 3: API Call
      onProgress?.({
        stage: 'processing',
        progress: 50,
        message: 'Processing with OCR.space...',
        provider: 'ocr-space',
        estimatedTimeRemaining: 2000,
      });

      const response = await fetch(config.providers.ocrSpace.endpoint, {
        method: 'POST',
        headers: {
          'apikey': config.providers.ocrSpace.apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`OCR.space API error: ${response.statusText}`);
      }

      // Stage 4: Process response
      onProgress?.({
        stage: 'postprocessing',
        progress: 90,
        message: 'Processing results...',
        provider: 'ocr-space',
        estimatedTimeRemaining: 400,
      });

      const data = await response.json();

      if (data.IsErroredOnProcessing) {
        throw new Error(`OCR.space processing error: ${data.ErrorMessage || 'Unknown error'}`);
      }

      const extractedText = data.ParsedResults?.[0]?.ParsedText || '';
      
      if (!extractedText) {
        throw new Error('No text detected in the image');
      }

      // Stage 5: Complete
      onProgress?.({
        stage: 'complete',
        progress: 100,
        message: 'OCR.space processing complete!',
        provider: 'ocr-space',
        estimatedTimeRemaining: 0,
      });

      return {
        text: extractedText,
        confidence: 85, // OCR.space doesn't provide confidence scores, use default
        provider: 'ocr-space',
        processingTime: Date.now() - startTime,
      };

    } catch (error) {
      throw new Error(`OCR.space failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}