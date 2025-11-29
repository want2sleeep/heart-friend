import { useState, useEffect, useCallback, useRef } from 'react';
import { VoiceChatSettings } from '../types';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useSpeechSynthesis } from './useSpeechSynthesis';

/**
 * useVoiceChat Hook
 * 
 * 整合语音识别和合成，提供统一的语音聊天接口
 * 包含设置持久化、错误处理和状态协调
 */

interface UseVoiceChatReturn {
  // 状态
  isListening: boolean;
  isSpeaking: boolean;
  isSupported: {
    recognition: boolean;
    synthesis: boolean;
  };
  settings: VoiceChatSettings;
  
  // 语音识别
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  
  // 语音合成
  speak: (text: string) => void;
  stopSpeaking: () => void;
  
  // 设置
  updateSettings: (settings: Partial<VoiceChatSettings>) => void;
  
  // 错误
  error: string | null;
  clearError: () => void;
}

// 默认设置
const DEFAULT_SETTINGS: VoiceChatSettings = {
  voiceInputEnabled: false,
  voiceOutputEnabled: false,
  autoSend: false,
  speechSettings: {
    rate: 1,
    pitch: 1,
    volume: 1,
    voice: null,
  },
};

// localStorage 键
const STORAGE_KEY = 'voice-chat-settings';

// 从 localStorage 加载设置
function loadSettings(): VoiceChatSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // 合并默认设置，确保所有字段都存在
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        speechSettings: {
          ...DEFAULT_SETTINGS.speechSettings,
          ...parsed.speechSettings,
        },
      };
    }
  } catch (err) {
    console.error('Error loading voice chat settings:', err);
  }
  return DEFAULT_SETTINGS;
}

// 保存设置到 localStorage
function saveSettings(settings: VoiceChatSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving voice chat settings:', err);
  }
}

export function useVoiceChat(): UseVoiceChatReturn {
  // 加载持久化设置
  const [settings, setSettings] = useState<VoiceChatSettings>(loadSettings);
  
  // 性能优化：防抖定时器引用 (需求 7.5)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 集成语音识别
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported: recognitionSupported,
    error: recognitionError,
    startListening: startRecognition,
    stopListening: stopRecognition,
    resetTranscript,
  } = useSpeechRecognition({
    lang: 'zh-CN',
    continuous: false,
    interimResults: true,
  });

  // 集成语音合成
  const {
    isSpeaking,
    isSupported: synthesisSupported,
    stop: stopSynthesis,
    speak: speakSynthesis,
    updateSettings: updateSpeechSettings,
  } = useSpeechSynthesis();

  // 统一错误状态
  const [error, setError] = useState<string | null>(null);

  // 同步语音合成设置
  useEffect(() => {
    updateSpeechSettings(settings.speechSettings);
  }, [settings.speechSettings, updateSpeechSettings]);

  // 监听识别错误
  useEffect(() => {
    if (recognitionError) {
      setError(recognitionError);
    }
  }, [recognitionError]);

  // 更新设置并持久化
  const updateSettings = useCallback((newSettings: Partial<VoiceChatSettings>) => {
    setSettings(prev => {
      const updated = {
        ...prev,
        ...newSettings,
        // 如果更新了 speechSettings，需要深度合并
        speechSettings: newSettings.speechSettings 
          ? { ...prev.speechSettings, ...newSettings.speechSettings }
          : prev.speechSettings,
      };
      
      // 保存到 localStorage
      saveSettings(updated);
      
      return updated;
    });
  }, []);

  // 开始监听（检查是否启用）
  // 性能优化：防抖避免频繁操作 (需求 7.5)
  const startListening = useCallback(() => {
    // 清除之前的防抖定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // 使用防抖延迟执行
    debounceTimerRef.current = setTimeout(() => {
      if (!settings.voiceInputEnabled) {
        setError('语音输入未启用');
        return;
      }
      
      if (!recognitionSupported) {
        setError('浏览器不支持语音识别');
        return;
      }
      
      setError(null);
      resetTranscript();
      startRecognition();
    }, 200); // 200ms 防抖延迟
  }, [settings.voiceInputEnabled, recognitionSupported, startRecognition, resetTranscript]);

  // 停止监听
  const stopListening = useCallback(() => {
    stopRecognition();
  }, [stopRecognition]);

  // 播放语音（检查是否启用）
  const speak = useCallback((text: string) => {
    if (!settings.voiceOutputEnabled) {
      return;
    }
    
    if (!synthesisSupported) {
      setError('浏览器不支持语音合成');
      return;
    }
    
    if (!text.trim()) {
      return;
    }
    
    speakSynthesis(text);
  }, [settings.voiceOutputEnabled, synthesisSupported, speakSynthesis]);

  // 停止播放
  const stopSpeaking = useCallback(() => {
    stopSynthesis();
  }, [stopSynthesis]);

  // 清除错误
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 清理函数 - 性能优化：清理防抖定时器 (需求 7.5)
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    // 状态
    isListening,
    isSpeaking,
    isSupported: {
      recognition: recognitionSupported,
      synthesis: synthesisSupported,
    },
    settings,
    
    // 语音识别
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    
    // 语音合成
    speak,
    stopSpeaking,
    
    // 设置
    updateSettings,
    
    // 错误
    error,
    clearError,
  };
}
