// src/pages/UpdatePasswordPage.tsx
import { useState, useEffect } from 'react';
// Import the function
import { getSupabaseClient } from '../lib/supabaseClient'; 
import { SupabaseClient } from '@supabase/supabase-js';

// Define the props interface
interface UpdatePasswordPageProps {
  onSuccess: () => void;
}

// Use the props
export default function UpdatePasswordPage({ onSuccess }: UpdatePasswordPageProps) {
  const [newPassword, setNewPassword] = useState('');
  // --- 1. ADD CONFIRM PASSWORD STATE ---
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [message, setMessage] = useState('Checking your link...');
  const [loading, setLoading] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);

  // Listen for the password recovery event
  useEffect(() => {
    const client: SupabaseClient = getSupabaseClient(); 
    
    const { data: { subscription: authListener } } = client.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMessage('Session recognized. Please enter your new password.');
        setIsSessionReady(true); // Enable the form
      }
    });

    // Also check the session on initial load
    client.auth.getSession().then(({ data: { session } }) => {
      if (session) {
         setMessage('Please enter your new password.');
         setIsSessionReady(true);
      } else {
         setTimeout(() => {
          if (!isSessionReady) { 
            setMessage('Invalid or expired link. Please request a new password reset.');
          }
         }, 1500);
      }
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, [isSessionReady]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSessionReady) {
      setMessage('Please wait, session not yet ready.');
      return;
    }
    
    // --- 2. ADD PASSWORD MATCH CHECK ---
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match. Please try again.');
      return; // Stop execution
    }

    setLoading(true);
    setMessage('Updating password...');

    const client: SupabaseClient = getSupabaseClient();

    const { error } = await client.auth.updateUser({ password: newPassword });

    setLoading(false);

    if (error) {
      setMessage(`Update failed: ${error.message}`);
    } else {
      setMessage('Password successfully updated! Redirecting to login...');
      setNewPassword('');
      setConfirmPassword(''); // Clear both fields
      setIsSessionReady(false); // Disable form
      
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-800">Set New Password</h2>
        
        <p className={`p-3 rounded-lg text-center ${message.includes('failed') || message.includes('match') ? 'bg-red-100 text-red-700' : (message.includes('successfully') ? 'bg-green-100 text-green-700' : 'text-gray-600 bg-gray-50')}`}>
          {message}
        </p>

        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
            <input 
              id="password"
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={!isSessionReady || loading}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 disabled:bg-gray-100"
            />
          </div>

          {/* --- 3. ADD CONFIRM PASSWORD FIELD --- */}
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input 
              id="confirm-password"
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={!isSessionReady || loading}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 disabled:bg-gray-100"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={!isSessionReady || loading || newPassword.length < 6}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-yellow-500 rounded-lg font-semibold hover:bg-yellow-600 disabled:bg-gray-400 transition"
          >
            {loading ? 'Updating...' : 'Set New Password'}
          </button>
        </form>
      </div>
    </div>
  );
}