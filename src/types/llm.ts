// LLM-specific type definitions
export type LlmProvider = 'openai' | 'google' | 'groq' | 'anthropic';

export interface LlmConfig {
  provider: LlmProvider;
  fallbackProviders: LlmProvider[];
  timeout: number;
  retryAttempts: number;
  maxTokens: number;
  temperature: number;
}

export interface LlmResult {
  content: string;
  provider: LlmProvider;
  processingTime: number;
  tokensUsed?: number;
  model: string;
}

export interface LlmProgress {
  stage: 'initializing' | 'processing' | 'parsing' | 'complete' | 'error';
  progress: number;
  message: string;
  provider: LlmProvider;
  estimatedTimeRemaining?: number;
}

export interface LlmError {
  code: string;
  message: string;
  provider: LlmProvider;
  retryable: boolean;
  suggestedAction?: string;
}

export interface LlmProviderCapabilities {
  name: string;
  requiresApiKey: boolean;
  supportedModels: string[];
  maxTokens: number;
  averageProcessingTime: number;
  accuracy: 'high' | 'medium' | 'low';
  cost: 'low' | 'medium' | 'high';
  features: string[];
}

// Abstract interface for LLM providers
export interface ILlmProvider {
  name: string;
  capabilities: LlmProviderCapabilities;
  isConfigured(): boolean;
  processPrompt(prompt: string, onProgress?: (progress: LlmProgress) => void): Promise<LlmResult>;
  validateConfiguration(): { isValid: boolean; errors: string[] };
}

// Provider-specific configuration interfaces
export interface OpenAIConfig {
  apiKey: string;
  endpoint: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface GoogleConfig {
  apiKey: string;
  endpoint: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface GroqConfig {
  apiKey: string;
  endpoint: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface AnthropicConfig {
  apiKey: string;
  endpoint: string;
  model: string;
  maxTokens: number;
  temperature: number;
}
