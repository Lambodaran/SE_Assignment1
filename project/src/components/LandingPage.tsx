// src/components/LandingPage.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ThreeDBanana from "./ThreeDBanana";
import { Trophy, BarChart, X } from "lucide-react";

// --- FIX: Imports updated to match your new supabase.ts file ---
// Assuming your new file is at '../lib/supabase.ts'
import {
  supabase,
  DifficultyLevel,
  LeaderboardEntry,
} from "../lib/supabase";
// -------------------------------------------------------------

interface LandingPageProps {
  onLoginClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  const symbols = ["+", "-", "×", "÷", "√", "π"];

  return (
    <div className="relative min-h-screen bg-gray-900 text-white overflow-hidden flex flex-col items-center justify-center px-4 py-16">
      {/* ... (Floating Symbols) ... */}
      {symbols.map((symbol, i) => (
        <motion.div
          key={i}
          className="absolute text-yellow-400 text-3xl opacity-20 select-none pointer-events-none"
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
        {/* ... (Hero content, title, button, etc. - no changes) ... */}
        {/* 3D Floating Banana */}
        <motion.div
          className="w-48 h-48 mb-6"
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

        {/* Title */}
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold text-yellow-400 drop-shadow-[0_0_15px_rgba(255,255,0,0.6)]"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          BANANA BRAIN
        </motion.h1>

        {/* Subtitle */}
        <p className="max-w-xl mt-4 text-lg md:text-xl text-gray-300">
          Sharpen your mind. Beat the clock. Solve fast-paced math puzzles and
          become the Banana Brain Master!
        </p>

        {/* Login Button */}
        <motion.button
          onClick={onLoginClick}
          className="mt-10 px-12 py-3 bg-yellow-500 text-gray-900 text-2xl font-bold rounded-full shadow-xl hover:bg-yellow-400 transition transform hover:scale-105 relative"
          animate={{ boxShadow: ["0 0 20px #facc15", "0 0 40px #facc15"] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          Login / Sign Up
        </motion.button>
      </motion.div>

      {/* --- HOW TO PLAY SECTION --- */}
      <div className="relative z-10 mt-24 max-w-5xl w-full">
        {/* ... (Unchanged) ... */}
        <h2 className="text-3xl font-bold text-center text-yellow-300 mb-8">
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
        <h2 className="text-3xl font-bold text-center text-yellow-300 mb-8 flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8" />
          Top 5 Players
        </h2>
        <LeaderboardPreview />
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-24 mb-6 text-gray-500 text-sm">
        © {new Date().getFullYear()} Banana Brain. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;

// --- Feature card component (Unchanged) ---
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
      className="bg-gray-800/60 p-6 rounded-xl border border-yellow-400/30 shadow-lg h-full"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-bold text-yellow-300">{title}</h3>
      <p className="text-gray-400 mt-2">{desc}</p>
    </motion.div>
  );
};

// --- LEADERBOARD PREVIEW COMPONENT (Updated) ---
const LeaderboardPreview = () => {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- FIX: Using lowercase 'medium' to match your new supabase.ts type ---
  const [activeDifficulty, setActiveDifficulty] =
    useState<DifficultyLevel>("medium");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);

      try {
        // --- FIX: Using the imported 'supabase' client directly ---
        const { data, error } = await supabase
          .from("leaderboard")
          .select("player_name, score")
          .eq("difficulty", activeDifficulty) // This will now send 'easy', 'medium', or 'hard'
          .order("score", { ascending: false })
          .limit(5);

        if (error) throw error;
        // We cast to LeaderboardEntry[] but only player_name and score are loaded
        if (data) setScores(data as LeaderboardEntry[]);
      } catch (err: any) {
        console.error("Error fetching leaderboard preview:", err);
        setError("Failed to load scores");
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, [activeDifficulty]);

  // --- FIX: Using lowercase 'easy', 'medium', 'hard' ---
  const difficulties: DifficultyLevel[] = ["easy", "medium", "hard"];
  const difficultyDisplay: Record<DifficultyLevel, string> = {
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
  };

  return (
    <motion.div
      className="bg-gray-800/60 p-6 rounded-xl border border-yellow-400/30 shadow-lg"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* --- Difficulty Tabs --- */}
      <div className="flex justify-center gap-2 mb-4">
        {difficulties.map((level) => (
          <button
            key={level}
            onClick={() => setActiveDifficulty(level)}
            className={`px-4 py-1 rounded-full text-sm font-semibold transition ${
              activeDifficulty === level
                ? "bg-yellow-500 text-gray-900"
                : "bg-gray-700 text-yellow-300 hover:bg-gray-600"
            }`}
          >
            {difficultyDisplay[level]}
          </button>
        ))}
      </div>

      <div className="space-y-3 min-h-[200px]">
        {loading && (
          <div className="flex justify-center items-center h-full pt-10">
            <BarChart className="w-8 h-8 text-gray-400 animate-pulse" />
          </div>
        )}
        {error && (
          <div className="flex justify-center items-center h-full pt-10 text-red-400">
            <X className="w-6 h-6 mr-2" />
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && scores.length > 0 && (
          <ol className="divide-y divide-yellow-400/20">
            {scores.map((score, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-2"
              >
                <div className="flex items-center min-w-0">
                  <span
                    className={`font-bold w-6 flex-shrink-0 ${
                      index === 0 ? "text-yellow-400" : "text-gray-400"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-100 ml-3 truncate">
                    {score.player_name}
                  </span>
                </div>
                <span className="text-lg font-bold text-yellow-300 ml-4 flex-shrink-0">
                  {score.score}
                </span>
              </li>
            ))}
          </ol>
        )}
        {!loading && !error && scores.length === 0 && (
          <p className="text-center text-gray-400 pt-10">
            No scores yet for {difficultyDisplay[activeDifficulty]}. Be the first!
          </p>
        )}
      </div>
    </motion.div>
  );
};