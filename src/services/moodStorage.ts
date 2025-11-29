import { MoodRecord, TimeRange, TimeRangeStats, MoodType, TrendDataPoint } from '../types';
import { MOOD_CONFIG } from '../config/moodConfig';

/**
 * 情绪数据本地存储服务
 * 负责所有与localStorage的交互
 */

const STORAGE_KEY = 'mood_records';
const MAX_RECORDS = 1000;

export const moodStorageService = {
  /**
   * 保存情绪记录
   * 自动管理存储容量，超过1000条时删除最旧的记录
   */
  saveRecord(record: MoodRecord): void {
    try {
      const records = this.getAllRecords();
      records.push(record);
      
      // 如果超过最大记录数，删除最旧的记录
      if (records.length > MAX_RECORDS) {
        records.splice(0, records.length - MAX_RECORDS);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('Failed to save mood record:', error);
      // 应用继续运行，不阻塞用户
    }
  },

  /**
   * 获取所有记录
   * 如果localStorage不可用或数据损坏，返回空数组
   */
  getAllRecords(): MoodRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data) as MoodRecord[];
    } catch (error) {
      console.error('Failed to load mood records:', error);
      // 清除损坏的数据
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (cleanupError) {
        console.error('Failed to cleanup corrupted data:', cleanupError);
      }
      return [];
    }
  },

  /**
   * 获取指定日期的记录
   * @param date ISO日期字符串 (YYYY-MM-DD)
   */
  getRecordsByDate(date: string): MoodRecord[] {
    const allRecords = this.getAllRecords();
    return allRecords.filter(record => record.date === date);
  },

  /**
   * 清除所有记录
   */
  clearAllRecords(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear all records:', error);
    }
  },

  /**
   * 清除指定日期之前的记录
   * @param date ISO日期字符串 (YYYY-MM-DD)
   */
  clearRecordsBefore(date: string): void {
    try {
      const allRecords = this.getAllRecords();
      const filtered = allRecords.filter(record => record.date >= date);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to clear records before date:', error);
    }
  },

  /**
   * 获取指定时间范围的记录
   * @param startDate 开始日期 (YYYY-MM-DD)
   * @param endDate 结束日期 (YYYY-MM-DD)
   * @returns 时间范围内的记录数组
   */
  getRecordsByRange(startDate: string, endDate: string): MoodRecord[] {
    const allRecords = this.getAllRecords();
    return allRecords.filter(
      record => record.date >= startDate && record.date <= endDate
    );
  },

  /**
   * 计算时间范围统计
   * @param range 时间范围类型
   * @param records 记录数组
   * @returns 时间范围统计数据
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
   * @param records 记录数组
   * @returns 趋势图数据点数组，按时间戳升序排列
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
};
