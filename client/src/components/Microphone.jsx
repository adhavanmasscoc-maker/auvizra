import React, { useState } from 'react';
import { Mic, MicOff, Send, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Waveform from './Waveform';

export default function Microphone({
  isListening,
  isSupported,
  interimText,
  currentChunk,
  audioLevel,
  error,
  onStartListening,
  onStopListening,
  onSubmitText,
  isProcessing
}) {
  const [typedInput, setTypedInput] = useState('');

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (typedInput.trim() && onSubmitText) {
      onSubmitText(typedInput.trim());
      setTypedInput('');
    }
  };

  return (
    <div className="relative flex flex-col items-center w-full max-w-4xl mx-auto space-y-3">
      
      {/* Live Transcript / Speech Feedback Bar */}
      <div className="w-full min-h-[48px] rounded-2xl bg-slate-900/80 border border-slate-800/80 px-4 py-2.5 shadow-lg flex items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          <div className="flex-shrink-0">
            {isProcessing ? (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping inline-block"></span>
            ) : isListening ? (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block"></span>
            )}
          </div>
          <div className="text-xs truncate text-slate-300">
            {interimText ? (
              <span className="text-indigo-300 italic font-medium">"{interimText}"</span>
            ) : currentChunk ? (
              <span className="text-slate-200">"{currentChunk}"</span>
            ) : isListening ? (
              <span className="text-emerald-300/90 font-medium">Listening continuously... Speak about any subject</span>
            ) : (
              <span className="text-slate-400">Microphone is paused. Click the mic button to start, or type a topic below.</span>
            )}
          </div>
        </div>

        {/* Live Audio Spectrum */}
        <Waveform isListening={isListening} audioLevel={audioLevel} />
      </div>

      {/* Unified Input Control Center: Continuous Mic + Permanent Text Input */}
      <div className="w-full flex items-center gap-3">
        
        {/* Toggleable Mic Button (Stays ON until user clicks to turn off) */}
        <div className="relative flex-shrink-0 group">
          {isListening && (
            <>
              <motion.div
                className="absolute -inset-2 rounded-2xl bg-indigo-500/20 blur-md pointer-events-none"
                animate={{ scale: [1, 1.18, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute -inset-1 rounded-2xl bg-cyan-400/20 blur-sm pointer-events-none"
                animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </>
          )}

          <button
            type="button"
            onClick={isListening ? onStopListening : onStartListening}
            className={`relative z-10 flex items-center gap-2 px-4 h-12 rounded-2xl font-semibold text-xs transition-all shadow-xl ${
              isListening
                ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-rose-950/60 ring-2 ring-indigo-400/50'
                : 'bg-slate-900 border border-slate-700/80 hover:border-indigo-500 text-slate-200 hover:text-white'
            }`}
            title={isListening ? 'Click to Turn Off Microphone' : 'Click to Turn On Continuous Microphone'}
          >
            {isListening ? (
              <>
                <Mic className="w-4 h-4 text-emerald-300 animate-pulse" />
                <span className="hidden sm:inline font-mono">MIC ON</span>
              </>
            ) : (
              <>
                <MicOff className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline font-mono">MIC OFF</span>
              </>
            )}
          </button>
        </div>

        {/* Permanent Quick Text Input Bar */}
        <form onSubmit={handleTextSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder="Type any topic, concept, or mechanism (e.g. Kubernetes cluster, Human heart blood flow, Solar system)..."
              className="w-full h-12 bg-slate-900/90 border border-slate-800 rounded-2xl pl-4 pr-10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition shadow-inner"
            />
            {typedInput.trim() && (
              <button
                type="button"
                onClick={() => setTypedInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!typedInput.trim()}
            className="h-12 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/30 flex-shrink-0"
          >
            <span>Visualize</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Notice / Warning banner if speech is not supported in current environment */}
      {error && (
        <div className="flex items-center gap-2 p-2 px-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
