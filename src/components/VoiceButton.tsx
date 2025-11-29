import React from 'react';

/**
 * VoiceButton Component
 * 
 * 语音输入按钮组件，显示不同状态（默认、监听中、禁用）
 * 包含麦克风图标和脉动动画效果
 * 
 * 验证需求: 1.1, 1.2, 3.1, 4.1
 */

interface VoiceButtonProps {
  isListening: boolean;      // 是否正在监听
  isSupported: boolean;      // 浏览器是否支持
  onStart: () => void;       // 开始监听回调
  onStop: () => void;        // 停止监听回调
  disabled?: boolean;        // 是否禁用
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  isListening,
  isSupported,
  onStart,
  onStop,
  disabled = false,
}) => {
  // 如果浏览器不支持，按钮应该被禁用
  const isDisabled = disabled || !isSupported;

  // 点击处理
  const handleClick = () => {
    if (isDisabled) return;
    
    if (isListening) {
      onStop();
    } else {
      onStart();
    }
  };

  // 键盘支持（Enter 和 Space）
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={isDisabled}
      aria-label={isListening ? '停止语音输入' : '开始语音输入'}
      aria-pressed={isListening}
      aria-describedby="voice-button-description"
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      className={`
        relative p-3 rounded-xl transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${
          isDisabled
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50'
            : isListening
            ? 'bg-red-500 text-white hover:bg-red-600 hover:scale-105 focus:ring-red-500 animate-pulse-subtle shadow-lg'
            : 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-105 focus:ring-slate-500 shadow-md hover:shadow-lg'
        }
      `}
      title={
        !isSupported
          ? '浏览器不支持语音识别'
          : isListening
          ? '点击停止录音'
          : '点击开始语音输入'
      }
    >
      {/* 监听中的脉动效果背景 */}
      {isListening && (
        <span className="absolute inset-0 rounded-xl bg-red-400 animate-ping opacity-75" />
      )}
      
      {/* 麦克风图标 */}
      <span className="relative z-10">
        <MicrophoneIcon size={20} isListening={isListening} />
      </span>
      
      {/* 可访问性：隐藏的描述文本 (需求 4.1) */}
      <span id="voice-button-description" className="sr-only">
        {isDisabled 
          ? '语音输入功能不可用' 
          : isListening 
          ? '正在录音，按 Enter 或 Space 键停止' 
          : '按 Enter 或 Space 键开始语音输入'}
      </span>
    </button>
  );
};

// 麦克风图标组件
const MicrophoneIcon: React.FC<{ size: number; isListening: boolean }> = ({ 
  size, 
  isListening 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={isListening ? 'animate-pulse' : ''}
  >
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);
