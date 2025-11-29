import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MoodConfigItem, DailyMoodStats } from '../types';
import { MOOD_CONFIG } from '../config/moodConfig';

interface AvatarViewProps {
  currentMood: MoodConfigItem;
  rawValue: number;
  smoothedValue: number;
  onAvatarClick?: () => void;
  dailyStats?: DailyMoodStats | null;
  onClearData?: () => void;
}

export const AvatarView: React.FC<AvatarViewProps> = ({ currentMood, rawValue, smoothedValue, onAvatarClick, dailyStats, onClearData }) => {
  const navigate = useNavigate();

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden transition-colors duration-1000 ${currentMood.color}`}>
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5" />
      
      {/* Animated particles effect */}
      <motion.div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)',
        }}
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ 
          duration: currentMood.id === 'calm' ? 4 : (currentMood.id === 'stressed' ? 1.5 : 2.5),
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Avatar Image Cross-fading - Smaller size */}
      <div 
        className={`relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white/40 shadow-xl z-10 ${onAvatarClick ? 'md:cursor-default cursor-pointer' : ''}`}
        onClick={onAvatarClick}
      >
        <AnimatePresence mode='wait'>
          <motion.img
            key={currentMood.id}
            src={currentMood.avatarSrc}
            alt={currentMood.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
      </div>

      {/* Mood Label */}
      <div className="mt-8 z-10 text-center">
        <motion.h2 
          key={currentMood.label}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-bold text-slate-800 tracking-widest uppercase"
        >
          {currentMood.label}
        </motion.h2>
        <p className="text-slate-600 mt-2 text-sm uppercase tracking-wide">Current State</p>
      </div>

      {/* Sensor Data Visualizer and Analytics */}
      <div className="absolute bottom-4 left-4 right-4 z-10 max-h-[45vh] overflow-y-auto space-y-2">
        {/* GSR Input Display */}
        <div className="bg-white/60 backdrop-blur-md p-3 rounded-xl border border-slate-200">
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>GSR Input (Raw): {Math.round(rawValue)}</span>
            <span>Smoothed: {smoothedValue}</span>
          </div>
          {/* Progress Bar Container */}
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
            {/* Smoothed Value Bar */}
            <motion.div 
              className={`h-full ${currentMood.id === 'stressed' ? 'bg-rose-400' : (currentMood.id === 'focused' ? 'bg-indigo-400' : 'bg-teal-400')}`}
              animate={{ width: `${smoothedValue}%` }}
              transition={{ type: 'spring', stiffness: 50 }}
            />
          </div>
          {/* Simple ticks */}
          <div className="w-full flex justify-between mt-1 text-[10px] text-slate-500">
            <span>0 (Calm)</span>
            <span>50</span>
            <span>100 (Stress)</span>
          </div>
        </div>

        {/* Mood Analytics - Inline */}
        {dailyStats && dailyStats.topMoods.length > 0 && (
          <div className="bg-white/60 backdrop-blur-md p-3 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-slate-700">
                📊 今日情绪统计 (前三)
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/analytics')}
                  className="text-xs px-2 py-1 rounded-md bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors flex items-center gap-1"
                  title="查看详细分析"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  详情
                </button>
                {onClearData && (
                  <button
                    onClick={() => {
                      if (window.confirm('确定要清除所有情绪记录吗？')) {
                        onClearData();
                      }
                    }}
                    className="text-xs px-2 py-1 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    title="清除所有数据"
                  >
                    清除
                  </button>
                )}
              </div>
            </div>
            
            {/* 横向排列的情绪统计 */}
            <div className="flex gap-2 justify-between">
              {dailyStats.topMoods.map((stat) => {
                // 获取情绪配置
                const config = MOOD_CONFIG[stat.moodType];
                
                return (
                  <div key={stat.moodType} className="flex-1 flex flex-col items-center gap-1.5">
                    {/* 排名徽章 */}
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                      ${stat.rank === 1 ? 'bg-yellow-400 text-yellow-900' : ''}
                      ${stat.rank === 2 ? 'bg-gray-300 text-gray-700' : ''}
                      ${stat.rank === 3 ? 'bg-amber-600 text-amber-100' : ''}
                    `}>
                      {stat.rank}
                    </div>

                    {/* 情绪名称和数据 */}
                    <div className="w-full text-center">
                      <div className={`text-xs font-medium ${config.accentColor} mb-0.5`}>
                        {config.label}
                      </div>
                      
                      <div className="text-[10px] text-slate-600 mb-1.5">
                        {stat.count}次 ({stat.percentage.toFixed(0)}%)
                      </div>
                      
                      {/* 进度条 */}
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
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
            <div className="mt-2 pt-2 border-t border-slate-200">
              <p className="text-[10px] text-slate-500 text-center">
                总记录: {dailyStats.totalRecords} 次
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
