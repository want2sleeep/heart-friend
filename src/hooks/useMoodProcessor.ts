import { useState, useEffect, useRef } from 'react';
import { MOOD_CONFIG } from '../config/moodConfig';
import { MoodConfigItem, MoodState } from '../types';

export const useMoodProcessor = (latestValue: number): MoodState => {
  const [moodState, setMoodState] = useState<MoodState>({
    currentMood: MOOD_CONFIG.calm,
    smoothedValue: 0
  });

  // Rolling buffer to calculate moving average
  // Assuming data comes in roughly every 50-100ms (due to our throttle in useSerialPort),
  // keeping 50 points gives us about 2-5 seconds of history.
  const bufferRef = useRef<number[]>([]);
  const BUFFER_SIZE = 50;

  useEffect(() => {
    const buffer = bufferRef.current;
    
    // Handle invalid data: if latestValue is 0 (disconnected) or less than 20 (invalid sensor reading)
    if (latestValue === 0 || latestValue < 20) {
      // Clear buffer if disconnected
      if (latestValue === 0 && buffer.length > 0) {
        bufferRef.current = [];
        setMoodState({
          currentMood: MOOD_CONFIG.calm,
          smoothedValue: 0
        });
      }
      // Don't add invalid values to buffer, just return
      return;
    }
    
    // Add new value to buffer
    buffer.push(latestValue);
    if (buffer.length > BUFFER_SIZE) {
      buffer.shift();
    }

    // Calculate smoothed average
    const sum = buffer.reduce((a: number, b: number) => a + b, 0);
    const avg = buffer.length > 0 ? sum / buffer.length : 0;

    // Determine mood based on 6-state thresholds
    // Requirements 5.1-5.6: Map sensor values to mood states
    let newMood: MoodConfigItem = MOOD_CONFIG.calm; // Default fallback

    if (avg >= 20 && avg < 25) {
      newMood = MOOD_CONFIG.very_calm;      // 非常平静 (20-25)
    } else if (avg >= 25 && avg < 30) {
      newMood = MOOD_CONFIG.calm;           // 平静 (25-30)
    } else if (avg >= 30 && avg < 35) {
      newMood = MOOD_CONFIG.light_tension;  // 轻度紧张 (30-35)
    } else if (avg >= 35 && avg < 40) {
      newMood = MOOD_CONFIG.tension;        // 紧张 (35-40)
    } else if (avg >= 40 && avg < 50) {
      newMood = MOOD_CONFIG.excited;        // 兴奋 (40-50)
    } else if (avg >= 50) {
      newMood = MOOD_CONFIG.very_excited;   // 极度兴奋 (50+)
    }

    // Optimization: Only update state if values changed significantly or mood changed
    // to prevent micro-renderings if avg changes by 0.0001
    setMoodState((prevState: MoodState) => {
      const moodChanged = prevState.currentMood.id !== newMood.id;
      const valueChanged = Math.abs(prevState.smoothedValue - avg) > 0.5;

      if (moodChanged || valueChanged) {
        return {
          currentMood: newMood,
          smoothedValue: Math.round(avg) // Round for UI cleanliness
        };
      }
      return prevState;
    });

  }, [latestValue]);

  return moodState;
};
