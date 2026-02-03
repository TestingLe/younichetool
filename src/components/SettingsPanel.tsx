'use client';

import { useState } from 'react';
import { Settings, Sparkles, Check } from 'lucide-react';

export default function SettingsPanel() {
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

        <div className="space-y-6">
          {/* AI Info */}
          <div className="rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-6">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="text-purple-400" size={24} />
              <h3 className="font-semibold text-white text-lg">AI-Powered Content Generation</h3>
            </div>
            <p className="text-gray-300 mb-4">
              This app uses <strong className="text-purple-400">Puter AI</strong> to generate viral YouTube content ideas
              automatically based on your channel&apos;s niche.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-gray-800/50 p-3">
                <p className="text-sm text-gray-400">✅ No API key required</p>
              </div>
              <div className="rounded-lg bg-gray-800/50 p-3">
                <p className="text-sm text-gray-400">✅ Unlimited generations</p>
              </div>
              <div className="rounded-lg bg-gray-800/50 p-3">
                <p className="text-sm text-gray-400">✅ YouTube Shorts ideas</p>
              </div>
              <div className="rounded-lg bg-gray-800/50 p-3">
                <p className="text-sm text-gray-400">✅ Full video concepts</p>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
            <h3 className="font-semibold text-white mb-3">About YouNiche Tool</h3>
            <p className="text-sm text-gray-400 mb-4">
              YouNiche Tool helps YouTube creators discover trending content ideas,
              analyze their niche, and generate viral video concepts using AI.
            </p>
            <div className="text-xs text-gray-500">
              <p>Version 1.0.0</p>
              <p className="mt-1">Powered by Puter AI</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
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
                <Check size={18} />
                Done
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
