import React from 'react';
import { BookOpen, Calendar, Download, Trash2, X, ArrowUpRight, FolderOpen } from 'lucide-react';

export default function SessionHistory({
  isOpen,
  onClose,
  sessions = [],
  onLoadSession,
  onDeleteSession
}) {
  if (!isOpen) return null;

  const exportAsMarkdown = (session) => {
    let md = `# Auvizra Study Session: ${session.title || 'Untitled Session'}\n`;
    md += `*Date: ${new Date(session.timestamp).toLocaleString()}*\n\n`;
    md += `## Topics Covered\n\n`;

    (session.topics || []).forEach((t, i) => {
      md += `### ${i + 1}. ${t.primaryTopic}\n`;
      if (t.subtopic) md += `**Subtopic:** ${t.subtopic}\n\n`;
      if (t.caption) md += `> ${t.caption}\n\n`;
      if (t.concepts && t.concepts.length) {
        md += `**Key Concepts:** ${t.concepts.map(c => `\`${c}\``).join(', ')}\n\n`;
      }
      md += `---\n\n`;
    });

    if (session.transcriptLog && session.transcriptLog.length > 0) {
      md += `## Spoken Speech Transcript\n\n`;
      session.transcriptLog.forEach((chunk, i) => {
        md += `- **[${i + 1}]** ${chunk}\n`;
      });
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auvizra-study-notes-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">Saved Study Sessions</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="text-sm font-medium text-slate-400">No saved sessions yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Save your study session to review topics, visuals, and export notes anytime.
              </p>
            </div>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                className="group flex items-center justify-between gap-4 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/40 transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xs font-semibold text-slate-100 truncate">
                      {s.title || (s.topics?.[0]?.primaryTopic) || 'Study Session'}
                    </h3>
                    <span className="px-2 py-0.2 rounded text-[9px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                      {s.topics?.length || 0} topics
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {new Date(s.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>•</span>
                    <span>{s.images?.length || 0} visual slides</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => exportAsMarkdown(s)}
                    className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="Export study notes (Markdown)"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteSession(s.id)}
                    className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      onLoadSession(s);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1 transition"
                  >
                    <span>Load</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
