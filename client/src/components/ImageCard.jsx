import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Maximize2, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateClientFallbackSVG } from '../services/diagramFallback';

export default function ImageCard({ image, isActive, onClick }) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(image.thumbUrl || image.url);
  const timerRef = useRef(null);

  useEffect(() => {
    setImgSrc(image.thumbUrl || image.url);
    setImgLoaded(false);

    // Timeout: if image doesn't load in 3 seconds, fail over to client-side SVG
    timerRef.current = setTimeout(() => {
      setImgLoaded(true);
      setImgSrc(prev => {
        if (!prev || prev.startsWith('/api') || prev.startsWith('http')) {
          return generateClientFallbackSVG(image.title);
        }
        return prev;
      });
    }, 3000);

    return () => clearTimeout(timerRef.current);
  }, [image.thumbUrl, image.url, image.title]);

  const handleError = (e) => {
    clearTimeout(timerRef.current);
    // Prevent infinite loop
    e.currentTarget.onerror = null;
    setImgLoaded(true);
    const fallback = generateClientFallbackSVG(image.title);
    setImgSrc(fallback);
  };

  if (!image) return null;

  return (
    <>
      <div
        onClick={onClick}
        className={`group relative flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border transition-all duration-300 ${
          isActive
            ? 'ring-2 ring-indigo-500 border-indigo-400 bg-indigo-950/40 shadow-lg shadow-indigo-950/60 scale-[1.02]'
            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/60 opacity-80 hover:opacity-100'
        }`}
      >
        <div className={`relative aspect-video w-44 sm:w-48 overflow-hidden flex items-center justify-center p-1 transition-colors ${
          image.mime === 'image/svg+xml' || (image.source === 'Wikimedia Commons' && (image.url?.toLowerCase().includes('.svg') || image.title?.toLowerCase().includes('diagram')))
            ? 'bg-slate-200'
            : 'bg-slate-950/90'
        }`}>
          {!imgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 animate-pulse">
              <span className="text-[10px] text-slate-500 font-mono">LOADING VISUAL...</span>
            </div>
          )}
          <img
            src={imgSrc}
            alt={image.title}
            referrerPolicy="no-referrer"
            onError={handleError}
            onLoad={() => {
              clearTimeout(timerRef.current);
              setImgLoaded(true);
            }}
            className={`h-full w-full object-contain transition-transform duration-300 group-hover:scale-105 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
          />

          {image.mime === 'image/svg+xml' && (
            <span className="absolute top-1.5 left-1.5 rounded bg-indigo-600/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow">
              SVG VECTOR
            </span>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(true);
            }}
            className="absolute top-1.5 right-1.5 p-1 rounded-md bg-slate-900/80 hover:bg-indigo-600 text-slate-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
            title="Enlarge visual"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-2 text-left">
          <p className="line-clamp-1 text-xs font-semibold text-slate-200 group-hover:text-indigo-300">
            {image.title}
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
            <span className="truncate max-w-[110px]" title={image.author}>
              {image.author || 'Visual Diagram'}
            </span>
            <span className="text-emerald-400/90 font-mono text-[9px]">
              {image.license}
            </span>
          </div>
        </div>
      </div>

      {/* Lightbox / Zoom Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsZoomed(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] w-full rounded-2xl bg-slate-900 border border-slate-700/80 overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-100 truncate max-w-md">
                    {image.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {image.license}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {image.pageUrl && (
                    <a
                      href={image.pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      title="Open on Wikimedia Commons"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => setIsZoomed(false)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-white transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center p-6 bg-slate-950/90 overflow-auto">
                <img
                  src={imgSrc}
                  alt={image.title}
                  referrerPolicy="no-referrer"
                  onError={handleError}
                  className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-lg"
                />
              </div>

              <div className="p-4 bg-slate-900/90 border-t border-slate-800 text-xs text-slate-300 space-y-1">
                {image.description && (
                  <p className="text-slate-200">{image.description}</p>
                )}
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                  <span>Author: {image.author}</span>
                  {image.licenseUrl && (
                    <a
                      href={image.licenseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:underline"
                    >
                      License: {image.license}
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
