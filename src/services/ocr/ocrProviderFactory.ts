import { IOcrProvider, OcrProvider } from '../../types/ocr';
import { TesseractOcrProvider } from './providers/tesseractProvider';
import { GoogleVisionProvider } from './providers/googleVisionProvider';
import { OcrSpaceProvider } from './providers/ocrSpaceProvider';

/**
 * Factory class for creating OCR provider instances
 * Implements the Factory pattern for easy provider management
 */
export class OcrProviderFactory {
  private static providers: Map<OcrProvider, IOcrProvider> = new Map();

  /**
   * Get an OCR provider instance
   * @param provider The provider type to create
   * @returns IOcrProvider instance
   */
  static getProvider(provider: OcrProvider): IOcrProvider {
    if (!this.providers.has(provider)) {
      this.providers.set(provider, this.createProvider(provider));
    }
    return this.providers.get(provider)!;
  }

  /**
   * Create a new provider instance
   * @param provider The provider type to create
   * @returns IOcrProvider instance
   */
  private static createProvider(provider: OcrProvider): IOcrProvider {
    switch (provider) {
      case 'tesseract':
        return new TesseractOcrProvider();
      case 'google-vision':
        return new GoogleVisionProvider();
      case 'ocr-space':
        return new OcrSpaceProvider();
      default:
        throw new Error(`Unsupported OCR provider: ${provider}`);
    }
  }

  /**
   * Get all available providers
   * @returns Array of all provider instances
   */
  static getAllProviders(): IOcrProvider[] {
    const providerTypes: OcrProvider[] = ['tesseract', 'google-vision', 'ocr-space'];
    return providerTypes.map(type => this.getProvider(type));
  }

  /**
   * Get configured providers only
   * @returns Array of properly configured provider instances
   */
  static getConfiguredProviders(): IOcrProvider[] {
    return this.getAllProviders().filter(provider => provider.isConfigured());
  }

  /**
   * Get the best available provider based on configuration and capabilities
   * @returns The recommended provider instance
   */
  static getBestProvider(): IOcrProvider {
    const configuredProviders = this.getConfiguredProviders();
    
    // Prefer providers in order: Google Vision > OCR.space > Tesseract
    const preferenceOrder: OcrProvider[] = ['google-vision', 'ocr-space', 'tesseract'];
    
    for (const providerType of preferenceOrder) {
      const provider = configuredProviders.find(p => p.name === providerType);
      if (provider) {
        return provider;
      }
    }
    
    // Fallback to Tesseract (always available)
    return this.getProvider('tesseract');
  }
}