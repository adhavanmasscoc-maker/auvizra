import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize,
  Minimize,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Layers,
  Award
} from 'lucide-react';
import ImageCard from './ImageCard';
import SafeSlideImage from './SafeSlideImage';
import { generateClientFallbackSVG } from '../services/diagramFallback';

export default function Slideshow({
  images = [],
  currentTopic,
  currentIndex,
  isPlaying,
  progress,
  onNext,
  onPrev,
  onSelectSlide,
  onTogglePlay,
  isFocusMode,
  onToggleFocusMode,
  onQuickTopicSelect,
  mode = 'study'
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [canvasBg, setCanvasBg] = useState('adaptive'); // 'adaptive', 'light', 'dark', 'blueprint'
  const currentImage = images[currentIndex] || null;

  const isWikimediaSvg = currentImage?.source === 'Wikimedia Commons' && (currentImage?.mime === 'image/svg+xml' || currentImage?.url?.toLowerCase().includes('.svg'));
  const isDiagram = currentImage?.title?.toLowerCase().includes('diagram') || currentImage?.title?.toLowerCase().includes('schematic') || currentImage?.title?.toLowerCase().includes('header');
  const shouldRenderLight = canvasBg === 'light' || (canvasBg === 'adaptive' && (isWikimediaSvg || isDiagram));

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const handleImageError = (e) => {
    e.currentTarget.onerror = null;
    const fallback = generateClientFallbackSVG(currentImage?.title || 'Visual Concept');
    e.currentTarget.src = fallback;
  };

  const getCanvasBgClass = () => {
    switch (canvasBg) {
      case 'light':
        return 'bg-slate-100 text-slate-900 border-slate-300';
      case 'dark':
        return 'bg-[#080b10] border-slate-800/80';
      case 'blueprint':
        return 'bg-[#08192e] border-cyan-900/60 bg-[radial-gradient(#1e3a5f_1px,transparent_1px)] [background-size:16px_16px]';
      case 'adaptive':
      default:
        return shouldRenderLight
          ? 'bg-gradient-to-b from-slate-900 via-[#0d131d] to-[#0a0d14] border-slate-800/70'
          : 'bg-gradient-to-b from-[#0f141c] via-[#0d1117] to-[#0a0d14] border-slate-800/70';
    }
  };

  const samplePresets = mode === 'study' ? [
    { label: 'TCP 3-Way Handshake', query: 'TCP connection handshake' },
    { label: 'Virtual Memory & Paging', query: 'Virtual memory paging' },
    { label: 'Neural Networks & Backprop', query: 'Neural network backpropagation' },
    { label: 'Photosynthesis & Chloroplast', query: 'Photosynthesis thylakoid' }
  ] : [
    { label: 'Solar System Orbits', query: 'Solar system planet orbits diagram' },
    { label: 'Human Heart Blood Flow', query: 'Human heart blood flow diagram' },
    { label: 'Ferrari V8 Engine', query: 'Ferrari V8 turbo engine schematic' },
    { label: 'Taj Mahal Architecture', query: 'Taj Mahal architecture plan' }
  ];

  return (
    <div className="relative flex flex-col w-full h-full">
      
      {/* Quick Topic Switcher Bar */}
      {!isFocusMode && onQuickTopicSelect && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 scrollbar-none text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1 flex-shrink-0 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{mode === 'study' ? 'Study Topics:' : 'Explore Topics:'}</span>
          </span>
          {samplePresets.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onQuickTopicSelect(item.label, item.query)}
              className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-indigo-950/80 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-200 transition text-[11px] font-medium"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Central Visual Viewport */}
      <div className={`relative flex-1 min-h-[380px] sm:min-h-[460px] md:min-h-[500px] rounded-2xl overflow-hidden border shadow-2xl flex flex-col justify-between group transition-colors duration-300 ${getCanvasBgClass()}`}>
        
        {/* Top Header Overlay */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto">
          <div className="flex items-center gap-2.5 flex-wrap">
            {currentTopic ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-indigo-500/30 backdrop-blur-md shadow-md">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                <span className="text-xs font-bold text-white tracking-wide">
                  {currentTopic.primaryTopic}
                </span>
                {currentTopic.subtopic && (
                  <span className="text-xs text-indigo-300 border-l border-slate-700 pl-2 font-medium">
                    {currentTopic.subtopic}
                  </span>
                )}
              </div>
            ) : (
              <div className="px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-400 font-mono">
                Awaiting input...
              </div>
            )}

            {currentImage && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                <Award className="w-3.5 h-3.5" />
                <span>Relevance: {currentImage.score ? `${Math.min(99, Math.round(currentImage.score))}%` : 'High'}</span>
              </div>
            )}
          </div>

          {/* Canvas Backdrop Switcher & View Controls */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-xl p-0.5 shadow-md" title="Canvas backdrop mode">
              <button
                type="button"
                onClick={() => setCanvasBg('light')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  canvasBg === 'light' ? 'bg-white text-slate-900 shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Paper / Light Canvas — Optimal for black-ink diagrams & SVGs"
              >
                ⚪ Light
              </button>
              <button
                type="button"
                onClick={() => setCanvasBg('adaptive')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  canvasBg === 'adaptive' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Auto Adaptive — Automatically provides contrast for transparent diagrams"
              >
                Auto
              </button>
              <button
                type="button"
                onClick={() => setCanvasBg('dark')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  canvasBg === 'dark' ? 'bg-slate-800 text-cyan-300 shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Deep OLED Dark"
              >
                ⚫ Dark
              </button>
              <button
                type="button"
                onClick={() => setCanvasBg('blueprint')}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition ${
                  canvasBg === 'blueprint' ? 'bg-cyan-800 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Technical Blueprint Grid"
              >
                Grid
              </button>
            </div>

            <button
              onClick={onToggleFocusMode}
              className={`p-2 rounded-xl border text-xs font-medium transition-all ${
                isFocusMode
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title={isFocusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
            >
              Focus
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Central Visual Content */}
        <div className="relative flex-1 flex items-center justify-center p-3 sm:p-5 select-none overflow-hidden">
          <AnimatePresence mode="wait">
            {currentImage ? (
              <motion.div
                key={currentImage.id || currentImage.url}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative max-h-[460px] min-h-[360px] sm:min-h-[410px] max-w-full w-full flex flex-col items-center justify-center"
              >
                <div className={`p-2 sm:p-4 rounded-2xl transition-all duration-300 flex items-center justify-center max-w-full w-full h-full ${
                  shouldRenderLight
                    ? 'bg-white shadow-2xl ring-1 ring-slate-200/60'
                    : canvasBg === 'blueprint'
                    ? 'bg-[#08182b] border border-cyan-800/60 shadow-2xl'
                    : 'bg-transparent'
                }`}>
                  <SafeSlideImage
                    src={currentImage.thumbUrl || currentImage.url}
                    alt={currentImage.title}
                    title={currentImage.title}
                    topic={currentTopic?.primaryTopic || ''}
                    concepts={currentTopic?.concepts || []}
                    shouldRenderLight={shouldRenderLight}
                    className={`max-h-[340px] sm:max-h-[390px] max-w-full object-contain rounded-lg transition-transform duration-200 ${
                      shouldRenderLight ? 'contrast-105 drop-shadow-sm' : 'shadow-2xl'
                    }`}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center text-center p-8 max-w-md"
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-950/50 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 animate-pulse">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-slate-200 mb-1">
                  Ready to Visualize
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Speak into the microphone or type any topic below.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={onPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/70 hover:bg-indigo-600/90 border border-slate-700/60 text-slate-200 hover:text-white transition-all shadow-lg backdrop-blur-sm opacity-60 hover:opacity-100 group-hover:opacity-100"
                title="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={onNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/70 hover:bg-indigo-600/90 border border-slate-700/60 text-slate-200 hover:text-white transition-all shadow-lg backdrop-blur-sm opacity-60 hover:opacity-100 group-hover:opacity-100"
                title="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Progress Bar */}
        {images.length > 1 && (
          <div className="w-full h-1 bg-slate-950/80 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>
        )}

        {/* Bottom Educational Caption */}
        {currentImage && (
          <div className="relative z-10 p-3 sm:p-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent border-t border-slate-800/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1 max-w-3xl">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                    {currentImage.title}
                  </h4>
                  {currentImage.mime === 'image/svg+xml' && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      VECTOR SCHEMATIC
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300/90 leading-snug line-clamp-2">
                  {currentTopic?.caption || currentImage.description || 'Visual concept representation.'}
                </p>
              </div>

              {/* Attribution & Play/Pause */}
              <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
                {currentImage.pageUrl ? (
                  <a
                    href={currentImage.pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-300 transition"
                    title="View license"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-mono text-[10px]">{currentImage.license}</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                  </a>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{currentImage.license}</span>
                  </span>
                )}

                <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-xl">
                  <button
                    onClick={onTogglePlay}
                    className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    title={isPlaying ? 'Pause slideshow' : 'Resume slideshow'}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <span className="text-[11px] text-slate-400 font-mono px-1">
                    {currentIndex + 1} / {images.length || 1}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail Reel */}
      {images.length > 0 && !isFocusMode && (
        <div className="mt-4 flex items-center gap-3 overflow-x-auto pb-2 px-1 pt-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono flex-shrink-0 pr-1">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>SLIDES ({images.length})</span>
          </div>
          {images.map((img, idx) => (
            <ImageCard
              key={`${img.id}-${idx}`}
              image={img}
              isActive={idx === currentIndex}
              onClick={() => onSelectSlide(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
