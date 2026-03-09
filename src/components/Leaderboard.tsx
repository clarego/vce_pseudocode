import React, { useEffect, useState, useCallback } from 'react';
import { Trophy, RefreshCw, Medal, Clock } from 'lucide-react';
import { fetchLeaderboard, LeaderboardEntry } from '../lib/scoringService';
import { authDb } from '../lib/supabaseAuth';

const MEDAL_COLORS = ['text-yellow-400', 'text-gray-400', 'text-amber-600'];
const MEDAL_BG = ['bg-yellow-400/10', 'bg-gray-400/10', 'bg-amber-600/10'];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

interface LeaderboardProps {
  currentUsername?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ currentUsername }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchLeaderboard();
    setEntries(data);
    setLastRefreshed(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();

    const channel = authDb
      .channel('leaderboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboard' }, () => {
        load();
      })
      .subscribe();

    return () => {
      authDb.removeChannel(channel);
    };
  }, [load]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-teal-600 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Trophy className="w-5 h-5 text-yellow-300" />
          <h2 className="text-white font-bold text-base tracking-wide">Top 10 Leaderboard</h2>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="px-5 py-2 border-b border-gray-100 dark:border-gray-700 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-xs text-gray-400">
          Updated {formatTime(lastRefreshed.toISOString())}
        </span>
      </div>

      {loading && entries.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 px-4">
          <Trophy className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No scores yet</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Complete exercises to appear here!</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {entries.map((entry, i) => {
            const isCurrentUser = entry.username === currentUsername;
            const isMedal = i < 3;
            return (
              <div
                key={entry.username}
                className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${
                  isCurrentUser
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                  isMedal ? MEDAL_BG[i] : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  {isMedal ? (
                    <Medal className={`w-4 h-4 ${MEDAL_COLORS[i]}`} />
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">{i + 1}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-sm truncate ${
                      isCurrentUser
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-800 dark:text-gray-200'
                    }`}>
                      {entry.username}
                    </span>
                    {isCurrentUser && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {formatDate(entry.achieved_at)} at {formatTime(entry.achieved_at)}
                  </div>
                </div>

                <div className="flex-shrink-0 text-right">
                  <div className={`text-lg font-bold ${
                    isMedal ? MEDAL_COLORS[i] : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {entry.best_score}
                  </div>
                  <div className="text-xs text-gray-400">pts</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-400 text-center">
          Scores update in real-time. Best session score counts.
        </p>
      </div>
    </div>
  );
};
