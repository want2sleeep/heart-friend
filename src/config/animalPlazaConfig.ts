/**
 * Animal Plaza Configuration
 * Contains hardcoded data for animals, mood texts, and animation settings
 */

export interface AnimalData {
  id: string;
  emoji: string;
}

export interface AnimationBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface DurationRange {
  min: number;
  max: number;
}

export interface AnimationConfigType {
  moveDuration: DurationRange;
  pauseDuration: DurationRange;
  bubbleDuration: DurationRange;
  bubbleChance: number;
  bounds: AnimationBounds;
}

// 7 different animals with distinct emojis (Requirements 1.3)
export const ANIMALS: AnimalData[] = [
  { id: 'cat', emoji: '🐱' },
  { id: 'dog', emoji: '🐶' },
  { id: 'rabbit', emoji: '🐰' },
  { id: 'bear', emoji: '🐻' },
  { id: 'panda', emoji: '🐼' },
  { id: 'fox', emoji: '🦊' },
  { id: 'hamster', emoji: '🐹' },
];

// 24 mood texts in Chinese covering various emotions (Requirements 4.1, 4.2, 4.3)
export const MOOD_TEXTS: string[] = [
  // 开心 (Happy)
  '今天心情超好！',
  '阳光真舒服~',
  '好想吃零食！',
  '哈哈哈太开心了',
  '生活真美好！',
  '遇到好事啦~',

  // 平静 (Calm)
  '发呆中...',
  '好安静啊',
  '散步真惬意',
  '今天天气不错',
  '岁月静好~',
  '享受当下',

  // 疲惫 (Tired)
  '好困啊...',
  '想睡觉了',
  '累了累了',
  '打个盹吧',
  '眼皮好重',
  '休息一下~',

  // 好奇 (Curious)
  '那是什么？',
  '好奇怪啊',
  '让我看看',
  '有意思！',
  '这是啥呀？',
  '好神奇！',
];

// Animation configuration (Requirements 2.2, 2.3, 3.3)
export const ANIMATION_CONFIG: AnimationConfigType = {
  moveDuration: { min: 2000, max: 4000 },      // 移动动画时长 (ms)
  pauseDuration: { min: 1000, max: 3000 },     // 暂停时长 (ms)
  bubbleDuration: { min: 3000, max: 5000 },    // 气泡显示时长 (ms)
  bubbleChance: 0.3,                            // 气泡出现概率
  bounds: { minX: 5, maxX: 95, minY: 20, maxY: 85 }, // 移动边界 (%)
};
