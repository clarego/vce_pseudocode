import { authDb } from './supabaseAuth';

export interface SessionRecord {
  id: string;
  username: string;
  started_at: string;
}

export interface QuestionScore {
  id: string;
  session_id: string;
  username: string;
  exercise_id: string;
  exercise_title: string;
  difficulty: string;
  points_earned: number;
  max_points: number;
  answered_at: string;
}

export interface LeaderboardEntry {
  username: string;
  best_score: number;
  achieved_at: string;
}

const POINTS: Record<string, number> = {
  beginner: 5,
  intermediate: 8,
  advanced: 10,
};

export const getMaxPoints = (difficulty: string): number =>
  POINTS[difficulty] ?? 5;

export const createSession = async (username: string): Promise<string | null> => {
  const { data, error } = await authDb
    .from('sessions')
    .insert({ username })
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('Failed to create session:', error);
    return null;
  }
  return data?.id ?? null;
};

export const recordQuestionScore = async (params: {
  sessionId: string;
  username: string;
  exerciseId: string;
  exerciseTitle: string;
  difficulty: string;
  hasMistakes: boolean;
}): Promise<void> => {
  const max = getMaxPoints(params.difficulty);
  const earned = params.hasMistakes ? Math.floor(max / 2) : max;

  await authDb.from('question_scores').insert({
    session_id: params.sessionId,
    username: params.username,
    exercise_id: params.exerciseId,
    exercise_title: params.exerciseTitle,
    difficulty: params.difficulty,
    points_earned: earned,
    max_points: max,
  });
};

export const getSessionTotal = async (sessionId: string): Promise<number> => {
  const { data, error } = await authDb
    .from('question_scores')
    .select('points_earned')
    .eq('session_id', sessionId);

  if (error || !data) return 0;
  return data.reduce((sum: number, row: { points_earned: number }) => sum + row.points_earned, 0);
};

export const upsertLeaderboard = async (username: string, sessionId: string): Promise<void> => {
  const sessionTotal = await getSessionTotal(sessionId);
  if (sessionTotal === 0) return;

  const { data: existing } = await authDb
    .from('leaderboard')
    .select('best_score')
    .eq('username', username)
    .maybeSingle();

  if (!existing) {
    await authDb.from('leaderboard').insert({
      username,
      best_score: sessionTotal,
      achieved_at: new Date().toISOString(),
    });
  } else if (sessionTotal > existing.best_score) {
    await authDb
      .from('leaderboard')
      .update({ best_score: sessionTotal, achieved_at: new Date().toISOString() })
      .eq('username', username);
  }
};

export const fetchLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const { data, error } = await authDb
    .from('leaderboard')
    .select('username, best_score, achieved_at')
    .order('best_score', { ascending: false })
    .limit(10);

  if (error) return [];
  return data ?? [];
};

export const getSessionScores = async (sessionId: string): Promise<QuestionScore[]> => {
  const { data, error } = await authDb
    .from('question_scores')
    .select('*')
    .eq('session_id', sessionId)
    .order('answered_at', { ascending: true });

  if (error) return [];
  return data ?? [];
};
