import React, { useEffect, useRef, useState } from 'react';
import type { MoodConfigItem, ChatError } from '../types';
import { useChatAPI } from '../hooks/useChatAPI';
import { useVoiceChat } from '../hooks/useVoiceChat';
import { VoiceButton } from './VoiceButton';
import { VoiceIndicator } from './VoiceIndicator';
import { VoiceSettings } from './VoiceSettings';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

interface ChatInterfaceProps {
  currentMood: MoodConfigItem;
  showVoiceSettings?: boolean;
  onCloseVoiceSettings?: () => void;
}

// Helper function to get error title based on error type
// Validates: Requirements 5.1, 5.2, 5.3, 5.4
const getErrorTitle = (errorType: string): string => {
  switch (errorType) {
    case 'network':
      return '网络错误';
    case 'auth':
      return '认证错误';
    case 'rate_limit':
      return '请求限制';
    case 'timeout':
      return '请求超时';
    default:
      return '错误';
  }
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  currentMood,
  showVoiceSettings: externalShowVoiceSettings,
  onCloseVoiceSettings
}) => {
  const [inputValue, setInputValue] = useState("");
  const [internalShowVoiceSettings, setInternalShowVoiceSettings] = useState(false);
  
  // 使用外部或内部的 showVoiceSettings 状态
  const showVoiceSettings = externalShowVoiceSettings ?? internalShowVoiceSettings;
  const setShowVoiceSettings = (value: boolean) => {
    if (onCloseVoiceSettings && !value) {
      onCloseVoiceSettings();
    } else {
      setInternalShowVoiceSettings(value);
    }
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use the real chat API hook with current mood's system prompt
  const { messages, isLoading, error, sendMessage, clearError } = useChatAPI(currentMood.systemPrompt);
  
  // Store last message for retry functionality
  const lastUserMessageRef = useRef<string>("");
  
  // 集成语音聊天功能 (需求 7.1, 7.2, 7.3, 7.4, 7.5)
  const {
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    settings: voiceSettings,
    updateSettings: updateVoiceSettings,
    isSupported: voiceSupported,
    error: voiceError,
    clearError: clearVoiceError,
  } = useVoiceChat();
  
  // 获取可用语音列表用于设置面板
  const { voices } = useSpeechSynthesis();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 追踪已处理的 transcript，避免重复发送
  const lastProcessedTranscriptRef = useRef<string>("");

  // 监听语音识别结果，自动填充输入框 (需求 1.4, 7.1)
  useEffect(() => {
    // 只处理新的、非空的 transcript
    if (transcript && transcript !== lastProcessedTranscriptRef.current) {
      setInputValue(transcript);
      
      // 如果启用自动发送，则自动发送消息 (需求 1.1)
      if (voiceSettings.autoSend && !isLoading) {
        lastProcessedTranscriptRef.current = transcript; // 标记为已处理
        const messageToSend = transcript;
        lastUserMessageRef.current = messageToSend;
        setInputValue(""); // 清空输入框
        sendMessage(messageToSend);
      }
    }
  }, [transcript, voiceSettings.autoSend, isLoading, sendMessage]);

  // 追踪已播放的消息 ID，避免重复播放
  const lastSpokenMessageIdRef = useRef<string>("");

  // 监听消息变化，自动播放 AI 回复 (需求 2.1, 2.4, 7.2)
  useEffect(() => {
    if (messages.length > 0 && voiceSettings.voiceOutputEnabled) {
      const lastMessage = messages[messages.length - 1];
      // 只播放 assistant 的回复，不播放 system 消息，且避免重复播放
      if (lastMessage.role === 'assistant' && lastMessage.id !== lastSpokenMessageIdRef.current) {
        lastSpokenMessageIdRef.current = lastMessage.id;
        speak(lastMessage.content);
      }
    }
  }, [messages, voiceSettings.voiceOutputEnabled, speak]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const messageToSend = inputValue;
    lastUserMessageRef.current = messageToSend; // Store for retry
    setInputValue(""); // Clear input immediately for better UX
    
    await sendMessage(messageToSend);
  };

  const handleRetry = async () => {
    if (!lastUserMessageRef.current || isLoading) return;
    
    clearError(); // Clear error before retry
    await sendMessage(lastUserMessageRef.current);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-white shadow-sm flex items-center gap-3">
        <div className={`p-2 rounded-full ${currentMood.color} text-white`}>
          <Bot size={20} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">AI Companion</h3>
          <p className={`text-xs font-medium uppercase ${currentMood.accentColor.replace('text-', 'text-opacity-80 text-')}`}>
            Mode: {currentMood.label}
          </p>
        </div>
        
        {/* 语音设置按钮 (需求 3.1, 3.2, 6.1, 6.2, 6.3) */}
        {(voiceSupported.recognition || voiceSupported.synthesis) && (
          <button
            onClick={() => setShowVoiceSettings(true)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="语音设置"
            title="语音设置"
          >
            <SettingsIcon size={20} className="text-slate-600" />
          </button>
        )}
      </div>

      {/* Messages Area with GIF background */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 relative"
        style={{
          backgroundImage: 'url(../../chatbg.gif)',
          backgroundSize: '300px auto',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Messages content */}
        <div className="relative z-10 space-y-4">
        {messages.map((msg) => {
          // Skip system notification messages (mood changes)
          if (msg.role === 'system') {
            return null;
          }
          
          return (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        
        {/* Loading indicator - "正在输入..." animation */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-bl-none shadow-sm p-3">
              <div className="flex items-center gap-1">
                <span className="text-sm">正在输入</span>
                <div className="flex gap-1">
                  <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 语音播放停止按钮 (需求 2.3) */}
        {isSpeaking && (
          <div className="flex justify-center">
            <button
              onClick={stopSpeaking}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-full shadow-md transition-colors flex items-center gap-2"
              aria-label="停止语音播放"
            >
              <StopCircle size={16} />
              停止播放
            </button>
          </div>
        )}
        
        <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error Display - Enhanced with error type-specific messages and retry */}
      {error && (
        <div className="mx-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle size={16} className="text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  {getErrorTitle(error.type)}
                </span>
              </div>
              <p className="text-sm text-red-700 mb-2">{error.message}</p>
              {/* Additional context based on error type */}
              {error.type === 'auth' && (
                <p className="text-xs text-red-600 mt-1">
                  💡 提示：请在 .env.local 文件中配置正确的 VITE_OPENAI_API_KEY
                </p>
              )}
              {error.type === 'network' && (
                <p className="text-xs text-red-600 mt-1">
                  💡 提示：请检查网络连接或 API 服务器地址是否正确
                </p>
              )}
              {error.type === 'rate_limit' && (
                <p className="text-xs text-red-600 mt-1">
                  💡 提示：请等待几分钟后再试，或检查您的 API 配额
                </p>
              )}
              {error.type === 'timeout' && (
                <p className="text-xs text-red-600 mt-1">
                  💡 提示：请求时间过长，可能是网络不稳定或服务器响应慢
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            {lastUserMessageRef.current && (
              <button
                onClick={handleRetry}
                disabled={isLoading}
                className="text-xs px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <RefreshCw size={12} />
                重试
              </button>
            )}
            <button
              onClick={clearError}
              className="text-xs px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* 语音错误显示 (需求 1.5, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5) */}
      {/* 用户体验优化：改进错误提示文案和样式 (需求 1.5, 4.4) */}
      {voiceError && (
        <div className="mx-4 mb-2 p-3 bg-orange-50 border border-orange-200 rounded-lg shadow-sm animate-fade-in">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle size={16} className="text-orange-600 flex-shrink-0" />
                <span className="text-sm font-medium text-orange-800">
                  语音功能提示
                </span>
              </div>
              <p className="text-sm text-orange-700 mb-2 leading-relaxed">{voiceError}</p>
              
              {/* 根据错误类型提供具体提示 */}
              {voiceError.includes('权限') && (
                <p className="text-xs text-orange-600 mt-1">
                  💡 提示：请在浏览器设置中允许麦克风权限，然后刷新页面重试
                </p>
              )}
              {voiceError.includes('不支持') && (
                <p className="text-xs text-orange-600 mt-1">
                  💡 提示：请使用 Chrome、Edge 或 Safari 浏览器以获得完整的语音功能支持
                </p>
              )}
              {voiceError.includes('网络') && (
                <p className="text-xs text-orange-600 mt-1">
                  💡 提示：语音识别需要网络连接，请检查您的网络状态
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            {/* 重试按钮 */}
            {voiceError.includes('权限') || voiceError.includes('网络') ? (
              <button
                onClick={() => {
                  clearVoiceError();
                  startListening();
                }}
                className="text-xs px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors flex items-center gap-1"
              >
                <RefreshCw size={12} />
                重试
              </button>
            ) : null}
            <button
              onClick={clearVoiceError}
              className="text-xs px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* 语音状态指示器 (需求 1.2, 2.2, 4.1, 4.2, 4.3) */}
      <VoiceIndicator
        isListening={isListening}
        isSpeaking={isSpeaking}
        isProcessing={isLoading && (isListening || transcript.length > 0)}
        interimTranscript={interimTranscript}
      />

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex gap-2">
          {/* 语音输入按钮 (需求 1.1, 7.1) */}
          <VoiceButton
            isListening={isListening}
            isSupported={voiceSupported.recognition}
            onStart={startListening}
            onStop={stopListening}
            disabled={isLoading}
          />
          
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder={isLoading ? "等待回复中..." : "输入消息..."}
            disabled={isLoading}
            className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button 
            onClick={handleSend}
            className={`p-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={!inputValue.trim() || isLoading}
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* 语音设置模态框 (需求 3.1, 3.2, 6.1, 6.2, 6.3) */}
      {showVoiceSettings && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowVoiceSettings(false)}
        >
          <div 
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowVoiceSettings(false)}
              className="absolute -top-2 -right-2 p-2 bg-white rounded-full shadow-lg hover:bg-slate-100 transition-colors z-10"
              aria-label="关闭设置"
            >
              <XIcon size={20} className="text-slate-600" />
            </button>
            
            {/* 设置面板 */}
            <VoiceSettings
              settings={voiceSettings}
              voices={voices}
              isSupported={voiceSupported}
              onUpdateSettings={updateVoiceSettings}
              onPreview={speak}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Simple Icons for the chat
const Send = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);
const Bot = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>
);
const AlertCircle = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);
const RefreshCw = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
);
const StopCircle = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><rect x="9" y="9" width="6" height="6"></rect></svg>
);
const SettingsIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);
const XIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);