/**
 * VoiceSettings Usage Example
 * 
 * This file demonstrates how to integrate the VoiceSettings component
 * with the useVoiceChat hook in your application.
 */

import React, { useState } from 'react';
import { VoiceSettings } from './VoiceSettings';
import { useVoiceChat } from '../hooks/useVoiceChat';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

export const VoiceSettingsExample: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Use the voice chat hook
  const voiceChat = useVoiceChat();
  
  // Get voices from speech synthesis
  const { voices } = useSpeechSynthesis();

  // Handle preview - speak the preview text with current settings
  const handlePreview = (text: string) => {
    voiceChat.speak(text);
  };

  return (
    <div>
      {/* Settings Button */}
      <button
        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
        className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
      >
        语音设置
      </button>

      {/* Settings Panel (Modal or Sidebar) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative">
            {/* Close Button */}
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-100"
              aria-label="关闭设置"
            >
              ✕
            </button>

            {/* Settings Component */}
            <VoiceSettings
              settings={voiceChat.settings}
              voices={voices}
              isSupported={voiceChat.isSupported}
              onUpdateSettings={voiceChat.updateSettings}
              onPreview={handlePreview}
            />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Alternative: Inline Settings Panel
 * 
 * You can also use VoiceSettings as an inline panel in your chat interface:
 */
export const InlineVoiceSettingsExample: React.FC = () => {
  const voiceChat = useVoiceChat();
  const { voices } = useSpeechSynthesis();

  return (
    <div className="p-4">
      <VoiceSettings
        settings={voiceChat.settings}
        voices={voices}
        isSupported={voiceChat.isSupported}
        onUpdateSettings={voiceChat.updateSettings}
        onPreview={(text) => voiceChat.speak(text)}
      />
    </div>
  );
};
