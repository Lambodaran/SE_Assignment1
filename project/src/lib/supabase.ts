import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  difficulty: DifficultyLevel;
  created_at: string;
}
