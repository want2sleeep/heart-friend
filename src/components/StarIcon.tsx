import React, { useState } from 'react';

/**
 * StarIcon Component
 * 显示星星图标（star.png），水平居中布局
 * 
 * Requirements: 2.1, 2.2, 2.3
 */
export const StarIcon: React.FC = () => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 处理图片加载错误
   */
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('Star icon image failed to load:', e.currentTarget.src);
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
    // Requirement 2.2: 水平居中布局
    // Requirement 2.3: 与主角色保持适当间距
    <div className="star-icon-container flex justify-center w-full my-4">
      {imageError ? (
        // 错误占位符 - 使用SVG星星图标
        <div className="w-20 h-20 flex items-center justify-center text-amber-400">
          <svg 
            width="80" 
            height="80" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="0.5"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
      ) : (
        <>
          {/* 加载占位符 */}
          {isLoading && (
            <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-8 h-8 border-3 border-amber-300 border-t-amber-500 rounded-full animate-spin" />
            </div>
          )}
          
          {/* 星星图标 - Requirement 2.1: 使用 star.png */}
          <img
            src="/star.png"
            alt="Star"
            className={`star-icon-image w-20 h-20 object-contain transition-opacity duration-300 ${
              isLoading ? 'opacity-0 absolute' : 'opacity-100'
            }`}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        </>
      )}
    </div>
  );
};
