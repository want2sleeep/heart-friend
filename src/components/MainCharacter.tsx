import React, { useState } from 'react';

/**
 * MainCharacter Component
 * 显示主角色图像（main.png），包含图片加载和错误处理逻辑
 * 
 * Requirements: 1.1, 1.2
 */
export const MainCharacter: React.FC = () => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 处理图片加载错误
   * Requirement 1.1: 添加图片加载错误处理
   */
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('Main character image failed to load:', e.currentTarget.src);
    setImageError(true);
    setIsLoading(false);
  };

  /**
   * 处理图片加载成功
   */
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="main-character-container w-full max-w-md mx-auto my-6">
      {imageError ? (
        // 错误占位符
        <div className="w-full aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 shadow-inner">
          <svg 
            width="64" 
            height="64" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <p className="mt-4 text-sm">图片加载失败</p>
        </div>
      ) : (
        <>
          {/* 加载占位符 */}
          {isLoading && (
            <div className="w-full aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center animate-pulse">
              <div className="w-16 h-16 border-4 border-slate-300 border-t-indigo-400 rounded-full animate-spin" />
            </div>
          )}
          
          {/* 主角色图片 - Requirement 1.2: 保持宽高比 */}
          <img
            src="/main.png"
            alt="Main Character"
            className={`main-character-image w-full h-auto object-contain transition-opacity duration-300 ${
              isLoading ? 'opacity-0 absolute' : 'opacity-100'
            }`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{ aspectRatio: 'auto' }}
          />
        </>
      )}
    </div>
  );
};
