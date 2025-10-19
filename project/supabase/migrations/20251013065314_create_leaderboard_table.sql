/*
  # Banana Brain Challenge Leaderboard Schema

  ## Overview
  This migration creates the leaderboard system for the Banana Brain Challenge game.
  It supports persistent high scores across three difficulty levels with proper indexing
  for efficient queries.

  ## New Tables
  
  ### `leaderboard`
  Stores player scores with the following columns:
  - `id` (uuid, primary key) - Unique identifier for each score entry
  - `player_name` (text, not null) - Player's virtual identity name
  - `score` (integer, not null, default 0) - Points achieved in the game
  - `difficulty` (text, not null) - Difficulty level: 'easy', 'medium', or 'hard'
  - `created_at` (timestamptz, default now()) - Timestamp of score submission
  
  ## Indexes
  - Index on (difficulty, score DESC) for efficient leaderboard queries per difficulty
  
  ## Security
  - Enable Row Level Security (RLS) on leaderboard table
  - Public read access: Anyone can view all leaderboard entries
  - Public insert access: Anyone can submit scores (no authentication required for game simplicity)
  
  ## Notes
  1. This is a public game with no user authentication, so RLS policies allow public access
  2. Separate leaderboards per difficulty level support academic demonstration of data filtering
  3. The created_at timestamp helps with tie-breaking and historical analysis
  4. Consider adding a constraint to validate difficulty values in future iterations
*/

-- Create leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at timestamptz DEFAULT now()
);

-- Create index for efficient leaderboard queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_difficulty_score 
  ON leaderboard(difficulty, score DESC);

-- Enable Row Level Security
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Public read policy: Anyone can view leaderboard
CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard
  FOR SELECT
  TO anon
  USING (true);

-- Public insert policy: Anyone can submit scores
CREATE POLICY "Anyone can submit scores"
  ON leaderboard
  FOR INSERT
  TO anon
  WITH CHECK (true);