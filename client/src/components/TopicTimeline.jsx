import React from 'react';
import { History, BookOpen, Clock, ChevronRight, Sparkles, CheckCircle2, Trash2, X } from 'lucide-react';

export default function TopicTimeline({
  topics = [],
  activeTopicIndex = 0,
  onSelectTopic,
  onClearTimeline,
  onDeleteTopic
}) {
  if (!topics || topics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-slate-900/50 border border-slate-800/60">
        <Clock className="w-6 h-6 text-slate-600 mb-2" />
        <p className="text-xs text-slate-400 font-medium">Session timeline is empty</p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Topics you speak about will be organized here with timestamps.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Study Timeline
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
            {topics.length} {topics.length === 1 ? 'Milestone' : 'Milestones'}
          </span>
          {onClearTimeline && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Clear all study milestones from the timeline?')) {
                  onClearTimeline();
                }
              }}
              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 transition"
              title="Clear Timeline"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
        {topics.map((item, idx) => {
          const isActive = idx === activeTopicIndex;
          const timeStr = item.timestamp
            ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            : '00:00';

          return (
            <div
              key={item.id || idx}
              onClick={() => onSelectTopic && onSelectTopic(idx, item)}
              className={`group relative flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                isActive
                  ? 'bg-indigo-950/60 border-indigo-500/50 shadow-md shadow-indigo-950/60'
                  : 'bg-slate-900/50 border-slate-800/70 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              {/* Stepper Dot */}
              <div className="mt-0.5 flex flex-col items-center">
                <div
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-colors ${
                    isActive
                      ? 'bg-indigo-500 border-indigo-300 ring-2 ring-indigo-500/30'
                      : 'bg-slate-800 border-slate-700 group-hover:border-slate-500'
                  }`}
                >
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </div>
              </div>

              {/* Milestone Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {timeStr}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {item.imagesCount && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {item.imagesCount} visuals
                      </span>
                    )}
                    {onDeleteTopic && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTopic(idx);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-rose-400 transition"
                        title="Delete milestone"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <h4 className="text-xs font-semibold text-slate-200 group-hover:text-indigo-200 truncate">
                  {item.primaryTopic}
                </h4>

                {item.subtopic && (
                  <p className="text-[11px] text-indigo-300/80 truncate mt-0.5 font-medium">
                    {item.subtopic}
                  </p>
                )}

                {/* Concept tags */}
                {item.concepts && item.concepts.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap mt-2">
                    {item.concepts.slice(0, 3).map((c, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.2 rounded text-[9px] bg-slate-800/90 text-slate-300 border border-slate-700/50"
                      >
                        #{c}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <ChevronRight
                className={`w-4 h-4 mt-2 transition-transform ${
                  isActive ? 'text-indigo-400 translate-x-0.5' : 'text-slate-600 opacity-0 group-hover:opacity-100'
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
