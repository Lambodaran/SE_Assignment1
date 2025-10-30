// src/App.tsx
import { useState, useEffect, useCallback } from 'react';
import { Session, SupabaseClient, AuthUser } from '@supabase/supabase-js'; 
import { getSupabaseClient, DifficultyLevel } from './lib/supabaseClient'; 

// Component Imports
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import LoginScreen from './components/Loginscreen';
import UpdatePasswordPage from './components/UpdatePasswordPage';
import VerifyMfaPage from './components/VerifyMfaPage'; 
import MfaEnrollPage from './components/MfaEnrollPage'; 
import { submitScore } from './services/leaderboardService';

// --- TYPE DEFINITIONS ---
type AppState = 'auth' | 'enroll-mfa' | 'verify-mfa' | 'start' | 'playing' | 'leaderboard' | 'update-password'; 

interface GameConfig {
  userId: string; 
  difficulty: DifficultyLevel;
  finalScore: number;
}
// --- COMPONENT START ---

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [appState, setAppState] = useState<AppState>('auth');
  const [loading, setLoading] = useState(true);

  const [gameConfig, setGameConfig] = useState<GameConfig>({
    userId: '', 
    difficulty: 'easy',
    finalScore: 0,
  });

  // --- NEW: MFA CHECK LOGIC ---
  // This function checks the user's login status and decides where to send them.
  const checkMfaStatus = async (client: SupabaseClient, user: AuthUser) => {
    setLoading(true);
    
    const { data, error } = await client.auth.mfa.getAuthenticatorAssuranceLevel();

    if (error) {
      console.error('Error getting AAL:', error);
      setAppState('auth');
      setLoading(false);
      return;
    }

    if (data.currentLevel === 'aal2') {
      setAppState('start');
    } else {
      const { data: factors, error: factorsError } = await client.auth.mfa.listFactors();
      
      if (factorsError) {
        console.error('Error listing factors:', factorsError);
        setAppState('auth');
        setLoading(false);
        return;
      }
      
      const totpFactor = factors.all.find(f => f.factor_type === 'totp' && f.status === 'verified');

      if (totpFactor) {
        setAppState('verify-mfa');
      } else {
        setAppState('enroll-mfa');
      }
    }
    setLoading(false);
  };


  // --- AUTH LOGIC (MODIFIED) ---
  useEffect(() => {
    // Check for password reset URL first
    if (window.location.pathname === '/update-password') {
      const client = getSupabaseClient();
      setSupabase(client);
      setAppState('update-password');
      setLoading(false);
      const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });
      return () => subscription.unsubscribe();
    }

    // --- Normal Auth Flow ---
    const client = getSupabaseClient();
    setSupabase(client);

    // Get initial session on page load
    client.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        // Session exists. Check their MFA status.
        checkMfaStatus(client, session.user);
      } else {
        // No session, go to login
        setAppState('auth'); 
        setLoading(false);
      }
    });

    // --- FIX: This listener now handles BOTH login and logout ---
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (window.location.pathname !== '/update-password') {
        setSession(session);
        if (session) {
          // User just logged in. Check their MFA status.
          checkMfaStatus(client, session.user);
        } else {
          // User just logged out. Go to auth.
          setAppState('auth');
          setLoading(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []); // Empty array, runs once on load

  
  // --- handleAuthSuccess is no longer needed ---
  
  // Called by VerifyMfaPage OR MfaEnrollPage on success
  const handleMfaSuccess = () => {
    setAppState('start');
  };
  
  // Called by UpdatePasswordPage on success
  const handlePasswordUpdateSuccess = () => {
    window.history.pushState({}, '', '/'); 
    setAppState('auth');
  };

  // Function passed to StartScreen
  const handleLogout = async () => {
    if (supabase) {
        setLoading(true);
        await supabase.auth.signOut();
    }
  };

  // ... (Rest of your handlers: handleStartGame, handleGameEnd, etc. are all unchanged) ...
  // Handle game start
  const handleStartGame = (difficulty: DifficultyLevel) => {
    const userId = session?.user?.id;
    if (!userId) { 
        setAppState('auth'); 
        return;
    }
    setGameConfig({ userId, difficulty, finalScore: 0 });
    setAppState('playing');
  };

  // Handle game end
  const handleGameEnd = useCallback( async (finalScore: number) => {
    if (appState === 'leaderboard') return;
    setGameConfig((prev) => ({ ...prev, finalScore }));
    const { difficulty } = gameConfig;
    const playerName = session!.user!.email!; 
    try {
      await submitScore(playerName, finalScore, difficulty); 
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
    setAppState('leaderboard');
  }, [gameConfig, session, appState]);

  const handlePlayAgain = () => {
    setAppState('playing');
    setGameConfig((prev) => ({ ...prev, finalScore: 0 }));
  };

  const handleMainMenu = () => {
    setAppState('start');
    setGameConfig((prev) => ({ ...prev, finalScore: 0, difficulty: 'easy' }));
  };

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
      {/* State 0: Update Password */}
      {appState === 'update-password' && (
        <UpdatePasswordPage onSuccess={handlePasswordUpdateSuccess} />
      )}
    
      {/* State 1: Authentication */}
      {/* --- FIX: Removed onSuccess prop --- */}
      {appState === 'auth' && <LoginScreen />} 
      
      {/* State 2: MFA Enrollment (NEW) */}
      {appState === 'enroll-mfa' && user && <MfaEnrollPage onSuccess={handleMfaSuccess} />}

      {/* State 3: MFA Verification */}
      {appState === 'verify-mfa' && user && <VerifyMfaPage onSuccess={handleMfaSuccess} />}
      
      {/* State 4: Start Screen (Requires fully verified user) */}
      {appState === 'start' && user && (
        <StartScreen 
            onStart={handleStartGame} 
            onLogout={handleLogout} 
        />
      )}
      
      {/* State 5: Playing (Requires fully verified user) */}
      {appState === 'playing' && user && (
        <GameScreen
          playerName={user.email || 'Player'} 
          difficulty={gameConfig.difficulty}
          onGameEnd={handleGameEnd}
        />
      )}
      
      {/* State 6: Leaderboard (Requires fully verified user) */}
      {appState === 'leaderboard' && user && (
        <LeaderboardScreen
          playerName={user.email || 'Guest'} 
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