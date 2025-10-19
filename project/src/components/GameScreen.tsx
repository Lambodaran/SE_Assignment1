import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DifficultyLevel } from '../lib/supabaseClient';
import { Clock, Ban, Zap, Banana, MonitorPlay, Timer, Brain, CheckCircle, RotateCcw } from 'lucide-react';

// Define the icons used for the memory cards
const GAME_ICONS = [
  Banana, MonitorPlay, Clock, Zap, Brain, Ban, CheckCircle, RotateCcw
];

// Difficulty settings map (matches your StartScreen logic)
const DIFFICULTY_SETTINGS: Record<DifficultyLevel, number> = {
  easy: 30,
  medium: 20,
  hard: 10,
};

interface Card {
  id: number; // Unique ID for keying
  icon: typeof GAME_ICONS[0];
  value: string; // Used for matching (icon name)
  isFlipped: boolean;
  isMatched: boolean;
}

interface GameScreenProps {
  playerName: string;
  difficulty: DifficultyLevel;
  onGameEnd: (finalScore: number) => void;
}

// Function to initialize the cards based on difficulty
const initializeCards = (difficulty: DifficultyLevel): Card[] => {
  const numPairs = difficulty === 'hard' ? 6 : 8; // 8 pairs for easy/medium (16 cards)
  const iconsToUse = GAME_ICONS.slice(0, numPairs);

  const cardValues = [...iconsToUse, ...iconsToUse].map((Icon, index) => ({
    id: index,
    icon: Icon,
    value: Icon.displayName || 'Icon',
    isFlipped: false,
    isMatched: false,
  }));

  // Simple Fisher-Yates shuffle algorithm
  for (let i = cardValues.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cardValues[i], cardValues[j]] = [cardValues[j], cardValues[i]];
  }

  return cardValues;
};


export default function GameScreen({ playerName, difficulty, onGameEnd }: GameScreenProps) {
  const initialTime = DIFFICULTY_SETTINGS[difficulty];

  const [cards, setCards] = useState<Card[]>(() => initializeCards(difficulty));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isGameActive, setIsGameActive] = useState(true);
  const [message, setMessage] = useState('');

  // Use a ref to track if the game has already been submitted to prevent multiple calls.
  const submissionRef = useRef(false);

  // Use refs to hold the current score and onGameEnd function for stable access
  const scoreRef = useRef(score);
  const onGameEndRef = useRef(onGameEnd);
  
  // Update refs when state/props change (stable effects)
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { onGameEndRef.current = onGameEnd; }, [onGameEnd]);


  // Check if the game is over (all cards matched)
  const allMatched = useMemo(() => cards.every(card => card.isMatched), [cards]);

  // --- 1. Timer Logic (Handles Time Out) ---

  useEffect(() => {
    // Stop the timer if the game is inactive (either by win or time-out)
    if (!isGameActive || allMatched) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          // Only submit score if time runs out and hasn't been submitted (by win condition)
          if (!submissionRef.current) {
             submissionRef.current = true;
             onGameEndRef.current(scoreRef.current); // Time ran out, submit current score
             setMessage('Time Out! Game Over.');
             setIsGameActive(false); // <--- Set inactive state *after* clearing interval
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Clean up the timer when the effect resets
    return () => clearInterval(timer);
    // FIX: Include allMatched so the effect cleans up instantly on win, preventing a race condition
  }, [isGameActive, allMatched]); 

  // --- 2. Matching Logic ---

  useEffect(() => {
    // Only run if exactly two cards are flipped
    if (flippedIndices.length === 2) {
      setIsGameActive(false); // Temporarily pause game interaction
      const [index1, index2] = flippedIndices;
      const card1 = cards[index1];
      const card2 = cards[index2];

      if (card1.value === card2.value) {
        // Match found!
        setScore(prevScore => prevScore + 10);
        setMessage('Match found! +10 points!');

        setCards(prevCards => {
          const newCards = [...prevCards];
          newCards[index1] = { ...newCards[index1], isMatched: true };
          newCards[index2] = { ...newCards[index2], isMatched: true };
          return newCards;
        });

        setTimeout(() => {
          setFlippedIndices([]);
          setIsGameActive(true);
          setMessage('');
        }, 800);

      } else {
        // No match
        setMessage('No match! Try again.');
        setTimeout(() => {
          // Flip them back over
          setCards(prevCards => {
            const newCards = [...prevCards];
            newCards[index1] = { ...newCards[index1], isFlipped: false };
            newCards[index2] = { ...newCards[index2], isFlipped: false };
            return newCards;
          });
          setFlippedIndices([]);
          setIsGameActive(true);
          setMessage('');
        }, 1200);
      }
    }
    // Dependencies: Only triggers when flipping/cards state changes.
  }, [flippedIndices, cards]); 

  // --- 3. Game Over (Win Condition) Logic ---
  useEffect(() => {
    // This hook ensures onGameEnd is called exactly once when allMatched becomes true
    if (allMatched && isGameActive && !submissionRef.current) {
      // Game over, stop interaction, mark as submitted
      setIsGameActive(false); // This will stop the timer via its dependency
      submissionRef.current = true; 
      
      setMessage('CONGRATULATIONS! You matched all the bananas!');
      // Access current score and function via refs
      onGameEndRef.current(scoreRef.current + timeLeft); 
    }
    // Dependencies: Triggered when the win condition is met (allMatched) or time changes
  }, [allMatched, isGameActive, timeLeft]); 
  
  // Clean up message on time out (moved the message setting to the timer cleanup)
  // Removed the previous cleanup useEffect to prevent further conflicts.


  const handleCardClick = useCallback((index: number) => {
    if (!isGameActive || flippedIndices.includes(index) || cards[index].isMatched || flippedIndices.length === 2) {
      return;
    }

    setCards(prevCards => {
      const newCards = [...prevCards];
      newCards[index] = { ...newCards[index], isFlipped: true };
      return newCards;
    });

    setFlippedIndices(prevIndices => [...prevIndices, index]);

  }, [isGameActive, flippedIndices, cards]);

  // --- Render Helpers ---

  const getTimerColor = () => {
    if (timeLeft <= 5) return 'bg-red-500';
    if (timeLeft <= 10) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const totalCards = cards.length;
  // Grid setup: 16 cards -> 4x4. 12 cards -> 3x4 (smaller grid gap on mobile for 12 cards)
  const gridColsClass = totalCards === 20 ? 'grid-cols-5 sm:grid-cols-5' : 'grid-cols-4 sm:grid-cols-4';
  const gridGap = 'gap-2 md:gap-4';


  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex flex-col items-center">
      
      {/* Header and Status */}
      <div className="w-full max-w-4xl bg-white p-4 rounded-xl shadow-lg mb-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="text-gray-700">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Banana className="w-5 h-5 text-yellow-600" />
              Banana Brain Challenge
            </h2>
            <p className="text-sm font-medium capitalize text-gray-500">
                Level: <span className={`font-semibold ${difficulty === 'hard' ? 'text-red-500' : difficulty === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>{difficulty}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="text-center">
                <p className="text-lg font-bold text-gray-800">{score}</p>
                <p className="text-xs text-gray-500">Score</p>
             </div>
             
             <div className="text-center">
                <p className="text-lg font-bold text-gray-800">{cards.filter(c => c.isMatched).length} / {totalCards / 2}</p>
                <p className="text-xs text-gray-500">Matches</p>
             </div>
          </div>
          
          {/* Timer */}
          <div className={`flex items-center text-white p-3 rounded-lg font-bold shadow-md ${getTimerColor()}`}>
            <Timer className="w-5 h-5 mr-2" />
            <span className="text-2xl w-8 text-right">{timeLeft}s</span>
          </div>
        </div>
      </div>
      
      {/* Message Area */}
      {message && (
        <div className={`w-full max-w-4xl p-3 text-center rounded-lg mb-6 text-white font-semibold shadow-md ${message.includes('Match found') ? 'bg-green-600' : message.includes('No match') ? 'bg-red-500' : message.includes('Time Out') || message.includes('CONGRATULATIONS') ? 'bg-indigo-600' : 'bg-blue-500'}`}>
          {message}
        </div>
      )}

      {/* Game Grid */}
      <div className={`w-full max-w-4xl grid ${gridColsClass} ${gridGap} aspect-square`}>
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`perspective-1000 w-full h-full cursor-pointer transition-all duration-300 transform hover:scale-[1.03] ${!isGameActive || card.isMatched || flippedIndices.length === 2 ? 'pointer-events-none' : ''}`}
            onClick={() => handleCardClick(index)}
          >
            <div 
              className={`relative preserve-3d w-full h-full rounded-xl shadow-lg transition-transform duration-500 ${card.isFlipped ? 'rotate-y-180' : ''}`}
              style={{ transformStyle: 'preserve-3d' as 'preserve-3d' }}
            >
              
              {/* Card Back (Hidden/Front Side) */}
              <div 
                className={`absolute backface-hidden w-full h-full flex items-center justify-center rounded-xl transition-colors duration-200 ${card.isMatched ? 'bg-yellow-300' : 'bg-yellow-500 hover:bg-yellow-600'}`}
              >
                <Brain className="w-10 h-10 text-white" />
              </div>
              
              {/* Card Face (Icon/Back Side) */}
              <div 
                className={`absolute backface-hidden rotate-y-180 w-full h-full flex items-center justify-center rounded-xl bg-white border-4 ${card.isMatched ? 'border-yellow-300' : 'border-yellow-500'}`}
              >
                {/* Dynamically render the icon component */}
                <card.icon 
                    className={`w-1/2 h-1/2 transition-opacity duration-300 ${card.isMatched ? 'text-gray-400 opacity-60' : 'text-gray-800'}`} 
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <p className="mt-8 text-sm text-gray-500">
        You are playing as: <span className="font-semibold text-gray-700">{playerName}</span>
      </p>
    </div>
  );
}
