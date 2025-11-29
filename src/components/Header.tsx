import React from 'react';

/**
 * Header Component Props
 */
interface HeaderProps {
  onAvatarClick?: () => void;
  onSettingsClick?: () => void;
  username?: string;
}

/**
 * Header Component
 * 顶部导航栏，包含用户头像按钮（左侧）、用户名（中间）、设置图标按钮（右侧）
 * 
 * Requirements: 6.1
 */
export const Header: React.FC<HeaderProps> = ({
  onAvatarClick,
  onSettingsClick,
  username = '用户'
}) => {
  return (
    <header className="w-full max-w-4xl flex items-center justify-between px-4 py-3 mb-4">
      {/* 左侧：用户头像按钮 */}
      <button
        onClick={onAvatarClick}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
        aria-label="User Avatar"
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </button>

      {/* 中间：用户名显示 */}
      <div className="flex-1 text-center">
        <h1 className="text-lg font-semibold text-slate-700">
          {username}
        </h1>
      </div>

      {/* 右侧：设置图标按钮 */}
      <button
        onClick={onSettingsClick}
        className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-slate-600 shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 border border-slate-200"
        aria-label="Settings"
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m0 6l4.2 4.2M23 12h-6m-6 0H1m18.2 5.2l-4.2-4.2m0-6l4.2-4.2"/>
        </svg>
      </button>
    </header>
  );
};
