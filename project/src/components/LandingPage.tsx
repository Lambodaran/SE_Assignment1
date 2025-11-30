// src/components/LandingPage.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ThreeDBanana from "./ThreeDBanana";
import { Trophy, BarChart, X } from "lucide-react";

import {
  supabase,
  DifficultyLevel,
  LeaderboardEntry,
} from "../lib/supabase";

interface LandingPageProps {
  onLoginClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  const symbols = ["+", "-", "×", "÷", "√", "π"];

  return (
    // THEME UPDATE: Added dark:from-gray-900 dark:to-gray-800 and dark:text-white
    <div className="relative min-h-screen bg-gradient-to-br from-yellow-400 to-orange-500 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white overflow-hidden flex flex-col items-center justify-center px-4 py-16 transition-colors duration-500">
      
      {symbols.map((symbol, i) => (
        <motion.div
          key={i}
          className="absolute text-white text-3xl opacity-20 select-none pointer-events-none"
          initial={{ y: 0, x: Math.random() * 400 - 200 }}
          animate={{ y: -800 }}
          transition={{
            repeat: Infinity,
            duration: 10 + i * 2,
            ease: "linear",
            delay: i * 1,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        >
          {symbol}
        </motion.div>
      ))}

      {/* --- HERO SECTION --- */}
      <motion.div
        className="flex flex-col items-center mt-10 text-center relative z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {/* 3D Floating Banana */}
        <motion.div
          className="w-48 h-48 mb-6 drop-shadow-2xl" 
          animate={{
            rotateY: [0, 360],
            y: [-10, 10, -10],
          }}
          transition={{
            rotateY: { repeat: Infinity, duration: 6, ease: "linear" },
            y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
          }}
          style={{
            perspective: "800px",
          }}
        >
          <ThreeDBanana className="w-full h-full" />
        </motion.div>

        <motion.h1
          className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.1)]"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          BANANA BRAIN
        </motion.h1>

        <p className="max-w-xl mt-4 text-lg md:text-xl text-white/90 font-medium">
          Sharpen your mind. Beat the clock. Solve fast-paced math puzzles and
          become the Banana Brain Master!
        </p>

        {/* THEME UPDATE: Dark mode button styling */}
        <motion.button
          onClick={onLoginClick}
          className="mt-10 px-12 py-3 bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 text-2xl font-bold rounded-full shadow-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition transform hover:scale-105 relative"
          animate={{ boxShadow: ["0 0 0px #fff", "0 0 20px rgba(255,255,255,0.5)"] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          Login / Sign Up
        </motion.button>
      </motion.div>

      {/* --- HOW TO PLAY SECTION --- */}
      <div className="relative z-10 mt-24 max-w-5xl w-full">
        <h2 className="text-3xl font-bold text-center text-white mb-8 drop-shadow-sm">
          🎮 How to Play
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-center">
          <FeatureCard
            title="Difficulty Selection"
            icon="⏳"
            desc="Easy (30s), Medium (20s), or Hard (10s) modes."
          />
          <FeatureCard
            title="3-Life System"
            icon="❤️"
            desc="Lose a life for wrong answers or if the timer runs out."
          />
          <FeatureCard
            title="Per-Question Timer"
            icon="⏱️"
            desc="The timer resets for every single puzzle. Stay fast!"
          />
          <FeatureCard
            title="Scoring System"
            icon="⭐"
            desc="Get +10 points for every correct solution."
          />
          <FeatureCard
            title="Combo Bonus"
            icon="🔥"
            desc="+10 bonus points for every 3 correct answers in a row."
          />
          <FeatureCard
            title="Leveling System"
            icon="🚀"
            desc="Level up and see a special animation every 50 points."
          />
        </div>
      </div>

      {/* --- LEADERBOARD PREVIEW SECTION --- */}
      <div className="relative z-10 mt-24 max-w-lg w-full">
        <h2 className="text-3xl font-bold text-center text-white mb-8 flex items-center justify-center gap-3 drop-shadow-sm">
          <Trophy className="w-8 h-8" />
          Top 5 Players
        </h2>
        <LeaderboardPreview />
      </div>

      <footer className="relative z-10 mt-24 mb-6 text-white/60 text-sm font-medium">
        © {new Date().getFullYear()} Banana Brain. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;

// --- Feature card component ---
const FeatureCard = ({
  title,
  icon,
  desc,
}: {
  title: string;
  icon: string;
  desc: string;
}) => {
  return (
    <motion.div
      // THEME UPDATE: Added dark:bg-gray-800 dark:border-gray-700
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg h-full border border-white/20 dark:border-gray-700"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-4xl mb-3">{icon}</div>
      {/* THEME UPDATE: Text colors for dark mode */}
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 mt-2 font-medium">{desc}</p>
    </motion.div>
  );
};

// --- LEADERBOARD PREVIEW COMPONENT ---
const LeaderboardPreview = () => {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeDifficulty, setActiveDifficulty] =
    useState<DifficultyLevel>("medium");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("leaderboard")
          .select("player_name, score")
          .eq("difficulty", activeDifficulty)
          .order("score", { ascending: false })
          .limit(5);

        if (error) throw error;
        if (data) setScores(data as LeaderboardEntry[]);
      } catch (err: any) {
        console.error("Error fetching leaderboard preview:", err);
        setError("Failed to load scores");
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, [activeDifficulty]);

  const difficulties: DifficultyLevel[] = ["easy", "medium", "hard"];
  const difficultyDisplay: Record<DifficultyLevel, string> = {
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
  };

  return (
    <motion.div
      // THEME UPDATE: Dark card background
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex justify-center gap-2 mb-4">
        {difficulties.map((level) => (
          <button
            key={level}
            onClick={() => setActiveDifficulty(level)}
            className={`px-4 py-1 rounded-full text-sm font-bold transition ${
              activeDifficulty === level
                ? "bg-orange-500 text-white shadow-md"
                // THEME UPDATE: Darker inactive tabs
                : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {difficultyDisplay[level]}
          </button>
        ))}
      </div>

      <div className="space-y-3 min-h-[200px]">
        {loading && (
          <div className="flex justify-center items-center h-full pt-10">
            <BarChart className="w-8 h-8 text-orange-300 animate-pulse" />
          </div>
        )}
        {error && (
          <div className="flex justify-center items-center h-full pt-10 text-red-500 font-medium">
            <X className="w-6 h-6 mr-2" />
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && scores.length > 0 && (
          // THEME UPDATE: Darker divider
          <ol className="divide-y divide-orange-100 dark:divide-gray-700">
            {scores.map((score, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-2"
              >
                <div className="flex items-center min-w-0">
                  <span
                    className={`font-bold w-6 flex-shrink-0 ${
                      index === 0 ? "text-orange-500 text-xl" : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </span>
                  {/* THEME UPDATE: Player name color */}
                  <span className="font-bold text-gray-700 dark:text-gray-200 ml-3 truncate">
                    {score.player_name}
                  </span>
                </div>
                <span className="text-lg font-bold text-orange-500 dark:text-orange-400 ml-4 flex-shrink-0">
                  {score.score}
                </span>
              </li>
            ))}
          </ol>
        )}
        {!loading && !error && scores.length === 0 && (
          <p className="text-center text-gray-400 pt-10 font-medium">
            No scores yet for {difficultyDisplay[activeDifficulty]}. Be the first!
          </p>
        )}
      </div>
    </motion.div>
  );
};