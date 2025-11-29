# Implementation Plan

- [x] 1. 设置环境配置和类型定义




  - 在 `.env.local` 中添加 OpenAI API 配置变量（VITE_OPENAI_API_KEY, VITE_OPENAI_BASE_URL, VITE_OPENAI_MODEL）
  - 在 `src/types.ts` 中添加 API 相关的 TypeScript 接口（Message, OpenAIConfig, ChatError 等）
  - _Requirements: 1.1, 1.2_

- [x] 2. 实现 OpenAI Service 核心功能





  - 创建 `src/services/openai.ts` 文件
  - 实现配置加载和验证逻辑
  - 实现 API 请求构造和发送功能
  - 实现响应解析和错误处理
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 2.1 为 OpenAI Service 编写属性测试
  - **Property 1: Configuration loading preserves values** - **Validates: Requirements 1.1**
  - **Property 2: Missing configuration uses defaults** - **Validates: Requirements 1.2**
  - **Property 3: URL validation correctness** - **Validates: Requirements 1.4**

- [ ]* 2.2 为 OpenAI Service 编写单元测试
  - 测试配置加载的各种场景
  - 测试 API 请求构造
  - 测试错误处理逻辑
  - _Requirements: 1.1, 1.2, 1.4, 5.1, 5.2, 5.3, 5.4_
-

- [x] 3. 实现 useChatAPI Hook




  - 创建 `src/hooks/useChatAPI.ts` 文件
  - 实现消息状态管理（useState for messages, isLoading, error）
  - 实现 sendMessage 函数，调用 OpenAI Service
  - 实现加载状态和错误状态的管理
  - 实现情绪变化时的 system prompt 更新逻辑
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 5.5, 7.1, 7.2, 7.4_

- [ ]* 3.1 为 useChatAPI Hook 编写属性测试
  - **Property 4: Message addition preserves history** - **Validates: Requirements 2.1**
  - **Property 5: API success adds response to history** - **Validates: Requirements 2.2**
  - **Property 6: API failure preserves history integrity** - **Validates: Requirements 2.3**
  - **Property 8: Invalid response triggers error** - **Validates: Requirements 2.5**
  - **Property 9: Mood change updates system prompt** - **Validates: Requirements 3.1**
  - **Property 10: API request includes system prompt** - **Validates: Requirements 3.2**
  - **Property 11: Mood change adds notification** - **Validates: Requirements 3.3**
  - **Property 18: Loading state transitions correctly** - **Validates: Requirements 7.2, 7.4**

- [ ]* 3.2 为 useChatAPI Hook 编写单元测试
  - 测试消息添加和历史管理
  - 测试加载状态转换
  - 测试错误处理
  - 测试情绪变化响应
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 7.1, 7.2, 7.4_


- [x] 4. 更新 ChatInterface 组件




  - 修改 `src/components/ChatInterface.tsx`
  - 移除占位符逻辑，集成 useChatAPI Hook
  - 实现加载指示器（"正在输入..."动画）
  - 实现错误消息显示和重试功能
  - 保持现有的 UI 样式和布局
  - 确保情绪变化时正确传递 systemPrompt
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 6.1, 6.3, 7.1, 7.2, 7.3, 7.4_

- [ ]* 4.1 为 ChatInterface 组件编写属性测试
  - **Property 7: Loading state controls input** - **Validates: Requirements 2.4, 7.1**
  - **Property 12: Message ordering by timestamp** - **Validates: Requirements 4.2**
  - **Property 13: Message role determines styling** - **Validates: Requirements 4.3**
  - **Property 17: Component uses mood's system prompt** - **Validates: Requirements 6.1**

- [ ]* 4.2 为 ChatInterface 组件编写单元测试
  - 测试消息渲染
  - 测试用户输入处理
  - 测试加载指示器显示
  - 测试错误消息显示
  - _Requirements: 2.4, 4.1, 4.2, 4.3, 6.1, 7.1, 7.2_

- [x] 5. 实现错误处理和用户反馈





  - 在 ChatInterface 中添加错误提示 UI
  - 实现不同错误类型的友好提示消息
  - 添加重试按钮和清除错误功能
  - 实现控制台错误日志记录
  - _Requirements: 2.3, 2.5, 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 5.1 为错误处理编写属性测试
  - **Property 14: HTTP error codes map to error types** - **Validates: Requirements 5.1, 5.2, 5.3**
  - **Property 15: Timeout cancels request** - **Validates: Requirements 5.4**
  - **Property 16: Errors are logged** - **Validates: Requirements 5.5**

- [ ] 6. 优化和性能改进
  - 实现消息历史长度限制（只发送最近 20 条到 API）
  - 添加请求超时设置（30 秒）
  - 实现用户输入长度验证（最大 2000 字符）
  - 添加输入防抖以防止快速连续发送
  - _Requirements: 2.1, 5.4_

- [ ] 7. 集成测试和端到端验证
  - 确保所有测试通过
  - 验证完整的用户流程：发送消息 → API 调用 → 响应显示
  - 验证情绪变化流程：情绪变化 → System Prompt 更新 → 下次调用使用新 Prompt
  - 验证错误处理流程：API 错误 → 错误显示 → 用户重试
  - 在浏览器中手动测试各种场景
  - _Requirements: All_

- [ ] 8. 最终检查点
  - 确保所有测试通过，如有问题请询问用户
