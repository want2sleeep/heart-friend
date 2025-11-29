import React, { useState, useEffect, useRef } from 'react';
import SpeechBubble from './SpeechBubble';
import { ANIMATION_CONFIG } from '../config/animalPlazaConfig';
import './Animal.css';
import {
  Position,
  generateRandomPosition,
  generateRandomDuration,
  getRandomMoodText,
  calculateDirection,
} from '../utils/animalPlazaUtils';

interface AnimalProps {
  id: string;
  emoji: string;
  initialPosition: Position;
}

/**
 * Animal component represents a single animal in the plaza.
 * Handles movement, direction facing, and speech bubble display.
 * 
 * Requirements:
 * - 2.1: Animals move to random positions within plaza boundaries
 * - 2.2: Animals animate smoothly to new position over 2-4 seconds
 * - 2.3: Animals pause for 1-5 seconds before moving again
 * - 2.4: Animals face the direction of movement
 * - 3.1: Speech bubble appears when animal is idle
 * - 3.3: Speech bubble remains visible for 3-5 seconds
 * - 3.5: Animal shall not move while bubble is visible
 * - 5.2: Animals have subtle shadow effect
 */
const Animal: React.FC<AnimalProps> = ({ id, emoji, initialPosition }) => {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isMoving, setIsMoving] = useState(false);
  const [isFacingLeft, setIsFacingLeft] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  
  const transitionDurationRef = useRef<number>(ANIMATION_CONFIG.moveDuration.min);
  const isMountedRef = useRef(true);

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Main behavior loop
  useEffect(() => {
    let timeoutId: number;

    const scheduleNextAction = () => {
      if (!isMountedRef.current) return;
      
      const pauseDuration = generateRandomDuration(
        ANIMATION_CONFIG.pauseDuration.min,
        ANIMATION_CONFIG.pauseDuration.max
      );

      timeoutId = window.setTimeout(() => {
        if (!isMountedRef.current) return;
        
        // Decide whether to show bubble or move
        if (Math.random() < ANIMATION_CONFIG.bubbleChance) {
          // Show bubble
          const moodText = getRandomMoodText();
          setShowBubble(true);
          setCurrentMood(moodText);

          const bubbleDuration = generateRandomDuration(
            ANIMATION_CONFIG.bubbleDuration.min,
            ANIMATION_CONFIG.bubbleDuration.max
          );

          timeoutId = window.setTimeout(() => {
            if (!isMountedRef.current) return;
            setShowBubble(false);
            
            // Schedule next action after bubble hides
            setTimeout(() => {
              setCurrentMood(null);
              scheduleNextAction();
            }, 300);
          }, bubbleDuration);
        } else {
          // Start movement
          const newPosition = generateRandomPosition();
          const moveDuration = generateRandomDuration(
            ANIMATION_CONFIG.moveDuration.min,
            ANIMATION_CONFIG.moveDuration.max
          );

          transitionDurationRef.current = moveDuration;
          
          setPosition(prev => {
            const direction = calculateDirection(prev, newPosition);
            setIsFacingLeft(direction === 'left');
            return newPosition;
          });
          setIsMoving(true);

          // After movement completes
          timeoutId = window.setTimeout(() => {
            if (!isMountedRef.current) return;
            setIsMoving(false);
            scheduleNextAction();
          }, moveDuration);
        }
      }, pauseDuration);
    };

    // Start the loop
    scheduleNextAction();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []); // Empty deps - runs once on mount

  // Build CSS classes based on state
  const classNames = [
    'animal',
    isMoving ? 'animal--moving' : 'animal--idle',
    isFacingLeft ? 'animal--facing-left' : 'animal--facing-right',
  ].join(' ');

  // Dynamic styles for position and transition duration
  const animalStyle: React.CSSProperties = {
    left: `${position.x}%`,
    top: `${position.y}%`,
    transitionDuration: isMoving ? `${transitionDurationRef.current}ms` : undefined,
  };

  return (
    <div className={classNames} style={animalStyle} data-animal-id={id}>
      <SpeechBubble text={currentMood || ''} visible={showBubble} />
      <span className="animal__sprite" role="img" aria-label={id}>
        {emoji}
      </span>
    </div>
  );
};

export default Animal;
