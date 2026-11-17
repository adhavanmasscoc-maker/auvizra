import React from 'react';
import { Tag, Sparkles } from 'lucide-react';

export default function ConceptTags({ concepts = [], onSelectConcept }) {
  if (!concepts || concepts.length === 0) return null;

  return (
    <div className="flex items-center flex-wrap gap-2 py-1">
      <div className="flex items-center gap-1 text-xs font-medium text-slate-400 mr-1">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span className="uppercase tracking-wider text-[10px] font-semibold text-slate-400">Concepts:</span>
      </div>
      {concepts.map((concept, idx) => (
        <button
          key={`${concept}-${idx}`}
          onClick={() => onSelectConcept && onSelectConcept(concept)}
          className="group relative inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/25 hover:border-indigo-400/50 text-indigo-200 transition-all duration-200 shadow-sm"
          title={`Click to search visuals for "${concept}"`}
        >
          <span className="text-indigo-400 text-[10px]">#</span>
          <span>{concept}</span>
        </button>
      ))}
    </div>
  );
}
