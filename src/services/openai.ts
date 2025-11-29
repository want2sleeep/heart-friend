import type { OpenAIConfig, ChatMessage, ChatCompletionRequest, ChatCompletionResponse, ChatError } from '../types';

/**
 * OpenAI Service
 * Handles communication with OpenAI Compatible API
 */
export class OpenAIService {
  private config: OpenAIConfig;

  constructor(config?: Partial<OpenAIConfig>) {
    this.config = this.loadConfig(config);
  }

  /**
   * Load configuration from localStorage, then environment variables, with fallback to defaults
   * Validates: Requirements 1.1, 1.2
   */
  private loadConfig(overrides?: Partial<OpenAIConfig>): OpenAIConfig {
    // Priority: overrides > localStorage > env > defaults
    const apiKey = overrides?.apiKey 
      || localStorage.getItem('openai_api_key') 
      || import.meta.env.VITE_OPENAI_API_KEY 
      || 'your_api_key_here';
    const baseURL = overrides?.baseURL 
      || localStorage.getItem('openai_base_url') 
      || import.meta.env.VITE_OPENAI_BASE_URL 
      || 'https://api.openai.com/v1';
    const model = overrides?.model 
      || localStorage.getItem('openai_model_name') 
      || import.meta.env.VITE_OPENAI_MODEL 
      || 'gpt-3.5-turbo';

    // Warn if using default placeholder values
    if (apiKey === 'your_api_key_here') {
      console.warn('[OpenAI Service] Using placeholder API key. Please configure via settings or VITE_OPENAI_API_KEY in .env.local');
    }

    return { apiKey, baseURL, model };
  }

  /**
   * Reload configuration from localStorage
   */
  reloadConfig(): void {
    this.config = this.loadConfig();
  }

  /**
   * Validate configuration
   * Validates: Requirements 1.4
   */
  validateConfig(): boolean {
    // Check if API key is present and not placeholder
    if (!this.config.apiKey || this.config.apiKey === 'your_api_key_here') {
      console.error('[OpenAI Service] Invalid API key');
      return false;
    }

    // Validate URL format
    if (!this.isValidURL(this.config.baseURL)) {
      console.error('[OpenAI Service] Invalid base URL format');
      return false;
    }

    // Check if model is specified
    if (!this.config.model || this.config.model.trim() === '') {
      console.error('[OpenAI Service] Model name is required');
      return false;
    }

    return true;
  }

  /**
   * Validate URL format
   * Validates: Requirements 1.4
   */
  private isValidURL(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Send chat completion request to OpenAI Compatible API
   * Validates: Requirements 2.1, 2.2, 2.3, 5.1, 5.2, 5.3, 5.4, 5.5
   */
  async sendChatCompletion(
    messages: ChatMessage[],
    options?: Partial<ChatCompletionRequest>
  ): Promise<string> {
    // Construct request body
    const requestBody: ChatCompletionRequest = {
      model: this.config.model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 500,
    };

    // Set up timeout controller (30 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      // Make API request
      const response = await fetch(`${this.config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        const error = await this.handleHTTPError(response);
        console.error('[OpenAI Service Error]', error);
        throw error;
      }

      // Parse response
      const data: ChatCompletionResponse = await response.json();

      // Validate response structure
      if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
        const error: ChatError = {
          type: 'unknown',
          message: 'API 返回了无效的响应格式',
          details: data,
        };
        console.error('[OpenAI Service Error]', error);
        throw error;
      }

      const content = data.choices[0].message.content;

      // Check for empty response
      if (!content || content.trim() === '') {
        const error: ChatError = {
          type: 'unknown',
          message: 'API 返回了空响应',
          details: data,
        };
        console.error('[OpenAI Service Error]', error);
        throw error;
      }

      return content;

    } catch (error: any) {
      clearTimeout(timeoutId);

      // Handle timeout
      if (error.name === 'AbortError') {
        const timeoutError: ChatError = {
          type: 'timeout',
          message: '请求超时，请重试',
          details: error,
        };
        console.error('[OpenAI Service Error]', timeoutError);
        throw timeoutError;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError: ChatError = {
          type: 'network',
          message: '网络连接失败，请检查您的网络设置',
          details: error,
        };
        console.error('[OpenAI Service Error]', networkError);
        throw networkError;
      }

      // If already a ChatError, re-throw
      if (error.type) {
        throw error;
      }

      // Unknown error
      const unknownError: ChatError = {
        type: 'unknown',
        message: '发生未知错误，请重试',
        details: error,
      };
      console.error('[OpenAI Service Error]', unknownError);
      throw unknownError;
    }
  }

  /**
   * Handle HTTP error responses
   * Validates: Requirements 5.1, 5.2, 5.3
   */
  private async handleHTTPError(response: Response): Promise<ChatError> {
    const status = response.status;
    let details: any;

    try {
      details = await response.json();
    } catch {
      details = await response.text();
    }

    // Authentication errors (401, 403)
    if (status === 401 || status === 403) {
      return {
        type: 'auth',
        message: 'API Key 无效，请检查配置',
        details,
      };
    }

    // Rate limit error (429)
    if (status === 429) {
      return {
        type: 'rate_limit',
        message: 'API 调用次数过多，请稍后重试',
        details,
      };
    }

    // Server errors (500+)
    if (status >= 500) {
      return {
        type: 'network',
        message: '服务器错误，请稍后重试',
        details,
      };
    }

    // Other errors
    return {
      type: 'unknown',
      message: `请求失败 (${status})`,
      details,
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): OpenAIConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   * Validates: Requirements 1.3
   */
  updateConfig(newConfig: Partial<OpenAIConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
    };
  }
}

/**
 * Create a singleton instance of OpenAI Service
 */
export const openAIService = new OpenAIService();
