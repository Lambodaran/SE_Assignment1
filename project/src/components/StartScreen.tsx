// src/components/StartScreen.tsx
import { useState } from 'react';
import { DifficultyLevel } from '../lib/supabaseClient';
import { LogOut } from 'lucide-react';

interface DifficultyOption {
  id: DifficultyLevel;
  name: string;
  time: string;
  desc: string;
}

const difficultyOptions: DifficultyOption[] = [
  { id: 'easy', name: 'Easy', time: '30s per puzzle', desc: 'Learn the game' },
  { id: 'medium', name: 'Medium', time: '20s per puzzle', desc: 'Balanced challenge' },
  { id: 'hard', name: 'Hard', time: '10s per puzzle', desc: 'Expert mode' },
];

interface StartScreenProps {
  onStart: (difficulty: DifficultyLevel) => void;
  onLogout: () => void;
}

export default function StartScreen({ onStart, onLogout }: StartScreenProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('easy');

  return (
    // THEME UPDATE: Gradient
    <div 
      className="min-h-screen bg-gradient-to-br from-yellow-300 to-orange-400 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 
                 animate-gradient-shimmer transition-colors duration-500"
    >
      {/* THEME UPDATE: Card background */}
      <div 
        className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-center
                   animate-fade-in-up transition-colors duration-300"
      >
        
        <button
          onClick={onLogout}
          className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium flex items-center gap-1
                     transition-transform duration-200 hover:rotate-12"
        >
          Log Out <LogOut className="w-4 h-4" />
        </button>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-2 flex items-center justify-center gap-2">
          <span role="img" aria-label="banana" className="inline-block animate-bounce-in animation-delay-100 animate-slow-pulse">🍌</span>
          <span className="inline-block animate-bounce-in animation-delay-200">Banana Brain</span>
          <span role="img" aria-label="brain" className="inline-block animate-bounce-in animation-delay-300 animate-slow-pulse">🧠</span>
        </h1>
        
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-8 animate-fade-in-up animation-delay-400">
          Challenge Your Mind!
        </p>

        <div className="space-y-4 mb-8 animate-fade-in-up animation-delay-400">
          <p className="font-semibold text-gray-700 dark:text-gray-200">Choose Difficulty</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {difficultyOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedDifficulty(opt.id)}
                className={`p-4 rounded-lg border-2 
                           transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md
                           ${
                  selectedDifficulty === opt.id
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-gray-700 dark:border-yellow-400'
                    // THEME UPDATE: Inactive button styles
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <span className="block font-bold text-gray-800 dark:text-white">{opt.name}</span>
                <span className="block text-sm text-gray-600 dark:text-gray-300">{opt.time}</span>
                <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onStart(selectedDifficulty)}
          className="w-full bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg shadow-md text-lg sm:text-xl 
                     transition-all duration-300 ease-in-out 
                     hover:scale-105 hover:-translate-y-1 hover:shadow-lg 
                     active:scale-95 active:shadow-inner
                     animate-fade-in-up animation-delay-500"
        >
          Start Challenge
        </button>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 animate-fade-in-up animation-delay-500">
          Solve banana puzzles and climb the leaderboard!
        </p>
      </div>
    </div>
  );
}