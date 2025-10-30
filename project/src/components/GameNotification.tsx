// src/components/GameNotification.tsx
import { CheckCircle, XCircle, Zap } from 'lucide-react';
import { useEffect } from 'react';

interface GameNotificationProps {
  type: 'correct' | 'wrong' | 'combo';
  message: string;
  onComplete: () => void;
}

export default function GameNotification({ type, message, onComplete }: GameNotificationProps) {
  // Automatically disappear after 1.2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1200); // Animation is 1s, stay for 0.2s
    return () => clearTimeout(timer);
  }, [onComplete]);

  const styles = {
    correct: 'bg-green-500',
    wrong: 'bg-red-500',
    combo: 'bg-blue-500',
  };

  const icons = {
    correct: <CheckCircle className="w-8 h-8" />,
    wrong: <XCircle className="w-8 h-8" />,
    combo: <Zap className="w-8 h-8" />,
  };

  return (
    <div className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50">
      <div 
        className={`flex items-center gap-4 text-white font-bold p-6 rounded-xl shadow-lg animate-popInFadeOut ${styles[type]}`}
      >
        {icons[type]}
        <span className="text-3xl">{message}</span>
      </div>
    </div>
  );
}