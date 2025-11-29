export type MoodType = 
  | 'very_calm'      // 非常平静 (20-25)
  | 'calm'           // 平静 (25-30)
  | 'light_tension'  // 轻度紧张 (30-35)
  | 'tension'        // 紧张 (35-40)
  | 'excited'        // 兴奋 (40-50)
  | 'very_excited';  // 极度兴奋 (50+)

export interface MoodConfigItem {
  id: MoodType;
  label: string;
  thresholdMin: number;
  thresholdMax: number;
  avatarSrc: string;
  systemPrompt: string;
  color: string;
  accentColor: string;
  chartColor: string; // 用于统计图表的颜色
}

export interface MoodState {
  currentMood: MoodConfigItem;
  smoothedValue: number;
}

// OpenAI API Configuration
export interface OpenAIConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

// Chat Message Types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// API Request/Response Types
export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
}

// Error Types
export interface ChatError {
  type: 'network' | 'auth' | 'rate_limit' | 'timeout' | 'unknown';
  message: string;
  details?: any;
}

// Mood Analytics Types

// 情绪记录数据结构
export interface MoodRecord {
  id: string;                // 唯一标识符 (timestamp-based)
  moodType: MoodType;        // 情绪类型
  sensorValue: number;       // 平滑后的传感器值
  timestamp: number;         // Unix时间戳 (毫秒)
  date: string;              // ISO日期字符串 (YYYY-MM-DD)
}

// 单个情绪统计
export interface MoodStat {
  moodType: MoodType;        // 情绪类型
  count: number;             // 出现次数
  percentage: number;        // 占比百分比
  rank: number;              // 排名 (1-3)
}

// 每日情绪统计
export interface DailyMoodStats {
  date: string;              // ISO日期字符串 (YYYY-MM-DD)
  topMoods: MoodStat[];      // 前三情绪状态
  totalRecords: number;      // 当日总记录数
}

// 时间范围类型
export type TimeRange = 'today' | 'week' | 'month';

// 时间范围统计
export interface TimeRangeStats {
  range: TimeRange;          // 时间范围
  startDate: string;         // 开始日期 (YYYY-MM-DD)
  endDate: string;           // 结束日期 (YYYY-MM-DD)
  allMoods: MoodStat[];      // 所有情绪统计（按次数降序）
  totalRecords: number;      // 总记录数
  avgDailyChanges: number;   // 平均每日变化次数
  mostFrequentMood: MoodType | null; // 最频繁情绪
}

// 趋势图数据点
export interface TrendDataPoint {
  timestamp: number;         // Unix时间戳
  time: string;              // 格式化时间字符串
  moodType: MoodType;        // 情绪类型
  sensorValue: number;       // 传感器值
  label: string;             // 中文标签
  color: string;             // 颜色代码
}

// Notification Types

// 通知类型
export type NotificationType = 'care' | 'warning' | 'info';

// 通知数据结构（重命名以避免与浏览器Notification API冲突）
export interface MoodNotification {
  id: string;                    // 唯一标识符
  type: NotificationType;        // 通知类型
  message: string;               // 通知消息内容
  timestamp: number;             // 创建时间戳
  duration?: number;             // 显示时长（毫秒），默认10000
  moodType?: MoodType;          // 关联的情绪类型（可选）
}

// 通知状态
export interface NotificationState {
  currentNotification: MoodNotification | null;  // 当前显示的通知
  lastNotificationTime: number;                  // 上次通知时间戳
  notificationHistory: string[];                 // 最近使用的消息模板ID
}

// Voice Chat Types

// 语音设置
export interface VoiceSettings {
  rate: number;      // 语速 (0.1-10)，默认 1
  pitch: number;     // 音调 (0-2)，默认 1
  volume: number;    // 音量 (0-1)，默认 1
  voice: string | null; // 语音名称，默认 null（系统默认）
}

// 语音聊天设置
export interface VoiceChatSettings {
  voiceInputEnabled: boolean;   // 语音输入开关
  voiceOutputEnabled: boolean;  // 语音输出开关
  autoSend: boolean;            // 识别完成后自动发送
  speechSettings: VoiceSettings; // 语音合成设置
}

// 语音错误类型
export type VoiceErrorType = 
  | 'permission'      // 麦克风权限被拒绝
  | 'not_supported'   // 浏览器不支持
  | 'network'         // 网络错误（在线识别服务）
  | 'no_speech'       // 未检测到语音
  | 'aborted'         // 用户中止
  | 'unknown';        // 未知错误

// 语音错误
export interface VoiceError {
  type: VoiceErrorType;
  message: string;
  details?: any;
}
