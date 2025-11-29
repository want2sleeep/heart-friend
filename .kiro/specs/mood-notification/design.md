# 设计文档

## 概述

本设计文档描述了为生物反馈AI伴侣应用添加情绪关怀通知功能的技术实现方案。该功能将在用户情绪达到"极度兴奋"状态时自动推送温和的关心信息，帮助用户及时意识到自己的情绪状态并获得支持。

核心功能包括:奋状态转换
- 生成温和、支持性的关心消息
- 智能通知冷却机制（5分钟间隔）
- 非侵入式的通知界面（10秒自动关闭）
- 多样化的消息模板系统

## 架构

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│  ┌──────────────────┐              ┌──────────────────┐     │
│  │  AvatarView      │              │  ChatInterface   │     │
│  │  + Notification  │              │                  │     │
│  └──────────────────┘              └──────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                    │                           
                    ▼                           
        ┌───────────────────────┐   
        │  useMoodProcessor     │   
        │  (现有)               │   
        └───────────────────────┘   
                    │
                    ▼
        ┌───────────────────────┐
        │  useMoodNotification  │  ← 新增
        │  (通知管理Hook)       │
        └───────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  NotificationToast    │  ← 新增
        │  (通知组件)           │
        └───────────────────────┘
```

### 数据流

```
GSR传感器 → useSerialPort → useMoodProcessor → useMoodNotification
                                                      ↓
                                              检测状态转换
                                                      ↓
                                              检查冷却期
                                                      ↓
                                              生成关心消息
                                                      ↓
                                              NotificationToast
                                                      ↓
                                              用户界面显示
```

## 组件和接口

### 1. 新增类型定义 (src/types.ts)

```typescript
// 通知类型
export type NotificationType = 'care' | 'warning' | 'info';

// 通知数据结构
export interface Notification {
  id: string;                    // 唯一标识符
  type: NotificationType;        // 通知类型
  message: string;               // 通知消息内容
  timestamp: number;             // 创建时间戳
  duration?: number;             // 显示时长（毫秒），默认10000
  moodType?: MoodType;          // 关联的情绪类型（可选）
}

// 通知状态
export interface NotificationState {
  currentNotification: Notification | null;  // 当前显示的通知
  lastNotificationTime: number;              // 上次通知时间戳
  notificationHistory: string[];             // 最近使用的消息模板ID
}
```

### 2. 关心消息模板配置 (src/config/notificationConfig.ts)

```typescript
/**
 * 关心消息模板配置
 * 用于极度兴奋状态的通知
 */

export interface CareMessageTemplate {
  id: string;
  message: string;
}

export const CARE_MESSAGE_TEMPLATES: CareMessageTemplate[] = [
  {
    id: 'care_1',
    message: '我注意到您现在可能感到有些紧张。让我们一起深呼吸，慢慢放松下来吧。'
  },
  {
    id: 'care_2',
    message: '您的情绪波动较大，这很正常。试着放慢节奏，给自己一些时间平静下来。'
  },
  {
    id: 'care_3',
    message: '感觉到压力了吗？不用担心，我在这里陪伴您。深呼吸几次会有帮助的。'
  },
  {
    id: 'care_4',
    message: '您现在可能需要休息一下。闭上眼睛，深呼吸，让身心都放松下来。'
  },
  {
    id: 'care_5',
    message: '我理解您现在的感受。让我们一起尝试一些放松技巧，帮助您恢复平静。'
  }
];

// 通知配置常量
export const NOTIFICATION_CONFIG = {
  COOLDOWN_PERIOD_MS: 5 * 60 * 1000,  // 5分钟冷却期
  AUTO_DISMISS_MS: 10 * 1000,          // 10秒自动关闭
  MAX_HISTORY_SIZE: 5                  // 保留最近5条消息历史
};
```)

### 3. 通知管理Hook (src/hooks/useMoodNotification.ts)

```typescript
/**
 * 情绪通知管理Hook
 * 负责检测极度兴奋状态并触发关心通知
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { MoodType, Notification, NotificationState } from '../types';
import { CARE_MESSAGE_TEMPLATES, NOTIFICATION_CONFIG } from '../config/notificationConfig';

export function useMoodNotification(currentMoodType: MoodType) {
  const [notificationState, setNotificationState] = useState<NotificationState>({
    currentNotification: null,
    lastNotificationTime: 0,
    notificationHistory: []
  });

  const previousMoodRef = useRef<MoodType | null>(null);

  /**
   * 选择一个未最近使用过的消息模板
   */
  const selectMessageTemplate = useCallback((history: string[]): CareMessageTemplate => {
    // 过滤掉最近使用过的模板
    const availableTemplates = CARE_MESSAGE_TEMPLATES.filter(
      template => !history.includes(template.id)
    );

    // 如果所有模板都用过了，重置历史
    const templates = availableTemplates.length > 0 
      ? availableTemplates 
      : CARE_MESSAGE_TEMPLATES;

    // 随机选择一个模板
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  }, []);

  /**
   * 创建通知
   */
  const createNotification = useCallback((message: string, templateId: string): void => {
    const notification: Notification = {
      id: `notification-${Date.now()}`,
      type: 'care',
      message,
      timestamp: Date.now(),
      duration: NOTIFICATION_CONFIG.AUTO_DISMISS_MS,
      moodType: 'very_excited'
    };

    setNotificationState(prev => {
      // 更新历史记录
      const newHistory = [...prev.notificationHistory, templateId];
      if (newHistory.length > NOTIFICATION_CONFIG.MAX_HISTORY_SIZE) {
        newHistory.shift();
      }

      return {
        currentNotification: notification,
        lastNotificationTime: Date.now(),
        notificationHistory: newHistory
      };
    });
  }, []);

  /**
   * 关闭通知
   */
  const dismissNotification = useCallback((): void => {
    setNotificationState(prev => ({
      ...prev,
      currentNotification: null
    }));
  }, []);

  /**
   * 检测情绪状态转换并触发通知
   */
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastNotification = now - notificationState.lastNotificationTime;
    const isInCooldown = timeSinceLastNotification < NOTIFICATION_CONFIG.COOLDOWN_PERIOD_MS;

    // 检查是否转换到极度兴奋状态
    const transitionedToVeryExcited = 
      previousMoodRef.current !== 'very_excited' && 
      currentMoodType === 'very_excited';

    // 触发通知的条件：
    // 1. 转换到极度兴奋状态
    // 2. 不在冷却期内
    if (transitionedToVeryExcited && !isInCooldown) {
      const template = selectMessageTemplate(notificationState.notificationHistory);
      createNotification(template.message, template.id);
    }

    // 更新前一个状态
    previousMoodRef.current = currentMoodType;
  }, [currentMoodType, notificationState.lastNotificationTime, notificationState.notificationHistory, selectMessageTemplate, createNotification]);

  /**
   * 自动关闭通知
   */
  useEffect(() => {
    if (!notificationState.currentNotification) return;

    const timer = setTimeout(() => {
      dismissNotification();
    }, NOTIFICATION_CONFIG.AUTO_DISMISS_MS);

    return () => clearTimeout(timer);
  }, [notificationState.currentNotification, dismissNotification]);

  return {
    notification: notificationState.currentNotification,
    dismissNotification
  };
}
```

### 4. 通知组件 (src/components/NotificationToast.tsx)

```typescript
/**
 * 通知Toast组件
 * 显示非侵入式的通知消息
 */

import React, { useEffect, useState } from 'react';
import { Notification } from '../types';

interface NotificationToastProps {
  notification: Notification | null;
  onDismiss: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (notification) {
      // 淡入动画
      setIsVisible(true);
      setIsExiting(false);
    } else {
      // 淡出动画
      setIsExiting(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsExiting(false);
      }, 300); // 动画持续时间
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (!notification && !isVisible) return null;

  // 根据通知类型选择样式
  const getNotificationStyle = () => {
    switch (notification?.type) {
      case 'care':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-rose-100',
          border: 'border-red-300',
          text: 'text-red-900',
          icon: '💝'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-orange-50 to-amber-100',
          border: 'border-orange-300',
          text: 'text-orange-900',
          icon: '⚠️'
        };
      case 'info':
      default:
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-cyan-100',
          border: 'border-blue-300',
          text: 'text-blue-900',
          icon: 'ℹ️'
        };
    }
  };

  const style = getNotificationStyle();

  return (
    <div
      className={`
        fixed top-4 left-1/2 transform -translate-x-1/2 z-50
        max-w-md w-full mx-4
        transition-all duration-300 ease-in-out
        ${isExiting ? 'opacity-0 translate-y-[-20px]' : 'opacity-100 translate-y-0'}
      `}
    >
      <div
        className={`
          ${style.bg} ${style.border} ${style.text}
          border-2 rounded-xl shadow-lg
          p-4 pr-12
          backdrop-blur-md
          relative
        `}
      >
        {/* 图标 */}
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">{style.icon}</span>
          
          {/* 消息内容 */}
          <p className="text-sm font-medium leading-relaxed flex-1">
            {notification?.message}
          </p>
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={onDismiss}
          className={`
            absolute top-3 right-3
            w-8 h-8 rounded-full
            flex items-center justify-center
            ${style.text} hover:bg-white/50
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-red-400
          `}
          aria-label="关闭通知"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        {/* 进度条 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-b-xl overflow-hidden">
          <div
            className="h-full bg-red-400 animate-shrink"
            style={{
              animation: `shrink ${notification?.duration || 10000}ms linear`
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        .animate-shrink {
          animation: shrink 10s linear;
        }
      `}</style>
    </div>
  );
};
```

### 5. 集成到主应用 (App.tsx 修改)

```typescript
// 在 App.tsx 中添加通知功能

import { useMoodNotification } from './hooks/useMoodNotification';
import { NotificationToast } from './components/NotificationToast';

function App() {
  // ... 现有代码 ...
  
  const moodState = useMoodProcessor(latestValue);
  
  // 新增：通知管理
  const { notification, dismissNotification } = useMoodNotification(
    moodState.currentMood.id
  );

  return (
    <div className="app">
      {/* 通知组件 */}
      <NotificationToast 
        notification={notification} 
        onDismiss={dismissNotification} 
      />
      
      {/* 现有组件 */}
      {/* ... */}
    </div>
  );
}
```

## 数据模型

### 通知对象 (Notification)

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| id | string | 唯一标识符 | "notification-1701234567890" |
| type | NotificationType | 通知类型 | "care" |
| message | string | 消息内容 | "我注意到您现在可能感到有些紧张..." |
| timestamp | number | 创建时间戳 | 1701234567890 |
| duration | number | 显示时长(毫秒) | 10000 |
| moodType | MoodType | 关联情绪类型 | "very_excited" |

### 通知状态 (NotificationState)

| 字段 | 类型 | 说明 |
|------|------|------|
| currentNotification | Notification \| null | 当前显示的通知 |
| lastNotificationTime | number | 上次通知时间戳 |
| notificationHistory | string[] | 最近使用的消息模板ID |

## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*


### 属性 1: 状态转换触发通知

*对于任何*情绪状态序列，当情绪从非极度兴奋状态转换到极度兴奋状态时，系统应该创建一个新的通知。

**验证需求: 1.1, 1.3**

### 属性 2: 相同状态不重复通知

*对于任何*连续的极度兴奋状态（无状态转换），系统不应该创建新的通知。

**验证需求: 1.2**

### 属性 3: 往返转换重新触发

*对于任何*包含"极度兴奋 → 其他状态 → 极度兴奋"模式的情绪序列，系统应该在第二次进入极度兴奋时再次触发通知（假设不在冷却期内）。

**验证需求: 1.4**

### 属性 4: 通知时间戳记录

*对于任何*被创建的通知，该通知对象必须包含有效的时间戳字段（大于0的数字）。

**验证需求: 1.5**

### 属性 5: 消息包含缓解建议

*对于任何*生成的关心消息，消息内容应该包含缓解建议相关的关键词（如"呼吸"、"放松"、"平静"等）。

**验证需求: 2.3**

### 属性 6: 消息使用中文

*对于任何*生成的关心消息，消息字符串应该包含中文字符。

**验证需求: 2.4**

### 属性 7: 消息长度限制

*对于任何*生成的关心消息，消息长度不应超过100个字符。

**验证需求: 2.5**

### 属性 8: 冷却期阻止通知

*对于任何*在上次通知后5分钟内的极度兴奋状态转换，系统不应该创建新的通知。

**验证需求: 3.1**

### 属性 9: 冷却期后允许通知

*对于任何*在上次通知后超过5分钟的极度兴奋状态转换，系统应该允许创建新的通知。

**验证需求: 3.2**

### 属性 10: 时间戳比较准确性

*对于任何*两个时间戳，冷却期计算应该准确反映它们之间的时间差（以毫秒为单位）。

**验证需求: 3.3**

### 属性 11: 消息模板选择有效性

*对于任何*消息生成请求，返回的消息应该存在于预定义的消息模板列表中。

**验证需求: 5.1**

### 属性 12: 消息模板包含必要元素

*对于任何*消息模板，该模板应该包含关心元素和建议元素的关键词。

**验证需求: 5.3**

### 属性 13: 消息模板避免重复

*对于任何*连续的多次通知（假设历史记录未满），系统应该尽量选择不同的消息模板，避免连续使用相同模板。

**验证需求: 5.4**

## 错误处理

### 时间戳异常

**场景**: 系统时间异常或时间戳为负数

**处理策略**:
- 使用 `Date.now()` 确保时间戳始终有效
- 在比较时间戳前进行有效性检查
- 异常情况下默认允许通知（安全失败）

```typescript
const timeSinceLastNotification = Math.max(0, now - lastNotificationTime);
```

### 消息模板为空

**场景**: 配置文件中没有消息模板

**处理策略**:
- 在配置文件中至少定义3个模板
- 运行时检查模板数组长度
- 如果为空，使用默认消息

```typescript
if (CARE_MESSAGE_TEMPLATES.length === 0) {
  return { id: 'default', message: '请注意休息，深呼吸放松一下。' };
}
```

### 通知组件卸载

**场景**: 通知显示期间组件被卸载

**处理策略**:
- 使用 `useEffect` 清理定时器
- 防止内存泄漏

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    dismissNotification();
  }, duration);
  
  return () => clearTimeout(timer); // 清理
}, [notification]);
```

### 快速状态切换

**场景**: 情绪状态在短时间内快速切换

**处理策略**:
- 使用 `useRef` 跟踪前一个状态
- 只在真正的状态转换时触发通知
- 冷却期机制防止过度通知

## 测试策略

### 单元测试

使用 **Vitest** 和 **React Testing Library** 作为测试框架。

**测试范围**:

1. **useMoodNotification Hook 测试**
   - 状态转换检测
   - 冷却期逻辑
   - 消息模板选择
   - 通知创建和关闭
   - 历史记录管理

2. **NotificationToast 组件测试**
   - 通知显示和隐藏
   - 自动关闭功能
   - 手动关闭功能
   - 样式和动画
   - 可访问性

3. **消息模板配置测试**
   - 模板数量验证
   - 消息长度验证
   - 中文字符验证
   - 关键词验证

**示例测试**:

```typescript
describe('useMoodNotification', () => {
  it('should create notification when transitioning to very_excited', () => {
    const { result, rerender } = renderHook(
      ({ mood }) => useMoodNotification(mood),
      { initialProps: { mood: 'calm' as MoodType } }
    );

    expect(result.current.notification).toBeNull();

    // 转换到极度兴奋
    rerender({ mood: 'very_excited' as MoodType });

    expect(result.current.notification).not.toBeNull();
    expect(result.current.notification?.type).toBe('care');
  });

  it('should not create duplicate notification for same state', () => {
    const { result, rerender } = renderHook(
      ({ mood }) => useMoodNotification(mood),
      { initialProps: { mood: 'very_excited' as MoodType } }
    );

    const firstNotification = result.current.notification;

    // 保持在极度兴奋状态
    rerender({ mood: 'very_excited' as MoodType });

    expect(result.current.notification).toBe(firstNotification);
  });

  it('should respect cooldown period', () => {
    jest.useFakeTimers();
    
    const { result, rerender } = renderHook(
      ({ mood }) => useMoodNotification(mood),
      { initialProps: { mood: 'calm' as MoodType } }
    );

    // 第一次转换
    rerender({ mood: 'very_excited' as MoodType });
    expect(result.current.notification).not.toBeNull();

    // 转换回去
    rerender({ mood: 'calm' as MoodType });
    
    // 立即再次转换（在冷却期内）
    rerender({ mood: 'very_excited' as MoodType });
    
    // 应该没有新通知（冷却期内）
    // 需要验证通知时间戳没有更新
    
    // 前进5分钟
    jest.advanceTimersByTime(5 * 60 * 1000 + 1000);
    
    // 再次转换
    rerender({ mood: 'calm' as MoodType });
    rerender({ mood: 'very_excited' as MoodType });
    
    // 现在应该有新通知
    expect(result.current.notification).not.toBeNull();
    
    jest.useRealTimers();
  });
});
```

### 属性测试

使用 **fast-check** 库进行属性测试。

**配置**: 每个属性测试运行至少100次迭代。

**测试范围**:

1. **属性 1: 状态转换触发通知**
   ```typescript
   // Feature: mood-notification, Property 1: 状态转换触发通知
   // Validates: Requirements 1.1, 1.3
   it('should trigger notification on transition to very_excited', () => {
     fc.assert(
       fc.property(
         fc.constantFrom(...allMoodTypes.filter(m => m !== 'very_excited')),
         (previousMood) => {
           // 测试从任何非极度兴奋状态转换到极度兴奋
           // 验证通知被创建
         }
       ),
       { numRuns: 100 }
     );
   });
   ```

2. **属性 7: 消息长度限制**
   ```typescript
   // Feature: mood-notification, Property 7: 消息长度限制
   // Validates: Requirements 2.5
   it('should keep all messages under 100 characters', () => {
     fc.assert(
       fc.property(
         fc.constantFrom(...CARE_MESSAGE_TEMPLATES),
         (template) => {
           expect(template.message.length).toBeLessThanOrEqual(100);
         }
       ),
       { numRuns: 100 }
     );
   });
   ```

3. **属性 8: 冷却期阻止通知**
   ```typescript
   // Feature: mood-notification, Property 8: 冷却期阻止通知
   // Validates: Requirements 3.1
   it('should block notifications within cooldown period', () => {
     fc.assert(
       fc.property(
         fc.integer({ min: 0, max: 5 * 60 * 1000 - 1 }),
         (timeDelta) => {
           // 测试在冷却期内的各种时间点
           // 验证不会创建新通知
         }
       ),
       { numRuns: 100 }
     );
   });
   ```

4. **属性 13: 消息模板避免重复**
   ```typescript
   // Feature: mood-notification, Property 13: 消息模板避免重复
   // Validates: Requirements 5.4
   it('should avoid consecutive duplicate messages', () => {
     fc.assert(
       fc.property(
         fc.integer({ min: 2, max: 10 }),
         (numNotifications) => {
           // 生成多次通知
           // 验证连续的消息不相同（在历史记录未满的情况下）
         }
       ),
       { numRuns: 100 }
     );
   });
   ```

**生成器定义**:

```typescript
// 情绪类型生成器
const moodTypeArbitrary = fc.constantFrom(
  'very_calm', 'calm', 'light_tension', 
  'tension', 'excited', 'very_excited'
);

// 情绪序列生成器
const moodSequenceArbitrary = fc.array(moodTypeArbitrary, { 
  minLength: 2, 
  maxLength: 20 
});

// 时间戳生成器
const timestampArbitrary = fc.integer({ 
  min: 0, 
  max: Date.now() 
});
```

### 集成测试

**测试范围**:
- 完整的通知流程：情绪变化 → 检测 → 通知创建 → 显示 → 自动关闭
- 与现有情绪处理系统的集成
- 多次状态转换的行为

### 边缘情况测试

**重点测试**:
- 应用启动时的初始状态
- 快速连续的状态切换
- 冷却期边界（恰好5分钟）
- 消息历史记录满时的行为
- 所有模板都用过后的选择逻辑
- 通知显示期间状态再次变化

## 性能考虑

### 通知频率控制

- 5分钟冷却期防止过度通知
- 使用 `useRef` 避免不必要的重渲染
- 状态转换检测高效（O(1)复杂度）

### 消息模板选择优化

- 预定义模板列表（常量）
- 简单的随机选择算法
- 历史记录限制为5条

### React性能优化

- 使用 `useCallback` 缓存函数
- 使用 `useRef` 存储前一个状态
- 条件渲染减少DOM操作
- CSS动画而非JavaScript动画

### 内存管理

- 及时清理定时器
- 限制历史记录大小
- 单例通知（同时只显示一个）

## 实现注意事项

### 时间处理

- 使用 `Date.now()` 获取当前时间戳
- 所有时间计算使用毫秒
- 考虑系统时间变化的影响

### 状态管理

- 使用 `useState` 管理通知状态
- 使用 `useRef` 跟踪前一个情绪状态
- 避免状态更新导致的无限循环

### 动画和过渡

- 使用CSS过渡实现淡入淡出
- 进度条动画使用CSS animation
- 确保动画流畅（60fps）

### 可访问性

- 通知组件包含适当的ARIA标签
- 关闭按钮有明确的 `aria-label`
- 支持键盘操作（ESC键关闭）
- 颜色对比度符合WCAG标准

### 浏览器兼容性

- CSS动画在所有现代浏览器中可用
- 使用标准的React API
- 避免使用实验性特性

## 未来扩展

### 短期扩展（v1.1）

- 支持其他情绪状态的通知（如长时间紧张）
- 通知历史记录查看
- 用户自定义通知设置

### 中期扩展（v2.0）

- 通知优先级系统
- 多通知队列管理
- 声音提示选项
- 通知统计分析

### 长期扩展（v3.0）

- AI生成个性化关心消息
- 基于用户反馈的消息优化
- 跨设备通知同步
- 与日历/提醒系统集成
