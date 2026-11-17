import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Robust continuous microphone hook.
 * CRITICAL FIXES:
 * 1. NEVER turns off automatically after an image or topic is fetched.
 * 2. Continuous listening stream runs concurrently without interrupting the user.
 * 3. Graceful auto-restart if browser recognition momentarily ends.
 * 4. User has 100% control: mic stays ON until the user explicitly toggles it OFF.
 */
export function useMicrophone({ onChunkReady, chunkIntervalSeconds = 10 } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimText, setInterimText] = useState('');
  const [currentChunk, setCurrentChunk] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const chunkTimerRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const accumulatedChunkRef = useRef('');
  const shouldListenRef = useRef(false);

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  // Flush accumulated speech without turning off the microphone
  const flushChunk = useCallback(() => {
    const text = accumulatedChunkRef.current.trim();
    if (text.length > 3) {
      if (onChunkReady) {
        onChunkReady(text);
      }
      accumulatedChunkRef.current = '';
      setCurrentChunk('');
    }
  }, [onChunkReady]);

  // Audio frequency level loop for waveform
  const updateAudioLevels = useCallback(() => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      setAudioLevel(Math.min(1, avg / 128));
    }
    if (shouldListenRef.current) {
      animationFrameRef.current = requestAnimationFrame(updateAudioLevels);
    }
  }, []);

  // Setup Web Speech Recognition with persistent auto-restart
  const setupRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setError(null);
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const trans = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += trans + ' ';
        } else {
          interim += trans;
        }
      }

      setInterimText(interim);

      if (final) {
        accumulatedChunkRef.current = (accumulatedChunkRef.current + ' ' + final).trim();
        setCurrentChunk(accumulatedChunkRef.current);

        // Natural pause detection (2.2s of silence flushes chunk concurrently)
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          flushChunk();
        }, 2200);
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('Speech recognition notice:', event.error);
      }
    };

    recognition.onend = () => {
      // PERSISTENT: Never turn off automatically. Restart immediately if user wants it ON!
      if (shouldListenRef.current) {
        try {
          recognition.start();
        } catch (e) {
          // Already running or restarting
        }
      }
    };

    return recognition;
  }, [flushChunk]);

  const startListening = useCallback(async () => {
    setError(null);
    shouldListenRef.current = true;
    setIsListening(true);

    // 1. Audio spectrum analyzer for waveform
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && !mediaStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        mediaStreamRef.current = stream;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        audioContextRef.current = audioCtx;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        updateAudioLevels();
      }
    } catch (err) {
      console.warn('Mic audio stream warning:', err.message);
    }

    // 2. Speech recognition
    try {
      if (!recognitionRef.current) {
        recognitionRef.current = setupRecognition();
      }
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (err) {
      console.warn('Speech recognition start note:', err.message);
    }

    // 3. Periodic continuous chunk capture (keeps mic permanently alive)
    clearInterval(chunkTimerRef.current);
    chunkTimerRef.current = setInterval(() => {
      flushChunk();
    }, chunkIntervalSeconds * 1000);

  }, [chunkIntervalSeconds, flushChunk, setupRecognition, updateAudioLevels]);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    setIsListening(false);

    clearTimeout(silenceTimerRef.current);
    clearInterval(chunkTimerRef.current);
    cancelAnimationFrame(animationFrameRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }

    setAudioLevel(0);
    setInterimText('');
    flushChunk();
  }, [flushChunk]);

  // Clean simulation / manual trigger
  const simulateSpeechChunk = useCallback((text) => {
    setInterimText(text);
    setTimeout(() => {
      setInterimText('');
      if (onChunkReady) {
        onChunkReady(text);
      }
    }, 300);
  }, [onChunkReady]);

  // Clean up
  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    isSupported,
    interimText,
    currentChunk,
    audioLevel,
    error,
    startListening,
    stopListening,
    simulateSpeechChunk,
    flushChunk
  };
}
