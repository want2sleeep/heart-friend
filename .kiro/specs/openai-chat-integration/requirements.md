# Requirements Document

## Introduction

本功能旨在为生物反馈 AI 伴侣应用集成真实的 OpenAI Compatible API 聊天能力。系统将根据用户的生物信号（GSR 传感器数据）动态调整 AI 的对话风格，通过可配置的 API 端点实现智能对话。用户可以自行配置 API Key、Base URL 和模型名称。

## Glossary

- **ChatSystem**: 聊天系统，负责管理消息历史和 API 调用
- **OpenAI Compatible API**: 兼容 OpenAI API 格式的接口
- **MoodContext**: 情绪上下文，基于 GSR 传感器数据确定的用户当前情绪状态
- **SystemPrompt**: 系统提示词，根据用户情绪动态调整的 AI 行为指令
- **MessageHistory**: 消息历史记录，包含用户和 AI 的对话内容
- **APIConfiguration**: API 配置，包含 API Key、Base URL 和模型名称

## Requirements

### Requirement 1

**User Story:** 作为用户，我希望能够配置 OpenAI Compatible API 的连接参数，以便使用我自己的 API 服务

#### Acceptance Criteria

1. WHEN 应用启动 THEN THE ChatSystem SHALL 从环境变量中读取 API Key、Base URL 和模型名称
2. WHEN 环境变量中的配置缺失 THEN THE ChatSystem SHALL 使用默认的占位符值并在控制台显示警告
3. WHEN 用户更新环境变量配置 THEN THE ChatSystem SHALL 在下次 API 调用时使用新的配置值
4. WHERE 配置包含 Base URL THEN THE ChatSystem SHALL 验证 URL 格式的有效性

### Requirement 2

**User Story:** 作为用户，我希望发送消息后能收到 AI 的真实回复，以便进行有意义的对话

#### Acceptance Criteria

1. WHEN 用户发送消息 THEN THE ChatSystem SHALL 将消息添加到 MessageHistory 并调用 OpenAI Compatible API
2. WHEN API 调用成功 THEN THE ChatSystem SHALL 将 AI 响应添加到 MessageHistory 并显示在界面上
3. WHEN API 调用失败 THEN THE ChatSystem SHALL 显示错误消息并保持 MessageHistory 的完整性
4. WHILE API 请求进行中 THEN THE ChatSystem SHALL 显示加载指示器并禁用输入框
5. WHEN API 响应为空或无效 THEN THE ChatSystem SHALL 显示友好的错误提示

### Requirement 3

**User Story:** 作为用户，我希望 AI 能够根据我的生物信号调整对话风格，以便获得更个性化的交互体验

#### Acceptance Criteria

1. WHEN 用户的 MoodContext 发生变化 THEN THE ChatSystem SHALL 在下次 API 调用时使用新的 SystemPrompt
2. WHEN 发送 API 请求 THEN THE ChatSystem SHALL 将当前 MoodContext 的 SystemPrompt 作为系统消息包含在请求中
3. WHEN MoodContext 变化 THEN THE ChatSystem SHALL 在 MessageHistory 中添加系统通知消息
4. WHILE 保持相同的 MoodContext THEN THE ChatSystem SHALL 使用一致的 SystemPrompt

### Requirement 4

**User Story:** 作为用户，我希望查看完整的对话历史，以便回顾之前的交流内容

#### Acceptance Criteria

1. WHEN 新消息添加到 MessageHistory THEN THE ChatSystem SHALL 自动滚动到最新消息
2. WHEN MessageHistory 包含多条消息 THEN THE ChatSystem SHALL 按时间顺序显示所有消息
3. WHEN 用户消息和 AI 消息显示 THEN THE ChatSystem SHALL 使用不同的视觉样式区分发送者
4. WHEN MessageHistory 超过一定长度 THEN THE ChatSystem SHALL 保持所有历史消息可滚动查看

### Requirement 5

**User Story:** 作为用户，我希望系统能够优雅地处理网络错误和 API 限制，以便在出现问题时了解情况

#### Acceptance Criteria

1. WHEN 网络连接失败 THEN THE ChatSystem SHALL 显示网络错误提示并允许用户重试
2. WHEN API 返回速率限制错误 THEN THE ChatSystem SHALL 显示速率限制提示并建议稍后重试
3. WHEN API 返回认证错误 THEN THE ChatSystem SHALL 显示 API Key 配置错误提示
4. WHEN 请求超时 THEN THE ChatSystem SHALL 取消请求并显示超时提示
5. IF 发生错误 THEN THE ChatSystem SHALL 记录错误详情到控制台以便调试

### Requirement 6

**User Story:** 作为开发者，我希望聊天功能与现有的情绪处理系统无缝集成，以便保持代码的可维护性

#### Acceptance Criteria

1. WHEN ChatInterface 组件接收 currentMood 属性 THEN THE ChatSystem SHALL 使用该属性的 SystemPrompt
2. WHEN 创建 API 服务 THEN THE ChatSystem SHALL 将其封装为独立的模块以便测试和复用
3. WHEN 实现聊天逻辑 THEN THE ChatSystem SHALL 保持与现有 UI 组件的兼容性
4. WHEN 添加新的依赖 THEN THE ChatSystem SHALL 最小化外部依赖以保持项目轻量

### Requirement 7

**User Story:** 作为用户，我希望能够看到 AI 正在"思考"的状态，以便知道系统正在处理我的请求

#### Acceptance Criteria

1. WHEN API 请求开始 THEN THE ChatSystem SHALL 在消息列表中显示"正在输入"指示器
2. WHEN API 响应返回 THEN THE ChatSystem SHALL 移除"正在输入"指示器并显示实际响应
3. WHILE 显示"正在输入"指示器 THEN THE ChatSystem SHALL 使用动画效果提供视觉反馈
4. WHEN 请求失败 THEN THE ChatSystem SHALL 移除"正在输入"指示器
