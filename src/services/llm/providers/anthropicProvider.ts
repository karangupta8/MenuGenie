import { BaseLlmProvider } from './baseProvider';
import { LlmResult, LlmProgress, LlmProviderCapabilities } from '../../../types/llm';
import { getLlmConfig } from '../../../config/llmConfig';

export class AnthropicProvider extends BaseLlmProvider {
  name = 'Anthropic Claude';
  capabilities: LlmProviderCapabilities = {
    name: 'Anthropic Claude',
    requiresApiKey: true,
    supportedModels: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
    maxTokens: 8000,
    averageProcessingTime: 4000,
    accuracy: 'high',
    cost: 'medium',
    features: ['reasoning', 'safety', 'long-context'],
  };

  isConfigured(): boolean {
    const config = getLlmConfig();
    return !!(config.providers.anthropic.apiKey && config.providers.anthropic.apiKey !== 'YOUR_ANTHROPIC_API_KEY_HERE');
  }

  validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = getLlmConfig();

    if (!config.providers.anthropic.apiKey || config.providers.anthropic.apiKey === 'YOUR_ANTHROPIC_API_KEY_HERE') {
      errors.push('Anthropic API key is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async processPrompt(prompt: string, onProgress?: (progress: LlmProgress) => void): Promise<LlmResult> {
    const config = getLlmConfig();
    
    if (!this.isConfigured()) {
      throw new Error('Anthropic provider is not configured');
    }

    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': config.providers.anthropic.apiKey,
      'anthropic-version': '2023-06-01',
    };

    const body = {
      model: config.providers.anthropic.model,
      max_tokens: config.providers.anthropic.maxTokens,
      temperature: config.providers.anthropic.temperature,
      messages: [
        {
          role: 'user',
          content: `You are an expert menu analyst and translator. Always return valid JSON responses.\n\n${prompt}`
        }
      ],
    };

    return this.makeRequest(config.providers.anthropic.endpoint, headers, body, onProgress);
  }

  protected extractContent(data: any): string {
    return data.content?.[0]?.text || '';
  }

  protected getProviderType() {
    return 'anthropic' as const;
  }

  protected getModel(): string {
    return getLlmConfig().providers.anthropic.model;
  }
}



