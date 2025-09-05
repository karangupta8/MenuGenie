import { ILlmProvider, LlmResult, LlmProgress, LlmProviderCapabilities } from '../../../types/llm';

export abstract class BaseLlmProvider implements ILlmProvider {
  abstract name: string;
  abstract capabilities: LlmProviderCapabilities;

  abstract isConfigured(): boolean;
  abstract processPrompt(prompt: string, onProgress?: (progress: LlmProgress) => void): Promise<LlmResult>;
  abstract validateConfiguration(): { isValid: boolean; errors: string[] };

  protected async makeRequest(
    url: string,
    headers: Record<string, string>,
    body: any,
    onProgress?: (progress: LlmProgress) => void
  ): Promise<LlmResult> {
    const startTime = Date.now();
    
    onProgress?.({
      stage: 'initializing',
      progress: 10,
      message: 'Initializing request...',
      provider: this.getProviderType(),
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      onProgress?.({
        stage: 'processing',
        progress: 50,
        message: 'Processing request...',
        provider: this.getProviderType(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      onProgress?.({
        stage: 'parsing',
        progress: 80,
        message: 'Parsing response...',
        provider: this.getProviderType(),
      });

      const content = this.extractContent(data);
      
      onProgress?.({
        stage: 'complete',
        progress: 100,
        message: 'Complete',
        provider: this.getProviderType(),
      });

      return {
        content,
        provider: this.getProviderType(),
        processingTime: Date.now() - startTime,
        model: this.getModel(),
      };
    } catch (error) {
      onProgress?.({
        stage: 'error',
        progress: 0,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
        provider: this.getProviderType(),
      });
      throw error;
    }
  }

  protected abstract extractContent(data: any): string;
  protected abstract getProviderType(): any;
  protected abstract getModel(): string;
}

