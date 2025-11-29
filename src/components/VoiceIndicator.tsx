import React from 'react';

/**
 * VoiceIndicator Component
 * 
 * 语音状态指示器，显示实时反馈
 * - 监听状态：显示临时识别文本 + 波形动画
 * - 播放状态：显示"正在播放..." + 音频波形
 * - 处理状态：显示加载指示器
 * 
 * 验证需求: 1.2, 2.2, 4.1, 4.2, 4.3, 4.5
 */

interface VoiceIndicatorProps {
  isListening: boolean;      // 是否正在监听
  isSpeaking: boolean;       // 是否正在播放
  isProcessing?: boolean;    // 是否正在处理（可选）
  interimTranscript?: string; // 临时识别文本
}

export const VoiceIndicator: React.FC<VoiceIndicatorProps> = ({
  isListening,
  isSpeaking,
  isProcessing = false,
  interimTranscript = '',
}) => {
  // 如果所有状态都是 false，不显示指示器
  if (!isListening && !isSpeaking && !isProcessing) {
    return null;
  }

  // 根据状态确定样式（需求 4.5：状态视觉区分）
  const getStateStyles = () => {
    if (isListening) {
      return {
        container: 'bg-blue-50 border-blue-200',
        icon: 'text-blue-600',
        text: 'text-blue-800',
        subtext: 'text-blue-700',
      };
    }
    if (isSpeaking) {
      return {
        container: 'bg-green-50 border-green-200',
        icon: 'text-green-600',
        text: 'text-green-800',
        subtext: 'text-green-700',
      };
    }
    if (isProcessing) {
      return {
        container: 'bg-purple-50 border-purple-200',
        icon: 'text-purple-600',
        text: 'text-purple-800',
        subtext: 'text-purple-700',
      };
    }
    return {
      container: 'bg-slate-50 border-slate-200',
      icon: 'text-slate-600',
      text: 'text-slate-800',
      subtext: 'text-slate-700',
    };
  };

  const styles = getStateStyles();

  // 可访问性：生成状态描述文本 (需求 4.1, 4.2, 4.3)
  const getAriaLabel = () => {
    if (isListening) {
      return interimTranscript 
        ? `正在监听语音输入，当前识别到：${interimTranscript}` 
        : '正在监听语音输入';
    }
    if (isSpeaking) {
      return '正在播放语音回复';
    }
    if (isProcessing) {
      return '正在处理语音';
    }
    return '';
  };

  return (
    <div 
      className={`mx-4 mb-2 p-3 rounded-lg border shadow-sm transition-all duration-200 animate-fade-in ${styles.container}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={getAriaLabel()}
    >
      {/* 监听状态 */}
      {isListening && (
        <div className="flex items-center gap-3">
          {/* 波形动画 - 用户体验优化：音量指示器 (需求 1.2) */}
          <div className="flex items-center gap-1" role="img" aria-label="音量指示器">
            <WaveBar delay={0} color="bg-blue-500" />
            <WaveBar delay={150} color="bg-blue-500" />
            <WaveBar delay={300} color="bg-blue-500" />
            <WaveBar delay={450} color="bg-blue-500" />
          </div>
          
          {/* 状态文本 */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <MicrophoneIcon size={16} className={styles.icon} />
              <span className={`text-sm font-medium ${styles.text}`}>
                正在监听...
              </span>
            </div>
            
            {/* 临时识别文本 */}
            {interimTranscript && (
              <p className={`text-sm ${styles.subtext} italic`}>
                "{interimTranscript}"
              </p>
            )}
          </div>
        </div>
      )}

      {/* 处理状态 */}
      {isProcessing && !isListening && !isSpeaking && (
        <div className="flex items-center gap-3">
          {/* 加载指示器 */}
          <div className="flex items-center gap-1">
            <LoadingDot delay={0} />
            <LoadingDot delay={150} />
            <LoadingDot delay={300} />
          </div>
          
          {/* 状态文本 */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <ProcessingIcon size={16} className={`${styles.icon} animate-spin`} />
              <span className={`text-sm font-medium ${styles.text}`}>
                正在处理...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 播放状态 */}
      {isSpeaking && (
        <div className="flex items-center gap-3">
          {/* 音频波形动画 - 用户体验优化：音量指示器 (需求 2.2, 4.3) */}
          <div className="flex items-center gap-1" role="img" aria-label="播放音量指示器">
            <AudioWaveBar delay={0} color="bg-green-500" />
            <AudioWaveBar delay={100} color="bg-green-500" />
            <AudioWaveBar delay={200} color="bg-green-500" />
            <AudioWaveBar delay={300} color="bg-green-500" />
            <AudioWaveBar delay={400} color="bg-green-500" />
          </div>
          
          {/* 状态文本 */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <SpeakerIcon size={16} className={styles.icon} />
              <span className={`text-sm font-medium ${styles.text}`}>
                正在播放...
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 波形条组件（用于监听状态）- 用户体验优化：优化动画效果 (需求 1.2, 4.1)
const WaveBar: React.FC<{ delay: number; color: string }> = ({ delay, color }) => (
  <div
    className={`w-1 ${color} rounded-full animate-wave transition-all duration-200`}
    style={{
      height: '20px',
      animationDelay: `${delay}ms`,
    }}
  />
);

// 音频波形条组件（用于播放状态，更密集）- 用户体验优化：优化动画效果 (需求 2.2, 4.3)
const AudioWaveBar: React.FC<{ delay: number; color: string }> = ({ delay, color }) => (
  <div
    className={`w-1 ${color} rounded-full animate-audio-wave transition-all duration-200`}
    style={{
      height: '24px',
      animationDelay: `${delay}ms`,
    }}
  />
);

// 加载点组件（用于处理状态）
const LoadingDot: React.FC<{ delay: number }> = ({ delay }) => (
  <div
    className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
    style={{
      animationDelay: `${delay}ms`,
    }}
  />
);

// 麦克风图标
const MicrophoneIcon: React.FC<{ size: number; className?: string }> = ({ 
  size, 
  className 
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
    className={className}
  >
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

// 扬声器图标
const SpeakerIcon: React.FC<{ size: number; className?: string }> = ({ 
  size, 
  className 
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
    className={className}
  >
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

// 处理图标（齿轮）
const ProcessingIcon: React.FC<{ size: number; className?: string }> = ({ 
  size, 
  className 
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
    className={className}
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3" />
  </svg>
);
