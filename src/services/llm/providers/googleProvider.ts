import { BaseLlmProvider } from './baseProvider';
import { LlmResult, LlmProgress, LlmProviderCapabilities } from '../../../types/llm';
import { getLlmConfig } from '../../../config/llmConfig';

export class GoogleProvider extends BaseLlmProvider {
  name = 'Google Gemini';
  capabilities: LlmProviderCapabilities = {
    name: 'Google Gemini',
    requiresApiKey: true,
    supportedModels: ['gemini-1.5-pro', 'gemini-1.5-flash'],
    maxTokens: 8000,
    averageProcessingTime: 2500,
    accuracy: 'high',
    cost: 'low',
    features: ['multimodal', 'reasoning', 'code-generation'],
  };

  isConfigured(): boolean {
    const config = getLlmConfig();
    return !!(config.providers.google.apiKey && config.providers.google.apiKey !== 'YOUR_GOOGLE_LLM_API_KEY_HERE');
  }

  validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = getLlmConfig();

    if (!config.providers.google.apiKey || config.providers.google.apiKey === 'YOUR_GOOGLE_LLM_API_KEY_HERE') {
      errors.push('Google LLM API key is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async processPrompt(prompt: string, onProgress?: (progress: LlmProgress) => void): Promise<LlmResult> {
    const config = getLlmConfig();
    
    if (!this.isConfigured()) {
      throw new Error('Google provider is not configured');
    }

    const model = config.providers.google.model;
    const endpoint = `${config.providers.google.endpoint}/${model}:generateContent?key=${config.providers.google.apiKey}`;

    const headers = {
      'Content-Type': 'application/json',
    };

    const body = {
      contents: [
        {
          parts: [
            {
              text: `You are an expert menu analyst and translator. Always return valid JSON responses.\n\n${prompt}`
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: config.providers.google.maxTokens,
        temperature: config.providers.google.temperature,
      },
    };

    return this.makeRequest(endpoint, headers, body, onProgress);
  }

  protected extractContent(data: any): string {
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  protected getProviderType() {
    return 'google' as const;
  }

  protected getModel(): string {
    return getLlmConfig().providers.google.model;
  }
}





