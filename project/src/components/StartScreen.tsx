// src/components/StartScreen.tsx (REVISED)

import { useState } from 'react';
import { Sparkles, Trophy } from 'lucide-react';
import { DifficultyLevel } from '../lib/supabase'; // Assuming DifficultyLevel is imported here

interface StartScreenProps {
  // onStart now only needs the difficulty
  onStart: (difficulty: DifficultyLevel) => void; 
  onLogout: () => void; // Add a logout function for convenience
}

export default function StartScreen({ onStart, onLogout }: StartScreenProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | null>(null);

  const difficulties: { level: DifficultyLevel; time: number; color: string; description: string }[] = [
    { level: 'easy', time: 30, color: 'bg-green-500 hover:bg-green-600', description: 'Learn the game' },
    { level: 'medium', time: 20, color: 'bg-yellow-500 hover:bg-yellow-600', description: 'Balanced challenge' },
    { level: 'hard', time: 10, color: 'bg-red-500 hover:bg-red-600', description: 'Expert mode' },
  ];

  const handleStart = () => {
    if (selectedDifficulty) {
      onStart(selectedDifficulty);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-400 to-yellow-500 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 transform hover:scale-[1.01] transition-transform duration-300 relative">
            
            {/* Logout Button */}
            <button 
                onClick={onLogout}
                className="absolute top-4 right-4 text-sm text-gray-500 hover:text-red-500 transition font-medium"
            >
                Log Out
            </button>
            
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4 animate-bounce">
              <Sparkles className="w-10 h-10 text-yellow-500" />
              <h1 className="text-5xl md:text-6xl font-bold text-gray-800">
                Banana Brain
              </h1>
              <Sparkles className="w-10 h-10 text-yellow-500" />
            </div>
            <p className="text-xl text-gray-600 font-medium">Challenge Your Mind!</p>
          </div>

          <div className="space-y-6">
            {/* Player Name Input Block REMOVED */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Choose Difficulty
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {difficulties.map(({ level, time, color, description }) => (
                  <button
                    key={level}
                    onClick={() => setSelectedDifficulty(level)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedDifficulty === level
                        ? `${color} text-white border-transparent scale-105 shadow-lg`
                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-lg font-bold capitalize mb-1">{level}</div>
                    <div className="text-sm opacity-90">{time}s per puzzle</div>
                    <div className="text-xs mt-1 opacity-75">{description}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={!selectedDifficulty}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 rounded-xl font-bold text-xl hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Trophy className="w-6 h-6" />
              Start Challenge
            </button>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Solve banana puzzles and climb the leaderboard!</p>
          </div>
        </div>
      </div>
    </div>
  );
}