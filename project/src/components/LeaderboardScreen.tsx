// src/components/LeaderboardScreen.tsx
import { useState, useEffect } from 'react';
import { getSupabaseClient, DifficultyLevel } from '../lib/supabaseClient';
import { Trophy, BarChart, X, Play, Home } from 'lucide-react';
import { Score } from '../services/leaderboardService';
import Top3Animation from './Top3Animation';

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
  const [showTop3, setShowTop3] = useState(false);
  const [animationPlayed, setAnimationPlayed] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      const supabase = getSupabaseClient();

      try {
        const { data, error } = await supabase
          .from('leaderboard')
          .select('*')
          .eq('difficulty', difficulty)
          .order('score', { ascending: false })
          .order('created_at', { ascending: true })
          .limit(10);

        if (error) throw error;

        if (data) {
          setScores(data);

          if (!animationPlayed) {
            const top3 = data.slice(0, 3);
            const isTop3 = top3.some(entry => 
              entry.player_name === playerName && entry.score === finalScore
            );
            const thirdPlaceScore = top3.length === 3 ? top3[2].score : 0;
            
            if ((isTop3 || finalScore >= thirdPlaceScore) && finalScore > 0) {
              setShowTop3(true); 
              setAnimationPlayed(true); 
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
  }, [difficulty, playerName, finalScore, animationPlayed]);

  return (
    <>
      {showTop3 && (
        <Top3Animation onComplete={() => setShowTop3(false)} />
      )}

      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-4 sm:p-8">
          
           {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 flex items-center justify-center gap-3">
              <Trophy className="w-8 h-8 sm:w-10 h-10 text-yellow-500" />
              Leaderboard
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mt-2 capitalize">
              Top 10 Players - <span className="font-semibold">{difficulty}</span>
            </p>
          </div>

          {/* Player's Final Score */}
          {/* --- FIX: Applied flex and truncate to handle long player names --- */}
          <div className="bg-yellow-100 border-2 border-yellow-300 p-4 rounded-lg text-center mb-8 shadow-md overflow-hidden">
            <div className="text-lg sm:text-xl font-medium text-yellow-800 flex items-center justify-center min-w-0">
              <span className="flex-shrink-0">Your Score,&nbsp;</span>
              <span className="truncate font-semibold">{playerName}</span>
              <span>:</span>
            </div>
            <p className="text-4xl sm:text-5xl font-bold text-yellow-900">{finalScore}</p>
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
                  <li 
                    key={score.id} 
                    className={`flex items-center justify-between p-2 sm:p-3 rounded-md ${score.player_name === playerName && score.score === finalScore ? 'bg-yellow-50' : ''}`}
                  >
                    {/* --- FIX: Added min-w-0 to allow this container to shrink --- */}
                    <div className="flex items-center min-w-0">
                      <span className={`text-base sm:text-lg font-bold w-8 flex-shrink-0 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-500' : index === 2 ? 'text-yellow-700' : 'text-gray-400'}`}>
                        {index + 1}
                      </span>
                      {/* --- FIX: Added truncate to the player name --- */}
                      <span className="text-base sm:text-lg font-medium text-gray-800 ml-3 truncate">{score.player_name}</span>
                    </div>
                    {/* --- FIX: Added ml-4 and flex-shrink-0 to protect the score --- */}
                    <span className="text-lg sm:text-xl font-bold text-gray-900 ml-4 flex-shrink-0">{score.score}</span>
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
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition text-base"
            >
              <Play className="w-5 h-5" />
              Play Again
            </button>
            <button
              onClick={onMainMenu}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition text-base"
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