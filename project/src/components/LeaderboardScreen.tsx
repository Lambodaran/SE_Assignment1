// src/components/LeaderboardScreen.tsx
import { useState, useEffect } from 'react';
import { getSupabaseClient, DifficultyLevel } from '../lib/supabaseClient';
import { Trophy, BarChart, X, Play, Home } from 'lucide-react';
import { Score } from '../services/leaderboardService';
import Top3Animation from './Top3Animation'; // Import our new animation

interface LeaderboardScreenProps {
  playerName: string;
  finalScore: number;
  difficulty: DifficultyLevel;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export default function LeaderboardScreen({ 
  playerName, 
  finalScore, 
  difficulty, 
  onPlayAgain, 
  onMainMenu 
}: LeaderboardScreenProps) {
  
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTop3, setShowTop3] = useState(false); // State for our animation
  const [animationPlayed, setAnimationPlayed] = useState(false); // Ensure it only plays once

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      const supabase = getSupabaseClient();

      try {
        const { data, error } = await supabase
          .from('leaderboard')
          .select('*')
          .eq('difficulty', difficulty) // Filter by the difficulty played
          .order('score', { ascending: false })
          .order('created_at', { ascending: true })
          .limit(10);

        if (error) throw error;

        if (data) {
          setScores(data);

          // --- CHECK FOR TOP 3 ---
          // Check if the current player's score is in the top 3
          // We check the top 3 scores from the fetched data
          if (!animationPlayed) {
            const top3 = data.slice(0, 3);
            
            // Check if our exact score entry is in the top 3
            const isTop3 = top3.some(entry => 
              entry.player_name === playerName && entry.score === finalScore
            );
            
            // Also check if the finalScore is *high enough*
            // in case the DB update was slow and our score isn't in the list yet.
            const thirdPlaceScore = top3.length === 3 ? top3[2].score : 0;
            
            if ((isTop3 || finalScore >= thirdPlaceScore) && finalScore > 0) {
              setShowTop3(true); // Trigger the animation!
              setAnimationPlayed(true); // Don't play it again
            }
          }
        }
      } catch (err: any) {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to fetch leaderboard. Please check your connection.");
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, [difficulty, playerName, finalScore, animationPlayed]); // Dependencies

  return (
    <>
      {/* --- RENDER TOP 3 ANIMATION --- */}
      {showTop3 && (
        <Top3Animation onComplete={() => setShowTop3(false)} />
      )}

      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-6 sm:p-10">
          
           {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800 flex items-center justify-center gap-3">
              <Trophy className="w-10 h-10 text-yellow-500" />
              Leaderboard
            </h1>
            <p className="text-lg text-gray-600 mt-2 capitalize">
              Top 10 Players - <span className="font-semibold">{difficulty}</span>
            </p>
          </div>

          {/* Player's Final Score */}
          <div className="bg-yellow-100 border-2 border-yellow-300 p-4 rounded-lg text-center mb-8 shadow-md">
            <p className="text-xl font-medium text-yellow-800">Your Score, {playerName}:</p>
            <p className="text-5xl font-bold text-yellow-900">{finalScore}</p>
          </div>

          {/* Leaderboard Table */}
          <div className="space-y-3">
            {loading && (
              <div className="flex justify-center items-center h-40">
                <BarChart className="w-12 h-12 text-gray-400 animate-pulse" />
              </div>
            )}
            {error && (
              <div className="flex justify-center items-center h-40 p-4 bg-red-100 text-red-700 rounded-lg">
                <X className="w-8 h-8 mr-2" />
                <p>{error}</p>
              </div>
            )}
            {!loading && !error && (
              <ol className="divide-y divide-gray-200">
                {scores.map((score, index) => (
                  <li key={score.id} className={`flex items-center justify-between p-3 rounded-md ${score.player_name === playerName && score.score === finalScore ? 'bg-yellow-50' : ''}`}>
                    <div className="flex items-center">
                      <span className={`text-lg font-bold w-8 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-500' : index === 2 ? 'text-yellow-700' : 'text-gray-400'}`}>
                        {index + 1}
                      </span>
                      <span className="text-lg font-medium text-gray-800 ml-3">{score.player_name}</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{score.score}</span>
                  </li>
                ))}
              </ol>
            )}
            {!loading && !error && scores.length === 0 && (
              <p className="text-center text-gray-500 py-6">No scores yet. Be the first!</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button
              onClick={onPlayAgain}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition"
            >
              <Play className="w-5 h-5" />
              Play Again
            </button>
            <button
              onClick={onMainMenu}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition"
            >
              <Home className="w-5 h-5" />
              Main Menu
            </button>
          </div>

        </div>
      </div>
    </>
  );
}