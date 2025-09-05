import { ProcessedMenu, MenuItem, MenuSection } from '../types/menu';
import { LlmProvider, LlmProgress } from '../types/llm';
import { LlmProviderFactory } from './llm/llmProviderFactory';
import { getLlmConfig, validateLlmConfig } from '../config/llmConfig';
import { LLM_PROMPTS } from '../config/api';

interface LLMResponse {
  originalLanguage: string;
  sections: Array<{
    name: string;
    items: Array<{
      name: string;
      originalName: string;
      description: string;
      originalDescription: string;
      simplifiedDescription: string;
      ingredientTranslations: Array<{
        original: string;
        translation: string;
        explanation: string;
      }>;
      section: string;
      price: string | null;
      currency: string;
      confidence: number;
      proteins: string[];
      meatProteins: string[];
      meatTypes: string[];
      cookingMethods: string[];
      allergens: string[];
      herbsSpices: string[];
      dietaryInfo: {
        vegetarian: boolean;
        vegan: boolean;
        halal: boolean;
        kosher: boolean;
        pescatarian: boolean;
        glutenFree: boolean;
        dairyFree: boolean;
        nutFree: boolean;
      };
      nutritionEstimate?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      };
    }>;
  }>;
}

export class LlmService {
  private static instance: LlmService;
  
  static getInstance(): LlmService {
    if (!LlmService.instance) {
      LlmService.instance = new LlmService();
    }
    return LlmService.instance;
  }

  async processMenuData(
    menuText: string, 
    targetLanguage: string = 'en',
    onProgress?: (progress: LlmProgress) => void,
    preferredProvider?: LlmProvider
  ): Promise<ProcessedMenu> {
    const startTime = Date.now();
    
    try {
      const prompt = LLM_PROMPTS.menuProcessing(menuText, targetLanguage);
      
      const response = await this.callLLM(prompt, onProgress, preferredProvider);
      const parsedData = this.parseResponse(response);
      
      // Convert LLM response to our internal format
      const sections: MenuSection[] = parsedData.sections.map(section => ({
        id: section.name.toLowerCase().replace(/\s+/g, '-'),
        name: section.name,
        items: section.items.map(item => ({
          ...item,
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          price: item.price || '0',
          imageUrl: '', // Will be populated later by image search
        }))
      }));

      const totalItems = sections.reduce((sum, section) => sum + section.items.length, 0);

      return {
        id: `menu_${Date.now()}`,
        originalLanguage: parsedData.originalLanguage,
        targetLanguage: targetLanguage,
        sections: sections,
        processingTime: Date.now() - startTime,
        totalItems: totalItems,
      };

    } catch (error) {
      console.error('LLM processing error:', error);
      throw new Error(`Failed to process menu with LLM: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async callLLM(
    prompt: string, 
    onProgress?: (progress: LlmProgress) => void,
    preferredProvider?: LlmProvider
  ): Promise<string> {
    const validation = validateLlmConfig();
    
    if (!validation.isValid) {
      throw new Error('No LLM providers are configured');
    }

    // Determine provider order
    const providers = this.getProviderOrder(preferredProvider, validation.availableProviders);
    
    let lastError: Error | null = null;

    // Try each provider in order
    for (let i = 0; i < providers.length; i++) {
      const providerType = providers[i];
      
      try {
        onProgress?.({
          stage: 'initializing',
          progress: 10,
          message: `Trying ${providerType} provider...`,
          provider: providerType,
        });

        const provider = LlmProviderFactory.getProvider(providerType);
        
        if (!provider.isConfigured()) {
          throw new Error(`${providerType} provider is not configured`);
        }

        const result = await provider.processPrompt(prompt, onProgress);
        
        if (!result.content) {
          throw new Error('Empty response from LLM');
        }

        return result.content;
        
      } catch (error) {
        console.warn(`${providerType} provider failed:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // If this is the last provider, throw the error
        if (i === providers.length - 1) {
          throw lastError;
        }
        
        // Otherwise, try the next provider
        onProgress?.({
          stage: 'error',
          progress: 0,
          message: `${providerType} failed, trying next provider...`,
          provider: providerType,
        });
      }
    }

    throw lastError || new Error('All LLM providers failed');
  }

  private getProviderOrder(preferredProvider?: LlmProvider, availableProviders?: LlmProvider[]): LlmProvider[] {
    const config = getLlmConfig();
    const available = availableProviders || config.fallbackProviders;
    
    if (preferredProvider && available.includes(preferredProvider)) {
      return [preferredProvider, ...available.filter(p => p !== preferredProvider)];
    }
    
    return available;
  }

  private parseResponse(response: string): LLMResponse {
    try {
      // Clean the response to extract JSON
      let jsonStr = response.trim();
      
      // Remove markdown code blocks if present
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Find JSON object boundaries
      const startIndex = jsonStr.indexOf('{');
      const lastIndex = jsonStr.lastIndexOf('}');
      
      if (startIndex === -1 || lastIndex === -1) {
        throw new Error('No valid JSON object found in response');
      }
      
      jsonStr = jsonStr.substring(startIndex, lastIndex + 1);
      
      const parsed = JSON.parse(jsonStr);
      
      // Validate the structure
      if (!parsed.sections || !Array.isArray(parsed.sections)) {
        throw new Error('Invalid response structure: missing sections array');
      }
      
      // Set default values for missing fields
      parsed.originalLanguage = parsed.originalLanguage || 'unknown';
      
      parsed.sections.forEach((section: any) => {
        if (!section.items || !Array.isArray(section.items)) {
          section.items = [];
        }
        
        section.items.forEach((item: any) => {
          // Set defaults for required fields
          item.name = item.name || 'Unknown Item';
          item.originalName = item.originalName || item.name;
          item.description = item.description || '';
          item.originalDescription = item.originalDescription || item.description;
          item.simplifiedDescription = item.simplifiedDescription || item.description;
          item.section = item.section || section.name;
          item.price = item.price || '0';
          item.currency = item.currency || '$';
          item.confidence = item.confidence || 50;
          item.proteins = item.proteins || [];
          item.meatProteins = item.meatProteins || [];
          item.meatTypes = item.meatTypes || [];
          item.cookingMethods = item.cookingMethods || [];
          item.allergens = item.allergens || [];
          item.herbsSpices = item.herbsSpices || [];
          item.ingredientTranslations = item.ingredientTranslations || [];
          
          // Set dietary info defaults
          item.dietaryInfo = item.dietaryInfo || {};
          const dietaryDefaults = {
            vegetarian: false,
            vegan: false,
            halal: false,
            kosher: false,
            pescatarian: false,
            glutenFree: false,
            dairyFree: false,
            nutFree: false,
          };
          item.dietaryInfo = { ...dietaryDefaults, ...item.dietaryInfo };
        });
      });
      
      return parsed as LLMResponse;
      
    } catch (error) {
      console.error('Failed to parse LLM response:', error);
      console.error('Raw response:', response);
      throw new Error(`Failed to parse LLM response: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}