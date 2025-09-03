import { ProcessedMenu, MenuItem, MenuSection } from '../types/menu';
import { API_CONFIG, LLM_PROMPTS } from '../config/api';

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

  async processMenuData(menuText: string, targetLanguage: string = 'en'): Promise<ProcessedMenu> {
    const startTime = Date.now();
    
    try {
      const prompt = LLM_PROMPTS.menuProcessing(menuText, targetLanguage);
      
      const response = await this.callLLM(prompt);
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

  private async callLLM(prompt: string): Promise<string> {
    const { provider, apiKey, endpoint, model, maxTokens, temperature } = API_CONFIG.llm;
    
    if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY_HERE') {
      throw new Error('LLM API key not configured');
    }

    let requestBody: any;
    let headers: Record<string, string>;

    // Configure request based on provider
    switch (provider) {
      case 'openai':
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        };
        requestBody = {
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert menu analyst and translator. Always return valid JSON responses.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: maxTokens,
          temperature: temperature,
        };
        break;
        
      case 'anthropic':
        headers = {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        };
        requestBody = {
          model: model,
          max_tokens: maxTokens,
          temperature: temperature,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
        };
        break;
        
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`LLM API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    // Extract content based on provider
    let content: string;
    switch (provider) {
      case 'openai':
        content = data.choices?.[0]?.message?.content || '';
        break;
      case 'anthropic':
        content = data.content?.[0]?.text || '';
        break;
      default:
        throw new Error(`Unsupported LLM provider for response parsing: ${provider}`);
    }

    if (!content) {
      throw new Error('Empty response from LLM');
    }

    return content;
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