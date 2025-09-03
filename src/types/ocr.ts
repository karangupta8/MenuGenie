// OCR-specific type definitions
export type OcrProvider = 'tesseract' | 'google-vision' | 'ocr-space';

export interface OcrConfig {
  provider: OcrProvider;
  fallbackProviders: OcrProvider[];
  timeout: number;
  retryAttempts: number;
  imagePreprocessing: {
    enabled: boolean;
    maxWidth: number;
    maxHeight: number;
    quality: number;
  };
}

export interface OcrResult {
  text: string;
  confidence: number;
  provider: OcrProvider;
  processingTime: number;
  boundingBoxes?: BoundingBox[];
}

export interface BoundingBox {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export interface OcrProgress {
  stage: 'preprocessing' | 'uploading' | 'processing' | 'postprocessing' | 'complete' | 'error';
  progress: number;
  message: string;
  provider: OcrProvider;
  estimatedTimeRemaining?: number;
}

export interface OcrError {
  code: string;
  message: string;
  provider: OcrProvider;
  retryable: boolean;
  suggestedAction?: string;
}

export interface OcrProviderCapabilities {
  name: string;
  requiresApiKey: boolean;
  supportedFormats: string[];
  maxFileSize: number;
  averageProcessingTime: number;
  accuracy: 'high' | 'medium' | 'low';
  offline: boolean;
}

// Abstract interface for OCR providers
export interface IOcrProvider {
  name: string;
  capabilities: OcrProviderCapabilities;
  isConfigured(): boolean;
  processImage(file: File, onProgress?: (progress: OcrProgress) => void): Promise<OcrResult>;
  validateConfiguration(): { isValid: boolean; errors: string[] };
}