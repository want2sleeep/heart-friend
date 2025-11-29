import { useState, useEffect, useRef, useCallback } from 'react';
import { openAIService } from '../services/openai';
import type { Message, ChatMessage, ChatError } from '../types';

/**
 * Custom hook for managing chat API interactions
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 5.5, 7.1, 7.2, 7.4
 */

interface UseChatAPIReturn {
  messages: Message[];
  isLoading: boolean;
  error: ChatError | null;
  sendMessage: (content: string) => Promise<void>;
  clearError: () => void;
}

export function useChatAPI(systemPrompt: string): UseChatAPIReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);
  
  // Track previous system prompt to detect mood changes
  const previousSystemPromptRef = useRef<string>(systemPrompt);

  /**
   * Handle mood/system prompt changes
   * Validates: Requirements 3.1, 3.3
   */
  useEffect(() => {
    // Check if system prompt has changed (mood change)
    if (previousSystemPromptRef.current !== systemPrompt && messages.length > 0) {
      // Add system notification message about mood change
      const notificationMessage: Message = {
        id: `system-${Date.now()}`,
        role: 'system',
        content: '情绪状态已变化，AI 对话风格将相应调整',
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, notificationMessage]);
    }
    
    // Update the ref for next comparison
    previousSystemPromptRef.current = systemPrompt;
  }, [systemPrompt, messages.length]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Send a message to the API
   * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 3.2, 5.5, 7.1, 7.2, 7.4
   */
  const sendMessage = useCallback(async (content: string) => {
    // Validate input
    if (!content || content.trim() === '') {
      return;
    }

    // Validate input length (max 2000 characters)
    if (content.length > 2000) {
      setError({
        type: 'unknown',
        message: '消息长度超过限制（最大 2000 字符）',
      });
      return;
    }

    // Clear any previous errors
    setError(null);

    // Create user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    // Add user message to history (Requirement 2.1)
    setMessages(prev => [...prev, userMessage]);

    // Set loading state (Requirement 2.4, 7.1, 7.2)
    setIsLoading(true);

    try {
      // Prepare messages for API call
      // Include system prompt as first message (Requirement 3.2)
      // Limit to last 20 messages to avoid token limits
      const recentMessages = messages.slice(-20);
      
      const apiMessages: ChatMessage[] = [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...recentMessages.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        })),
        {
          role: 'user',
          content: content.trim(),
        },
      ];

      // Reload config from localStorage before each request
      openAIService.reloadConfig();
      
      // Call OpenAI API
      const responseContent = await openAIService.sendChatCompletion(apiMessages);

      // Validate response (Requirement 2.5)
      if (!responseContent || responseContent.trim() === '') {
        throw {
          type: 'unknown',
          message: 'API 返回了空响应',
        } as ChatError;
      }

      // Create assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: responseContent,
        timestamp: Date.now(),
      };

      // Add assistant response to history (Requirement 2.2)
      setMessages(prev => [...prev, assistantMessage]);

    } catch (err: any) {
      // Handle errors (Requirement 2.3, 5.5)
      console.error('[useChatAPI Error]', err);
      
      // Set error object (preserve type information for UI)
      if (err && typeof err === 'object' && 'type' in err) {
        // Already a ChatError from the service
        setError(err as ChatError);
      } else {
        // Wrap unknown errors
        setError({
          type: 'unknown',
          message: err?.message || '发生未知错误，请重试',
          details: err,
        });
      }

      // Note: Message history is preserved on error (Requirement 2.3)
      // We don't remove the user message, allowing retry
    } finally {
      // Clear loading state (Requirement 7.4)
      setIsLoading(false);
    }
  }, [messages, systemPrompt]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearError,
  };
}
