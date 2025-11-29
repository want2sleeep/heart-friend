/**
 * 通知Toast组件
 * 显示非侵入式的通知消息
 */

import React, { useEffect, useState } from 'react';
import { MoodNotification } from '../types';

interface NotificationToastProps {
  notification: MoodNotification | null;
  onDismiss: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (notification) {
      // 淡入动画
      setIsVisible(true);
      setIsExiting(false);
    } else {
      // 淡出动画
      setIsExiting(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsExiting(false);
      }, 300); // 动画持续时间
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // 键盘支持：ESC键关闭通知
  useEffect(() => {
    if (!notification) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [notification, onDismiss]);

  if (!notification && !isVisible) return null;

  // 根据通知类型选择样式
  const getNotificationStyle = () => {
    switch (notification?.type) {
      case 'care':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-rose-100',
          border: 'border-red-300',
          text: 'text-red-900',
          icon: '💝'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-orange-50 to-amber-100',
          border: 'border-orange-300',
          text: 'text-orange-900',
          icon: '⚠️'
        };
      case 'info':
      default:
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-cyan-100',
          border: 'border-blue-300',
          text: 'text-blue-900',
          icon: 'ℹ️'
        };
    }
  };

  const style = getNotificationStyle();

  return (
    <div
      className={`
        fixed top-4 left-1/2 transform -translate-x-1/2 z-50
        max-w-md w-full mx-4
        transition-all duration-300 ease-in-out
        ${isExiting ? 'opacity-0 translate-y-[-20px]' : 'opacity-100 translate-y-0'}
      `}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={`
          ${style.bg} ${style.border} ${style.text}
          border-2 rounded-xl shadow-lg
          p-4 pr-12
          backdrop-blur-md
          relative
        `}
      >
        {/* 图标 */}
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">{style.icon}</span>
          
          {/* 消息内容 */}
          <p className="text-sm font-medium leading-relaxed flex-1">
            {notification?.message}
          </p>
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={onDismiss}
          className={`
            absolute top-3 right-3
            w-8 h-8 rounded-full
            flex items-center justify-center
            ${style.text} hover:bg-white/50
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-red-400
          `}
          aria-label="关闭通知"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        {/* 进度条 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-b-xl overflow-hidden">
          <div
            className="h-full bg-red-400"
            style={{
              animation: `shrink ${notification?.duration || 10000}ms linear`
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};
