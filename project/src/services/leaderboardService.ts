import { getSupabaseClient, DifficultyLevel, LeaderboardEntry } from '../lib/supabaseClient'; 

export async function submitScore(
  playerName: string,
  score: number,
  difficulty: DifficultyLevel
): Promise<void> {
  const supabase = getSupabaseClient(); 
  
  const { error } = await supabase
    .from('leaderboard')
    .insert({
      player_name: playerName,
      score: score,
      difficulty: difficulty,
    });

  if (error) {
    console.error('Error submitting score:', error);
    throw new Error(`Failed to submit score: ${error.message}`);
  } else {
    console.log('Score submitted successfully!');
  }
}

export async function getTopScores(
  difficulty: DifficultyLevel,
  limit: number = 10
): Promise<LeaderboardEntry[]> {
  const supabase = getSupabaseClient(); 

  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('difficulty', difficulty)
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    throw new Error(`Failed to load leaderboard: ${error.message}`);
  }

  return data || [];
}
