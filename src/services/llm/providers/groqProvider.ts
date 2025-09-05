import { BaseLlmProvider } from './baseProvider';
import { LlmResult, LlmProgress, LlmProviderCapabilities } from '../../../types/llm';
import { getLlmConfig } from '../../../config/llmConfig';

export class GroqProvider extends BaseLlmProvider {
  name = 'Groq (Llama)';
  capabilities: LlmProviderCapabilities = {
    name: 'Groq (Llama)',
    requiresApiKey: true,
    supportedModels: ['llama-3.3-70b-versatile', 'llama-3.3-8b-instant'],
    maxTokens: 8000,
    averageProcessingTime: 1000,
    accuracy: 'high',
    cost: 'low',
    features: ['fast-inference', 'open-source', 'cost-effective'],
  };

  isConfigured(): boolean {
    const config = getLlmConfig();
    return !!(config.providers.groq.apiKey && config.providers.groq.apiKey !== 'YOUR_GROQ_API_KEY_HERE');
  }

  validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = getLlmConfig();

    if (!config.providers.groq.apiKey || config.providers.groq.apiKey === 'YOUR_GROQ_API_KEY_HERE') {
      errors.push('Groq API key is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async processPrompt(prompt: string, onProgress?: (progress: LlmProgress) => void): Promise<LlmResult> {
    const config = getLlmConfig();
    
    if (!this.isConfigured()) {
      throw new Error('Groq provider is not configured');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.providers.groq.apiKey}`,
    };

    const body = {
      model: config.providers.groq.model,
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
      max_tokens: config.providers.groq.maxTokens,
      temperature: config.providers.groq.temperature,
    };

    return this.makeRequest(config.providers.groq.endpoint, headers, body, onProgress);
  }

  protected extractContent(data: any): string {
    return data.choices?.[0]?.message?.content || '';
  }

  protected getProviderType() {
    return 'groq' as const;
  }

  protected getModel(): string {
    return getLlmConfig().providers.groq.model;
  }
}





