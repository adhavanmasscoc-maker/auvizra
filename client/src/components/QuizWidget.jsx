import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

export default function QuizWidget({ quizQuestion }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  if (!quizQuestion || !quizQuestion.question) return null;

  const handleSelect = (idx) => {
    if (submitted) return;
    setSelected(idx);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSelected(null);
    setSubmitted(false);
  };

  const isCorrect = selected === quizQuestion.correctIndex;

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-4 shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-300">
          <HelpCircle className="w-4 h-4 text-indigo-400" />
          <span>Quick Recall Check</span>
        </div>
        {submitted && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <p className="text-xs font-semibold text-slate-200 mb-3">
        {quizQuestion.question}
      </p>

      <div className="space-y-2">
        {quizQuestion.options.map((opt, i) => {
          let btnStyle = 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700';
          if (submitted) {
            if (i === quizQuestion.correctIndex) {
              btnStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-200 font-semibold';
            } else if (i === selected) {
              btnStyle = 'bg-rose-950/70 border-rose-500 text-rose-300';
            } else {
              btnStyle = 'bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-60';
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={submitted}
              className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${btnStyle}`}
            >
              <span>{opt}</span>
              {submitted && i === quizQuestion.correctIndex && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              )}
              {submitted && i === selected && i !== quizQuestion.correctIndex && (
                <XCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {submitted && (
        <div className={`mt-2.5 text-[11px] font-medium flex items-center gap-1.5 ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isCorrect ? '✓ Correct! Great recall on this concept.' : '✕ Review this slide diagram to strengthen understanding.'}
        </div>
      )}
    </div>
  );
}
