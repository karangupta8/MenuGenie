import { createWorker, Worker } from 'tesseract.js';
import { IOcrProvider, OcrResult, OcrProgress, OcrProviderCapabilities } from '../../../types/ocr';
import { preprocessImage } from '../imagePreprocessor';

/**
 * Tesseract.js OCR Provider
 * Provides local, offline OCR processing using WebAssembly
 */
export class TesseractOcrProvider implements IOcrProvider {
  name = 'tesseract' as const;
  private worker: Worker | null = null;

  capabilities: OcrProviderCapabilities = {
    name: 'Tesseract.js',
    requiresApiKey: false,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    averageProcessingTime: 8000, // 8 seconds
    accuracy: 'medium',
    offline: true,
  };

  /**
   * Check if provider is configured (always true for Tesseract)
   */
  isConfigured(): boolean {
    return true; // Tesseract doesn't require API keys
  }

  /**
   * Validate configuration (always valid for Tesseract)
   */
  validateConfiguration(): { isValid: boolean; errors: string[] } {
    return { isValid: true, errors: [] };
  }

  /**
   * Process image using Tesseract.js
   */
  async processImage(
    file: File, 
    onProgress?: (progress: OcrProgress) => void
  ): Promise<OcrResult> {
    const startTime = Date.now();
    
    try {
      // Stage 1: Preprocessing
      onProgress?.({
        stage: 'preprocessing',
        progress: 10,
        message: 'Optimizing image for OCR...',
        provider: 'tesseract',
        estimatedTimeRemaining: 7000,
      });

      const preprocessedFile = await preprocessImage(file);

      // Stage 2: Initialize worker
      onProgress?.({
        stage: 'processing',
        progress: 20,
        message: 'Initializing Tesseract engine...',
        provider: 'tesseract',
        estimatedTimeRemaining: 6000,
      });

      this.worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const progress = Math.round(20 + (m.progress * 60)); // 20-80%
            onProgress?.({
              stage: 'processing',
              progress,
              message: `Processing text recognition... ${Math.round(m.progress * 100)}%`,
              provider: 'tesseract',
              estimatedTimeRemaining: Math.max(0, 8000 - (Date.now() - startTime)),
            });
          }
        },
      });

      // Stage 3: OCR Processing
      onProgress?.({
        stage: 'processing',
        progress: 25,
        message: 'Recognizing text in image...',
        provider: 'tesseract',
        estimatedTimeRemaining: 5000,
      });

      const { data } = await this.worker.recognize(preprocessedFile);

      // Stage 4: Post-processing
      onProgress?.({
        stage: 'postprocessing',
        progress: 90,
        message: 'Finalizing results...',
        provider: 'tesseract',
        estimatedTimeRemaining: 500,
      });

      // Clean up worker
      await this.worker.terminate();
      this.worker = null;

      // Stage 5: Complete
      onProgress?.({
        stage: 'complete',
        progress: 100,
        message: 'OCR processing complete!',
        provider: 'tesseract',
        estimatedTimeRemaining: 0,
      });

      return {
        text: data.text.trim(),
        confidence: data.confidence,
        provider: 'tesseract',
        processingTime: Date.now() - startTime,
        boundingBoxes: data.words?.map(word => ({
          text: word.text,
          x: word.bbox.x0,
          y: word.bbox.y0,
          width: word.bbox.x1 - word.bbox.x0,
          height: word.bbox.y1 - word.bbox.y0,
          confidence: word.confidence,
        })),
      };

    } catch (error) {
      // Clean up worker on error
      if (this.worker) {
        await this.worker.terminate();
        this.worker = null;
      }

      throw new Error(`Tesseract OCR failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Cancel ongoing OCR operation
   */
  async cancel(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}