import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Animal from './Animal';
import { ANIMALS } from '../config/animalPlazaConfig';
import { generateRandomPosition } from '../utils/animalPlazaUtils';
import './AnimalPlaza.css';

// 返回图标
const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

/**
 * AnimalPlaza is the main page component that displays a virtual plaza scene
 * with multiple animals moving around and showing mood speech bubbles.
 * 
 * Requirements:
 * - 1.1: Display a background representing a plaza or park scene
 * - 1.2: Show at least 5 different animals positioned randomly
 * - 5.1: Use soft, pastel color scheme for background
 */
const AnimalPlaza: React.FC = () => {
  const navigate = useNavigate();
  
  // Generate random initial positions for all animals (memoized to prevent re-generation on re-render)
  const animalsWithPositions = useMemo(() => {
    return ANIMALS.map(animal => ({
      ...animal,
      initialPosition: generateRandomPosition(),
    }));
  }, []);

  return (
    <div className="animal-plaza">
      {/* 左上角返回按钮 */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all shadow-lg backdrop-blur-md border bg-white/80 border-slate-300 text-slate-700 hover:bg-white"
        title="返回主页"
      >
        <BackIcon />
        返回
      </button>
      <div className="animal-plaza__background">
        {/* Decorative elements for the plaza scene */}
        <div className="animal-plaza__ground" />
        <div className="animal-plaza__decoration animal-plaza__decoration--tree-1" />
        <div className="animal-plaza__decoration animal-plaza__decoration--tree-2" />
        <div className="animal-plaza__decoration animal-plaza__decoration--bush-1" />
        <div className="animal-plaza__decoration animal-plaza__decoration--bush-2" />
      </div>
      
      <div className="animal-plaza__content">
        {animalsWithPositions.map(animal => (
          <Animal
            key={animal.id}
            id={animal.id}
            emoji={animal.emoji}
            initialPosition={animal.initialPosition}
          />
        ))}
      </div>
    </div>
  );
};

export default AnimalPlaza;
