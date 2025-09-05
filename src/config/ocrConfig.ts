import { OcrConfig, OcrProvider } from '../types/ocr';

/**
 * OCR Configuration Management
 * Handles hierarchical configuration loading and validation
 */

// Helper function to get configuration values with fallback hierarchy
const getConfigValue = (envKey: string, sessionKey: string, fallback: string): string => {
  // 1. Environment variables (highest priority)
  const envValue = import.meta.env[envKey];
  if (envValue && envValue !== 'YOUR_API_KEY_HERE') {
    return envValue;
  }
  
  // 2. Session storage (runtime changes) - only if available
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const sessionValue = sessionStorage.getItem(sessionKey);
      if (sessionValue && sessionValue !== 'YOUR_API_KEY_HERE') {
        return sessionValue;
      }
    } catch (error) {
      console.warn('Could not access sessionStorage:', error);
    }
  }
  
  // 3. Hardcoded fallback (lowest priority)
  return fallback;
};

/**
 * Get current OCR configuration
 */
export const getOcrConfig = (): OcrConfig & {
  providers: {
    tesseract: { enabled: boolean };
    googleVision: { apiKey: string; endpoint: string };
    ocrSpace: { apiKey: string; endpoint: string };
  };
} => ({
  provider: (getConfigValue('VITE_OCR_DEFAULT_PROVIDER', 'ocr_default_provider', 'tesseract') as OcrProvider),
  fallbackProviders: ['google-vision', 'ocr-space', 'tesseract'] as OcrProvider[],
  timeout: 30000,
  retryAttempts: 2,
  imagePreprocessing: {
    enabled: true,
    maxWidth: 2048,
    maxHeight: 2048,
    quality: 0.9,
  },
  providers: {
    tesseract: {
      enabled: true, // Always enabled (no API key required)
    },
    googleVision: {
      apiKey: getConfigValue('VITE_GOOGLE_VISION_API_KEY', 'temp_google_vision_api_key', 'YOUR_GOOGLE_VISION_API_KEY_HERE'),
      endpoint: 'https://vision.googleapis.com/v1/images:annotate',
    },
    ocrSpace: {
      apiKey: getConfigValue('VITE_OCR_SPACE_API_KEY', 'temp_ocr_space_api_key', 'YOUR_OCR_SPACE_API_KEY_HERE'),
      endpoint: 'https://api.ocr.space/parse/image',
    },
  },
});

/**
 * Set temporary OCR configuration in session storage
 */
export const setTempOcrConfig = (provider: OcrProvider, apiKey?: string): void => {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    console.warn('SessionStorage not available');
    return;
  }

  try {
    sessionStorage.setItem('ocr_default_provider', provider);
    
    if (apiKey) {
      switch (provider) {
        case 'google-vision':
          sessionStorage.setItem('temp_google_vision_api_key', apiKey);
          break;
        case 'ocr-space':
          sessionStorage.setItem('temp_ocr_space_api_key', apiKey);
          break;
      }
    }
  } catch (error) {
    console.warn('Could not save to sessionStorage:', error);
  }
};

/**
 * Get current OCR API keys for display (only session keys, not .env keys)
 */
export const getCurrentOcrKeys = () => {
  const keys: Record<string, string> = {};
  
  // Only get keys from session storage, not from .env
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      keys.googleVision = sessionStorage.getItem('temp_google_vision_api_key') || '';
      keys.ocrSpace = sessionStorage.getItem('temp_ocr_space_api_key') || '';
    } catch (error) {
      console.warn('Could not access sessionStorage:', error);
    }
  }
  
  return keys;
};

/**
 * Check if a key is configured via .env
 */
export const isKeyFromEnv = (keyName: string): boolean => {
  const envKey = import.meta.env[`VITE_${keyName}`];
  return !!(envKey && envKey !== 'YOUR_API_KEY_HERE');
};

/**
 * Validate OCR configuration
 */
export const validateOcrConfig = (): { 
  isValid: boolean; 
  availableProviders: OcrProvider[];
  missingKeys: string[];
} => {
  const config = getOcrConfig();
  const availableProviders: OcrProvider[] = ['tesseract']; // Always available
  const missingKeys: string[] = [];

  // Check Google Vision
  if (config.providers.googleVision.apiKey && config.providers.googleVision.apiKey !== 'YOUR_GOOGLE_VISION_API_KEY_HERE') {
    availableProviders.push('google-vision');
  } else {
    missingKeys.push('Google Vision API Key');
  }

  // Check OCR.space
  if (config.providers.ocrSpace.apiKey && config.providers.ocrSpace.apiKey !== 'YOUR_OCR_SPACE_API_KEY_HERE') {
    availableProviders.push('ocr-space');
  } else {
    missingKeys.push('OCR.space API Key');
  }

  return {
    isValid: availableProviders.length > 0,
    availableProviders,
    missingKeys,
  };
};

/**
 * Get provider display information
 */
export const getProviderInfo = (provider: OcrProvider) => {
  const providerInfo = {
    tesseract: {
      name: 'Tesseract.js',
      description: 'Local processing, no API key required',
      icon: '🔧',
      color: 'bg-blue-100 text-blue-800',
    },
    'google-vision': {
      name: 'Google Vision',
      description: 'High accuracy, fast processing',
      icon: '🔍',
      color: 'bg-green-100 text-green-800',
    },
    'ocr-space': {
      name: 'OCR.space',
      description: 'Cloud-based, reliable results',
      icon: '☁️',
      color: 'bg-purple-100 text-purple-800',
    },
  };

  return providerInfo[provider];
};