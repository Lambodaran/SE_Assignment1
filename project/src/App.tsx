import { useState, useEffect, useCallback } from 'react';
import { Session, SupabaseClient } from '@supabase/supabase-js'; 
// Use the function-based export
import { getSupabaseClient, DifficultyLevel } from './lib/supabaseClient'; 

// Component Imports
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import LoginScreen from './components/Loginscreen';
import { submitScore } from './services/leaderboardService';

// --- TYPE DEFINITIONS ---
type AppState = 'auth' | 'start' | 'playing' | 'leaderboard'; 

interface GameConfig {
  userId: string; 
  difficulty: DifficultyLevel;
  finalScore: number;
}
// --- COMPONENT START ---

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null); // Stores the initialized client
  const [appState, setAppState] = useState<AppState>('auth');
  const [loading, setLoading] = useState(true);

  const [gameConfig, setGameConfig] = useState<GameConfig>({
    userId: '', 
    difficulty: 'easy',
    finalScore: 0,
  });

  // 1. Supabase Session Management & Client Initialization
  useEffect(() => {
    // 1. Initialize the client using the function
    const client = getSupabaseClient();
    setSupabase(client);

    // 2. Set up session listener only if client is valid
    if (client) {
      // Get initial session
      client.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setAppState(session ? 'start' : 'auth'); 
        setLoading(false);
      });

      // Listen for auth changes (login, logout)
      const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setAppState(session ? 'start' : 'auth');
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    }
  }, []); 

  // Function passed to LoginScreen
  const handleAuthSuccess = () => {
    setAppState('start'); 
  };

  // Function passed to StartScreen
  const handleLogout = async () => {
    if (supabase) {
        setLoading(true);
        await supabase.auth.signOut();
    }
  };

  // Handle game start (only takes difficulty)
  const handleStartGame = (difficulty: DifficultyLevel) => {
    const userId = session?.user?.id;
    if (!userId) {
        setAppState('auth'); 
        return;
    }

    setGameConfig({
      userId: userId,
      difficulty,
      finalScore: 0,
    });
    setAppState('playing');
  };

  // Handle game end and score submission
  const handleGameEnd = useCallback( async (finalScore: number) => {
    // *** CRITICAL FIX: Guard clause to break the infinite render loop ***
    if (appState === 'leaderboard') return;

    setGameConfig((prev) => ({ ...prev, finalScore }));
    
    const { difficulty } = gameConfig;
    
    // Use the user's email as the display name for the leaderboard
    const playerName = session?.user?.email || 'Authenticated User'; 

    try {
      await submitScore(playerName, finalScore, difficulty); 
    } catch (error) {
      console.error('Failed to submit score:', error);
    }

    setAppState('leaderboard');
  }, [gameConfig, session, appState]); // appState added to dependencies for the guard clause

  // Reset functions
  const handlePlayAgain = () => {
    setAppState('playing');
    setGameConfig((prev) => ({ ...prev, finalScore: 0 }));
  };

  const handleMainMenu = () => {
    setAppState('start');
    setGameConfig((prev) => ({ ...prev, finalScore: 0, difficulty: 'easy' }));
  };

  // --- Keyboard Listener (to quit game) ---
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && appState === 'playing') { 
        if (window.confirm('Are you sure you want to quit? Your progress will be lost.')) {
          handleMainMenu();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [appState, handleMainMenu]); 

  // --- RENDER LOGIC ---

  if (loading || !supabase) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-700 text-xl">Loading Session...</div>;
  }
  
  const user = session?.user; 

  return (
    <>
      {/* State 1: Authentication */}
      {appState === 'auth' && <LoginScreen onSuccess={handleAuthSuccess} />}
      
      {/* State 2: Start Screen (Requires Authentication) */}
      {appState === 'start' && user && (
        <StartScreen 
            onStart={handleStartGame} 
            onLogout={handleLogout} 
        />
      )}
      
      {/* State 3: Playing (Requires Authentication) */}
      {appState === 'playing' && user && (
        <GameScreen
          playerName={user.email || 'Player'} 
          difficulty={gameConfig.difficulty}
          onGameEnd={handleGameEnd}
        />
      )}
      
      {/* State 4: Leaderboard */}
      {appState === 'leaderboard' && (
        <LeaderboardScreen
          playerName={user?.email || 'Guest'} 
          finalScore={gameConfig.finalScore}
          difficulty={gameConfig.difficulty}
          onPlayAgain={handlePlayAgain}
          onMainMenu={handleMainMenu}
        />
      )}
    </>
  );
}

export default App;