import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSerialPort } from '../hooks/useSerialPort';
import { useMoodProcessor } from '../hooks/useMoodProcessor';
import { useMoodAnalytics } from '../hooks/useMoodAnalytics';
import { useMoodNotification } from '../hooks/useMoodNotification';
import { MainCharacter } from './MainCharacter';
import { MOOD_CONFIG } from '../config/moodConfig';
import AiChatWidget from './xinghuo';

// Inline SVGs for icons
const PlugIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/></svg>;
const CheckIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const ChatIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const SettingsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;

/**
 * HomePage Component
 * 主页面组件，展示角色形象、星星装饰、GSR进度条和情绪统计卡片
 * 
 * Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 6.3
 */
export const HomePage: React.FC = () => {
  // Requirement 5.2: 使用 useNavigate 实现页面导航
  const navigate = useNavigate();
  
  // 集成现有的 hooks - 实现数据流传递
  const { 
    connect, 
    disconnect, 
    isConnected, 
    latestValue
  } = useSerialPort();
  const { currentMood, smoothedValue } = useMoodProcessor(latestValue);
  const { dailyStats, clearAllData } = useMoodAnalytics(currentMood, smoothedValue);
  const { notificationPermission } = useMoodNotification(currentMood.id);

  // API 设置状态 - 从环境变量获取默认值作为 placeholder
  const envApiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  const envBaseUrl = import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const envModelName = import.meta.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo';
  
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('openai_api_key') || '');
  const [baseUrl, setBaseUrl] = useState(() => localStorage.getItem('openai_base_url') || '');
  const [modelName, setModelName] = useState(() => localStorage.getItem('openai_model_name') || '');

  // 保存 API 设置
  const handleSaveApiSettings = () => {
    localStorage.setItem('openai_api_key', apiKey);
    localStorage.setItem('openai_base_url', baseUrl);
    localStorage.setItem('openai_model_name', modelName);
    setShowApiSettings(false);
  };

  // 请求通知权限
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  // Requirement 1.1, 2.1: 图片预加载逻辑
  useEffect(() => {
    const preloadImages = () => {
      const images = ['/main.png'];
      
      images.forEach((src) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          console.log(`Preloaded image: ${src}`);
        };
        img.onerror = () => {
          console.error(`Failed to preload image: ${src}`);
        };
      });
    };

    preloadImages();
  }, []);

  // 导航到聊天页面
  const handleChatClick = () => {
    navigate('/chat');
  };

  // 点击主角色图片也可以进入聊天
  const handleCharacterClick = () => {
    navigate('/chat');
  };

  return (
    // Requirement 6.1: 垂直布局和间距
    // Requirement 6.3: 响应式设计 - 适配不同屏幕尺寸
    <div className="home-container min-h-screen w-full flex flex-col items-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 md:p-8 pb-32 relative overflow-y-auto">
      
      {/* 左上角：连接串口按钮和通知权限 */}
      <div className="absolute top-4 left-4 z-50 flex gap-2 flex-wrap">
        <button
          onClick={isConnected ? disconnect : connect}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all shadow-lg backdrop-blur-md border ${
            isConnected 
              ? 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200' 
              : 'bg-white/80 border-slate-300 text-slate-700 hover:bg-white'
          }`}
        >
          {isConnected ? <CheckIcon /> : <PlugIcon />}
        </button>

        {/* 通知权限提示 */}
        {notificationPermission === 'default' && (
          <button
            onClick={requestNotificationPermission}
            className="flex items-center justify-center px-4 py-2 rounded-full font-medium text-sm transition-all shadow-lg backdrop-blur-md border bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100"
            title="启用通知提醒"
          >
            🔔
          </button>
        )}
        {notificationPermission === 'denied' && (
          <div 
            className="flex items-center justify-center px-4 py-2 rounded-full font-medium text-sm shadow-lg backdrop-blur-md border bg-gray-100 border-gray-300 text-gray-600"
            title="通知已禁用"
          >
            🔕
          </div>
        )}
      </div>

      {/* 右上角：设置按钮和对话入口按钮 */}
      <div className="absolute top-4 right-4 z-50 flex gap-2 items-center">
        {/* API 设置按钮 */}
        <button
          onClick={() => setShowApiSettings(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all shadow-lg backdrop-blur-md border bg-white/80 border-slate-300 text-slate-700 hover:bg-white"
        >
          <SettingsIcon />
        </button>
        {/* 讯飞 AI 助手按钮 */}
        <AiChatWidget />
        {/* 动物广场入口按钮 */}
        <motion.button
          onClick={() => navigate('/plaza')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex items-center justify-center px-4 py-2 rounded-full bg-white/80 hover:bg-white transition-all shadow-lg backdrop-blur-md border border-slate-300"
          title="动物广场"
        >
          <img src="/plaza.png" alt="动物广场" className="w-5 h-5" />
        </motion.button>
        {/* 对话入口按钮 */}
        <button
          onClick={handleChatClick}
          className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all shadow-lg backdrop-blur-md border bg-indigo-500 border-indigo-600 text-white hover:bg-indigo-600"
        >
          <ChatIcon />
        </button>
      </div>

      {/* API 设置模态框 */}
      {showApiSettings && (
        <div 
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-[100]"
          onClick={() => setShowApiSettings(false)}
        >
          <div 
            className="w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-slate-600 font-medium">测试用，OpenAI Compatible</p>
              <button 
                onClick={() => setShowApiSettings(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">API Key</label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={envApiKey || '...'}
                  autoComplete="off"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Base URL</label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder={envBaseUrl}
                  autoComplete="off"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Model Name</label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder={envModelName}
                  autoComplete="off"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800"
                />
              </div>
              
              <button
                onClick={handleSaveApiSettings}
                className="w-full py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Requirement 1.1, 1.2: Main character image - 可点击进入对话 */}
      <div onClick={handleCharacterClick} className="cursor-pointer mt-2">
        <MainCharacter />
      </div>
      
      {/* 当前情绪显示 */}
      <div className="w-full max-w-md px-4">
        <motion.div 
          key={currentMood.label}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-center gap-2"
        >
          <p className="text-slate-500 text-sm uppercase tracking-wide">您的状态是：</p>
          <h2 className={`text-2xl font-bold ${currentMood.accentColor} tracking-wide uppercase`}>
            {currentMood.label}
          </h2>
        </motion.div>
      </div>
      
      {/* GSR Progress Bar - 使用 /chat 的样式 */}
      <div className="w-full max-w-md px-4 mt-4">
        <div className="bg-white/60 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between text-xs text-slate-600 mb-2">
            <span>GSR Input (Raw): {Math.round(latestValue)}</span>
            <span>Smoothed: {smoothedValue}</span>
          </div>
          {/* Progress Bar Container */}
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
            {/* Smoothed Value Bar */}
            <motion.div 
              className="h-full"
              style={{
                backgroundColor: currentMood.chartColor
              }}
              animate={{ width: `${smoothedValue}%` }}
              transition={{ type: 'spring', stiffness: 50 }}
            />
          </div>
          {/* Simple ticks */}
          <div className="w-full flex justify-between mt-1 text-[10px] text-slate-500">
            <span>0</span>
            <span>100</span>
          </div>
        </div>
      </div>
      
      {/* 今日情绪统计 - 使用 /chat 的完整组件 */}
      {dailyStats && dailyStats.topMoods.length > 0 && (
        <div className="w-full max-w-md px-4 mt-4">
          <div className="bg-white/60 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-sm">
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
                <button
                  onClick={() => {
                    if (window.confirm('确定要清除所有情绪记录吗？')) {
                      clearAllData();
                    }
                  }}
                  className="text-xs px-2 py-1 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  title="清除所有数据"
                >
                  清除
                </button>
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
        </div>
      )}

    </div>
  );
};
