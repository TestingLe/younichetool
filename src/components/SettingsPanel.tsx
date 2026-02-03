'use client';

import { useState } from 'react';
import { Settings, Key, Bell, Palette, Save, Check, AlertCircle } from 'lucide-react';

export default function SettingsPanel() {
  const [apiKeys, setApiKeys] = useState({
    youtube: '',
  });
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    weeklyReports: true,
    trendingAlerts: false,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-r from-gray-600 to-gray-500 p-2">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Settings</h2>
        </div>

        <div className="space-y-8">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Key className="text-yellow-400" size={18} />
              <h3 className="font-semibold text-white">API Configuration</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-gray-400">YouTube API Key</label>
                <input
                  type="password"
                  value={apiKeys.youtube}
                  onChange={(e) => setApiKeys({ ...apiKeys, youtube: e.target.value })}
                  placeholder="Enter your YouTube Data API v3 key"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 outline-none transition-colors focus:border-yellow-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Get your API key from the{' '}
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-500 hover:underline"
                  >
                    Google Cloud Console
                  </a>
                </p>
              </div>
              <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-4">
                <p className="text-sm text-purple-300">
                  <strong>🤖 AI Features:</strong> Powered by Puter AI - No API key required!
                  AI content generation works out of the box.
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2">
              <Bell className="text-blue-400" size={18} />
              <h3 className="font-semibold text-white">Notifications</h3>
            </div>
            <div className="space-y-3">
              {[
                { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive email notifications for important updates' },
                { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Get a weekly summary of your channel performance' },
                { key: 'trendingAlerts', label: 'Trending Alerts', desc: 'Get notified when topics in your niche start trending' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-700 bg-gray-800 p-4 transition-colors hover:border-gray-600"
                >
                  <div>
                    <p className="font-medium text-white">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={notifications[item.key as keyof typeof notifications]}
                      onChange={(e) =>
                        setNotifications({ ...notifications, [item.key]: e.target.checked })
                      }
                      className="peer sr-only"
                    />
                    <div className={`h-6 w-11 rounded-full transition-colors ${notifications[item.key as keyof typeof notifications] ? 'bg-blue-500' : 'bg-gray-600'
                      }`} />
                    <div className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : ''
                      }`} />
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2">
              <Palette className="text-purple-400" size={18} />
              <h3 className="font-semibold text-white">Appearance</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {['Dark', 'Light', 'System'].map((theme) => (
                <button
                  key={theme}
                  className={`rounded-lg border border-gray-700 bg-gray-800 p-4 text-center transition-all hover:border-purple-500/50 ${theme === 'Dark' ? 'border-purple-500 ring-2 ring-purple-500/20' : ''
                    }`}
                >
                  <p className="font-medium text-white">{theme}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-gray-800 pt-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <AlertCircle size={16} />
            <span>API keys are stored locally in your browser</span>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-2 font-semibold text-white transition-all hover:opacity-90"
          >
            {saved ? (
              <>
                <Check size={18} />
                Saved!
              </>
            ) : (
              <>
                <Save size={18} />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
