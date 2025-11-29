import { motion } from 'framer-motion';

export default function AiChatWidget() {
  // 讯飞助手地址
  const CHAT_URL = "https://agent.xfyun.cn/chat?sharekey=3bf537d7081ee2167242edcb1b3a6aa8&botId=3983999";

  const openChat = () => {
    window.open(CHAT_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.button
      onClick={openChat}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title="打开 AI 智能助手"
      className="flex items-center justify-center px-4 py-2 rounded-full bg-white/80 hover:bg-white transition-all shadow-lg backdrop-blur-md border border-slate-300"
    >
      <img src="/health.png" alt="AI助手" className="w-5 h-5" />
    </motion.button>
  );
}