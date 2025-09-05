import { LlmConfig, LlmProvider, OpenAIConfig, GoogleConfig, GroqConfig, AnthropicConfig } from '../types/llm';

/**
 * LLM Configuration Management
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
 * Get current LLM configuration
 */
export const getLlmConfig = (): LlmConfig & {
  providers: {
    openai: OpenAIConfig;
    google: GoogleConfig;
    groq: GroqConfig;
    anthropic: AnthropicConfig;
  };
} => ({
  provider: (getConfigValue('VITE_LLM_DEFAULT_PROVIDER', 'llm_default_provider', 'openai') as LlmProvider),
  fallbackProviders: ['openai', 'google', 'groq', 'anthropic'] as LlmProvider[],
  timeout: 30000,
  retryAttempts: 2,
  maxTokens: 8000,
  temperature: 0.1,
  providers: {
    openai: {
      apiKey: getConfigValue('VITE_OPENAI_API_KEY', 'temp_openai_api_key', 'YOUR_OPENAI_API_KEY_HERE'),
      endpoint: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-4o',
      maxTokens: 8000,
      temperature: 0.1,
    },
    google: {
      apiKey: getConfigValue('VITE_GOOGLE_LLM_API_KEY', 'temp_google_llm_api_key', 'YOUR_GOOGLE_LLM_API_KEY_HERE'),
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
      model: 'gemini-1.5-pro',
      maxTokens: 8000,
      temperature: 0.1,
    },
    groq: {
      apiKey: getConfigValue('VITE_GROQ_API_KEY', 'temp_groq_api_key', 'YOUR_GROQ_API_KEY_HERE'),
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      model: 'llama-3.1-70b-versatile',
      maxTokens: 8000,
      temperature: 0.1,
    },
    anthropic: {
      apiKey: getConfigValue('VITE_ANTHROPIC_API_KEY', 'temp_anthropic_api_key', 'YOUR_ANTHROPIC_API_KEY_HERE'),
      endpoint: 'https://api.anthropic.com/v1/messages',
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 8000,
      temperature: 0.1,
    },
  },
});

/**
 * Set temporary LLM configuration in session storage
 */
export const setTempLlmConfig = (provider: LlmProvider, apiKey?: string): void => {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    console.warn('SessionStorage not available');
    return;
  }

  try {
    sessionStorage.setItem('llm_default_provider', provider);
    
    if (apiKey) {
      switch (provider) {
        case 'openai':
          sessionStorage.setItem('temp_openai_api_key', apiKey);
          break;
        case 'google':
          sessionStorage.setItem('temp_google_llm_api_key', apiKey);
          break;
        case 'groq':
          sessionStorage.setItem('temp_groq_api_key', apiKey);
          break;
        case 'anthropic':
          sessionStorage.setItem('temp_anthropic_api_key', apiKey);
          break;
      }
    }
  } catch (error) {
    console.warn('Could not save to sessionStorage:', error);
  }
};

/**
 * Get current LLM API keys for display (only session keys, not .env keys)
 */
export const getCurrentLlmKeys = () => {
  const keys: Record<string, string> = {};
  
  // Only get keys from session storage, not from .env
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      keys.openai = sessionStorage.getItem('temp_openai_api_key') || '';
      keys.google = sessionStorage.getItem('temp_google_llm_api_key') || '';
      keys.groq = sessionStorage.getItem('temp_groq_api_key') || '';
      keys.anthropic = sessionStorage.getItem('temp_anthropic_api_key') || '';
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
  // Check for various placeholder patterns
  const placeholderPatterns = [
    'YOUR_API_KEY_HERE',
    'YOUR_OPENAI_API_KEY_HERE',
    'YOUR_GOOGLE_LLM_API_KEY_HERE',
    'YOUR_GROQ_API_KEY_HERE',
    'YOUR_ANTHROPIC_API_KEY_HERE',
    'YOUR_GOOGLE_VISION_API_KEY_HERE',
    'YOUR_OCR_SPACE_API_KEY_HERE',
    'YOUR_PEXELS_API_KEY_HERE'
  ];
  
  return !!(envKey && !placeholderPatterns.includes(envKey));
};

/**
 * Validate LLM configuration
 */
export const validateLlmConfig = (): { 
  isValid: boolean; 
  availableProviders: LlmProvider[];
  missingKeys: string[];
} => {
  const config = getLlmConfig();
  const availableProviders: LlmProvider[] = [];
  const missingKeys: string[] = [];

  // Check OpenAI
  if (config.providers.openai.apiKey && config.providers.openai.apiKey !== 'YOUR_OPENAI_API_KEY_HERE') {
    availableProviders.push('openai');
  } else {
    missingKeys.push('OpenAI API Key');
  }

  // Check Google
  if (config.providers.google.apiKey && config.providers.google.apiKey !== 'YOUR_GOOGLE_LLM_API_KEY_HERE') {
    availableProviders.push('google');
  } else {
    missingKeys.push('Google LLM API Key');
  }

  // Check Groq
  if (config.providers.groq.apiKey && config.providers.groq.apiKey !== 'YOUR_GROQ_API_KEY_HERE') {
    availableProviders.push('groq');
  } else {
    missingKeys.push('Groq API Key');
  }

  // Check Anthropic
  if (config.providers.anthropic.apiKey && config.providers.anthropic.apiKey !== 'YOUR_ANTHROPIC_API_KEY_HERE') {
    availableProviders.push('anthropic');
  } else {
    missingKeys.push('Anthropic API Key');
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
export const getLlmProviderInfo = (provider: LlmProvider) => {
  const providerInfo = {
    openai: {
      name: 'OpenAI GPT',
      description: 'High-quality responses, reliable performance',
      icon: '',
      color: 'bg-green-100 text-green-800',
      models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    },
    google: {
      name: 'Google Gemini',
      description: 'Advanced reasoning, multimodal capabilities',
      icon: '',
      color: 'bg-blue-100 text-blue-800',
      models: ['gemini-1.5-pro', 'gemini-1.5-flash'],
    },
    groq: {
      name: 'Groq (Llama)',
      description: 'Ultra-fast inference, cost-effective',
      icon: '⚡',
      color: 'bg-purple-100 text-purple-800',
      models: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant'],
    },
    anthropic: {
      name: 'Anthropic Claude',
      description: 'Excellent reasoning, safety-focused',
      icon: '',
      color: 'bg-orange-100 text-orange-800',
      models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
    },
  };

  return providerInfo[provider];
};
