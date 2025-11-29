/**
 * 关心消息模板配置
 * 用于极度兴奋状态的通知
 */

export interface CareMessageTemplate {
  id: string;
  message: string;
}

export const CARE_MESSAGE_TEMPLATES: CareMessageTemplate[] = [
  {
    id: 'care_1',
    message: '我注意到您现在可能感到有些紧张。让我们一起深呼吸，慢慢放松下来吧。'
  },
  {
    id: 'care_2',
    message: '您的情绪波动较大，这很正常。试着放慢节奏，给自己一些时间平静下来。'
  },
  {
    id: 'care_3',
    message: '感觉到压力了吗？不用担心，我在这里陪伴您。深呼吸几次会有帮助的。'
  },
  {
    id: 'care_4',
    message: '您现在可能需要休息一下。闭上眼睛，深呼吸，让身心都放松下来。'
  },
  {
    id: 'care_5',
    message: '我理解您现在的感受。让我们一起尝试一些放松技巧，帮助您恢复平静。'
  }
];

// 通知配置常量
export const NOTIFICATION_CONFIG = {
  COOLDOWN_PERIOD_MS: 5 * 60 * 1000,  // 5分钟冷却期
  AUTO_DISMISS_MS: 10 * 1000,          // 10秒自动关闭
  MAX_HISTORY_SIZE: 5                  // 保留最近5条消息历史
};
