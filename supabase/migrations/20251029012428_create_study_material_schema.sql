/*
  # Study Material System Schema

  ## Overview
  Creates a comprehensive database structure for managing pseudocode learning content,
  including chapters, lessons, examples, and user progress tracking.

  ## New Tables

  ### `chapters`
  - `id` (uuid, primary key) - Unique chapter identifier
  - `order_num` (integer) - Display order of chapters
  - `title` (text) - Chapter title
  - `description` (text) - Chapter overview
  - `created_at` (timestamptz) - Creation timestamp

  ### `lessons`
  - `id` (uuid, primary key) - Unique lesson identifier
  - `chapter_id` (uuid, foreign key) - Parent chapter
  - `order_num` (integer) - Display order within chapter
  - `title` (text) - Lesson title
  - `content` (text) - Lesson content in markdown
  - `pseudocode_example` (text, nullable) - Example pseudocode
  - `python_example` (text, nullable) - Python conversion example
  - `javascript_example` (text, nullable) - JavaScript conversion example
  - `created_at` (timestamptz) - Creation timestamp

  ### `exercises`
  - `id` (uuid, primary key) - Unique exercise identifier
  - `lesson_id` (uuid, foreign key) - Parent lesson
  - `order_num` (integer) - Display order within lesson
  - `title` (text) - Exercise title
  - `description` (text) - Exercise instructions
  - `difficulty` (text) - Difficulty level (beginner, intermediate, advanced)
  - `starter_code` (text, nullable) - Pre-filled pseudocode
  - `solution` (text, nullable) - Sample solution
  - `hints` (jsonb, nullable) - Array of hints
  - `created_at` (timestamptz) - Creation timestamp

  ### `user_progress`
  - `id` (uuid, primary key) - Unique progress record
  - `user_id` (uuid) - User identifier (for future auth integration)
  - `lesson_id` (uuid, foreign key) - Completed lesson
  - `exercise_id` (uuid, foreign key, nullable) - Completed exercise
  - `completed` (boolean) - Completion status
  - `user_code` (text, nullable) - User's submitted code
  - `completed_at` (timestamptz) - Completion timestamp
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on all tables
  - Public read access for content tables
  - Authenticated write access for progress tracking
*/

-- Create chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_num integer NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid REFERENCES chapters(id) ON DELETE CASCADE NOT NULL,
  order_num integer NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  pseudocode_example text,
  python_example text,
  javascript_example text,
  created_at timestamptz DEFAULT now()
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  order_num integer NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  difficulty text DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  starter_code text,
  solution text,
  hints jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create user progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES exercises(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  user_code text,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Policies for chapters (public read)
CREATE POLICY "Anyone can view chapters"
  ON chapters FOR SELECT
  TO public
  USING (true);

-- Policies for lessons (public read)
CREATE POLICY "Anyone can view lessons"
  ON lessons FOR SELECT
  TO public
  USING (true);

-- Policies for exercises (public read)
CREATE POLICY "Anyone can view exercises"
  ON exercises FOR SELECT
  TO public
  USING (true);

-- Policies for user_progress (public for now, will be restricted with auth)
CREATE POLICY "Anyone can view their progress"
  ON user_progress FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert their progress"
  ON user_progress FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update their progress"
  ON user_progress FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chapters_order ON chapters(order_num);
CREATE INDEX IF NOT EXISTS idx_lessons_chapter ON lessons(chapter_id, order_num);
CREATE INDEX IF NOT EXISTS idx_exercises_lesson ON exercises(lesson_id, order_num);
CREATE INDEX IF NOT EXISTS idx_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_progress_exercise ON user_progress(exercise_id);