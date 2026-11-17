import React, { useState } from 'react';
import { Settings, Key, Sliders, Check, ShieldCheck, X, Sparkles } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings
}) {
  const [geminiKey, setGeminiKey] = useState(settings.geminiKey || '');
  const [slideInterval, setSlideInterval] = useState(settings.slideInterval || 8);
  const [chunkDuration, setChunkDuration] = useState(settings.chunkDuration || 12);
  const [autoPauseOnSpeech, setAutoPauseOnSpeech] = useState(settings.autoPauseOnSpeech ?? true);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveSettings({
      geminiKey: geminiKey.trim(),
      slideInterval: Number(slideInterval),
      chunkDuration: Number(chunkDuration),
      autoPauseOnSpeech
    });
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">Companion Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          {/* Gemini API Key */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between font-semibold text-slate-200">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                Gemini API Key (Optional)
              </span>
              <span className="text-[10px] text-emerald-400 font-normal">Offline fallback ready</span>
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy... (leave blank to use smart offline engine)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
            />
            <p className="text-[10px] text-slate-500">
              Keys are kept safely in your browser storage or backend .env.
            </p>
          </div>

          {/* Slideshow Duration */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-slate-200">
              <span>Slide Auto-Advance Interval</span>
              <span className="font-mono text-indigo-300">{slideInterval}s</span>
            </div>
            <input
              type="range"
              min="4"
              max="20"
              step="2"
              value={slideInterval}
              onChange={(e) => setSlideInterval(e.target.value)}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Fast (4s)</span>
              <span>Default (8s)</span>
              <span>Slow (20s)</span>
            </div>
          </div>

          {/* Audio Chunk Duration */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-slate-200">
              <span>Speech Chunk Capture Window</span>
              <span className="font-mono text-indigo-300">{chunkDuration}s</span>
            </div>
            <input
              type="range"
              min="8"
              max="25"
              step="1"
              value={chunkDuration}
              onChange={(e) => setChunkDuration(e.target.value)}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>8s</span>
              <span>12s recommended</span>
              <span>25s</span>
            </div>
          </div>

          {/* Auto pause on speech */}
          <div className="pt-2 border-t border-slate-800/80">
            <label className="flex items-center justify-between cursor-pointer py-1">
              <div>
                <span className="font-semibold text-slate-200 block">Auto-pause while speaking</span>
                <span className="text-[10px] text-slate-500">Freezes the active slide when speech is detected</span>
              </div>
              <input
                type="checkbox"
                checked={autoPauseOnSpeech}
                onChange={(e) => setAutoPauseOnSpeech(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-indigo-600 accent-indigo-600 focus:ring-0"
              />
            </label>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/30"
            >
              {savedNotice ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{savedNotice ? 'Saved!' : 'Save Preferences'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
