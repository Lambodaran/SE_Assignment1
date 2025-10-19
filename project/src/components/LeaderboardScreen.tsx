import React, { useState, useEffect } from 'react';
import { Trophy, ArrowLeft, RotateCcw, Medal } from 'lucide-react';
import { DifficultyLevel, LeaderboardEntry } from '../lib/supabaseClient'; // Assuming types are here
import { getTopScores } from '../services/leaderboardService'; // Import the service function

interface LeaderboardScreenProps {
  playerName: string; // Current authenticated user's email
  finalScore: number;
  difficulty: DifficultyLevel; // Difficulty of the score just submitted
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

// Map for displaying difficulty titles and colors
const DIFFICULTY_TABS: { level: DifficultyLevel; color: string; hover: string }[] = [
    { level: 'easy', color: 'bg-green-500', hover: 'hover:bg-green-600' },
    { level: 'medium', color: 'bg-yellow-500', hover: 'hover:bg-yellow-600' },
    { level: 'hard', color: 'bg-red-500', hover: 'hover:bg-red-600' },
];

export default function LeaderboardScreen({ 
  playerName, 
  finalScore, 
  difficulty, 
  onPlayAgain, 
  onMainMenu 
}: LeaderboardScreenProps) {
  
  const [activeDifficulty, setActiveDifficulty] = useState<DifficultyLevel>(difficulty);
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Data Fetching Effect ---
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const fetchScores = async () => {
      try {
        const topScores = await getTopScores(activeDifficulty);
        setScores(topScores);
      } catch (err) {
        // Log the error but show a user-friendly message
        console.error("Error fetching leaderboard:", err);
        setError("Failed to load scores. Check your network or Supabase connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [activeDifficulty]); // Re-fetch whenever the tab changes

  // --- Render Helpers ---

  const getRankBadge = (index: number) => {
    if (index === 0) return 'text-yellow-500';
    if (index === 1) return 'text-gray-400';
    if (index === 2) return 'text-amber-700';
    return 'text-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-6 md:p-10 my-8">
        
        <div className="text-center mb-8">
          <Trophy className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
          <h1 className="text-4xl font-extrabold text-gray-800">Leaderboard</h1>
        </div>

        {/* --- Player's Latest Score Card --- */}
        <div className={`p-4 rounded-xl border-4 ${difficulty === 'hard' ? 'border-red-500' : difficulty === 'medium' ? 'border-yellow-500' : 'border-green-500'} bg-yellow-50 shadow-md mb-8`}>
            <p className="text-sm font-semibold text-gray-600 mb-1 flex items-center gap-2">
                <Medal className="w-4 h-4" />
                Your Latest Score ({difficulty.toUpperCase()})
            </p>
            <div className="flex justify-between items-baseline">
                <p className="text-2xl font-bold text-gray-900 truncate">{playerName}</p>
                <p className="text-3xl font-extrabold text-yellow-600">{finalScore}</p>
            </div>
        </div>

        {/* --- Difficulty Tabs --- */}
        <div className="flex justify-center space-x-2 mb-6 p-2 bg-gray-50 rounded-lg shadow-inner">
          {DIFFICULTY_TABS.map(({ level, color, hover }) => (
            <button
              key={level}
              onClick={() => setActiveDifficulty(level)}
              className={`py-2 px-4 rounded-lg text-sm font-semibold capitalize transition-all duration-200 shadow-md ${
                activeDifficulty === level
                  ? `${color} text-white`
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* --- Leaderboard List --- */}
        {loading && <p className="text-center py-8 text-gray-500">Loading top scores...</p>}
        {error && <p className="text-center py-8 text-red-600 bg-red-100 rounded-lg">{error}</p>}
        
        {!loading && !error && (
            <div className="space-y-3">
            {scores.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No scores recorded yet for the {activeDifficulty} level.</p>
            ) : (
                scores.map((entry, index) => (
                    <div
                        key={entry.id}
                        className={`flex justify-between items-center p-4 rounded-xl shadow-sm transition-all duration-150 ${
                            entry.player_name === playerName && entry.score === finalScore && entry.difficulty === difficulty 
                            ? 'bg-yellow-200 border-2 border-yellow-600 scale-[1.01]' 
                            : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                        }`}
                    >
                        {/* Rank */}
                        <div className="flex items-center w-1/4">
                            <Medal className={`w-6 h-6 mr-3 ${getRankBadge(index)}`} fill="currentColor" />
                            <span className="text-lg font-extrabold text-gray-700">{index + 1}</span>
                        </div>
                        
                        {/* Name */}
                        <p className="text-lg font-medium text-gray-800 w-1/2 truncate">{entry.player_name}</p>
                        
                        {/* Score */}
                        <p className="text-xl font-extrabold w-1/4 text-right text-yellow-700">{entry.score}</p>
                    </div>
                ))
            )}
            </div>
        )}

        {/* --- Action Buttons --- */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
          <button
            onClick={onPlayAgain}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 transition shadow-md"
          >
            <RotateCcw className="w-5 h-5" />
            Play Again ({difficulty.toUpperCase()})
          </button>
          
          <button
            onClick={onMainMenu}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Main Menu
          </button>
        </div>
        
      </div>
    </div>
  );
}
