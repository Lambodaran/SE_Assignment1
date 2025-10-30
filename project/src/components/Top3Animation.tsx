// src/components/Top3Animation.tsx
import { useEffect } from 'react';
import { Trophy, Star, Award } from 'lucide-react';

interface Top3AnimationProps {
  onComplete: () => void;
}

export default function Top3Animation({ onComplete }: Top3AnimationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-gradient-to-br from-blue-500 to-indigo-700 rounded-3xl p-12 shadow-2xl transform animate-scaleIn">
        <div className="text-center">
          <div className="flex justify-center gap-4 mb-6 animate-bounce">
            <Award className="w-16 h-16 text-white" fill="white" />
            <Trophy className="w-20 h-20 text-white" />
            <Award className="w-16 h-16 text-white" fill="white" />
          </div>
          <h2 className="text-6xl font-bold text-white mb-2">TOP 3!</h2>
          <p className="text-3xl text-white font-semibold">You're on the leaderboard!</p>
        </div>
      </div>
    </div>
  );
}