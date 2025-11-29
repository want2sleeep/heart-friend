import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useSerialPort } from './hooks/useSerialPort';
import { useMoodProcessor } from './hooks/useMoodProcessor';
import { HomePage } from './components/HomePage';
import { ChatInterface } from './components/ChatInterface';
import { MoodAnalyticsDetail } from './components/MoodAnalyticsDetail';

// Home icon SVG
const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

// Settings icon SVG (齿轮图标)
const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

// Chat page component - 纯聊天界面
const ChatPage: React.FC = () => {
  const { latestValue } = useSerialPort();
  const { currentMood } = useMoodProcessor(latestValue);
  const navigate = useNavigate();
  const [showVoiceSettings, setShowVoiceSettings] = React.useState(false);

  return (
    <div className="h-screen w-full relative">
      {/* 顶部按钮栏 */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        {/* 语音设置按钮 */}
        <button
          onClick={() => setShowVoiceSettings(true)}
          className="p-2.5 rounded-full transition-all shadow-lg backdrop-blur-md border bg-white/80 border-slate-300 text-slate-700 hover:bg-white"
          aria-label="语音设置"
          title="语音设置"
        >
          <SettingsIcon />
        </button>
        
        {/* 返回主页按钮 */}
        <button
          onClick={() => navigate('/')}
          className="p-2.5 rounded-full transition-all shadow-lg backdrop-blur-md border bg-white/80 border-slate-300 text-slate-700 hover:bg-white"
          aria-label="返回主页"
          title="返回主页"
        >
          <HomeIcon />
        </button>
      </div>
      
      <ChatInterface 
        currentMood={currentMood} 
        showVoiceSettings={showVoiceSettings}
        onCloseVoiceSettings={() => setShowVoiceSettings(false)}
      />
    </div>
  );
};

// App component with router
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/analytics" element={<MoodAnalyticsDetail />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
