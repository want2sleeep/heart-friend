import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useSpeechRecognition Hook
 * 
 * 封装 Web Speech API 的语音识别功能
 * 支持浏览器原生的 SpeechRecognition API
 */

interface UseSpeechRecognitionOptions {
  lang?: string;              // 识别语言，默认 'zh-CN'
  continuous?: boolean;       // 是否连续识别，默认 false
  interimResults?: boolean;   // 是否返回临时结果，默认 true
  maxAlternatives?: number;   // 最大候选数，默认 1
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;       // 是否正在监听
  transcript: string;         // 识别的文本
  interimTranscript: string;  // 临时文本（实时）
  isSupported: boolean;       // 浏览器是否支持
  error: string | null;       // 错误信息
  startListening: () => void; // 开始监听
  stopListening: () => void;  // 停止监听
  resetTranscript: () => void;// 重置文本
}

export function useSpeechRecognition(
  options?: UseSpeechRecognitionOptions
): UseSpeechRecognitionReturn {
  // 状态管理
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // 检测浏览器支持
  const isSupported = 
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // 使用 ref 存储 SpeechRecognition 实例和静默超时
  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 默认选项
  const {
    lang = 'zh-CN',
    continuous = false,
    interimResults = true,
    maxAlternatives = 1,
  } = options || {};

  // 清除静默超时
  const clearSilenceTimeout = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  }, []);

  // 设置静默超时（1.5秒无语音自动停止）
  // 性能优化：使用防抖避免频繁操作 (需求 7.5)
  const setSilenceTimeout = useCallback(() => {
    clearSilenceTimeout();
    silenceTimeoutRef.current = setTimeout(() => {
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // 忽略停止时的错误
          console.debug('Recognition already stopped');
        }
      }
    }, 1500);
  }, [isListening, clearSilenceTimeout]);

  // 停止监听
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
    }
    clearSilenceTimeout();
    setIsListening(false);
  }, [clearSilenceTimeout]);

  // 开始监听
  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('浏览器不支持语音识别功能');
      return;
    }

    if (isListening) {
      return;
    }

    setError(null);
    setTranscript('');
    setInterimTranscript('');

    try {
      // 创建 SpeechRecognition 实例
      const SpeechRecognition = 
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      // 配置识别选项
      recognition.lang = lang;
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.maxAlternatives = maxAlternatives;

      // 处理识别结果
      recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0].transcript;

          if (result.isFinal) {
            finalText += text;
          } else {
            interimText += text;
          }
        }

        if (finalText) {
          setTranscript((prev) => prev + finalText);
          setInterimTranscript('');
        } else {
          setInterimTranscript(interimText);
        }

        // 重置静默超时
        setSilenceTimeout();
      };

      // 处理错误 - 用户体验优化：改进错误提示文案 (需求 1.5, 4.4)
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        let errorMessage = '';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = '😶 未检测到语音，请靠近麦克风清晰地说话';
            break;
          case 'audio-capture':
            errorMessage = '🎤 无法访问麦克风，请检查设备连接';
            break;
          case 'not-allowed':
            errorMessage = '🔒 麦克风权限被拒绝，请在浏览器设置中允许麦克风访问';
            break;
          case 'network':
            errorMessage = '🌐 网络连接失败，语音识别需要网络支持';
            break;
          case 'aborted':
            // 用户主动中止，不显示错误
            errorMessage = '';
            break;
          case 'service-not-allowed':
            errorMessage = '⚠️ 语音识别服务不可用，请稍后重试';
            break;
          case 'bad-grammar':
            errorMessage = '⚠️ 语音识别配置错误';
            break;
          default:
            errorMessage = `⚠️ 语音识别遇到问题：${event.error}`;
        }

        if (errorMessage) {
          setError(errorMessage);
        }
        
        setIsListening(false);
        clearSilenceTimeout();
      };

      // 处理开始事件
      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        setSilenceTimeout();
      };

      // 处理结束事件
      recognition.onend = () => {
        setIsListening(false);
        clearSilenceTimeout();
      };

      // 开始识别
      recognition.start();
    } catch (err) {
      console.error('Error starting recognition:', err);
      setError('启动语音识别失败');
      setIsListening(false);
    }
  }, [isSupported, isListening, lang, continuous, interimResults, maxAlternatives, setSilenceTimeout, clearSilenceTimeout]);

  // 重置文本
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  // 清理函数 - 性能优化：防止内存泄漏 (需求 7.5)
  useEffect(() => {
    return () => {
      // 清理事件监听器
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onstart = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
        } catch (err) {
          // 忽略清理时的错误
          console.debug('Error during recognition cleanup:', err);
        }
        recognitionRef.current = null;
      }
      clearSilenceTimeout();
    };
  }, [clearSilenceTimeout]);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
