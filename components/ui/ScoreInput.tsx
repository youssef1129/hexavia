'use client';

import React from 'react';

export interface ScoreInputProps {
  label: string;
  description: string;
  value: number; // 1 a 5
  aiValue?: number; // proposition IA de reference
  onChange: (newValue: number) => void;
  disabled?: boolean;
}

export const ScoreInput: React.FC<ScoreInputProps> = ({
  label,
  description,
  value,
  aiValue,
  onChange,
  disabled = false,
}) => {
  const isDifferentFromAi = typeof aiValue === 'number' && aiValue !== value;

  return (
    <div className="py-3 border-b border-slate-100 last:border-b-0">
      <div className="flex items-center justify-between mb-1.5">
        <div>
          <span className="text-sm font-semibold text-slate-800">{label}</span>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          {typeof aiValue === 'number' && (
            <span
              className="inline-flex items-center text-xs px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200"
              title="Note initialement suggeree par l IA"
            >
              IA : {aiValue}/5
            </span>
          )}
          {isDifferentFromAi && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
              Modifiee
            </span>
          )}
        </div>
      </div>

      <div
        role="radiogroup"
        aria-label={`Note pour ${label}`}
        className="flex items-center gap-2 mt-2"
      >
        {[1, 2, 3, 4, 5].map((score) => {
          const isSelected = value === score;
          const isAiSelected = aiValue === score;

          return (
            <button
              key={score}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onChange(score)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all relative focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600 ring-offset-1'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span>{score}</span>
              {isAiSelected && !isSelected && (
                <span
                  title="Suggestion IA"
                  className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-500 rounded-full ring-2 ring-white"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
