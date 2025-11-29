/**
 * 情绪通知管理Hook
 * 负责检测极度兴奋状态并触发系统级通知
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { MoodType, MoodNotification, NotificationState } from '../types';
import { CARE_MESSAGE_TEMPLATES, NOTIFICATION_CONFIG } from '../config/notificationConfig';

/**
 * 情绪通知管理Hook
 * 
 * @param currentMoodType - 当前的情绪类型
 * @returns notification - 当前显示的通知对象
 * @returns dismissNotification - 手动关闭通知的函数
 * @returns notificationPermission - 通知权限状态
 * 
 * 功能：
 * - 检测情绪状态转换到"极度兴奋"
 * - 使用浏览器系统级通知（Notification API）
 * - 实施5分钟冷却期防止过度通知
 * - 智能选择消息模板避免重复
 */
export function useMoodNotification(currentMoodType: MoodType) {
  const [notificationState, setNotificationState] = useState<NotificationState>({
    currentNotification: null,
    lastNotificationTime: 0,
    notificationHistory: []
  });

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // 使用ref跟踪前一个情绪状态，避免不必要的重渲染
  const previousMoodRef = useRef<MoodType | null>(null);
  const systemNotificationRef = useRef<globalThis.Notification | null>(null);

  /**
   * 请求通知权限
   */
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      
      // 如果权限是默认状态，自动请求权限
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission);
        });
      }
    }
  }, []);

  /**
   * 选择一个未最近使用过的消息模板
   */
  const selectMessageTemplate = useCallback((history: string[]) => {
    // 过滤掉最近使用过的模板
    const availableTemplates = CARE_MESSAGE_TEMPLATES.filter(
      template => !history.includes(template.id)
    );

    // 如果所有模板都用过了，重置历史
    const templates = availableTemplates.length > 0 
      ? availableTemplates 
      : CARE_MESSAGE_TEMPLATES;

    // 随机选择一个模板
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  }, []);

  /**
   * 创建系统级通知
   */
  const createNotification = useCallback((message: string, templateId: string): void => {
    const notification: MoodNotification = {
      id: `notification-${Date.now()}`,
      type: 'care',
      message,
      timestamp: Date.now(),
      duration: NOTIFICATION_CONFIG.AUTO_DISMISS_MS,
      moodType: 'very_excited'
    };

    // 创建浏览器系统级通知
    if ('Notification' in window && Notification.permission === 'granted') {
      // 关闭之前的通知
      if (systemNotificationRef.current) {
        systemNotificationRef.current.close();
      }

      // 创建新的系统通知
      const systemNotification = new window.Notification('💝 情绪关怀提醒', {
        body: message,
        icon: '/favicon.ico', // 可以替换为您的应用图标
        badge: '/favicon.ico',
        tag: 'mood-care', // 使用tag确保同一时间只显示一个通知
        requireInteraction: false, // 不需要用户交互，会自动消失
        silent: false, // 播放系统通知声音
      });

      // 点击通知时跳转到聊天页面
      systemNotification.onclick = () => {
        window.focus();
        // 跳转到聊天页面
        window.location.href = '/chat';
        systemNotification.close();
      };

      // 保存引用
      systemNotificationRef.current = systemNotification;

      // 自动关闭通知
      setTimeout(() => {
        systemNotification.close();
      }, NOTIFICATION_CONFIG.AUTO_DISMISS_MS);
    }

    setNotificationState(prev => {
      // 更新历史记录
      const newHistory = [...prev.notificationHistory, templateId];
      if (newHistory.length > NOTIFICATION_CONFIG.MAX_HISTORY_SIZE) {
        newHistory.shift();
      }

      return {
        currentNotification: notification,
        lastNotificationTime: Date.now(),
        notificationHistory: newHistory
      };
    });
  }, []);

  /**
   * 关闭通知
   */
  const dismissNotification = useCallback((): void => {
    // 关闭系统通知
    if (systemNotificationRef.current) {
      systemNotificationRef.current.close();
      systemNotificationRef.current = null;
    }

    setNotificationState(prev => ({
      ...prev,
      currentNotification: null
    }));
  }, []);

  /**
   * 检测情绪状态转换并触发通知
   */
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastNotification = now - notificationState.lastNotificationTime;
    const isInCooldown = timeSinceLastNotification < NOTIFICATION_CONFIG.COOLDOWN_PERIOD_MS;

    // 检查是否转换到极度兴奋状态
    const transitionedToVeryExcited = 
      previousMoodRef.current !== 'very_excited' && 
      currentMoodType === 'very_excited';

    // 触发通知的条件：
    // 1. 转换到极度兴奋状态
    // 2. 不在冷却期内
    if (transitionedToVeryExcited && !isInCooldown) {
      const template = selectMessageTemplate(notificationState.notificationHistory);
      createNotification(template.message, template.id);
    }

    // 更新前一个状态
    previousMoodRef.current = currentMoodType;
  }, [currentMoodType, notificationState.lastNotificationTime, notificationState.notificationHistory, selectMessageTemplate, createNotification]);

  /**
   * 自动关闭通知状态（系统通知会自动关闭）
   */
  useEffect(() => {
    if (!notificationState.currentNotification) return;

    const timer = setTimeout(() => {
      dismissNotification();
    }, NOTIFICATION_CONFIG.AUTO_DISMISS_MS);

    return () => clearTimeout(timer);
  }, [notificationState.currentNotification, dismissNotification]);

  // 清理：组件卸载时关闭通知
  useEffect(() => {
    return () => {
      if (systemNotificationRef.current) {
        systemNotificationRef.current.close();
      }
    };
  }, []);

  return {
    notification: notificationState.currentNotification,
    dismissNotification,
    notificationPermission
  };
}
