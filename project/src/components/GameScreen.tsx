import React, { useState, useEffect, useRef } from 'react';
import { DifficultyLevel } from '../lib/supabaseClient';
import { Clock, Timer, Banana, Brain } from 'lucide-react';

// API details - Fetches directly, no proxy
const API_BASE_URL = 'https://marcconrad.com/uob/banana/api.php?out=json';

// Difficulty settings (reused for the timer)
const DIFFICULTY_SETTINGS: Record<DifficultyLevel, number> = {
  easy: 30,
  medium: 20,
  hard: 10,
};

interface GameScreenProps {
  playerName: string;
  difficulty: DifficultyLevel;
  onGameEnd: (finalScore: number) => void;
}

// Define the state for a single question from the API
// Note: The component state uses 'image', but the API provides 'question'
interface Question {
  image: string;
  solution: number;
}

export default function GameScreen({ playerName, difficulty, onGameEnd }: GameScreenProps) {
  const initialTime = DIFFICULTY_SETTINGS[difficulty];

  // --- New State for Guessing Game ---
  const [question, setQuestion] = useState<Question | null>(null);
  const [userGuess, setUserGuess] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isGameActive, setIsGameActive] = useState(true);

  // Refs for stable timer/game end logic
  const submissionRef = useRef(false);
  const scoreRef = useRef(score);
  const onGameEndRef = useRef(onGameEnd);

  // Keep refs updated with current state
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { onGameEndRef.current = onGameEnd; }, [onGameEnd]);


  // --- 1. Fetch Question Logic (Corrected) ---
  const fetchQuestion = async () => {
    setIsLoading(true);
    setMessage('');
    setUserGuess(''); // Clear previous guess
    try {
      // Fetch directly from the API, no proxy
      const response = await fetch(`${API_BASE_URL}&_=${new Date().getTime()}`);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // The API response format is { question: string, solution: number }
      const data = await response.json();

      // --- SAFETY CHECK ---
      if (!data || !data.question || data.solution === undefined) {
        throw new Error('Invalid data received from API');
      }
      // --- END OF SAFETY CHECK ---

      // --- FIX ---
      // Map the API's 'data.question' to our state's 'image' property
      // We also don't need the .replace() logic, as your old code proved.
      const questionData: Question = {
        image: data.question, 
        solution: parseInt(data.solution, 10),
      };
      // --- END OF FIX ---

      setQuestion(questionData); // Use the correctly mapped data
      
    } catch (error) {
      console.error("Failed to fetch question:", error);
      setMessage('Error loading question. Please try again.');
    }
    setIsLoading(false);
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchQuestion();
  }, []); // Empty array means run once on mount


  // --- 2. Timer Logic (Mostly unchanged) ---
  useEffect(() => {
    if (!isGameActive) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          if (!submissionRef.current) {
            submissionRef.current = true;
            onGameEndRef.current(scoreRef.current); // Submit final score
            setMessage('Time Out! Game Over.');
            setIsGameActive(false);
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameActive]); // Only depends on game active state


  // --- 3. Guess Handling Logic ---
  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form from reloading page
    if (!isGameActive || isLoading || !question) {
      return;
    }

    const guessAsNumber = parseInt(userGuess, 10);

    if (guessAsNumber === question.solution) {
      // Correct Guess
      setScore(prevScore => prevScore + 10); // Add 10 points
      setMessage('Correct! +10 points');
      
      // Fetch next question after a short delay
      setTimeout(() => {
        fetchQuestion();
      }, 1000);

    } else {
      // Incorrect Guess
      setMessage('Wrong! Try again.');
      // Clear the "Wrong" message after a moment
      setTimeout(() => {
        setMessage('');
      }, 1200);
    }
  };
  
  // Note: There is no "win" condition like matching all cards.
  // The game only ends when the timer runs out.

  
  // --- Render Helpers ---
  const getTimerColor = () => {
    if (timeLeft <= 5) return 'bg-red-500';
    if (timeLeft <= 10) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex flex-col items-center">
      
      {/* Header and Status (Kept from original) */}
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
             
             {/* We don't have "Matches" anymore, so that is removed */}
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
        <div className={`w-full max-w-4xl p-3 text-center rounded-lg mb-6 text-white font-semibold shadow-md ${message.includes('Correct!') ? 'bg-green-600' : message.includes('Wrong!') ? 'bg-red-500' : message.includes('Time Out') || message.includes('CONGRAGULATIONS') ? 'bg-indigo-600' : 'bg-blue-500'}`}>
          {message}
        </div>
      )}

      {/* --- New Game Area --- */}
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Brain className="w-16 h-16 text-yellow-500 animate-pulse" />
            <p className="mt-4 text-gray-600">Loading new challenge...</p>
          </div>
        ) : question ? (
          <form onSubmit={handleGuessSubmit} className="flex flex-col items-center">
            
            {/* Image from API */}
            <div className="w-full mb-4 rounded-lg overflow-hidden shadow-md border-4 border-gray-200">
              <img 
                src={question.image} 
                alt="Banana Challenge" 
                className="w-full" 
              />
            </div>
            
            <p className="mb-4 text-lg font-semibold text-gray-700">What is the solution?</p>
            
            {/* Guess Input */}
            <input 
              type="number" 
              value={userGuess}
              onChange={(e) => setUserGuess(e.target.value)}
              disabled={!isGameActive || isLoading}
              className="w-full max-w-xs text-center text-2xl font-bold p-3 rounded-lg border-2 border-gray-300 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              placeholder="Enter number"
            />
            
            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={!isGameActive || isLoading || !userGuess}
              className="mt-6 w-full max-w-xs bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-yellow-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Submit Guess
            </button>
            
          </form>
        ) : (
          <p>Error: No question loaded.</p>
        )}
      </div>
      
      <p className="mt-8 text-sm text-gray-500">
        You are playing as: <span className="font-semibold text-gray-700">{playerName}</span>
      </p>
    </div>
  );
}