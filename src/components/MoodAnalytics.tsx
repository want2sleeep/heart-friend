import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DailyMoodStats } from '../types';
import { MOOD_CONFIG } from '../config/moodConfig';

/**
 * 情绪统计展示组件
 * 显示当日前三情绪状态
 * 
 * Requirements:
 * - 2.5: 空状态显示友好提示
 * - 3.1: 使用对应的颜色主题
 * - 3.2: 显示中文名称、次数、排名
 * - 3.3: 使用视觉元素（进度条）增强可读性
 * - 3.4: 与现有界面风格保持一致
 * - 3.5: 响应式布局
 * - 3.6: 使用中文标签
 * - 7.1: 点击组件导航到详细分析页面
 * - 7.3: 显示视觉提示（悬停效果、提示文字）
 */

interface MoodAnalyticsProps {
  dailyStats: DailyMoodStats | null;
}

export const MoodAnalytics: React.FC<MoodAnalyticsProps> = ({ dailyStats }) => {
  // Requirement 7.1: 导入并使用 useNavigate hook
  const navigate = useNavigate();

  // Requirement 7.1: 点击事件处理器导航到 /analytics
  const handleClick = () => {
    navigate('/analytics');
  };

  // Requirement 2.5: 当日没有任何情绪记录时显示友好的空状态提示信息
  if (!dailyStats || dailyStats.topMoods.length === 0) {
    return (
      <div 
        className="bg-white/60 backdrop-blur-md p-3 sm:p-4 rounded-xl border border-slate-200 flex-1"
        role="region"
        aria-label="今日情绪统计"
      >
        <h3 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2">
          📊 今日情绪统计
        </h3>
        <p className="text-xs text-slate-500">
          暂无数据，开始记录您的情绪状态...
        </p>
      </div>
    );
  }

  return (
    // Requirement 3.4: 与现有界面风格保持一致（使用相同的背景、边框样式）
    // Requirement 3.5: 响应式布局（使用flex和gap确保移动端正常显示）
    // Requirement 4.1, 4.2, 4.3, 5.3: 调整样式以适配新布局，与 MoodSummaryCard 保持一致
    // Requirement 7.1: 添加cursor-pointer样式和点击事件
    // Requirement 7.3: 添加悬停效果（hover:shadow-lg transition-shadow）
    // Requirement 8.6: 移动端优化 - 触摸友好的交互和响应式间距
    // Requirement 11.1, 11.4: 可访问性 - ARIA标签、键盘导航、语义化角色
    <div 
      className="bg-white/60 backdrop-blur-md p-3 sm:p-4 rounded-xl border border-slate-200 flex-1 cursor-pointer hover:shadow-lg hover:bg-white/70 active:bg-white/80 transition-all duration-300 touch-manipulation focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="查看详细情绪分析，今日共记录 ${dailyStats.totalRecords} 次情绪变化"
    >
      <h3 
        className="text-xs sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3"
        id="mood-stats-heading"
      >
        📊 今日情绪统计 (前三)
      </h3>
      
      {/* 横向排列的情绪统计 */}
      {/* Requirement 8.6: 移动端优化 - 响应式间距 */}
      {/* Requirement 11.1, 11.4: 可访问性 - 语义化列表结构 */}
      <div 
        className="flex gap-2 sm:gap-3 justify-between"
        role="list"
        aria-labelledby="mood-stats-heading"
      >
        {dailyStats.topMoods.map((stat) => {
          // Requirement 3.1: 为每种情绪状态使用对应的颜色主题
          const config = MOOD_CONFIG[stat.moodType];
          
          return (
            <div 
              key={stat.moodType} 
              className="flex-1 flex flex-col items-center gap-1.5 sm:gap-2 min-w-0"
              role="listitem"
              aria-label={`第${stat.rank}名：${config.label}，出现${stat.count}次，占比${stat.percentage.toFixed(0)}%`}
            >
              {/* Requirement 3.2: 显示排名 - 使用排名徽章（金银铜） */}
              {/* Requirement 8.6: 移动端优化 - 响应式徽章大小 */}
              {/* Requirement 11.1, 11.4: 可访问性 - ARIA标签说明排名 */}
              <div 
                className={`
                  w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0
                  ${stat.rank === 1 ? 'bg-yellow-400 text-yellow-900' : ''}
                  ${stat.rank === 2 ? 'bg-gray-300 text-gray-700' : ''}
                  ${stat.rank === 3 ? 'bg-amber-600 text-amber-100' : ''}
                `}
                aria-label={`排名第${stat.rank}`}
              >
                {stat.rank}
              </div>

              {/* 情绪名称和数据 */}
              <div className="w-full text-center">
                {/* Requirement 3.6: 使用中文标签 */}
                {/* Requirement 3.2: 显示情绪状态中文名称 */}
                {/* Requirement 3.1: 使用对应的accentColor */}
                {/* Requirement 8.6: 移动端优化 - 响应式字体大小和文本截断 */}
                <div className={`text-xs sm:text-sm font-medium ${config.accentColor} mb-1 truncate`}>
                  {config.label}
                </div>
                
                {/* Requirement 3.2: 显示出现次数和百分比 */}
                {/* Requirement 8.6: 移动端优化 - 响应式字体大小 */}
                <div className="text-[10px] sm:text-xs text-slate-600 mb-1.5 sm:mb-2">
                  {stat.count}次 ({stat.percentage.toFixed(0)}%)
                </div>
                
                {/* Requirement 3.3: 使用视觉元素（进度条）增强可读性 */}
                {/* Requirement 3.1: 使用配置的chartColor */}
                {/* Requirement 8.6: 移动端优化 - 响应式进度条高度 */}
                {/* Requirement 11.1, 11.4: 可访问性 - 进度条ARIA属性 */}
                <div 
                  className="w-full h-1.5 sm:h-2 bg-slate-200 rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={stat.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${config.label}占比${stat.percentage.toFixed(0)}%`}
                >
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

      {/* 显示总记录数 */}
      {/* Requirement 8.6: 移动端优化 - 响应式间距 */}
      <div className="mt-2 sm:mt-3 pt-2 border-t border-slate-200">
        <p className="text-[10px] sm:text-xs text-slate-500 text-center">
          总记录: {dailyStats.totalRecords} 次
        </p>
      </div>

      {/* Requirement 7.3: 添加视觉提示文字 */}
      {/* Requirement 8.6: 移动端优化 - 响应式字体大小 */}
      <div className="mt-1.5 sm:mt-2 text-center">
        <span className="text-[10px] sm:text-xs text-slate-400 hover:text-slate-600 transition-colors">
          点击查看详细分析 →
        </span>
      </div>
    </div>
  );
};
