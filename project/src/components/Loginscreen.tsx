// src/components/LoginScreen.tsx
import { useState } from 'react';
import { getSupabaseClient } from '../lib/supabaseClient'; 
import { LogIn, UserPlus, MailOpen, ArrowLeft } from 'lucide-react';
import { SupabaseClient } from '@supabase/supabase-js';

type AuthView = 'sign-in' | 'sign-up' | 'forgot-password';

// --- FIX: onSuccess prop is no longer needed ---
interface LoginScreenProps {
  // No props needed
}

export default function LoginScreen({}: LoginScreenProps) { // <-- FIX: No props
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [view, setView] = useState<AuthView>('sign-in');

  // Unified function for Sign In and Sign Up
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
      // --- FIX: No longer call onSuccess() ---
      // App.tsx's onAuthStateChange listener will handle the redirect.
      setMessage('Login successful! Redirecting...');
    } else if (action === 'signup') {
      setMessage('Success! Check your email for a confirmation link to log in.');
      setEmail('');
      setPassword('');
      setConfirmPassword(''); 
    }
  };

  // --- FORGOT PASSWORD HANDLER ---
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
            <h2 className="text-3xl font-bold text-center text-gray-800">{title}</h2>
            {message && (
                <p className={`p-3 rounded-lg ${message.includes('Error') || message.includes('match') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message}
                </p>
            )}
            <form onSubmit={(e) => handleAuthAction(e, isSignUp ? 'signup' : 'signin')} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500" required />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500" required />
                </div>
                {isSignUp && (
                  <div>
                      <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                      <input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500" required />
                  </div>
                )}
                {!isSignUp && (
                    <div className="text-right text-sm">
                        <button type="button" onClick={() => { setView('forgot-password'); setMessage(''); }}
                            className="text-yellow-600 hover:text-yellow-700 font-medium">
                            Forgot Password?
                        </button>
                    </div>
                )}
                <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-yellow-500 rounded-lg font-semibold hover:bg-yellow-600 disabled:bg-gray-400 transition">
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
                    className="text-yellow-600 hover:text-yellow-700 font-medium">
                    {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create an Account"}
                </button>
            </div>
          </>
        );
      }

      case 'forgot-password':
        return (
            <>
                <h2 className="text-3xl font-bold text-center text-gray-800">Reset Password</h2>
                <p className={`p-3 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-700' : (message ? 'bg-green-100 text-green-700' : 'text-gray-600 bg-gray-50')}`}>
                    {message || "Enter your email address and we'll send you a recovery link."}
                </p>
                <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500" required />
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-yellow-500 rounded-lg font-semibold hover:bg-yellow-600 disabled:bg-gray-400 transition">
                        {loading ? 'Sending...' : ( <><MailOpen className="w-5 h-5" /> Send Reset Link</> )}
                    </button>
                    <div className="text-center text-sm pt-2">
                        <button type="button" onClick={() => { setView('sign-in'); setMessage(''); setEmail(''); }}
                            className="text-yellow-600 hover:text-yellow-700 font-medium flex items-center justify-center gap-1 mx-auto">
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 space-y-6">
        {renderForm()}
      </div>
    </div>
  );
}