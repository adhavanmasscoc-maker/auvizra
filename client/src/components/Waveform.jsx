import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function Waveform({ isListening, audioLevel = 0, barCount = 18 }) {
  // Generate pseudo-frequency bars influenced by audioLevel
  const bars = useMemo(() => {
    return Array.from({ length: barCount }, (_, i) => {
      // Center bars tend to be higher
      const centerFactor = 1 - Math.abs(i - barCount / 2) / (barCount / 2);
      return {
        id: i,
        baseScale: Math.max(0.15, centerFactor * 0.8),
        delay: (i * 0.05) % 0.4
      };
    });
  }, [barCount]);

  if (!isListening) {
    return (
      <div className="flex items-center justify-center gap-1.5 h-8 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800/80">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
        <span className="text-xs text-slate-500 font-mono tracking-wide">MIC OFF</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 h-9 px-3.5 py-1 rounded-full bg-indigo-950/40 border border-indigo-500/30 backdrop-blur-md shadow-lg shadow-indigo-950/50">
      <div className="flex items-center gap-1 h-5">
        {bars.map((bar) => {
          const height = Math.max(
            4,
            Math.min(22, 5 + (audioLevel > 0.02 ? audioLevel * 20 * bar.baseScale : Math.sin(Date.now() / 200 + bar.id) * 3 + 4))
          );

          return (
            <motion.div
              key={bar.id}
              className="w-1 rounded-full bg-gradient-to-t from-indigo-500 to-cyan-400"
              animate={{
                height: `${height}px`,
                opacity: audioLevel > 0.05 ? 0.95 : 0.45
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20
              }}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-1.5 ml-1.5 border-l border-indigo-500/30 pl-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span className="text-xs font-semibold text-emerald-400 font-mono tracking-wider">LIVE</span>
      </div>
    </div>
  );
}
