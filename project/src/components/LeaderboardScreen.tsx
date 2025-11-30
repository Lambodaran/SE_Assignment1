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
  onMainMenu,
}: LeaderboardScreenProps) {
  
  const [selectedTab, setSelectedTab] = useState<DifficultyLevel>(difficulty);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showTop3, setShowTop3] = useState(false);
  const [animationPlayed, setAnimationPlayed] = useState(false);

  // Fetch Leaderboard for selected difficulty
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);

      const supabase = getSupabaseClient();
      try {
        const { data, error } = await supabase
          .from('leaderboard')
          .select('*')
          .eq('difficulty', selectedTab)
          .order('score', { ascending: false })
          .order('created_at', { ascending: true })
          .limit(10);

        if (error) throw error;

        setScores(data || []);

        // Check Top3 animation
        if (!animationPlayed && selectedTab === difficulty && data) {
          const top3 = data.slice(0, 3);
          const isTop3 = top3.some(
            (entry) =>
              entry.player_name === playerName &&
              entry.score === finalScore
          );
          const third = top3.length === 3 ? top3[2].score : 0;

          if ((isTop3 || finalScore >= third) && finalScore > 0) {
            setShowTop3(true);
            setAnimationPlayed(true);
          }
        }

      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch leaderboard. Please check your connection.");
      }

      setLoading(false);
    };

    fetchLeaderboard();
  }, [selectedTab, animationPlayed, difficulty, playerName, finalScore]);


  // Difficulty Tab Button
  const TabButton = (label: DifficultyLevel) => (
    <button
      key={label}
      onClick={() => setSelectedTab(label)}
      className={`flex-1 py-3 text-center font-bold rounded-xl transition-all duration-300
        ${
          selectedTab === label
            ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md scale-105"
            // THEME UPDATE: Darker inactive state
            : "bg-white/40 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-600"
        }
      `}
    >
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </button>
  );


  return (
    <>
      {showTop3 && <Top3Animation onComplete={() => setShowTop3(false)} />}

      {/* THEME UPDATE: Main Gradient Background */}
      <div 
        className="min-h-screen bg-gradient-to-br from-yellow-300 to-orange-400 dark:from-gray-900 dark:to-gray-800 
                   flex items-center justify-center p-4 transition-colors duration-500"
      >

        {/* THEME UPDATE: Main Card Container */}
        <div className="w-full max-w-3xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-md 
                        rounded-2xl shadow-2xl p-6 relative border border-white/20 dark:border-gray-700 transition-colors duration-300">

          {/* Header */}
          <div className="text-center mb-6">
            <Trophy className="w-14 h-14 text-yellow-500 drop-shadow-xl mx-auto" />
            <h1 className="text-4xl sm:text-5xl font-black 
                           bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 
                           bg-clip-text text-transparent">
              Leaderboard
            </h1>
          </div>

          {/* Player Score */}
          <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 
                          p-1 rounded-2xl mb-6 shadow-2xl">
            {/* THEME UPDATE: Inner score card */}
            <div className="bg-white dark:bg-gray-700 rounded-xl p-6 transition-colors duration-300">
              <div className="text-lg sm:text-xl text-gray-700 dark:text-gray-200 font-medium mb-2">
                Your Score, <span className="font-bold">{playerName}</span>:
              </div>
              <p className="text-5xl sm:text-6xl font-black 
                            bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 
                            bg-clip-text text-transparent">
                {finalScore}
              </p>
            </div>
          </div>

          {/* Difficulty Tabs */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {TabButton("easy")}
            {TabButton("medium")}
            {TabButton("hard")}
          </div>

          {/* THEME UPDATE: Leaderboard Table Container */}
          <div className="space-y-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 shadow-inner transition-colors duration-300">

            {loading && (
              <div className="flex justify-center h-40 items-center">
                <BarChart className="w-12 h-12 text-yellow-500 animate-pulse" />
              </div>
            )}

            {error && (
              <div className="flex justify-center h-40 items-center p-4 
                              bg-red-500 text-white rounded-xl shadow-lg">
                <X className="w-8 h-8 mr-2" />
                <p className="font-semibold">{error}</p>
              </div>
            )}

            {!loading && !error && (
              // THEME UPDATE: Divider color
              <ol className="divide-y divide-gray-200 dark:divide-gray-700">
                {scores.map((score, index) => (
                  <li
                    key={score.id}
                    className={`flex items-center justify-between p-3 rounded-lg duration-300
                      ${
                        score.player_name === playerName &&
                        score.score === finalScore &&
                        selectedTab === difficulty
                          // THEME UPDATE: Active Player Highlight
                          ? "bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-400 dark:border-yellow-500 shadow-lg scale-[102%]"
                          : index < 3
                          // THEME UPDATE: Top 3 vs Others
                          ? "bg-white dark:bg-gray-800 shadow-sm"
                          : "bg-white/70 dark:bg-gray-800/70"
                      }
                    `}
                  >
                    <div className="flex items-center min-w-0 gap-3">
                      <span className="text-2xl w-10 text-center">
                        {index === 0 ? "🥇" 
                        : index === 1 ? "🥈" 
                        : index === 2 ? "🥉" 
                        : index + 1}
                      </span>

                      {/* THEME UPDATE: Player Name */}
                      <span className="truncate font-semibold text-gray-800 dark:text-gray-200">
                        {score.player_name}
                      </span>
                    </div>

                    {/* THEME UPDATE: Score Text */}
                    <span className="text-2xl font-black text-gray-700 dark:text-white">
                      {score.score}
                    </span>
                  </li>
                ))}
              </ol>
            )}

            {!loading && !error && scores.length === 0 && (
              <div className="text-center py-10">
                <Trophy className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto" />
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mt-4">
                  No scores yet for this level.
                </p>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button
              onClick={onPlayAgain}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 
                         text-white font-bold rounded-xl shadow-lg 
                         hover:scale-105 transition-all"
            >
              <Play className="inline-block w-5 h-5 mr-2" />
              Play Again
            </button>

            {/* THEME UPDATE: Main Menu Button */}
            <button
              onClick={onMainMenu}
              className="flex-1 px-6 py-4 bg-gray-900 dark:bg-gray-700 text-white font-bold 
                         rounded-xl shadow-lg hover:scale-105 transition-all hover:bg-gray-800 dark:hover:bg-gray-600"
            >
              <Home className="inline-block w-5 h-5 mr-2" />
              Main Menu
            </button>
          </div>

        </div>
      </div>
    </>
  );
}