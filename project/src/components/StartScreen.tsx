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
    <div 
      className="min-h-screen bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center p-4 
                 animate-gradient-shimmer" /* 1. Background gradient shimmer */
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-center
                   animate-fade-in-up" /* 2. Page load card fade-in */
      >
        
        <button
          onClick={onLogout}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-sm font-medium flex items-center gap-1
                     transition-transform duration-200 hover:rotate-12" /* 3. Logout icon animation */
        >
          Log Out <LogOut className="w-4 h-4" />
        </button>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          {/* 4. Staggered logo animation */}
          <span 
            role="img" 
            aria-label="banana" 
            className="inline-block animate-pop-in animation-delay-100"
          >
            🍌
          </span>
          <span className="inline-block animate-pop-in animation-delay-200">
            Banana Brain
          </span>
          <span 
            role="img" 
            aria-label="brain" 
            className="inline-block animate-pop-in animation-delay-300"
          >
            🧠
          </span>
        </h1>
        
        <p className="text-base sm:text-lg text-gray-600 mb-8 animate-fade-in-up animation-delay-400">
          Challenge Your Mind!
        </p>

        <div className="space-y-4 mb-8 animate-fade-in-up animation-delay-400">
          <p className="font-semibold text-gray-700">Choose Difficulty</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {difficultyOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedDifficulty(opt.id)}
                className={`p-4 rounded-lg border-2 
                           transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md /* 5. Difficulty card hover */
                           ${
                  selectedDifficulty === opt.id
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <span className="block font-bold text-gray-800">{opt.name}</span>
                <span className="block text-sm text-gray-600">{opt.time}</span>
                <span className="block text-xs text-gray-500 mt-1">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onStart(selectedDifficulty)}
          className="w-full bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg shadow-md text-lg sm:text-xl 
                     transition-transform duration-200 ease-in-out hover:scale-105 active:scale-95 /* 6. Start button spring effect */
                     animate-fade-in-up animation-delay-500"
        >
          Start Challenge
        </button>
        <p className="text-xs text-gray-500 mt-4 animate-fade-in-up animation-delay-500">
          Solve banana puzzles and climb the leaderboard!
        </p>
      </div>
    </div>
  );
}