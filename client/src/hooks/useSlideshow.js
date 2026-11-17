import { useState, useEffect, useCallback, useRef } from 'react';

export function useSlideshow({
  images = [],
  autoAdvance = true,
  intervalSeconds = 8,
  onSlideChange
} = {}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoAdvance);
  const [progress, setProgress] = useState(0);

  const timerRef = useRef(null);
  const progressTimerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  // Reset index if image list completely changes
  useEffect(() => {
    if (images.length > 0 && currentIndex >= images.length) {
      setCurrentIndex(0);
    }
  }, [images.length, currentIndex]);

  const goToSlide = useCallback((index) => {
    if (images.length === 0) return;
    const nextIndex = (index + images.length) % images.length;
    setCurrentIndex(nextIndex);
    setProgress(0);
    startTimeRef.current = Date.now();
    if (onSlideChange) onSlideChange(nextIndex, images[nextIndex]);
  }, [images, onSlideChange]);

  const nextSlide = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Timer loop for auto-advance and progress bar
  useEffect(() => {
    if (!isPlaying || images.length <= 1) {
      setProgress(0);
      clearInterval(timerRef.current);
      clearInterval(progressTimerRef.current);
      return;
    }

    startTimeRef.current = Date.now();
    const intervalMs = intervalSeconds * 1000;

    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / intervalMs) * 100);
      setProgress(pct);
    }, 50);

    timerRef.current = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, intervalMs);

    return () => {
      clearInterval(timerRef.current);
      clearInterval(progressTimerRef.current);
    };
  }, [isPlaying, currentIndex, images.length, intervalSeconds, goToSlide]);

  return {
    currentIndex,
    currentImage: images[currentIndex] || null,
    isPlaying,
    progress,
    nextSlide,
    prevSlide,
    goToSlide,
    togglePlay,
    setIsPlaying
  };
}
