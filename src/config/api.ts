// API Configuration
// API keys will be loaded from environment variables or session storage

// Helper function to get API keys from various sources
const getApiKey = (keyName: string, fallbackKey?: string): string => {
  // First try environment variables (for production)
  const envKey = import.meta.env[`VITE_${keyName}`];
  if (envKey && envKey !== 'YOUR_API_KEY_HERE') {
    return envKey;
  }
  
  // Then try session storage (for temporary testing)
  const sessionKey = sessionStorage.getItem(`temp_${keyName.toLowerCase()}`);
  if (sessionKey && sessionKey !== 'YOUR_API_KEY_HERE') {
    return sessionKey;
  }
  
  // Finally use fallback
  return fallbackKey || 'YOUR_API_KEY_HERE';
};

export const API_CONFIG = {
  // Google Cloud Vision API
  googleVision: {
    apiKey: getApiKey('GOOGLE_VISION_API_KEY', ''),
    endpoint: 'https://vision.googleapis.com/v1/images:annotate',
  },
  
  // LLM Provider (OpenAI GPT-4 by default, but configurable)
  llm: {
    provider: 'openai', // 'openai', 'anthropic', 'google', 'azure'
    apiKey: getApiKey('OPENAI_API_KEY', ''),
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o', // gpt-4o, gpt-4-turbo, claude-3-sonnet, gemini-pro
    maxTokens: 8000,
    temperature: 0.1, // Low temperature for consistent structured output
  },
  
  // Pexels API
  pexels: {
    apiKey: getApiKey('PEXELS_API_KEY', ''),
    endpoint: 'https://api.pexels.com/v1/search',
  },
  
  // Configuration options
  options: {
    maxRetries: 3,
    timeoutMs: 30000,
    fallbackToMockData: false, // Set to false in production
  },
} as const;

// Function to set temporary API keys in session storage
export const setTempApiKey = (keyName: string, value: string): void => {
  sessionStorage.setItem(`temp_${keyName.toLowerCase()}`, value);
};

// Function to get current API key values
export const getCurrentApiKeys = () => ({
  googleVision: API_CONFIG.googleVision.apiKey,
  openai: API_CONFIG.llm.apiKey,
  pexels: API_CONFIG.pexels.apiKey,
});

// LLM Prompts for structured menu processing
export const LLM_PROMPTS = {
  menuProcessing: (menuText: string, targetLanguage: string) => `
You are an expert menu analyst and translator. Analyze the following menu text and return a structured JSON response.

MENU TEXT:
${menuText}

TARGET LANGUAGE: ${targetLanguage}

INSTRUCTIONS:
1. Parse the menu into sections and individual items
2. Translate all content to ${targetLanguage} while preserving original text
3. Analyze ingredients, proteins, allergens, and dietary information
4. Provide simplified descriptions and ingredient explanations
5. Estimate nutritional information where possible
6. Assign confidence scores (0-100) based on text clarity
7. Identify meat types and cooking methods for each dish

RETURN ONLY VALID JSON in this exact structure:
{
  "originalLanguage": "detected_language_code",
  "sections": [
    {
      "name": "section_name",
      "items": [
        {
          "name": "translated_dish_name",
          "originalName": "original_dish_name",
          "description": "translated_description",
          "originalDescription": "original_description",
          "simplifiedDescription": "easy_to_understand_explanation",
          "ingredientTranslations": [
            {
              "original": "original_ingredient",
              "translation": "translated_ingredient",
              "explanation": "what_this_ingredient_is"
            }
          ],
          "section": "section_name",
          "price": "price_number_only",
          "currency": "$",
          "confidence": 95,
          "proteins": ["protein1", "protein2"],
          "meatProteins": ["meat1", "meat2"],
          "meatTypes": ["beef", "poultry"],
          "cookingMethods": ["grilled", "sautéed"],
          "allergens": ["allergen1", "allergen2"],
          "herbsSpices": ["herb1", "spice1"],
          "dietaryInfo": {
            "vegetarian": true/false,
            "vegan": true/false,
            "halal": true/false,
            "kosher": true/false,
            "pescatarian": true/false,
            "glutenFree": true/false,
            "dairyFree": true/false,
            "nutFree": true/false
          },
          "nutritionEstimate": {
            "calories": 350,
            "protein": 25,
            "carbs": 30,
            "fat": 15
          }
        }
      ]
    }
  ]
}

IMPORTANT:
- Return ONLY the JSON, no additional text
- Ensure all strings are properly escaped
- Use null for missing prices
- Be conservative with dietary classifications
- Provide realistic nutritional estimates
- Include confidence scores based on text clarity
`,
} as const;

// API Key validation
export const validateApiKeys = (): { isValid: boolean; missingKeys: string[] } => {
  const missingKeys: string[] = [];
  
  if (!API_CONFIG.googleVision.apiKey || API_CONFIG.googleVision.apiKey === 'YOUR_API_KEY_HERE') {
    missingKeys.push('Google Vision API Key');
  }
  
  if (!API_CONFIG.llm.apiKey || API_CONFIG.llm.apiKey === 'YOUR_API_KEY_HERE') {
    missingKeys.push('LLM API Key');
  }
  
  if (!API_CONFIG.pexels.apiKey || API_CONFIG.pexels.apiKey === 'YOUR_API_KEY_HERE') {
    missingKeys.push('Pexels API Key');
  }
  
  return {
    isValid: missingKeys.length === 0,
    missingKeys
  };
};

// Language codes supported by Google Translate
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
] as const;

// Supported currencies for conversion
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
] as const;

// Simple currency conversion rates (in a real app, you'd fetch these from an API)
export const CURRENCY_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.85,
  GBP: 0.73,
  JPY: 110.0,
  CAD: 1.25,
  AUD: 1.35,
  CHF: 0.92,
  CNY: 6.45,
  INR: 74.5,
  KRW: 1180.0,
  MXN: 20.0,
  BRL: 5.2,
};

// Convert price from one currency to another
export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / CURRENCY_RATES[fromCurrency];
  return usdAmount * CURRENCY_RATES[toCurrency];
};

// Get currency symbol by code
export const getCurrencySymbol = (currencyCode: string): string => {
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
  return currency?.symbol || '$';
};