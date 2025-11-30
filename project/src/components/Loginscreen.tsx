// src/components/LoginScreen.tsx
import { useState } from 'react';
import { getSupabaseClient } from '../lib/supabaseClient'; 
import { LogIn, UserPlus, MailOpen, ArrowLeft } from 'lucide-react';
import { SupabaseClient } from '@supabase/supabase-js';

type AuthView = 'sign-in' | 'sign-up' | 'forgot-password';

interface LoginScreenProps {}

export default function LoginScreen({}: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [view, setView] = useState<AuthView>('sign-in');

  const handleAuthAction = async (e: React.FormEvent, action: 'signup' | 'signin') => {
    e.preventDefault();
    if (action === 'signup' && password !== confirmPassword) {
      setMessage('Passwords do not match. Please try again.');
      return; 
    }
    setLoading(true);
    setMessage('');

    const supabase: SupabaseClient = getSupabaseClient();
    let data, error;
    
    if (action === 'signup') {
        ({ data, error } = await supabase.auth.signUp({ email, password }));
    } else {
        ({ data, error } = await supabase.auth.signInWithPassword({ email, password }));
    }

    setLoading(false);

    if (error) {
      setMessage(`${action === 'signup' ? 'Sign Up' : 'Login'} Error: ${error.message}`);
    } else if (action === 'signin' && data.session) {
      setMessage('Login successful! Redirecting...');
    } else if (action === 'signup') {
      setMessage('Success! Check your email for a confirmation link to log in.');
      setEmail('');
      setPassword('');
      setConfirmPassword(''); 
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const supabase: SupabaseClient = getSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`, 
    });

    setLoading(false);

    if (error) {
      setMessage(`Reset Error: ${error.message}`);
    } else {
      setMessage('Password recovery email sent. Check your inbox!');
      setEmail('');
    }
  };


  const renderForm = () => {
    switch (view) {
      case 'sign-in':
      case 'sign-up': { 
        const isSignUp = view === 'sign-up';
        const title = isSignUp ? 'Create Account' : 'Welcome Back';
        const buttonText = isSignUp ? 'Sign Up' : 'Sign In';

        return (
          <>
            {/* THEME UPDATE: Title text color */}
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 dark:text-white mb-2 flex items-center justify-center gap-2 animate-bounce-in">
              {isSignUp ? (
                <>
                  <span role="img" aria-label="sparkles" className="inline-block animate-slow-pulse">✨</span>
                  <span>{title}</span>
                  <span role="img" aria-label="rocket" className="inline-block animate-slow-pulse">🚀</span>
                </>
              ) : (
                <>
                  <span role="img" aria-label="banana" className="inline-block animate-slow-pulse">🍌</span>
                  <span>{title}</span>
                  <span role="img" aria-label="wave" className="inline-block animate-slow-pulse">👋</span>
                </>
              )}
            </h2>
            {message && (
                <p className={`p-3 rounded-lg animate-fade-in-up ${message.includes('Error') || message.includes('match') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message}
                </p>
            )}
            <form onSubmit={(e) => handleAuthAction(e, isSignUp ? 'signup' : 'signin')} className="space-y-4">
                <div>
                    {/* THEME UPDATE: Label color */}
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    {/* THEME UPDATE: Input styling (bg-gray-700 text-white) */}
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 bg-white dark:bg-gray-700 dark:text-white" required />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                    <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 bg-white dark:bg-gray-700 dark:text-white" required />
                </div>
                {isSignUp && (
                  <div>
                      <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                      <input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 bg-white dark:bg-gray-700 dark:text-white" required />
                  </div>
                )}
                {!isSignUp && (
                    <div className="text-right text-sm">
                        <button type="button" onClick={() => { setView('forgot-password'); setMessage(''); }}
                            className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 font-medium">
                            Forgot Password?
                        </button>
                    </div>
                )}
                <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white bg-yellow-500 rounded-lg font-bold text-lg shadow-md
                               transition-all duration-300 ease-in-out 
                               hover:scale-105 hover:-translate-y-1 hover:shadow-lg hover:bg-yellow-600
                               active:scale-95 active:shadow-inner
                               disabled:bg-gray-400 disabled:hover:scale-100 disabled:hover:translate-y-0">
                    {loading ? 'Processing...' : (
                        <>
                            {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                            {buttonText}
                        </>
                    )}
                </button>
            </form>
            <div className="text-center text-sm pt-2">
                <button type="button" onClick={() => {
                        setView(isSignUp ? 'sign-in' : 'sign-up');
                        setMessage(''); setEmail(''); setPassword(''); setConfirmPassword('');
                    }}
                    className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 font-medium">
                    {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create an Account"}
                </button>
            </div>
          </>
        );
      }

      case 'forgot-password':
        return (
            <>
                <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 dark:text-white mb-2 flex items-center justify-center gap-2 animate-bounce-in">
                  <span role="img" aria-label="key" className="inline-block animate-slow-pulse">🔑</span>
                  <span>Reset Password</span>
                  <span role="img" aria-label="lock" className="inline-block animate-slow-pulse">🔒</span>
                </h2>
                <p className={`p-3 rounded-lg animate-fade-in-up ${message.includes('Error') ? 'bg-red-100 text-red-700' : (message ? 'bg-green-100 text-green-700' : 'text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700')}`}>
                    {message || "Enter your email address and we'll send you a recovery link."}
                </p>
                <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 
                                       transition-all duration-200 focus:scale-[1.02] bg-white dark:bg-gray-700 dark:text-white" required />
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white bg-yellow-500 rounded-lg font-bold text-lg shadow-md
                                   transition-all duration-300 ease-in-out 
                                   hover:scale-105 hover:-translate-y-1 hover:shadow-lg hover:bg-yellow-600
                                   active:scale-95 active:shadow-inner
                                   disabled:bg-gray-400 disabled:hover:scale-100 disabled:hover:translate-y-0">
                        {loading ? 'Sending...' : ( <><MailOpen className="w-5 h-5" /> Send Reset Link</> )}
                    </button>
                    <div className="text-center text-sm pt-2">
                        <button type="button" onClick={() => { setView('sign-in'); setMessage(''); setEmail(''); }}
                            className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 font-medium flex items-center justify-center gap-1 mx-auto
                                       transition-transform duration-200 hover:scale-110">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Sign In
                        </button>
                    </div>
                </form>
            </>
        );
    }
  };

  return (
    // THEME UPDATE: Dark gradient background
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 to-orange-400 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 
                    animate-gradient-shimmer transition-colors duration-500">
      {/* THEME UPDATE: Dark card background */}
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-6 
                      animate-fade-in-up transition-colors duration-300">
        {renderForm()}
      </div>
    </div>
  );
}