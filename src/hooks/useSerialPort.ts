import { useState, useRef, useCallback, useEffect } from 'react';

interface SerialHookReturn {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isConnected: boolean;
  latestValue: number;
  toggleMockMode: () => void;
  isMockMode: boolean;
}

export const useSerialPort = (): SerialHookReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [latestValue, setLatestValue] = useState(0);
  const [isMockMode, setIsMockMode] = useState(false);

  // Refs for managing the stream and interval without causing re-renders
  const portRef = useRef<any>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<string> | null>(null);
  const keepReadingRef = useRef(false);
  const mockIntervalRef = useRef<number | null>(null);
  
  // Ref to throttle state updates. We might receive 100 serial events/sec,
  // but we only want to trigger a React render ~10-20 times/sec max.
  const lastUpdateRef = useRef<number>(0);
  const UPDATE_THROTTLE_MS = 50; // Update state max every 50ms (20fps)

  // Helper to safely update state with throttling
  const updateValueThrottled = useCallback((newValue: number) => {
    const now = Date.now();
    if (now - lastUpdateRef.current > UPDATE_THROTTLE_MS) {
      setLatestValue(newValue);
      lastUpdateRef.current = now;
    }
  }, []);

  // --- Mock Mode Logic ---
  const startMockMode = useCallback(() => {
    if (mockIntervalRef.current) return;
    
    let time = 0;
    mockIntervalRef.current = window.setInterval(() => {
      time += 0.1;
      // Simulate a sine wave + some random noise to look like organic bio-data
      // Oscillates between roughly 10 and 90
      const base = Math.sin(time) * 35 + 50; 
      const noise = (Math.random() - 0.5) * 10;
      const val = Math.max(0, Math.min(100, Math.floor(base + noise)));
      
      updateValueThrottled(val);
    }, 100); // Internal simulation tick rate
    setIsConnected(true);
  }, [updateValueThrottled]);

  const stopMockMode = useCallback(() => {
    if (mockIntervalRef.current) {
      clearInterval(mockIntervalRef.current);
      mockIntervalRef.current = null;
    }
    setIsConnected(false);
    setLatestValue(0);
  }, []);

  const toggleMockMode = useCallback(() => {
    if (isMockMode) {
      stopMockMode();
      if (isConnected) disconnect(); // Ensure everything is clean
    }
    setIsMockMode(prev => !prev);
  }, [isMockMode, stopMockMode]); // We don't auto-start here, user clicks Connect

  // --- Web Serial Logic ---
  const connect = async () => {
    if (isMockMode) {
      startMockMode();
      return;
    }

    if (!('serial' in navigator)) {
      alert("Web Serial API not supported in this browser. Try Chrome or Edge.");
      return;
    }

    try {
      // Prompt user to select an Arduino/Serial device
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 9600 }); // Standard baud rate for many sensors
      
      portRef.current = port;
      keepReadingRef.current = true;
      setIsConnected(true);

      readLoop(port);
    } catch (err) {
      console.error("Error connecting to serial port:", err);
      setIsConnected(false);
    }
  };

  const readLoop = async (port: any) => {
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();
    readerRef.current = reader;

    let buffer = '';

    try {
      while (keepReadingRef.current) {
        const { value, done } = await reader.read();
        if (done) {
          reader.releaseLock();
          break;
        }
        if (value) {
          buffer += value;
          // Split by newline to get complete data packets
          const lines = buffer.split('\n');
          // Keep the last partial fragment in the buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed) {
              console.log('[Serial Data] Raw:', trimmed);
              
              // 优先匹配 "GSR值: 数字" 或 "当前GSR值: 数字" 格式
              const gsrMatch = trimmed.match(/GSR值[：:]\s*(\d+)/);
              if (gsrMatch) {
                const num = parseFloat(gsrMatch[1]);
                if (!isNaN(num) && num > 0) {
                  // Assuming sensor sends 0-100 or 0-1023 mapped to 0-100
                  // If value is > 100, assume it's 0-1023 range and scale it
                  let scaled = num;
                  if (num > 100) {
                    scaled = (num / 1023) * 100;
                  }
                  const clamped = Math.max(0, Math.min(100, scaled));
                  console.log('[Serial Data] Parsed:', num, '→ Scaled:', scaled, '→ Clamped:', clamped);
                  updateValueThrottled(clamped);
                  continue; // 成功解析，跳过其他匹配
                }
              }
              
              // 备用：尝试提取任何数字（但跳过包含中文错误信息的行）
              if (!trimmed.includes('分析') && !trimmed.includes('情绪') && !trimmed.includes('信号') && !trimmed.includes('检测')) {
                const match = trimmed.match(/[-+]?\d*\.?\d+/);
                if (match) {
                  const num = parseFloat(match[0]);
                  if (!isNaN(num) && num > 0) {
                    let scaled = num;
                    if (num > 100) {
                      scaled = (num / 1023) * 100;
                    }
                    const clamped = Math.max(0, Math.min(100, scaled));
                    console.log('[Serial Data] Parsed:', num, '→ Scaled:', scaled, '→ Clamped:', clamped);
                    updateValueThrottled(clamped);
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Read loop error:", error);
    } finally {
      reader.releaseLock();
    }
  };

  const disconnect = async () => {
    if (isMockMode) {
      stopMockMode();
      return;
    }

    keepReadingRef.current = false;
    if (readerRef.current) {
      await readerRef.current.cancel();
      readerRef.current = null;
    }
    if (portRef.current) {
      await portRef.current.close();
      portRef.current = null;
    }
    setIsConnected(false);
    setLatestValue(0);
  };

  return {
    connect,
    disconnect,
    isConnected,
    latestValue,
    toggleMockMode,
    isMockMode
  };
};
