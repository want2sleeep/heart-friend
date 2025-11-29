import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceSettings } from '../types';

/**
 * useSpeechSynthesis Hook
 * 
 * 封装 Web Speech API 的语音合成功能
 * 支持浏览器原生的 SpeechSynthesis API
 */

interface UseSpeechSynthesisReturn {
  isSpeaking: boolean;        // 是否正在播放
  isPaused: boolean;          // 是否暂停
  isSupported: boolean;       // 浏览器是否支持
  voices: SpeechSynthesisVoice[]; // 可用语音列表
  settings: VoiceSettings;    // 当前设置
  speak: (text: string) => void;  // 播放文本
  pause: () => void;          // 暂停播放
  resume: () => void;         // 恢复播放
  stop: () => void;           // 停止播放
  updateSettings: (settings: Partial<VoiceSettings>) => void; // 更新设置
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  // 检测浏览器支持
  const isSupported = 
    typeof window !== 'undefined' && 
    'speechSynthesis' in window;

  // 状态管理
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<VoiceSettings>({
    rate: 1,
    pitch: 1,
    volume: 1,
    voice: null,
  });

  // 使用 ref 存储当前的 utterance
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // 加载可用语音列表
  const loadVoices = useCallback(() => {
    if (!isSupported) return;

    const availableVoices = window.speechSynthesis.getVoices();
    
    if (availableVoices.length > 0) {
      setVoices(availableVoices);
      
      // 优先选择中文语音
      const chineseVoice = availableVoices.find(
        voice => voice.lang.startsWith('zh')
      );
      
      if (chineseVoice && !settings.voice) {
        setSettings(prev => ({
          ...prev,
          voice: chineseVoice.name,
        }));
      }
    }
  }, [isSupported, settings.voice]);

  // 初始化语音列表
  useEffect(() => {
    if (!isSupported) return;

    // 立即尝试加载
    loadVoices();

    // 监听 voiceschanged 事件（某些浏览器需要）
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported, loadVoices]);

  // 更新状态的辅助函数
  const updateSpeakingState = useCallback(() => {
    if (!isSupported) return;
    
    setIsSpeaking(window.speechSynthesis.speaking);
    setIsPaused(window.speechSynthesis.paused);
  }, [isSupported]);

  // 性能优化：优化长文本分段播放（避免超时）(需求 7.5)
  // 改进的分段算法，考虑标点符号和自然断句
  const splitTextIntoChunks = useCallback((text: string, maxLength: number = 200): string[] => {
    const chunks: string[] = [];
    let currentChunk = '';
    
    // 按句子分割（中文句号、英文句号、问号、感叹号、逗号、分号）
    // 保留分隔符以保持语义完整性
    const sentences = text.split(/([。.!?！？,，;；\n])/);
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      
      // 如果当前句子本身就超过最大长度，强制分割
      if (sentence.length > maxLength) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
        // 按字符强制分割长句
        for (let j = 0; j < sentence.length; j += maxLength) {
          chunks.push(sentence.slice(j, j + maxLength).trim());
        }
      } else if (currentChunk.length + sentence.length <= maxLength) {
        currentChunk += sentence;
      } else {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = sentence;
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    // 过滤空字符串
    return chunks.filter(chunk => chunk.length > 0);
  }, []);

  // 播放文本
  const speak = useCallback((text: string) => {
    if (!isSupported || !text.trim()) return;

    // 停止当前播放
    window.speechSynthesis.cancel();

    // 分段处理长文本
    const chunks = splitTextIntoChunks(text);
    let currentChunkIndex = 0;

    const speakChunk = () => {
      if (currentChunkIndex >= chunks.length) {
        setIsSpeaking(false);
        setIsPaused(false);
        currentUtteranceRef.current = null;
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[currentChunkIndex]);
      currentUtteranceRef.current = utterance;

      // 应用设置
      utterance.rate = settings.rate;
      utterance.pitch = settings.pitch;
      utterance.volume = settings.volume;

      // 选择语音
      if (settings.voice) {
        const selectedVoice = voices.find(v => v.name === settings.voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      // 处理播放完成
      utterance.onend = () => {
        currentChunkIndex++;
        speakChunk();
      };

      // 处理错误
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        setIsPaused(false);
        currentUtteranceRef.current = null;
      };

      // 开始播放
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      setIsPaused(false);
    };

    speakChunk();
  }, [isSupported, settings, voices]);

  // 暂停播放
  const pause = useCallback(() => {
    if (!isSupported) return;
    
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [isSupported]);

  // 恢复播放
  const resume = useCallback(() => {
    if (!isSupported) return;
    
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [isSupported]);

  // 停止播放
  const stop = useCallback(() => {
    if (!isSupported) return;
    
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    currentUtteranceRef.current = null;
  }, [isSupported]);

  // 更新设置
  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
    }));
  }, []);

  // 清理函数 - 性能优化：防止内存泄漏 (需求 7.5)
  useEffect(() => {
    return () => {
      if (isSupported) {
        // 清理当前的 utterance 事件监听器
        if (currentUtteranceRef.current) {
          currentUtteranceRef.current.onend = null;
          currentUtteranceRef.current.onerror = null;
          currentUtteranceRef.current = null;
        }
        // 取消所有语音播放
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    settings,
    speak,
    pause,
    resume,
    stop,
    updateSettings,
  };
}
