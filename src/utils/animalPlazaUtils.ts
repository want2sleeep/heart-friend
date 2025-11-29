/**
 * Animal Plaza Utility Functions
 * Provides helper functions for position generation, duration calculation,
 * mood text selection, and direction calculation
 */

import { MOOD_TEXTS, ANIMATION_CONFIG, AnimationBounds } from '../config/animalPlazaConfig';

export interface Position {
  x: number;  // 0-100 percentage
  y: number;  // 0-100 percentage
}

/**
 * Generates a random position within the specified bounds
 * Requirements: 2.1 - Animals move to random positions within plaza boundaries
 * 
 * @param bounds - The boundary constraints for position generation
 * @returns A Position object with x and y coordinates within bounds
 */
export function generateRandomPosition(bounds: AnimationBounds = ANIMATION_CONFIG.bounds): Position {
  const x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
  const y = bounds.minY + Math.random() * (bounds.maxY - bounds.minY);
  return { x, y };
}

/**
 * Generates a random duration within the specified range
 * Requirements: 2.3 - Animals pause for 1-5 seconds before moving again
 * 
 * @param min - Minimum duration in milliseconds
 * @param max - Maximum duration in milliseconds
 * @returns A random duration between min and max (inclusive)
 */
export function generateRandomDuration(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Returns a random mood text from the predefined list
 * Requirements: 3.2 - Speech bubble displays random mood text from predefined list
 * 
 * @returns A random mood text string in Chinese
 */
export function getRandomMoodText(): string {
  const index = Math.floor(Math.random() * MOOD_TEXTS.length);
  return MOOD_TEXTS[index];
}

/**
 * Calculates the direction an animal should face based on movement
 * Requirements: 2.4 - Animals face the direction of movement
 * 
 * @param from - The starting position
 * @param to - The destination position
 * @returns 'left' if moving left, 'right' if moving right or staying in place
 */
export function calculateDirection(from: Position, to: Position): 'left' | 'right' {
  return to.x < from.x ? 'left' : 'right';
}
