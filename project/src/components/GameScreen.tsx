// src/components/GameScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { DifficultyLevel, getSupabaseClient } from '../lib/supabaseClient';
import { Clock, Timer, Banana, Brain, Heart } from 'lucide-react';
import LevelUpAnimation from './LevelUpAnimation';
import GameNotification from './GameNotification';

const DIFFICULTY_SETTINGS: Record<DifficultyLevel, number> = {
  easy: 30,
  medium: 20,
  hard: 10,
};
const POINTS_PER_LEVEL = 50;

interface GameScreenProps {
  playerName: string;
  difficulty: DifficultyLevel;
  onGameEnd: (finalScore: number) => void;
}

interface Question {
  image: string;
  answerToken: string;
}

// Add a unique, stable 'id' to the notification
type Notification = {
  id: number; // <-- ADD THIS
  type: 'correct' | 'wrong' | 'combo';
  message: string;
} | null;

export default function GameScreen({ playerName, difficulty, onGameEnd }: GameScreenProps) {
  const initialTime = DIFFICULTY_SETTINGS[difficulty];

  const [question, setQuestion] = useState<Question | null>(null);
  const [userGuess, setUserGuess] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isGameActive, setIsGameActive] = useState(true);
  const [lives, setLives] = useState(3);
  
  const [level, setLevel] = useState(1);
  const [comboCount, setComboCount] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [notification, setNotification] = useState<Notification>(null);

  const submissionRef = useRef(false);
  const scoreRef = useRef(score);
  const onGameEndRef = useRef(onGameEnd);

  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { onGameEndRef.current = onGameEnd; }, [onGameEnd]);

  const handleLifeLoss = (reason: string) => {
    if (!isGameActive || submissionRef.current) return;

    // ADD ID TO NOTIFICATION
    setNotification({ id: new Date().getTime(), type: 'wrong', message: reason });
    setComboCount(0); // Reset combo

    const newLives = lives - 1;
    setLives(newLives);
    setIsGameActive(false);

    if (newLives <= 0) {
      setMessage(`Game Over! Final Score: ${scoreRef.current}`);
      if (!submissionRef.current) {
        submissionRef.current = true;
        onGameEndRef.current(scoreRef.current);
      }
    } else {
      setTimeout(() => {
        fetchQuestion();
      }, 2000); 
    }
  };

  const fetchQuestion = async () => {
    setIsLoading(true);
    setMessage('');
    setUserGuess(''); 
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.functions.invoke('get-question');
      
      if (error) throw new Error(error.message);
      if (!data || !data.image || !data.answerToken) {
        throw new Error('Invalid data from server function');
      }
      setQuestion(data); 
      
    } catch (error: any) {
      console.error("Failed to fetch question:", error);
      setMessage(`Error loading question: ${error.message}`);
    }
    
    setTimeLeft(initialTime);
    setIsLoading(false);
    setIsGameActive(true); 
  };

  useEffect(() => {
    fetchQuestion();
  }, []); 

  useEffect(() => {
    if (!isGameActive || isLoading) return;
    if (timeLeft === 0) {
      handleLifeLoss('Time out!');
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isGameActive, isLoading]); 

  const handleGuessSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!isGameActive || isLoading || !question) return;
    
    setIsLoading(true); 
    setIsGameActive(false); 
    
    try {
      const supabase = getSupabaseClient();
      const guessAsNumber = parseInt(userGuess, 10);
      const { data, error } = await supabase.functions.invoke('check-answer', {
        body: { guess: guessAsNumber, answerToken: question.answerToken },
      });

      if (error) throw new Error(error.message);

      if (data.correct) {
        // --- CORRECT GUESS ---
        const newComboCount = comboCount + 1;
        setComboCount(newComboCount);

        let pointsToAdd = 10; 
        
        // Check for COMBO
        if (newComboCount > 0 && newComboCount % 3 === 0) {
          const comboNum = newComboCount / 3;
          pointsToAdd += 10; 
          // ADD ID TO NOTIFICATION
          setNotification({ id: new Date().getTime(), type: 'combo', message: `COMBO x${comboNum}!` });
        } else {
          // ADD ID TO NOTIFICATION
          setNotification({ id: new Date().getTime(), type: 'correct', message: `+${pointsToAdd}` });
        }

        setScore(prevScore => {
          const newScore = prevScore + pointsToAdd;
          const newLevel = Math.floor(newScore / POINTS_PER_LEVEL) + 1;
          
          if (newLevel > level) {
            setLevel(newLevel);
            setShowLevelUp(true); 
          }
          return newScore;
        });

        setTimeout(() => {
          fetchQuestion();
        }, 1200); 

      } else {
        // --- WRONG GUESS ---
        handleLifeLoss('Wrong!'); 
      }
    } catch (error: any) {
      console.error("Failed to check answer:", error);
      setMessage(`Error checking answer: ${error.message}`);
      setTimeout(() => fetchQuestion(), 1500);
    }
  };
  
  const getTimerColor = () => {
    if (timeLeft <= 5) return 'bg-red-500';
    if (timeLeft <= 10) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex flex-col items-center">
      
      {/* --- RENDER ANIMATIONS --- */}
      {notification && (
        // --- USE THE STABLE ID AS THE KEY ---
        <GameNotification
          key={notification.id} 
          type={notification.type}
          message={notification.message}
          onComplete={() => setNotification(null)}
        />
      )}
      
      {showLevelUp && (
        <LevelUpAnimation
          level={level}
          onComplete={() => setShowLevelUp(false)}
        />
      )}
      {/* ------------------------- */}

      
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
          
          <div className="flex items-center gap-4 sm:gap-6">
             <div className="text-center">
                <p className="text-lg font-bold text-gray-800">{score}</p>
                <p className="text-xs text-gray-500">Score</p>
             </div>
             
             <div className="text-center">
                <div className="flex justify-center items-center gap-1 h-6">
                    <Heart className={`w-6 h-6 ${lives >= 1 ? 'text-red-500 fill-red-500' : 'text-gray-300'}`} />
                    <Heart className={`w-6 h-6 ${lives >= 2 ? 'text-red-500 fill-red-500' : 'text-gray-300'}`} />
                    <Heart className={`w-6 h-6 ${lives >= 3 ? 'text-red-500 fill-red-500' : 'text-gray-300'}`} />
                </div>
                <p className="text-xs text-gray-500">Lives</p>
             </div>
          </div>
          
          {/* Timer */}
          <div className={`flex items-center text-white p-3 rounded-lg font-bold shadow-md ${getTimerColor()}`}>
            <Timer className="w-5 h-5 mr-2" />
            <span className="text-2xl w-8 text-right">{timeLeft}s</span>
          </div>
        </div>
      </div>
      
      {/* Message Area (Only shows Game Over message now) */}
      {message && (
        <div className={`w-full max-w-4xl p-3 text-center rounded-lg mb-6 text-white font-semibold shadow-md bg-red-500`}>
          {message}
        </div>
      )}

      {/* Game Area */}
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg">
        {(isLoading || !isGameActive) && lives > 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Brain className="w-16 h-16 text-yellow-500 animate-pulse" />
            <p className="mt-4 text-gray-600">Loading new challenge...</p>
          </div>
        ) : question && isGameActive ? (
          <form onSubmit={handleGuessSubmit} className="flex flex-col items-center">
            
            <div className="w-full mb-4 rounded-lg overflow-hidden shadow-md border-4 border-gray-200">
              <img 
                src={question.image} 
                alt="Banana Challenge" 
                className="w-full" 
              />
            </div>
            
            <p className="mb-4 text-lg font-semibold text-gray-700">What is the solution?</p>
            
            <input 
              type="number" 
              value={userGuess}
              onChange={(e) => setUserGuess(e.target.value)}
              disabled={!isGameActive || isLoading}
              className="w-full max-w-xs text-center text-2xl font-bold p-3 rounded-lg border-2 border-gray-300 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              placeholder="Enter number"
            />
            
            <button 
              type="submit" 
              disabled={!isGameActive || isLoading || !userGuess}
              className="mt-6 w-full max-w-xs bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-yellow-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Submit Guess
            </button>
            
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
             <Brain className="w-16 h-16 text-red-500" />
             <p className="mt-4 text-xl font-bold text-gray-700">{message || "Error: No question loaded."}</p>
          </div>
        )}
      </div>
      
      {/* --- THIS IS THE FIX --- */}
      {/* The </p> tag was missing, and it was inside the <div> */}
      <p className="mt-8 text-sm text-gray-500">
        You are playing as: <span className="font-semibold text-gray-700">{playerName}</span>
      </p>
      {/* ------------------------- */}

    </div> // This is the main closing div, it was correct
  );
}