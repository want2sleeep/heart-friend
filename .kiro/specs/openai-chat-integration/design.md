# Design Document

## Overview

本设计实现了一个基于 OpenAI Compatible API 的聊天系统，与现有的生物反馈情绪检测系统集成。系统将根据用户的 GSR 传感器数据动态调整 AI 的对话风格，提供个性化的交互体验。

核心设计原则：
- **模块化**: API 服务与 UI 组件分离，便于测试和维护
- **类型安全**: 使用 TypeScript 确保类型正确性
- **错误恢复**: 优雅处理网络错误和 API 异常
- **用户体验**: 提供清晰的加载状态和错误反馈

## Architecture

系统采用分层架构：

```
┌─────────────────────────────────────┐
│   ChatInterface Component (UI)     │
│   - 消息显示                         │
│   - 用户输入                         │
│   - 加载状态                         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   useChatAPI Hook (Logic)          │
│   - 消息状态管理                     │
│   - API 调用协调                     │
│   - 错误处理                         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   OpenAI Service (API Layer)       │
│   - HTTP 请求                        │
│   - 配置管理                         │
│   - 响应解析                         │
└─────────────────────────────────────┘
```

### 数据流

1. 用户在 ChatInterface 输入消息
2. useChatAPI Hook 接收消息并更新本地状态
3. Hook 调用 OpenAI Service 发送 API 请求
4. Service 返回响应或错误
5. Hook 更新消息历史并触发 UI 重新渲染

## Components and Interfaces

### 1. OpenAI Service (`src/services/openai.ts`)

负责与 OpenAI Compatible API 通信的服务层。

```typescript
interface OpenAIConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
}

class OpenAIService {
  private config: OpenAIConfig;
  
  constructor(config: OpenAIConfig);
  
  // 发送聊天请求
  async sendChatCompletion(
    messages: ChatMessage[],
    options?: Partial<ChatCompletionRequest>
  ): Promise<string>;
  
  // 验证配置
  validateConfig(): boolean;
}
```

### 2. Chat Hook (`src/hooks/useChatAPI.ts`)

管理聊天状态和 API 调用的自定义 Hook。

```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface UseChatAPIReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearError: () => void;
}

function useChatAPI(systemPrompt: string): UseChatAPIReturn;
```

### 3. Updated ChatInterface Component

增强现有的 ChatInterface 组件以使用真实 API。

```typescript
interface ChatInterfaceProps {
  currentMood: MoodConfigItem;
}

// 组件内部使用 useChatAPI Hook
// 保持现有 UI 结构，替换占位符逻辑
```

### 4. Environment Configuration

在 `.env.local` 中添加配置：

```
VITE_OPENAI_API_KEY=your_api_key_here
VITE_OPENAI_BASE_URL=https://api.openai.com/v1
VITE_OPENAI_MODEL=gpt-3.5-turbo
```

## Data Models

### Message Model

```typescript
interface Message {
  id: string;              // 唯一标识符
  role: 'user' | 'assistant' | 'system';  // 消息角色
  content: string;         // 消息内容
  timestamp: number;       // 时间戳（毫秒）
}
```

### API Configuration Model

```typescript
interface OpenAIConfig {
  apiKey: string;          // API 密钥
  baseURL: string;         // API 基础 URL
  model: string;           // 模型名称
}
```

### Error Model

```typescript
interface ChatError {
  type: 'network' | 'auth' | 'rate_limit' | 'timeout' | 'unknown';
  message: string;
  details?: any;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Configuration loading preserves values
*For any* valid environment configuration (API key, base URL, model name), loading the configuration should produce a config object that contains exactly those values
**Validates: Requirements 1.1**

### Property 2: Missing configuration uses defaults
*For any* subset of missing configuration values, the system should use default placeholder values for the missing fields and preserve any provided values
**Validates: Requirements 1.2**

### Property 3: URL validation correctness
*For any* string, the URL validation function should return true if and only if the string is a valid HTTP/HTTPS URL format
**Validates: Requirements 1.4**

### Property 4: Message addition preserves history
*For any* message history and new user message, adding the message should result in the history length increasing by exactly one and the new message appearing at the end
**Validates: Requirements 2.1**

### Property 5: API success adds response to history
*For any* message history and successful API response, the response should be added to the history with role 'assistant' and the response content
**Validates: Requirements 2.2**

### Property 6: API failure preserves history integrity
*For any* message history and failed API call, the history should remain unchanged (same length and same messages)
**Validates: Requirements 2.3**

### Property 7: Loading state controls input
*For any* UI state where isLoading is true, the input field should be disabled and a loading indicator should be visible
**Validates: Requirements 2.4, 7.1**

### Property 8: Invalid response triggers error
*For any* API response that is empty, null, or malformed, the system should set an error state and not add the response to message history
**Validates: Requirements 2.5**

### Property 9: Mood change updates system prompt
*For any* two different mood contexts, when the mood changes from one to the other, the next API request should include the new mood's system prompt
**Validates: Requirements 3.1**

### Property 10: API request includes system prompt
*For any* API request, the messages array should have a system role message as the first element containing the current mood's system prompt
**Validates: Requirements 3.2**

### Property 11: Mood change adds notification
*For any* mood change event, a system notification message should be added to the message history
**Validates: Requirements 3.3**

### Property 12: Message ordering by timestamp
*For any* message history with multiple messages, the displayed messages should be ordered by their timestamp in ascending order
**Validates: Requirements 4.2**

### Property 13: Message role determines styling
*For any* message with role 'user' or 'assistant', the rendered HTML should contain different CSS classes to visually distinguish them
**Validates: Requirements 4.3**

### Property 14: HTTP error codes map to error types
*For any* HTTP error response (401, 403, 429, 500, etc.), the system should map it to the appropriate error type (auth, rate_limit, network, etc.) and display the corresponding error message
**Validates: Requirements 5.1, 5.2, 5.3**

### Property 15: Timeout cancels request
*For any* API request that exceeds the timeout duration, the request should be aborted and a timeout error should be set
**Validates: Requirements 5.4**

### Property 16: Errors are logged
*For any* error that occurs (network, API, validation), the error details should be logged to the console
**Validates: Requirements 5.5**

### Property 17: Component uses mood's system prompt
*For any* mood configuration passed to ChatInterface, the chat system should use that mood's systemPrompt field in API requests
**Validates: Requirements 6.1**

### Property 18: Loading state transitions correctly
*For any* API request lifecycle, isLoading should be true when the request starts, and false when the request completes (success or failure)
**Validates: Requirements 7.2, 7.4**

## Error Handling

### Error Types

系统定义以下错误类型：

1. **Network Error**: 网络连接失败，无法到达服务器
2. **Authentication Error**: API Key 无效或缺失（401/403）
3. **Rate Limit Error**: 超过 API 调用限制（429）
4. **Timeout Error**: 请求超时
5. **Invalid Response Error**: API 返回格式错误或空响应
6. **Unknown Error**: 其他未分类错误

### Error Handling Strategy

```typescript
try {
  // API 调用
} catch (error) {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    // 网络错误
    setError({ type: 'network', message: '网络连接失败，请检查您的网络设置' });
  } else if (error.status === 401 || error.status === 403) {
    // 认证错误
    setError({ type: 'auth', message: 'API Key 无效，请检查配置' });
  } else if (error.status === 429) {
    // 速率限制
    setError({ type: 'rate_limit', message: 'API 调用次数过多，请稍后重试' });
  } else if (error.name === 'AbortError') {
    // 超时
    setError({ type: 'timeout', message: '请求超时，请重试' });
  } else {
    // 未知错误
    setError({ type: 'unknown', message: '发生未知错误，请重试' });
  }
  
  console.error('[ChatSystem Error]', error);
}
```

### Error Recovery

- 所有错误都应该允许用户重试
- 错误状态应该可以通过 `clearError()` 方法清除
- 错误不应该导致应用崩溃或状态损坏
- 用户应该始终能够继续发送新消息

## Testing Strategy

### Unit Testing

使用 Vitest 进行单元测试，覆盖以下场景：

1. **OpenAI Service 测试**
   - 配置加载和验证
   - API 请求构造
   - 响应解析
   - 错误处理

2. **useChatAPI Hook 测试**
   - 消息状态管理
   - 加载状态转换
   - 错误状态管理
   - 情绪变化响应

3. **ChatInterface Component 测试**
   - 消息渲染
   - 用户输入处理
   - 加载指示器显示
   - 错误消息显示

### Property-Based Testing

使用 **fast-check** 库进行属性测试，每个测试运行至少 100 次迭代。

每个属性测试必须：
- 使用注释标记对应的设计文档属性：`// Feature: openai-chat-integration, Property X: [property text]`
- 生成随机但有效的测试数据
- 验证通用规则而非具体示例
- 覆盖边缘情况（空值、极端值等）

测试覆盖的属性包括：
- 配置加载和验证（Properties 1-3）
- 消息历史管理（Properties 4-6）
- UI 状态管理（Properties 7, 18）
- 情绪系统集成（Properties 9-11, 17）
- 错误处理（Properties 8, 14-16）

### Integration Testing

测试完整的用户流程：
1. 用户发送消息 → API 调用 → 响应显示
2. 情绪变化 → System Prompt 更新 → 下次调用使用新 Prompt
3. API 错误 → 错误显示 → 用户重试

### Testing Dependencies

需要添加的测试依赖：
```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "fast-check": "^3.15.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0"
  }
}
```

## Implementation Notes

### API Request Format

OpenAI Compatible API 请求格式：

```typescript
POST {baseURL}/chat/completions
Headers:
  Authorization: Bearer {apiKey}
  Content-Type: application/json

Body:
{
  "model": "gpt-3.5-turbo",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant..." },
    { "role": "user", "content": "Hello!" },
    { "role": "assistant", "content": "Hi! How can I help?" },
    { "role": "user", "content": "Tell me a joke" }
  ],
  "temperature": 0.7,
  "max_tokens": 500
}
```

### Performance Considerations

1. **请求节流**: 防止用户快速连续发送消息导致 API 过载
2. **超时设置**: 默认 30 秒超时，避免长时间等待
3. **消息历史限制**: 只发送最近 20 条消息到 API，避免 token 超限
4. **响应流式处理**: 未来可以考虑支持 SSE 流式响应以改善用户体验

### Security Considerations

1. **API Key 保护**: 
   - API Key 仅存储在环境变量中
   - 不在客户端代码中硬编码
   - 不在日志中输出完整 API Key

2. **输入验证**:
   - 验证用户输入长度（最大 2000 字符）
   - 过滤特殊字符以防止注入攻击

3. **错误信息**:
   - 不在错误消息中暴露敏感信息
   - 生产环境中隐藏详细的技术错误

## Future Enhancements

1. **流式响应**: 支持 Server-Sent Events (SSE) 实现打字机效果
2. **对话持久化**: 将消息历史保存到 localStorage
3. **多模型支持**: 允许用户在不同模型间切换
4. **对话导出**: 支持导出对话历史为文本或 JSON
5. **语音输入**: 集成 Web Speech API 支持语音输入
6. **消息编辑**: 允许用户编辑已发送的消息并重新生成响应
