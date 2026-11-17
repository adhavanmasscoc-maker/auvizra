import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Save,
  Settings,
  Clock,
  Layers,
  CheckCircle2,
  FolderOpen,
  GraduationCap,
  Globe
} from 'lucide-react';
import Microphone from '../components/Microphone';
import Slideshow from '../components/Slideshow';
import TopicTimeline from '../components/TopicTimeline';
import ConceptTags from '../components/ConceptTags';
import QuizWidget from '../components/QuizWidget';
import SessionHistory from '../components/SessionHistory';
import SettingsModal from '../components/SettingsModal';
import { useMicrophone } from '../hooks/useMicrophone';
import { useSlideshow } from '../hooks/useSlideshow';
import {
  analyzeSpeechTopic,
  fetchVisualsForQueries,
  saveStudySession,
  loadSavedSessions,
  deleteSavedSession
} from '../services/api';

export default function StudySession() {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem('auvizra_user_settings') || localStorage.getItem('vizora_user_settings');
      return stored ? JSON.parse(stored) : { slideInterval: 8, chunkDuration: 10, geminiKey: '' };
    } catch (e) {
      return { slideInterval: 8, chunkDuration: 10, geminiKey: '' };
    }
  });

  // Operating Mode: 'study' vs 'all' (All Topics)
  const [activeMode, setActiveMode] = useState('all'); // default to 'all' for universal responsiveness

  // Session State
  const [sessionId, setSessionId] = useState(() => `session_${Date.now()}`);
  const [sessionStartTime] = useState(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [topicHistory, setTopicHistory] = useState([]);
  const [transcriptChunks, setTranscriptChunks] = useState([]);
  const [allImages, setAllImages] = useState([]);
  const [activeTopicIndex, setActiveTopicIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Modals
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [savedSessionsList, setSavedSessionsList] = useState([]);

  // Slideshow Hook
  const {
    currentIndex,
    currentImage,
    isPlaying,
    progress,
    nextSlide,
    prevSlide,
    goToSlide,
    togglePlay
  } = useSlideshow({
    images: allImages,
    autoAdvance: true,
    intervalSeconds: settings.slideInterval || 8
  });

  // Session Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionStartTime]);

  // Load Saved Sessions
  const refreshSavedSessions = useCallback(async () => {
    const list = await loadSavedSessions();
    setSavedSessionsList(list);
  }, []);

  useEffect(() => {
    refreshSavedSessions();
  }, [refreshSavedSessions]);

  // Core Pipeline: Process Speech or Typed Input Concurrently
  const handleChunkReady = useCallback(async (chunkText) => {
    if (!chunkText || !chunkText.trim()) return;

    let cleanText = chunkText.trim();
    // Guardrail against accidental profanity or test inputs
    const profaneRegex = /\b(sex|porn|xxx|nude|penis|vagina|bitch|fuck|shit|ass|dick|pussy|cock)\b/gi;
    if (profaneRegex.test(cleanText)) {
      cleanText = cleanText.replace(profaneRegex, '').trim();
      if (!cleanText) cleanText = 'General Scientific Concept';
    }

    setIsProcessing(true);

    try {
      const recentHistory = transcriptChunks.slice(-5);
      const analysis = await analyzeSpeechTopic({
        chunk: cleanText,
        history: recentHistory,
        currentTopic,
        apiKey: settings.geminiKey,
        mode: activeMode
      });

      setTranscriptChunks(prev => [...prev, cleanText]);

      // Multi-source image retrieval
      const searchQueries = analysis.searchQueries || [`${analysis.primaryTopic}`];
      let newImages = await fetchVisualsForQueries(searchQueries, 8, activeMode);

      // GUARANTEED NON-EMPTY SLIDES: Never leave user stuck on previous topic!
      if (!newImages || newImages.length === 0) {
        newImages = [
          {
            id: `client-fb-${Date.now()}-1`,
            title: `${analysis.primaryTopic} (System Overview)`,
            url: generateClientFallbackSVG(analysis.primaryTopic, 'Architecture Overview'),
            thumbUrl: generateClientFallbackSVG(analysis.primaryTopic, 'Architecture Overview'),
            mime: 'image/svg+xml',
            source: 'Auvizra Engine',
            license: 'Public Domain',
            description: `Visual schematic and architecture for ${analysis.primaryTopic}.`
          },
          {
            id: `client-fb-${Date.now()}-2`,
            title: `${analysis.primaryTopic} (Components & Hierarchy)`,
            url: generateClientFallbackSVG(`${analysis.primaryTopic} Components`, 'Structure & Specs'),
            thumbUrl: generateClientFallbackSVG(`${analysis.primaryTopic} Components`, 'Structure & Specs'),
            mime: 'image/svg+xml',
            source: 'Auvizra Engine',
            license: 'Public Domain',
            description: `Component structure and specifications for ${analysis.primaryTopic}.`
          }
        ];
      }

      // IMMEDIATELY REPLACE ACTIVE SLIDES with the new topic's visuals so the screen switches instantly!
      setAllImages(newImages);
      goToSlide(0); // Jump to first slide of new topic immediately

      // Update current active topic milestone
      const cleanConcepts = (analysis.concepts || []).filter(c => !profaneRegex.test(c));
      const milestone = {
        id: `topic_${Date.now()}`,
        primaryTopic: analysis.primaryTopic,
        subtopic: analysis.subtopic,
        concepts: cleanConcepts.length > 0 ? cleanConcepts : [analysis.primaryTopic],
        caption: analysis.caption || '',
        quizQuestion: analysis.quizQuestion || null,
        timestamp: Date.now(),
        imagesCount: newImages.length,
        images: newImages, // store topic's images for 1-click review
        searchQueries
      };

      setCurrentTopic(milestone);

      setTopicHistory(prev => {
        const updated = [...prev, milestone];
        setActiveTopicIndex(updated.length - 1);
        return updated;
      });

    } catch (err) {
      console.error('Pipeline processing error:', err);
      // Fallback: guaranteed instant switch even on network error
      const fallbackName = cleanText;
      const fallbackSlides = [
        {
          id: `client-err-fb-${Date.now()}-1`,
          title: `${fallbackName} (Overview)`,
          url: generateClientFallbackSVG(fallbackName, 'Visual Overview'),
          thumbUrl: generateClientFallbackSVG(fallbackName, 'Visual Overview'),
          mime: 'image/svg+xml',
          source: 'Auvizra Engine',
          license: 'Public Domain',
          description: `Visual overview for ${fallbackName}.`
        }
      ];
      setAllImages(fallbackSlides);
      goToSlide(0);
      setCurrentTopic({
        id: `topic_${Date.now()}`,
        primaryTopic: fallbackName,
        subtopic: 'Visual Overview',
        concepts: [fallbackName],
        images: fallbackSlides
      });
    } finally {
      setIsProcessing(false);
    }
  }, [transcriptChunks, currentTopic, settings.geminiKey, activeMode, goToSlide]);

  // Initial load
  useEffect(() => {
    if (allImages.length === 0) {
      handleChunkReady('TCP is a connection-oriented protocol using a three-way handshake with SYN, SYN-ACK, and ACK.');
    }
  }, []);

  // Continuous Microphone Hook
  const {
    isListening,
    isSupported,
    interimText,
    currentChunk,
    audioLevel,
    error: micError,
    startListening,
    stopListening
  } = useMicrophone({
    onChunkReady: handleChunkReady,
    chunkIntervalSeconds: settings.chunkDuration || 10
  });

  // Save Session
  const handleSaveCurrentSession = async () => {
    const sessionData = {
      id: sessionId,
      title: currentTopic?.primaryTopic || 'Auvizra Visual Session',
      timestamp: sessionStartTime,
      durationSeconds: elapsedSeconds,
      topics: topicHistory,
      images: allImages,
      transcriptLog: transcriptChunks
    };

    await saveStudySession(sessionData);
    await refreshSavedSessions();
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 2500);
  };

  // Load Session
  const handleLoadSession = (session) => {
    setSessionId(session.id || `session_${Date.now()}`);
    setTopicHistory(session.topics || []);
    setAllImages(session.images || []);
    setTranscriptChunks(session.transcriptLog || []);
    if (session.topics && session.topics.length > 0) {
      setCurrentTopic(session.topics[0]);
      setActiveTopicIndex(0);
    }
    goToSlide(0);
  };

  // Switch to specific topic from timeline
  const handleSelectTopicFromTimeline = (idx, topicItem) => {
    setActiveTopicIndex(idx);
    setCurrentTopic(topicItem);
    if (topicItem.images && topicItem.images.length > 0) {
      setAllImages(topicItem.images);
      goToSlide(0);
    }
  };

  // Clear timeline completely
  const handleClearTimeline = () => {
    setTopicHistory([]);
    setTranscriptChunks([]);
    setActiveTopicIndex(0);
  };

  // Delete individual milestone
  const handleDeleteTimelineTopic = (indexToDelete) => {
    setTopicHistory(prev => {
      const updated = prev.filter((_, idx) => idx !== indexToDelete);
      if (updated.length === 0) {
        setActiveTopicIndex(0);
        setCurrentTopic(null);
      } else if (activeTopicIndex >= updated.length) {
        const nextIdx = updated.length - 1;
        setActiveTopicIndex(nextIdx);
        setCurrentTopic(updated[nextIdx]);
        if (updated[nextIdx].images) setAllImages(updated[nextIdx].images);
      } else if (indexToDelete === activeTopicIndex) {
        setCurrentTopic(updated[activeTopicIndex]);
        if (updated[activeTopicIndex].images) setAllImages(updated[activeTopicIndex].images);
      }
      return updated;
    });
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#090c10] text-slate-100 selection:bg-indigo-500/30">
      
      {/* Header */}
      {!isFocusMode && (
        <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#090c10]/80 backdrop-blur-xl px-4 sm:px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-600/20">
                <div className="w-full h-full rounded-[11px] bg-slate-950 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                    AUVIZRA
                  </h1>
                  <span className="text-[9px] text-cyan-400/90 font-mono font-medium px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 hidden xs:inline-block">
                    AUVIZRA CORE
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">
                  Universal Visual Companion
                </p>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-900/90 border border-slate-800 p-0.5 rounded-xl shadow-inner">
              <button
                type="button"
                onClick={() => setActiveMode('study')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeMode === 'study'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Study Mode</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('all')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeMode === 'all'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>All Topics</span>
              </button>
            </div>

            {/* Session Stats & Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{formatTime(elapsedSeconds)}</span>
              </div>

              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-400">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>{allImages.length} Visuals</span>
              </div>

              <button
                onClick={handleSaveCurrentSession}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
                title="Save current session"
              >
                {saveSuccessMsg ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Save</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowHistoryModal(true)}
                className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
                title="Saved Sessions"
              >
                <FolderOpen className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-4">
        
        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
          
          {/* Main Slideshow Column */}
          <div className={`${isFocusMode ? 'lg:col-span-12' : 'lg:col-span-8'} flex flex-col gap-3 min-w-0`}>
            
            {/* Concept Badges Row */}
            {currentTopic?.concepts && currentTopic.concepts.length > 0 && !isFocusMode && (
              <ConceptTags
                concepts={currentTopic.concepts}
                onSelectConcept={(tag) => {
                  handleChunkReady(tag);
                }}
              />
            )}

            {/* Central Visual Viewport */}
            <div className="flex-1">
              <Slideshow
                images={allImages}
                currentTopic={currentTopic}
                currentIndex={currentIndex}
                isPlaying={isPlaying}
                progress={progress}
                onNext={nextSlide}
                onPrev={prevSlide}
                onSelectSlide={goToSlide}
                onTogglePlay={togglePlay}
                isFocusMode={isFocusMode}
                onToggleFocusMode={() => setIsFocusMode(prev => !prev)}
                onQuickTopicSelect={(label, text) => handleChunkReady(text)}
                mode={activeMode}
              />
            </div>
          </div>

          {/* Right Sidebar */}
          {!isFocusMode && (
            <div className="lg:col-span-4 flex flex-col gap-4">
              
              {/* Chronological Topic Timeline */}
              <div className="flex-1 rounded-2xl bg-slate-900/50 border border-slate-800/80 p-4 shadow-xl backdrop-blur-md">
                <TopicTimeline
                  topics={topicHistory}
                  activeTopicIndex={activeTopicIndex}
                  onSelectTopic={handleSelectTopicFromTimeline}
                  onClearTimeline={handleClearTimeline}
                  onDeleteTopic={handleDeleteTimelineTopic}
                />
              </div>

              {/* Instant Recall Quiz Widget */}
              {currentTopic?.quizQuestion && (
                <QuizWidget quizQuestion={currentTopic.quizQuestion} />
              )}
            </div>
          )}
        </div>

        {/* Bottom Continuous Microphone & Text Input Bar */}
        <div className="mt-auto pt-2 pb-4">
          <Microphone
            isListening={isListening}
            isSupported={isSupported}
            interimText={interimText}
            currentChunk={currentChunk}
            audioLevel={audioLevel}
            error={micError}
            onStartListening={startListening}
            onStopListening={stopListening}
            onSubmitText={handleChunkReady}
            isProcessing={isProcessing}
          />
        </div>
      </main>

      {/* Modals */}
      <SessionHistory
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        sessions={savedSessionsList}
        onLoadSession={handleLoadSession}
        onDeleteSession={async (id) => {
          await deleteSavedSession(id);
          await refreshSavedSessions();
        }}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          localStorage.setItem('vizora_user_settings', JSON.stringify(newSettings));
        }}
      />
    </div>
  );
}
