import { useState, useEffect, useRef, useCallback } from 'react';
import { MoodConfigItem, MoodType, DailyMoodStats, MoodRecord } from '../types';
import { moodStorageService } from '../services/moodStorage';

/**
 * 情绪分析自定义Hook
 * 负责记录情绪变化和计算统计数据
 * 
 * Requirements:
 * - 1.1: 自动记录情绪状态变化
 * - 1.2: 记录包含完整信息（类型、时间戳、传感器值）
 * - 2.1: 显示当日统计
 * - 2.2: 统计所有六种情绪状态
 * - 2.3: 按次数排序并显示前三
 * - 2.4: 排除零计数情绪
 * - 2.6: 少于三种时只显示实际存在的
 * - 4.4: 跨日期边界自动刷新
 * - 6.5: 通过Hook提供数据和操作方法
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
   * 计算当日统计
   * Requirements: 2.1, 2.2, 2.3, 2.4, 2.6
   */
  const updateDailyStats = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = moodStorageService.getRecordsByDate(today);

    // Requirement 2.5: 当日没有记录时显示空状态
    if (todayRecords.length === 0) {
      setDailyStats(null);
      return;
    }

    // Requirement 2.2: 统计每种情绪出现次数
    const moodCounts = new Map<MoodType, number>();
    todayRecords.forEach(record => {
      moodCounts.set(
        record.moodType,
        (moodCounts.get(record.moodType) || 0) + 1
      );
    });

    // Requirement 2.3: 按次数排序并显示前三
    // Requirement 2.4: 排除零计数情绪
    // Requirement 2.6: 少于三种时只显示实际存在的
    const sortedMoods = Array.from(moodCounts.entries())
      .filter(([_, count]) => count > 0) // 排除零计数
      .map(([moodType, count]) => ({
        moodType,
        count,
        percentage: (count / todayRecords.length) * 100
      }))
      .sort((a, b) => b.count - a.count) // 按次数降序排序
      .slice(0, 3) // 取前三（如果少于三种，自然只返回实际数量）
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
   * 记录情绪变化
   * Requirements: 1.1, 1.2, 5.7
   */
  useEffect(() => {
    const currentMoodType = currentMood.id as MoodType;
    const now = Date.now();
    
    // Requirement 5.7: 无效数据不记录
    // 检查是否应该记录（定期记录模式）
    const shouldRecord = 
      smoothedValue >= 20 && // 有效数据范围（排除<20或=0）
      smoothedValue > 0 && // 确保不是0（未连接状态）
      now - lastRecordTimeRef.current >= MIN_RECORD_INTERVAL_MS; // 间隔足够（5秒）

    if (shouldRecord) {
      // Requirement 1.2: 记录包含情绪类型、时间戳、传感器值
      const record: MoodRecord = {
        id: `${now}-${currentMoodType}`,
        moodType: currentMoodType,
        sensorValue: smoothedValue,
        timestamp: now,
        date: new Date(now).toISOString().split('T')[0] // YYYY-MM-DD
      };

      // Requirement 1.1: 保存到本地存储
      moodStorageService.saveRecord(record);
      previousMoodRef.current = currentMoodType;
      lastRecordTimeRef.current = now;

      // 更新统计
      updateDailyStats();
    }
  }, [currentMood.id, smoothedValue, updateDailyStats]);

  /**
   * 初始化和定时更新
   * Requirement 4.4: 跨日期边界自动刷新
   */
  useEffect(() => {
    // 初始加载
    updateDailyStats();

    // 每分钟更新一次统计
    const statsInterval = setInterval(updateDailyStats, 60000);

    // Requirement 4.4: 检查日期变化（午夜刷新）
    const lastDateRef = { current: new Date().toISOString().split('T')[0] };
    const checkDateChange = setInterval(() => {
      const currentDate = new Date().toISOString().split('T')[0];
      if (lastDateRef.current !== currentDate) {
        lastDateRef.current = currentDate;
        updateDailyStats();
      }
    }, 60000); // 每分钟检查

    return () => {
      clearInterval(statsInterval);
      clearInterval(checkDateChange);
    };
  }, [updateDailyStats]);

  /**
   * 清除所有记录
   */
  const clearAllData = useCallback(() => {
    moodStorageService.clearAllRecords();
    setDailyStats(null);
    previousMoodRef.current = null;
    lastRecordTimeRef.current = 0;
  }, []);

  // Requirement 6.5: 返回数据和操作方法
  return {
    dailyStats,
    refreshStats: updateDailyStats,
    clearAllData
  };
}
