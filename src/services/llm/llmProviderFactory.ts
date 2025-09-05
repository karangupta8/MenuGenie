import { ILlmProvider, LlmProvider } from '../../types/llm';
import { OpenAIProvider } from './providers/openaiProvider';
import { GoogleProvider } from './providers/googleProvider';
import { GroqProvider } from './providers/groqProvider';
import { AnthropicProvider } from './providers/anthropicProvider';

/**
 * Factory for creating LLM provider instances
 */
export class LlmProviderFactory {
  private static providers: Map<LlmProvider, ILlmProvider> = new Map();

  /**
   * Get a provider instance
   */
  static getProvider(providerType: LlmProvider): ILlmProvider {
    if (!this.providers.has(providerType)) {
      this.providers.set(providerType, this.createProvider(providerType));
    }
    return this.providers.get(providerType)!;
  }

  /**
   * Create a new provider instance
   */
  private static createProvider(providerType: LlmProvider): ILlmProvider {
    switch (providerType) {
      case 'openai':
        return new OpenAIProvider();
      case 'google':
        return new GoogleProvider();
      case 'groq':
        return new GroqProvider();
      case 'anthropic':
        return new AnthropicProvider();
      default:
        throw new Error(`Unsupported LLM provider: ${providerType}`);
    }
  }

  /**
   * Get all available providers
   */
  static getAllProviders(): ILlmProvider[] {
    const providerTypes: LlmProvider[] = ['openai', 'google', 'groq', 'anthropic'];
    return providerTypes.map(type => this.getProvider(type));
  }

  /**
   * Clear provider cache (useful for testing or reconfiguration)
   */
  static clearCache(): void {
    this.providers.clear();
  }
}
