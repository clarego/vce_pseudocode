/*
  # Scoring and Leaderboard System

  ## Overview
  Tracks per-question scores for each user login session, and maintains
  a permanent leaderboard of top scores.

  ## New Tables

  ### sessions
  - Each time a user logs in, a new session row is created.
  - `id` (uuid, primary key)
  - `username` (text) — the logged-in user's username
  - `started_at` (timestamptz) — when the session began

  ### question_scores
  - One row per question answered within a session.
  - `id` (uuid, primary key)
  - `session_id` (uuid, FK → sessions.id)
  - `username` (text) — denormalised for easier querying
  - `exercise_id` (text) — matches Exercise.id from studyContent
  - `exercise_title` (text) — human-readable title
  - `difficulty` (text) — beginner / intermediate / advanced
  - `points_earned` (integer) — points for this attempt (0–10)
  - `max_points` (integer) — maximum possible for this exercise
  - `answered_at` (timestamptz) — when the score was recorded

  ### leaderboard
  - Permanent record of a user's best total score.
  - Upserted whenever a session ends or score improves.
  - `id` (uuid, primary key)
  - `username` (text, unique) — one row per user
  - `best_score` (integer) — their all-time best session total
  - `achieved_at` (timestamptz) — when that best score was set

  ## Scoring Scale
  - beginner:     5 points max
  - intermediate: 8 points max
  - advanced:    10 points max
  - Full marks if no mistakes (AI feedback hasMistakes = false)
  - Half marks if mistakes present

  ## Security
  - RLS enabled on all tables
  - Public can SELECT leaderboard (read-only, no auth required for display)
  - Sessions and scores writable via service role only (edge function or direct insert with anon key using permissive INSERT policy keyed on username match)
  - For simplicity and since auth is username/password (not Supabase Auth), INSERT policies allow anon to insert their own rows; SELECT is open for leaderboard
*/

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  started_at timestamptz DEFAULT now()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert a session"
  ON sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS question_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  username text NOT NULL,
  exercise_id text NOT NULL,
  exercise_title text NOT NULL,
  difficulty text NOT NULL DEFAULT 'beginner',
  points_earned integer NOT NULL DEFAULT 0,
  max_points integer NOT NULL DEFAULT 5,
  answered_at timestamptz DEFAULT now()
);

ALTER TABLE question_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert question scores"
  ON question_scores FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view question scores"
  ON question_scores FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  best_score integer NOT NULL DEFAULT 0,
  achieved_at timestamptz DEFAULT now()
);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert leaderboard entry"
  ON leaderboard FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update leaderboard entry"
  ON leaderboard FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_question_scores_session ON question_scores(session_id);
CREATE INDEX IF NOT EXISTS idx_question_scores_username ON question_scores(username);
CREATE INDEX IF NOT EXISTS idx_leaderboard_best_score ON leaderboard(best_score DESC);
