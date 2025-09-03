import { IOcrProvider, OcrResult, OcrProgress, OcrProvider, OcrError } from '../../types/ocr';
import { OcrProviderFactory } from './ocrProviderFactory';
import { getOcrConfig, validateOcrConfig } from '../../config/ocrConfig';

/**
 * Main OCR Service
 * Orchestrates OCR processing with multiple providers and fallback logic
 */
export class OcrService {
  private static instance: OcrService;
  private currentOperation: AbortController | null = null;

  static getInstance(): OcrService {
    if (!OcrService.instance) {
      OcrService.instance = new OcrService();
    }
    return OcrService.instance;
  }

  /**
   * Process image with automatic provider selection and fallback
   */
  async processImage(
    file: File,
    onProgress?: (progress: OcrProgress) => void,
    preferredProvider?: OcrProvider
  ): Promise<OcrResult> {
    const config = getOcrConfig();
    const validation = validateOcrConfig();
    
    if (!validation.isValid && validation.availableProviders.length === 0) {
      throw new Error('No OCR providers are configured');
    }

    // Create abort controller for cancellation
    this.currentOperation = new AbortController();

    // Determine provider order
    const providers = this.getProviderOrder(preferredProvider, validation.availableProviders);
    
    let lastError: Error | null = null;

    // Try each provider in order
    for (let i = 0; i < providers.length; i++) {
      const providerType = providers[i];
      
      try {
        onProgress?.({
          stage: 'preprocessing',
          progress: 5,
          message: `Attempting OCR with ${this.getProviderDisplayName(providerType)}...`,
          provider: providerType,
          estimatedTimeRemaining: this.getEstimatedTime(providerType),
        });

        const provider = OcrProviderFactory.getProvider(providerType);
        
        // Check if operation was cancelled
        if (this.currentOperation?.signal.aborted) {
          throw new Error('Operation cancelled by user');
        }

        const result = await this.processWithTimeout(
          provider,
          file,
          onProgress,
          config.timeout
        );

        // Success - clear abort controller
        this.currentOperation = null;
        return result;

      } catch (error) {
        lastError = error as Error;
        console.warn(`OCR provider ${providerType} failed:`, error);

        // If this is the last provider, throw the error
        if (i === providers.length - 1) {
          break;
        }

        // Try next provider
        onProgress?.({
          stage: 'preprocessing',
          progress: 5,
          message: `${this.getProviderDisplayName(providerType)} failed, trying next provider...`,
          provider: providers[i + 1],
          estimatedTimeRemaining: this.getEstimatedTime(providers[i + 1]),
        });
      }
    }

    // All providers failed
    this.currentOperation = null;
    throw new Error(`All OCR providers failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Cancel current OCR operation
   */
  async cancelOperation(): Promise<void> {
    if (this.currentOperation) {
      this.currentOperation.abort();
      this.currentOperation = null;
    }
  }

  /**
   * Get available OCR providers
   */
  getAvailableProviders(): { provider: OcrProvider; configured: boolean; capabilities: any }[] {
    const allProviders = OcrProviderFactory.getAllProviders();
    return allProviders.map(provider => ({
      provider: provider.name as OcrProvider,
      configured: provider.isConfigured(),
      capabilities: provider.capabilities,
    }));
  }

  /**
   * Process with timeout wrapper
   */
  private async processWithTimeout(
    provider: IOcrProvider,
    file: File,
    onProgress?: (progress: OcrProgress) => void,
    timeout: number = 30000
  ): Promise<OcrResult> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`OCR processing timed out after ${timeout / 1000} seconds`));
      }, timeout);

      provider.processImage(file, onProgress)
        .then(result => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Determine provider order based on preference and availability
   */
  private getProviderOrder(
    preferredProvider?: OcrProvider,
    availableProviders: OcrProvider[] = []
  ): OcrProvider[] {
    const config = getOcrConfig();
    
    // Start with preferred provider if specified and available
    const providers: OcrProvider[] = [];
    
    if (preferredProvider && availableProviders.includes(preferredProvider)) {
      providers.push(preferredProvider);
    }
    
    // Add configured default provider
    if (availableProviders.includes(config.provider) && !providers.includes(config.provider)) {
      providers.push(config.provider);
    }
    
    // Add remaining fallback providers
    for (const fallbackProvider of config.fallbackProviders) {
      if (availableProviders.includes(fallbackProvider) && !providers.includes(fallbackProvider)) {
        providers.push(fallbackProvider);
      }
    }
    
    // Ensure Tesseract is always available as final fallback
    if (!providers.includes('tesseract')) {
      providers.push('tesseract');
    }
    
    return providers;
  }

  /**
   * Get provider display name
   */
  private getProviderDisplayName(provider: OcrProvider): string {
    const names = {
      'tesseract': 'Tesseract.js',
      'google-vision': 'Google Vision',
      'ocr-space': 'OCR.space',
    };
    return names[provider];
  }

  /**
   * Get estimated processing time for provider
   */
  private getEstimatedTime(provider: OcrProvider): number {
    const times = {
      'tesseract': 8000,
      'google-vision': 3000,
      'ocr-space': 4000,
    };
    return times[provider];
  }
}