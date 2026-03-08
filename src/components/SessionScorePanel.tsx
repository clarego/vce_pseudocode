import React from 'react';
import { Star, CheckCircle, AlertCircle } from 'lucide-react';
import { QuestionScore } from '../lib/scoringService';

interface SessionScorePanelProps {
  scores: QuestionScore[];
  sessionTotal: number;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

const DIFFICULTY_BADGE: Record<string, string> = {
  beginner: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  intermediate: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  advanced: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

export const SessionScorePanel: React.FC<SessionScorePanelProps> = ({ scores, sessionTotal }) => {
  if (scores.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-teal-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-300" />
          <span className="text-white font-semibold text-sm">This Session</span>
        </div>
        <div className="text-white font-bold text-sm">
          {sessionTotal} pts
        </div>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {scores.map((s) => {
          const perfect = s.points_earned === s.max_points;
          return (
            <div key={s.id} className="flex items-start gap-2.5 px-4 py-2.5">
              {perfect ? (
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {s.exercise_title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${DIFFICULTY_BADGE[s.difficulty] ?? ''}`}>
                    {s.difficulty}
                  </span>
                  <span className="text-xs text-gray-400">{formatTime(s.answered_at)}</span>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <span className={`font-bold text-sm ${perfect ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                  {s.points_earned}
                </span>
                <span className="text-xs text-gray-400">/{s.max_points}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
