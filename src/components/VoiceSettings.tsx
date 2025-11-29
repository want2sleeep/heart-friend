import React, { useState } from 'react';
import { VoiceChatSettings } from '../types';

/**
 * VoiceSettings Component
 * 
 * 语音设置面板组件，提供语音功能的配置界面
 * - 语音输入/输出开关
 * - 语速、音调、音量调节
 * - 语音选择
 * 
 * 验证需求: 3.1, 3.2, 6.1, 6.2, 6.3, 6.4, 6.5
 */

interface VoiceSettingsProps {
  settings: VoiceChatSettings;
  voices: SpeechSynthesisVoice[];
  isSupported: {
    recognition: boolean;
    synthesis: boolean;
  };
  onUpdateSettings: (settings: Partial<VoiceChatSettings>) => void;
  onPreview?: (text: string) => void; // 可选的预览功能
}

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  settings,
  voices,
  isSupported,
  onUpdateSettings,
  onPreview,
}) => {
  const [previewText] = useState('你好，这是语音预览测试。');

  // 处理开关切换（需求 3.3, 3.4, 6.5: 设置持久化）
  const handleToggle = (key: 'voiceInputEnabled' | 'voiceOutputEnabled' | 'autoSend') => {
    onUpdateSettings({ [key]: !settings[key] });
  };

  // 处理语音设置变更（需求 6.4: 设置立即应用）
  const handleSpeechSettingChange = (
    key: 'rate' | 'pitch' | 'volume',
    value: number
  ) => {
    onUpdateSettings({
      speechSettings: {
        ...settings.speechSettings,
        [key]: value,
      },
    });
  };

  // 处理语音选择（需求 6.4: 设置立即应用）
  const handleVoiceChange = (voiceName: string) => {
    onUpdateSettings({
      speechSettings: {
        ...settings.speechSettings,
        voice: voiceName || null,
      },
    });
  };

  // 预览语音（需求 6.4: 实时预览）
  const handlePreview = () => {
    if (onPreview && isSupported.synthesis) {
      onPreview(previewText);
    }
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full"
      role="dialog"
      aria-labelledby="voice-settings-title"
      aria-describedby="voice-settings-description"
    >
      {/* 标题 */}
      <div className="mb-6">
        <h2 id="voice-settings-title" className="text-xl font-bold text-slate-900 mb-2">
          语音设置
        </h2>
        <p id="voice-settings-description" className="text-sm text-slate-600">
          自定义语音输入和输出的行为
        </p>
      </div>

      {/* 语音输入设置 */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">语音输入</h3>
        
        {/* 语音输入开关 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <label htmlFor="voice-input-toggle" className="text-sm text-slate-700">
              启用语音输入
            </label>
            {!isSupported.recognition && (
              <p className="text-xs text-red-600 mt-1">
                浏览器不支持语音识别
              </p>
            )}
          </div>
          <ToggleSwitch
            id="voice-input-toggle"
            checked={settings.voiceInputEnabled}
            onChange={() => handleToggle('voiceInputEnabled')}
            disabled={!isSupported.recognition}
          />
        </div>

        {/* 自动发送开关 */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <label htmlFor="auto-send-toggle" className="text-sm text-slate-700">
              识别后自动发送
            </label>
            <p className="text-xs text-slate-500 mt-1">
              语音识别完成后立即发送消息
            </p>
          </div>
          <ToggleSwitch
            id="auto-send-toggle"
            checked={settings.autoSend}
            onChange={() => handleToggle('autoSend')}
            disabled={!settings.voiceInputEnabled || !isSupported.recognition}
          />
        </div>
      </div>

      {/* 分隔线 */}
      <div className="border-t border-slate-200 my-6" />

      {/* 语音输出设置 */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">语音输出</h3>
        
        {/* 语音输出开关 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <label htmlFor="voice-output-toggle" className="text-sm text-slate-700">
              启用语音输出
            </label>
            {!isSupported.synthesis && (
              <p className="text-xs text-red-600 mt-1">
                浏览器不支持语音合成
              </p>
            )}
          </div>
          <ToggleSwitch
            id="voice-output-toggle"
            checked={settings.voiceOutputEnabled}
            onChange={() => handleToggle('voiceOutputEnabled')}
            disabled={!isSupported.synthesis}
          />
        </div>

        {/* 语音合成设置（仅在启用时显示） */}
        {settings.voiceOutputEnabled && isSupported.synthesis && (
          <div className="space-y-4 pl-4 border-l-2 border-slate-200">
            {/* 语速调节 */}
            <div>
              <label htmlFor="rate-slider" className="text-sm text-slate-700 block mb-2">
                语速: {settings.speechSettings.rate.toFixed(1)}x
              </label>
              <input
                id="rate-slider"
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.speechSettings.rate}
                onChange={(e) => handleSpeechSettingChange('rate', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                aria-valuemin={0.5}
                aria-valuemax={2}
                aria-valuenow={settings.speechSettings.rate}
                aria-label="语速调节"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>慢速</span>
                <span>正常</span>
                <span>快速</span>
              </div>
            </div>

            {/* 音调调节 */}
            <div>
              <label htmlFor="pitch-slider" className="text-sm text-slate-700 block mb-2">
                音调: {settings.speechSettings.pitch.toFixed(1)}
              </label>
              <input
                id="pitch-slider"
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.speechSettings.pitch}
                onChange={(e) => handleSpeechSettingChange('pitch', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                aria-valuemin={0.5}
                aria-valuemax={2}
                aria-valuenow={settings.speechSettings.pitch}
                aria-label="音调调节"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>低</span>
                <span>正常</span>
                <span>高</span>
              </div>
            </div>

            {/* 音量调节 */}
            <div>
              <label htmlFor="volume-slider" className="text-sm text-slate-700 block mb-2">
                音量: {Math.round(settings.speechSettings.volume * 100)}%
              </label>
              <input
                id="volume-slider"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.speechSettings.volume}
                onChange={(e) => handleSpeechSettingChange('volume', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                aria-valuemin={0}
                aria-valuemax={1}
                aria-valuenow={settings.speechSettings.volume}
                aria-label="音量调节"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>静音</span>
                <span>最大</span>
              </div>
            </div>

            {/* 语音选择 */}
            {voices.length > 0 && (
              <div>
                <label htmlFor="voice-select" className="text-sm text-slate-700 block mb-2">
                  语音选择
                </label>
                <select
                  id="voice-select"
                  value={settings.speechSettings.voice || ''}
                  onChange={(e) => handleVoiceChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
                  aria-label="选择语音类型"
                >
                  <option value="">系统默认</option>
                  {voices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 预览按钮 */}
            {onPreview && (
              <button
                onClick={handlePreview}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors"
                aria-label="预览当前语音设置"
              >
                预览语音
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// 开关组件
interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      aria-label={checked ? '已启用' : '已禁用'}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2
        ${
          disabled
            ? 'bg-slate-200 cursor-not-allowed opacity-50'
            : checked
            ? 'bg-slate-900'
            : 'bg-slate-300'
        }
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
};
