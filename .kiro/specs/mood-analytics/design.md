# 设计文档

## 概述

本设计文档描述了为生物反馈AI伴侣应用添加情绪数据分析功能的技术实现方案。该功能将自动记录用户的情绪状态变化，在主界面展示每日情绪统计分析，并提供独立的详细数据分析页面，展示趋势图、周报、月报等深度分析，帮助用户全面了解自己的情绪模式。

核心功能包括：
- 自动记录情绪状态变化到本地存储
- 实时计算和展示当日前三情绪状态
- 支持6种细粒度情绪分类（从"非常平静"到"极度兴奋"）
- 高效的存储管理和数据清理机制
- 独立的详细分析页面，支持页面路由和导航
- 情绪趋势图表可视化（折线图/面积图）
- 时间范围切换（今日/本周/本月）
- 周报和月报统计分析

## 架构

### 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         App.tsx (路由容器)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  主页面 (/)                                               │  │
│  │  ┌──────────────────┐        ┌──────────────────┐       │  │
│  │  │  AvatarView      │        │  ChatInterface   │       │  │
│  │  │  + MoodAnalytics │ (可点击)│                  │       │  │
│  │  └──────────────────┘        └──────────────────┘       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  详细分析页面 (/analytics) ← 新增                        │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  MoodAnalyticsDetail                               │  │  │
│  │  │  - 返回按钮                                        │  │  │
│  │  │  - 时间范围选择器 (今日/本周/本月)                │  │  │
│  │  │  - 趋势图 (Recharts)                              │  │  │
│  │  │  - 周报/月报统计                                   │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                    │                           │
                    ▼                           ▼
        ┌───────────────────────┐   ┌──────────────────┐
        │  useMoodProcessor     │   │   useChatAPI     │
        │  (现有)               │   │   (现有)         │
        └───────────────────────┘   └──────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  useMoodAnalytics     │  ← 扩展
        │  (情绪分析Hook)       │
        └───────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  moodStorageService   │  ← 扩展
        │  (本地存储服务)       │
        │  + getRecordsByRange  │
        │  + calculateStats     │
        └───────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  localStorage         │
        │  (浏览器API)          │
        └───────────────────────┘
```

### 数据流

**数据记录流程：**
```
GSR传感器 → useSerialPort → useMoodProcessor → useMoodAnalytics
                                                      ↓
                                              moodStorageService
                                                      ↓
                                                localStorage
```

**主界面显示流程：**
```
localStorage → moodStorageService → useMoodAnalytics → MoodAnalytics组件
                                                              ↓
                                                        用户点击
                                                              ↓
                                                      路由导航到 /analytics
```

**详细分析页面流程：**
```
localStorage → moodStorageService → getRecordsByRange
                                           ↓
                                    calculateStats
                                           ↓
                              MoodAnalyticsDetail组件
                                           ↓
                    ┌──────────────────────┼──────────────────────┐
                    ▼                      ▼                      ▼
              时间范围选择器          趋势图(Recharts)        周报/月报统计
```

## 组件和接口

### 1. 新增类型定义 (src/types.ts)

```typescript
// 扩展情绪类型以支持6种状态
export type MoodType = 
  | 'very_calm'      // 非常平静 (20-25)
  | 'calm'           // 平静 (25-30)
  | 'light_tension'  // 轻度紧张 (30-35)
  | 'tension'        // 紧张 (35-40)
  | 'excited'        // 兴奋 (40-50)
  | 'very_excited';  // 极度兴奋 (50+)

// 情绪记录数据结构
export interface MoodRecord {
  id: string;                // 唯一标识符 (timestamp-based)
  moodType: MoodType;        // 情绪类型
  sensorValue: number;       // 平滑后的传感器值
  timestamp: number;         // Unix时间戳 (毫秒)
  date: string;              // ISO日期字符串 (YYYY-MM-DD)
}

// 每日情绪统计
export interface DailyMoodStats {
  date: string;              // ISO日期字符串 (YYYY-MM-DD)
  topMoods: MoodStat[];      // 前三情绪状态
  totalRecords: number;      // 当日总记录数
}

// 单个情绪统计
export interface MoodStat {
  moodType: MoodType;        // 情绪类型
  count: number;             // 出现次数
  percentage: number;        // 占比百分比
  rank: number;              // 排名 (1-3)
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
```

### 2. 情绪配置更新 (src/config/moodConfig.ts)

需要扩展现有的 `MOOD_CONFIG` 以支持6种情绪状态：

```typescript
export const MOOD_CONFIG: Record<MoodType, MoodConfigItem> = {
  very_calm: {
    id: 'very_calm',
    label: '非常平静',
    thresholdMin: 20,
    thresholdMax: 25,
    avatarSrc: 'https://picsum.photos/id/64/800/800',
    systemPrompt: "你是一位极其温和、平静的禅师。用最简洁、诗意的语言回应，帮助用户保持深度放松状态。",
    color: 'bg-gradient-to-br from-emerald-50 to-teal-100',
    accentColor: 'text-emerald-700',
    chartColor: '#10b981' // 翠绿色
  },
  calm: {
    id: 'calm',
    label: '平静',
    thresholdMin: 25,
    thresholdMax: 30,
    avatarSrc: 'https://picsum.photos/id/64/800/800',
    systemPrompt: "你是一位温和、舒缓的禅师。用自然的隐喻，帮助用户保持放松。保持简洁和诗意。",
    color: 'bg-gradient-to-br from-teal-50 to-cyan-100',
    accentColor: 'text-teal-700',
    chartColor: '#14b8a6' // 青色
  },
  light_tension: {
    id: 'light_tension',
    label: '轻度紧张',
    thresholdMin: 30,
    thresholdMax: 35,
    avatarSrc: 'https://picsum.photos/id/1/800/800',
    systemPrompt: "你是一位友好、支持性的助手。提供清晰、实用的建议，帮助用户保持专注和平衡。",
    color: 'bg-gradient-to-br from-amber-50 to-yellow-100',
    accentColor: 'text-amber-700',
    chartColor: '#f59e0b' // 琥珀色
  },
  tension: {
    id: 'tension',
    label: '紧张',
    thresholdMin: 35,
    thresholdMax: 40,
    avatarSrc: 'https://picsum.photos/id/1/800/800',
    systemPrompt: "你是一位敏锐、高效的分析助手。提供简洁、数据驱动的答案。专注于生产力和清晰度。不使用填充词。",
    color: 'bg-gradient-to-br from-orange-50 to-amber-100',
    accentColor: 'text-orange-700',
    chartColor: '#f97316' // 橙色
  },
  excited: {
    id: 'excited',
    label: '兴奋',
    thresholdMin: 40,
    thresholdMax: 50,
    avatarSrc: 'https://picsum.photos/id/117/800/800',
    systemPrompt: "用户处于高度兴奋状态。你是一位富有同理心的治疗顾问。优先考虑缓和情绪。立即建议呼吸练习。使用温暖、令人安心的语气。",
    color: 'bg-gradient-to-br from-rose-50 to-pink-100',
    accentColor: 'text-rose-700',
    chartColor: '#f43f5e' // 玫瑰色
  },
  very_excited: {
    id: 'very_excited',
    label: '极度兴奋',
    thresholdMin: 50,
    thresholdMax: 100,
    avatarSrc: 'https://picsum.photos/id/117/800/800',
    systemPrompt: "用户处于极度兴奋/压力状态。你是一位紧急心理干预专家。立即引导深呼吸和放松技巧。使用极其温和、缓慢、安抚的语气。",
    color: 'bg-gradient-to-br from-red-50 to-rose-100',
    accentColor: 'text-red-700',
    chartColor: '#dc2626' // 红色
  }
};
```

### 3. 本地存储服务 (src/services/moodStorage.ts)

```typescript
/**
 * 情绪数据本地存储服务
 * 负责所有与localStorage的交互
 */

const STORAGE_KEY = 'mood_records';
const MAX_RECORDS = 1000;

export const moodStorageService = {
  /**
   * 保存情绪记录
   */
  saveRecord(record: MoodRecord): void {
    const records = this.getAllRecords();
    records.push(record);
    
    // 如果超过最大记录数，删除最旧的记录
    if (records.length > MAX_RECORDS) {
      records.splice(0, records.length - MAX_RECORDS);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  },

  /**
   * 获取所有记录
   */
  getAllRecords(): MoodRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data) as MoodRecord[];
    } catch (error) {
      console.error('Failed to load mood records:', error);
      return [];
    }
  },

  /**
   * 获取指定日期的记录
   */
  getRecordsByDate(date: string): MoodRecord[] {
    const allRecords = this.getAllRecords();
    return allRecords.filter(record => record.date === date);
  },

  /**
   * 清除所有记录
   */
  clearAllRecords(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * 清除指定日期之前的记录
   */
  clearRecordsBefore(date: string): void {
    const allRecords = this.getAllRecords();
    const filtered = allRecords.filter(record => record.date >= date);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
};
```

### 4. 情绪分析Hook (src/hooks/useMoodAnalytics.ts)

```typescript
/**
 * 情绪分析自定义Hook
 * 负责记录情绪变化和计算统计数据
 */

export function useMoodAnalytics(
  currentMood: MoodConfigItem,
  smoothedValue: number
) {
  const [dailyStats, setDailyStats] = useState<DailyMoodStats | null>(null);
  const previousMoodRef = useRef<MoodType | null>(null);
  const lastRecordTimeRef = useRef<number>(0);

  // 最小记录间隔（防止频繁记录）
  const MIN_RECORD_INTERVAL_MS = 5000; // 5秒

  /**
   * 记录情绪变化
   */
  useEffect(() => {
    const currentMoodType = currentMood.id as MoodType;
    const now = Date.now();
    
    // 检查是否应该记录
    const shouldRecord = 
      previousMoodRef.current !== currentMoodType && // 情绪发生变化
      smoothedValue >= 20 && // 有效数据范围
      now - lastRecordTimeRef.current >= MIN_RECORD_INTERVAL_MS; // 间隔足够

    if (shouldRecord) {
      const record: MoodRecord = {
        id: `${now}-${currentMoodType}`,
        moodType: currentMoodType,
        sensorValue: smoothedValue,
        timestamp: now,
        date: new Date(now).toISOString().split('T')[0] // YYYY-MM-DD
      };

      moodStorageService.saveRecord(record);
      previousMoodRef.current = currentMoodType;
      lastRecordTimeRef.current = now;

      // 更新统计
      updateDailyStats();
    }
  }, [currentMood.id, smoothedValue]);

  /**
   * 计算当日统计
   */
  const updateDailyStats = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = moodStorageService.getRecordsByDate(today);

    if (todayRecords.length === 0) {
      setDailyStats(null);
      return;
    }

    // 统计每种情绪出现次数
    const moodCounts = new Map<MoodType, number>();
    todayRecords.forEach(record => {
      moodCounts.set(
        record.moodType,
        (moodCounts.get(record.moodType) || 0) + 1
      );
    });

    // 转换为数组并排序
    const sortedMoods = Array.from(moodCounts.entries())
      .map(([moodType, count]) => ({
        moodType,
        count,
        percentage: (count / todayRecords.length) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3) // 取前三
      .map((stat, index) => ({
        ...stat,
        rank: index + 1
      }));

    setDailyStats({
      date: today,
      topMoods: sortedMoods,
      totalRecords: todayRecords.length
    });
  }, []);

  /**
   * 初始化和定时更新
   */
  useEffect(() => {
    // 初始加载
    updateDailyStats();

    // 每分钟更新一次统计
    const interval = setInterval(updateDailyStats, 60000);

    // 检查日期变化（午夜刷新）
    const checkDateChange = setInterval(() => {
      const currentDate = new Date().toISOString().split('T')[0];
      if (dailyStats && dailyStats.date !== currentDate) {
        updateDailyStats();
      }
    }, 60000); // 每分钟检查

    return () => {
      clearInterval(interval);
      clearInterval(checkDateChange);
    };
  }, [updateDailyStats, dailyStats]);

  return {
    dailyStats,
    refreshStats: updateDailyStats
  };
}
```

### 5. 情绪统计组件 (src/components/MoodAnalytics.tsx)

```typescript
/**
 * 情绪统计展示组件
 * 显示当日前三情绪状态
 */

interface MoodAnalyticsProps {
  dailyStats: DailyMoodStats | null;
}

export const MoodAnalytics: React.FC<MoodAnalyticsProps> = ({ dailyStats }) => {
  if (!dailyStats || dailyStats.topMoods.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-md p-4 rounded-xl border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">
          📊 今日情绪统计
        </h3>
        <p className="text-xs text-slate-500">
          暂无数据，开始记录您的情绪状态...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-md p-4 rounded-xl border border-slate-200">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">
        📊 今日情绪统计 (前三)
      </h3>
      
      <div className="space-y-2">
        {dailyStats.topMoods.map((stat) => {
          const config = MOOD_CONFIG[stat.moodType];
          return (
            <div key={stat.moodType} className="flex items-center gap-2">
              {/* 排名徽章 */}
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${stat.rank === 1 ? 'bg-yellow-400 text-yellow-900' : ''}
                ${stat.rank === 2 ? 'bg-gray-300 text-gray-700' : ''}
                ${stat.rank === 3 ? 'bg-amber-600 text-amber-100' : ''}
              `}>
                {stat.rank}
              </div>

              {/* 情绪名称和进度条 */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-medium ${config.accentColor}`}>
                    {config.label}
                  </span>
                  <span className="text-xs text-slate-600">
                    {stat.count}次 ({stat.percentage.toFixed(1)}%)
                  </span>
                </div>
                
                {/* 进度条 */}
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${stat.percentage}%`,
                      backgroundColor: config.chartColor
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-200">
        <p className="text-xs text-slate-500">
          总记录: {dailyStats.totalRecords} 次
        </p>
      </div>
    </div>
  );
};
```

### 6. 扩展本地存储服务 (src/services/moodStorage.ts)

在现有服务基础上添加新方法：

```typescript
/**
 * 获取指定时间范围的记录
 */
getRecordsByRange(startDate: string, endDate: string): MoodRecord[] {
  const allRecords = this.getAllRecords();
  return allRecords.filter(
    record => record.date >= startDate && record.date <= endDate
  );
},

/**
 * 计算时间范围统计
 */
calculateTimeRangeStats(
  range: TimeRange,
  records: MoodRecord[]
): TimeRangeStats {
  if (records.length === 0) {
    return {
      range,
      startDate: '',
      endDate: '',
      allMoods: [],
      totalRecords: 0,
      avgDailyChanges: 0,
      mostFrequentMood: null
    };
  }

  // 计算日期范围
  const dates = [...new Set(records.map(r => r.date))].sort();
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];

  // 统计每种情绪出现次数
  const moodCounts = new Map<MoodType, number>();
  records.forEach(record => {
    moodCounts.set(
      record.moodType,
      (moodCounts.get(record.moodType) || 0) + 1
    );
  });

  // 转换为数组并排序
  const allMoods = Array.from(moodCounts.entries())
    .map(([moodType, count]) => ({
      moodType,
      count,
      percentage: (count / records.length) * 100,
      rank: 0 // 稍后设置
    }))
    .sort((a, b) => b.count - a.count)
    .map((stat, index) => ({
      ...stat,
      rank: index + 1
    }));

  // 计算平均每日变化次数
  const dayCount = dates.length;
  const avgDailyChanges = records.length / dayCount;

  // 最频繁情绪
  const mostFrequentMood = allMoods.length > 0 ? allMoods[0].moodType : null;

  return {
    range,
    startDate,
    endDate,
    allMoods,
    totalRecords: records.length,
    avgDailyChanges,
    mostFrequentMood
  };
},

/**
 * 获取趋势图数据
 */
getTrendData(records: MoodRecord[]): TrendDataPoint[] {
  return records.map(record => {
    const config = MOOD_CONFIG[record.moodType];
    const date = new Date(record.timestamp);
    
    return {
      timestamp: record.timestamp,
      time: date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      moodType: record.moodType,
      sensorValue: record.sensorValue,
      label: config.label,
      color: config.chartColor
    };
  }).sort((a, b) => a.timestamp - b.timestamp);
}
```

### 7. 路由配置

使用 **React Router** 进行页面路由管理：

```typescript
// App.tsx 中的路由配置
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/analytics" element={<MoodAnalyticsDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 8. 更新 MoodAnalytics 组件添加点击导航

```typescript
import { useNavigate } from 'react-router-dom';

export const MoodAnalytics: React.FC<MoodAnalyticsProps> = ({ dailyStats }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/analytics');
  };

  return (
    <div 
      className="bg-white/60 backdrop-blur-md p-4 rounded-xl border border-slate-200 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
    >
      {/* 现有内容 */}
      {/* 添加视觉提示 */}
      <div className="mt-2 text-center">
        <span className="text-xs text-slate-400">点击查看详细分析 →</span>
      </div>
    </div>
  );
};
```

### 9. 详细分析页面组件 (src/components/MoodAnalyticsDetail.tsx)

```typescript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { moodStorageService } from '../services/moodStorage';
import { MOOD_CONFIG } from '../config/moodConfig';
import type { TimeRange, TimeRangeStats, TrendDataPoint } from '../types';

export const MoodAnalyticsDetail: React.FC = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [stats, setStats] = useState<TimeRangeStats | null>(null);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(false);

  // 计算日期范围
  const getDateRange = (range: TimeRange): { start: string; end: string } => {
    const now = new Date();
    const end = now.toISOString().split('T')[0];
    
    let start: string;
    if (range === 'today') {
      start = end;
    } else if (range === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      start = weekAgo.toISOString().split('T')[0];
    } else { // month
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      start = monthAgo.toISOString().split('T')[0];
    }
    
    return { start, end };
  };

  // 加载数据
  useEffect(() => {
    setLoading(true);
    
    const { start, end } = getDateRange(timeRange);
    const records = moodStorageService.getRecordsByRange(start, end);
    
    // 计算统计
    const calculatedStats = moodStorageService.calculateTimeRangeStats(timeRange, records);
    setStats(calculatedStats);
    
    // 获取趋势数据
    const trend = moodStorageService.getTrendData(records);
    setTrendData(trend);
    
    setLoading(false);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* 头部 */}
      <div className="max-w-6xl mx-auto mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <span>←</span>
          <span>返回主页</span>
        </button>
        
        <h1 className="text-2xl font-bold text-slate-800 mt-4">
          情绪数据分析
        </h1>
      </div>

      {/* 时间范围选择器 */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex gap-2">
            {(['today', 'week', 'month'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  timeRange === range
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {range === 'today' ? '今日' : range === 'week' ? '本周' : '本月'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 空状态 */}
      {!stats || stats.totalRecords === 0 ? (
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <p className="text-slate-500">该时间范围内暂无数据</p>
          </div>
        </div>
      ) : (
        <>
          {/* 概览卡片 */}
          <div className="max-w-6xl mx-auto mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-slate-500 mb-1">总记录数</p>
              <p className="text-2xl font-bold text-slate-800">{stats.totalRecords}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-slate-500 mb-1">平均每日变化</p>
              <p className="text-2xl font-bold text-slate-800">
                {stats.avgDailyChanges.toFixed(1)} 次
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-slate-500 mb-1">最频繁情绪</p>
              <p className="text-2xl font-bold" style={{ color: stats.mostFrequentMood ? MOOD_CONFIG[stats.mostFrequentMood].chartColor : '#000' }}>
                {stats.mostFrequentMood ? MOOD_CONFIG[stats.mostFrequentMood].label : '-'}
              </p>
            </div>
          </div>

          {/* 趋势图 */}
          <div className="max-w-6xl mx-auto mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                情绪趋势图
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    label={{ value: '传感器值', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as TrendDataPoint;
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                            <p className="text-sm font-semibold">{data.label}</p>
                            <p className="text-xs text-slate-600">{data.time}</p>
                            <p className="text-xs text-slate-600">传感器值: {data.sensorValue}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sensorValue" 
                    stroke="#3b82f6" 
                    fill="#93c5fd" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 情绪分布 */}
          <div className="max-w-6xl mx-auto mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                {timeRange === 'today' ? '今日' : timeRange === 'week' ? '本周' : '本月'}情绪分布
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 饼图 */}
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.allMoods}
                      dataKey="count"
                      nameKey="moodType"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => MOOD_CONFIG[entry.moodType].label}
                    >
                      {stats.allMoods.map((entry) => (
                        <Cell 
                          key={entry.moodType} 
                          fill={MOOD_CONFIG[entry.moodType].chartColor} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                {/* 统计列表 */}
                <div className="space-y-3">
                  {stats.allMoods.map((stat) => {
                    const config = MOOD_CONFIG[stat.moodType];
                    return (
                      <div key={stat.moodType} className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: config.chartColor }}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-slate-700">
                              {config.label}
                            </span>
                            <span className="text-sm text-slate-600">
                              {stat.count}次 ({stat.percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full transition-all duration-500"
                              style={{
                                width: `${stat.percentage}%`,
                                backgroundColor: config.chartColor
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
```

## 数据模型

### 情绪记录 (MoodRecord)

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| id | string | 唯一标识符 | "1701234567890-calm" |
| moodType | MoodType | 情绪类型 | "calm" |
| sensorValue | number | 平滑后的传感器值 | 28 |
| timestamp | number | Unix时间戳(毫秒) | 1701234567890 |
| date | string | ISO日期 | "2024-11-29" |

### 本地存储结构

```json
{
  "mood_records": [
    {
      "id": "1701234567890-very_calm",
      "moodType": "very_calm",
      "sensorValue": 23,
      "timestamp": 1701234567890,
      "date": "2024-11-29"
    },
    {
      "id": "1701234572345-calm",
      "moodType": "calm",
      "sensorValue": 28,
      "timestamp": 1701234572345,
      "date": "2024-11-29"
    }
  ]
}
```


## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*


### 属性 1: 情绪变化记录完整性

*对于任何*情绪状态变化序列，当情绪从一种类型变化到另一种类型时，本地存储中应该存在对应的情绪记录。

**验证需求: 1.1**

### 属性 2: 情绪记录结构完整性

*对于任何*保存的情绪记录，该记录必须包含情绪类型(moodType)、时间戳(timestamp)、传感器值(sensorValue)和日期(date)字段。

**验证需求: 1.2**

### 属性 3: 序列化往返一致性

*对于任何*有效的情绪记录，将其序列化为JSON后再反序列化，应该得到等价的记录对象。

**验证需求: 1.3**

### 属性 4: 日期过滤正确性

*对于任何*日期和情绪记录集合，按日期过滤后的结果应该只包含该日期(00:00:00到23:59:59)范围内的记录。

**验证需求: 2.1**

### 属性 5: 情绪统计计数和排序正确性

*对于任何*情绪记录集合，计算出的统计数据应该：(1)正确统计每种情绪的出现次数，(2)按次数降序排序，(3)只返回前三名。

**验证需求: 2.2, 2.3**

### 属性 6: 零计数过滤

*对于任何*情绪统计结果，所有出现次数为零的情绪状态应该被排除，不出现在最终结果中。

**验证需求: 2.4**

### 属性 7: 少于三种情绪的处理

*对于任何*包含少于三种不同情绪的记录集合，统计结果应该只包含实际存在的情绪种类数量，而不是强制填充到三个。

**验证需求: 2.6**

### 属性 8: 情绪颜色映射正确性

*对于任何*情绪类型，渲染时使用的颜色代码应该与配置中定义的chartColor字段匹配。

**验证需求: 3.1**

### 属性 9: 统计显示信息完整性

*对于任何*情绪统计项，渲染的字符串应该包含中文名称、出现次数和排名信息。

**验证需求: 3.2**

### 属性 10: 中文标签正确性

*对于任何*情绪类型，其对应的中文标签应该是以下之一：非常平静、平静、轻度紧张、紧张、兴奋、极度兴奋。

**验证需求: 3.6**

### 属性 11: 存储容量限制

*对于任何*超过1000条记录的情绪记录集合，保存后本地存储中应该只保留最新的1000条记录。

**验证需求: 4.1, 4.2**

### 属性 12: 清理操作持久化

*对于任何*清理操作，执行后从本地存储重新加载的数据应该反映清理后的状态。

**验证需求: 4.3**

### 属性 13: 情绪识别阈值正确性

*对于任何*GSR传感器平滑值，系统识别的情绪类型应该符合以下规则：
- 20-25 → very_calm (非常平静)
- 25-30 → calm (平静)
- 30-35 → light_tension (轻度紧张)
- 35-40 → tension (紧张)
- 40-50 → excited (兴奋)
- 50+ → very_excited (极度兴奋)

**验证需求: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6**

### 属性 14: 时间范围过滤正确性

*对于任何*开始日期和结束日期，按时间范围过滤后的记录应该只包含在该日期范围内（包含边界）的记录。

**验证需求: 7.2, 9.2, 9.3, 9.4**

### 属性 15: 时间范围统计计算正确性

*对于任何*情绪记录集合，计算的时间范围统计应该：(1)正确统计所有情绪类型的出现次数，(2)正确计算百分比总和为100%，(3)正确识别最频繁情绪。

**验证需求: 10.1, 10.2, 10.5**

### 属性 16: 平均每日变化计算正确性

*对于任何*跨越多天的情绪记录集合，平均每日变化次数应该等于总记录数除以天数。

**验证需求: 10.4**

### 属性 17: 趋势数据时间排序

*对于任何*情绪记录集合，生成的趋势图数据点应该按时间戳升序排列。

**验证需求: 8.1, 8.2**

### 属性 18: 趋势数据点完整性

*对于任何*趋势图数据点，应该包含时间戳、格式化时间、情绪类型、传感器值、中文标签和颜色代码。

**验证需求: 8.4**

### 属性 19: 路由导航状态保持

*对于任何*从主页面导航到详细分析页面的操作，应用状态（包括已记录的情绪数据）应该保持不变。

**验证需求: 7.2**

### 属性 20: 时间范围切换响应性

*对于任何*时间范围切换操作，所有图表和统计数据应该在500毫秒内更新完成。

**验证需求: 9.6**

## 错误处理

### 本地存储错误

**场景**: localStorage不可用或已满

**处理策略**:
- 捕获所有localStorage操作的异常
- 记录错误到控制台
- 返回空数组或默认值，确保应用继续运行
- 向用户显示友好的错误提示（可选）

```typescript
try {
  localStorage.setItem(key, value);
} catch (error) {
  console.error('Failed to save to localStorage:', error);
  // 应用继续运行，不阻塞用户
}
```

### JSON解析错误

**场景**: 本地存储数据损坏

**处理策略**:
- 使用try-catch包裹JSON.parse
- 解析失败时返回空数组
- 可选：清除损坏的数据

```typescript
try {
  return JSON.parse(data);
} catch (error) {
  console.error('Failed to parse mood records:', error);
  localStorage.removeItem(STORAGE_KEY); // 清除损坏数据
  return [];
}
```

### 无效数据过滤

**场景**: 传感器值小于20或等于0

**处理策略**:
- 在记录前检查数据有效性
- 无效数据不记录，不影响统计
- 保持应用正常运行

```typescript
if (smoothedValue < 20 || smoothedValue === 0) {
  return; // 不记录无效数据
}
```

### 日期边界处理

**场景**: 跨午夜时统计数据需要刷新

**处理策略**:
- 使用定时器每分钟检查日期变化
- 检测到日期变化时自动刷新统计
- 确保统计始终反映当日数据

```typescript
const checkDateChange = setInterval(() => {
  const currentDate = new Date().toISOString().split('T')[0];
  if (dailyStats && dailyStats.date !== currentDate) {
    updateDailyStats();
  }
}, 60000);
```

## 测试策略

### 单元测试

使用 **Vitest** 作为测试框架（与项目现有技术栈一致）。

**测试范围**:

1. **moodStorageService 测试**
   - 保存和加载记录
   - 日期过滤
   - 容量限制（1000条）
   - 清理操作
   - 错误处理（localStorage不可用）

2. **useMoodAnalytics Hook 测试**
   - 情绪变化检测
   - 统计计算逻辑
   - 日期边界处理
   - 最小记录间隔

3. **MoodAnalytics 组件测试**
   - 空状态渲染
   - 统计数据渲染
   - 颜色和标签正确性

4. **情绪识别逻辑测试**
   - 阈值边界测试
   - 无效数据处理

**示例测试**:

```typescript
describe('moodStorageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save and load records', () => {
    const record: MoodRecord = {
      id: '123-calm',
      moodType: 'calm',
      sensorValue: 28,
      timestamp: Date.now(),
      date: '2024-11-29'
    };

    moodStorageService.saveRecord(record);
    const loaded = moodStorageService.getAllRecords();

    expect(loaded).toHaveLength(1);
    expect(loaded[0]).toEqual(record);
  });

  it('should limit records to 1000', () => {
    // 添加1001条记录
    for (let i = 0; i < 1001; i++) {
      moodStorageService.saveRecord({
        id: `${i}-calm`,
        moodType: 'calm',
        sensorValue: 25,
        timestamp: Date.now() + i,
        date: '2024-11-29'
      });
    }

    const records = moodStorageService.getAllRecords();
    expect(records).toHaveLength(1000);
    // 验证保留的是最新的1000条
    expect(records[0].id).toBe('1-calm');
  });
});
```

### 属性测试

使用 **fast-check** 库进行属性测试（JavaScript/TypeScript的PBT库）。

**配置**: 每个属性测试运行至少100次迭代。

**测试范围**:

1. **属性 1: 情绪变化记录完整性**
   ```typescript
   // Feature: mood-analytics, Property 1: 情绪变化记录完整性
   // Validates: Requirements 1.1
   it('should record all mood changes', () => {
     fc.assert(
       fc.property(
         fc.array(fc.constantFrom(...allMoodTypes), { minLength: 2 }),
         (moodSequence) => {
           // 生成情绪变化序列
           // 验证每次变化都被记录
         }
       ),
       { numRuns: 100 }
     );
   });
   ```

2. **属性 3: 序列化往返一致性**
   ```typescript
   // Feature: mood-analytics, Property 3: 序列化往返一致性
   // Validates: Requirements 1.3
   it('should preserve data through serialization round-trip', () => {
     fc.assert(
       fc.property(
         moodRecordArbitrary,
         (record) => {
           const serialized = JSON.stringify(record);
           const deserialized = JSON.parse(serialized);
           expect(deserialized).toEqual(record);
         }
       ),
       { numRuns: 100 }
     );
   });
   ```

3. **属性 13: 情绪识别阈值正确性**
   ```typescript
   // Feature: mood-analytics, Property 13: 情绪识别阈值正确性
   // Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
   it('should correctly identify mood based on sensor value', () => {
     fc.assert(
       fc.property(
         fc.integer({ min: 20, max: 100 }),
         (sensorValue) => {
           const mood = identifyMood(sensorValue);
           
           if (sensorValue >= 20 && sensorValue < 25) {
             expect(mood).toBe('very_calm');
           } else if (sensorValue >= 25 && sensorValue < 30) {
             expect(mood).toBe('calm');
           } else if (sensorValue >= 30 && sensorValue < 35) {
             expect(mood).toBe('light_tension');
           } else if (sensorValue >= 35 && sensorValue < 40) {
             expect(mood).toBe('tension');
           } else if (sensorValue >= 40 && sensorValue < 50) {
             expect(mood).toBe('excited');
           } else {
             expect(mood).toBe('very_excited');
           }
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

// 情绪记录生成器
const moodRecordArbitrary = fc.record({
  id: fc.string(),
  moodType: moodTypeArbitrary,
  sensorValue: fc.integer({ min: 20, max: 100 }),
  timestamp: fc.integer({ min: 0 }),
  date: fc.date().map(d => d.toISOString().split('T')[0])
});
```

### 集成测试

**测试范围**:
- 完整的数据流：情绪变化 → 记录 → 存储 → 统计 → 显示
- 跨日期边界的行为
- 长时间运行的稳定性

### 边缘情况测试

**重点测试**:
- 空数据状态
- 单条记录
- 恰好1000条记录
- 超过1000条记录
- 无效传感器值（<20, =0）
- 午夜时刻的日期切换
- localStorage不可用
- 损坏的JSON数据
- 跨月份的日期范围
- 时间范围边界（恰好7天、30天）
- 单日数据的周报/月报
- 大量数据点的趋势图渲染

### 详细分析页面测试

**测试范围**:

1. **路由和导航测试**
   - 从主页点击跳转到详细页面
   - 返回按钮导航回主页
   - 浏览器前进后退按钮
   - URL状态管理

2. **时间范围切换测试**
   - 切换到今日视图
   - 切换到本周视图
   - 切换到本月视图
   - 切换响应时间（<500ms）

3. **趋势图测试**
   - 空数据状态渲染
   - 单个数据点渲染
   - 多个数据点渲染
   - 悬停交互显示详情
   - 移动端触摸交互
   - 响应式布局

4. **统计图表测试**
   - 饼图正确显示比例
   - 图例显示正确
   - 颜色映射正确
   - 百分比计算准确

5. **性能测试**
   - 大数据集加载时间
   - 图表渲染性能
   - 时间范围切换流畅度

## 性能考虑

### 记录频率控制

- 最小记录间隔：5秒
- 防止频繁的localStorage写入
- 减少不必要的状态更新

### 统计计算优化

- 仅在需要时计算统计（情绪变化、定时刷新）
- 使用Map数据结构提高计数效率
- 限制统计范围为当日数据

### 存储容量管理

- 硬限制：1000条记录
- 自动清理旧数据
- 估计存储大小：约50KB（1000条记录）

### React性能优化

- 使用useCallback缓存函数
- 使用useRef避免不必要的重渲染
- 条件渲染减少DOM操作

## 实现注意事项

### 时区处理

- 使用本地时区进行日期计算
- 日期字符串格式：YYYY-MM-DD
- 确保午夜边界正确处理

### 数据迁移

- 当前版本不需要迁移
- 未来版本如需修改数据结构，需要实现迁移逻辑
- 建议在MoodRecord中添加version字段

### 浏览器兼容性

- localStorage在所有现代浏览器中可用
- 需要处理隐私模式下localStorage不可用的情况
- 考虑使用IndexedDB作为未来扩展选项

### 可访问性

- 确保统计组件有适当的ARIA标签
- 颜色不是唯一的信息传达方式（使用文字+颜色）
- 支持键盘导航
- 图表提供文字替代说明
- 确保对比度符合WCAG标准

### 图表库选择

使用 **Recharts** 作为图表库：
- React原生支持，易于集成
- 响应式设计
- 丰富的图表类型（折线图、面积图、饼图）
- 良好的TypeScript支持
- 可定制性强

### 路由库选择

使用 **React Router v6**：
- React生态标准路由解决方案
- 支持声明式路由
- 浏览器历史管理
- 简洁的API

### 数据加载策略

- 详细分析页面首次加载时从localStorage读取所有数据
- 时间范围切换时仅重新计算统计，不重新读取存储
- 使用React状态管理避免不必要的重新计算
- 考虑使用useMemo缓存计算结果

### 移动端优化

- 图表在小屏幕上自动调整显示密度
- 触摸友好的交互设计
- 时间范围选择器使用大按钮
- 趋势图支持横向滚动（数据点过多时）

## 技术依赖

### 新增依赖包

```json
{
  "dependencies": {
    "react-router-dom": "^6.20.0",
    "recharts": "^2.10.0"
  },
  "devDependencies": {
    "@types/react-router-dom": "^5.3.3"
  }
}
```

### 安装命令

```bash
npm install react-router-dom recharts
npm install --save-dev @types/react-router-dom
```

## 未来扩展

### 短期扩展（v1.2）

- 数据导出功能（CSV/JSON）
- 自定义日期范围选择
- 情绪日记功能（添加文字备注）
- 打印/分享报告

### 中期扩展（v2.0）

- 多日对比分析（对比不同周/月）
- 情绪模式识别（识别规律和异常）
- 个性化建议（基于历史数据）
- 目标设置和追踪

### 长期扩展（v3.0）

- 云端同步
- 多设备数据共享
- AI驱动的情绪预测
- 社交功能（匿名分享和对比）
