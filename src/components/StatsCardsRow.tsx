import React from 'react';
import { DailyMoodStats } from '../types';

/**
 * 统计卡片横向容器组件
 * 用于在主页面横向排列情绪统计卡片
 * 
 * Requirements:
 * - 6.2: 横向排列统计卡片，移动端垂直排列
 */

interface StatsCardsRowProps {
  children: React.ReactNode;
}

export const StatsCardsRow: React.FC<StatsCardsRowProps> = ({ children }) => {
  return (
    // Requirement 6.2: 横向布局容器，移动端（< 640px）垂直排列
    <div 
      className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-2xl"
      role="region"
      aria-label="情绪统计卡片"
    >
      {children}
    </div>
  );
};
