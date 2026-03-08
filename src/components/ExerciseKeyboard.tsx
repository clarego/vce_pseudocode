import React, { useState } from 'react';
import { reservedWordCategories } from '../data/reservedWords';

interface ExerciseKeyboardProps {
  onInsert: (text: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Program Structure': 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100 dark:border-slate-600',
  'Control Flow': 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-100 dark:border-blue-700',
  'Loops': 'bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900 dark:hover:bg-teal-800 dark:text-teal-100 dark:border-teal-700',
  'Functions': 'bg-orange-50 hover:bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:hover:bg-orange-800 dark:text-orange-100 dark:border-orange-700',
  'Input/Output': 'bg-green-50 hover:bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:hover:bg-green-800 dark:text-green-100 dark:border-green-700',
  'Operators': 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:hover:bg-amber-800 dark:text-amber-100 dark:border-amber-700',
  'Logical': 'bg-red-50 hover:bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-100 dark:border-red-700',
};

export const ExerciseKeyboard: React.FC<ExerciseKeyboardProps> = ({ onInsert }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-t-lg bg-gray-50 dark:bg-gray-800">
      <div className="flex flex-wrap gap-1 px-2 pt-2 pb-1 border-b border-gray-200 dark:border-gray-700">
        {reservedWordCategories.map((cat) => (
          <button
            key={cat.name}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setActiveCategory(activeCategory === cat.name ? null : cat.name);
            }}
            className={`px-2 py-0.5 text-xs font-semibold rounded border transition-colors ${
              activeCategory === cat.name
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-300'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1 p-2 min-h-[2.5rem]">
        {reservedWordCategories
          .filter((cat) => activeCategory === null || cat.name === activeCategory)
          .flatMap((cat) =>
            cat.words.map((word) => (
              <button
                key={`${cat.name}-${word}`}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onInsert(word);
                }}
                className={`px-2 py-0.5 text-sm font-mono rounded border transition-colors ${CATEGORY_COLORS[cat.name] ?? 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200'}`}
              >
                {word}
              </button>
            ))
          )}
      </div>
    </div>
  );
};
