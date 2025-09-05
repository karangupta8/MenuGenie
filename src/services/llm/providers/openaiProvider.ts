import { BaseLlmProvider } from './baseProvider';
import { LlmResult, LlmProgress, LlmProviderCapabilities } from '../../../types/llm';
import { getLlmConfig } from '../../../config/llmConfig';

export class OpenAIProvider extends BaseLlmProvider {
  name = 'OpenAI GPT';
  capabilities: LlmProviderCapabilities = {
    name: 'OpenAI GPT',
    requiresApiKey: true,
    supportedModels: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    maxTokens: 8000,
    averageProcessingTime: 3000,
    accuracy: 'high',
    cost: 'medium',
    features: ['json-mode', 'function-calling', 'vision'],
  };

  isConfigured(): boolean {
    const config = getLlmConfig();
    return !!(config.providers.openai.apiKey && config.providers.openai.apiKey !== 'YOUR_OPENAI_API_KEY_HERE');
  }

  validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = getLlmConfig();

    if (!config.providers.openai.apiKey || config.providers.openai.apiKey === 'YOUR_OPENAI_API_KEY_HERE') {
      errors.push('OpenAI API key is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async processPrompt(prompt: string, onProgress?: (progress: LlmProgress) => void): Promise<LlmResult> {
    const config = getLlmConfig();
    
    if (!this.isConfigured()) {
      throw new Error('OpenAI provider is not configured');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.providers.openai.apiKey}`,
    };

    const body = {
      model: config.providers.openai.model,
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
      max_tokens: config.providers.openai.maxTokens,
      temperature: config.providers.openai.temperature,
    };

    return this.makeRequest(config.providers.openai.endpoint, headers, body, onProgress);
  }

  protected extractContent(data: any): string {
    return data.choices?.[0]?.message?.content || '';
  }

  protected getProviderType() {
    return 'openai' as const;
  }

  protected getModel(): string {
    return getLlmConfig().providers.openai.model;
  }
}
