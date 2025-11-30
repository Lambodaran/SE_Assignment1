// src/components/UpdatePasswordPage.tsx
import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../lib/supabaseClient'; 
import { SupabaseClient } from '@supabase/supabase-js';
import { ShieldCheck, KeyRound, Lock } from 'lucide-react';

interface UpdatePasswordPageProps {
  onSuccess: () => void;
}

export default function UpdatePasswordPage({ onSuccess }: UpdatePasswordPageProps) {
  // --- STATE MANAGEMENT ---
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [message, setMessage] = useState('Checking security status...');
  const [loading, setLoading] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);
  
  // MFA Logic State
  const [needsMfa, setNeedsMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [factorId, setFactorId] = useState<string | null>(null);
  const [isMfaVerified, setIsMfaVerified] = useState(false);

  useEffect(() => {
    const checkSessionAndMfa = async () => {
      const client: SupabaseClient = getSupabaseClient();
      
      // 1. Check if we have a session (from the email link)
      const { data: { session } } = await client.auth.getSession();
      
      if (!session) {
        // Wait a moment in case the auth listener hasn't fired yet
        const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
           if (session) {
             subscription.unsubscribe();
             await analyzeMfaStatus(client);
           }
        });
        
        // Timeout if no session appears
        setTimeout(() => {
           if (!isSessionReady && !needsMfa) {
             setMessage('Invalid or expired link. Please request a new password reset.');
           }
        }, 2000);
      } else {
        await analyzeMfaStatus(client);
      }
    };

    checkSessionAndMfa();
  }, []); // Run once on mount

  // Helper to check if user needs MFA
  const analyzeMfaStatus = async (client: SupabaseClient) => {
    try {
      // Check current security level
      const { data: aal } = await client.auth.mfa.getAuthenticatorAssuranceLevel();
      
      // If user has enrolled factors (nextLevel='aal2') but is currently only 'aal1'
      if (aal && aal.nextLevel === 'aal2' && aal.currentLevel === 'aal1') {
        
        // We need to find the Factor ID to challenge
        const { data: factors } = await client.auth.mfa.listFactors();
        const totpFactor = factors?.all.find(f => f.factor_type === 'totp' && f.status === 'verified');
        
        if (totpFactor) {
          setFactorId(totpFactor.id);
          setNeedsMfa(true);
          setMessage('Security Check: Please enter your MFA code.');
          setIsSessionReady(true);
          return;
        }
      }

      // If no MFA needed, proceed directly to password reset
      setNeedsMfa(false);
      setIsMfaVerified(true);
      setIsSessionReady(true);
      setMessage('Please enter your new password.');
    } catch (error) {
      console.error("MFA Check Error:", error);
      // Fallback: let them try to update password, Supabase will block if needed
      setIsSessionReady(true);
      setIsMfaVerified(true); 
    }
  };

  // --- HANDLER: VERIFY MFA ---
  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;
    
    setLoading(true);
    setMessage('Verifying code...');
    const client = getSupabaseClient();

    const { error } = await client.auth.mfa.challengeAndVerify({
      factorId,
      code: mfaCode,
    });

    setLoading(false);

    if (error) {
      setMessage(`MFA Error: ${error.message}`);
    } else {
      setMessage('Identity verified. You may now set your new password.');
      setNeedsMfa(false);
      setIsMfaVerified(true);
    }
  };

  // --- HANDLER: UPDATE PASSWORD ---
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSessionReady) return;
    
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match. Please try again.');
      return; 
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
      setConfirmPassword(''); 
      setIsSessionReady(false); 
      
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 to-orange-400 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 animate-gradient-shimmer transition-colors duration-500">
      
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 space-y-6 transition-colors duration-300">
        
        {/* --- DYNAMIC HEADER --- */}
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white flex justify-center items-center gap-2">
           {needsMfa ? <ShieldCheck className="w-8 h-8 text-yellow-500" /> : <KeyRound className="w-8 h-8 text-yellow-500" />}
           {needsMfa ? 'Security Check' : 'Set New Password'}
        </h2>
        
        {/* --- STATUS MESSAGE --- */}
        <p className={`p-3 rounded-lg text-center transition-colors ${
            message.includes('failed') || message.includes('match') || message.includes('Error')
            ? 'bg-red-100 text-red-700' 
            : (message.includes('successfully') 
                ? 'bg-green-100 text-green-700' 
                : 'text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700')
          }`}>
          {message}
        </p>

        {/* --- VIEW 1: MFA VERIFICATION FORM --- */}
        {needsMfa && (
          <form onSubmit={handleMfaVerify} className="space-y-4 animate-fade-in-up">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Authenticator Code</label>
              <input 
                type="text" 
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                maxLength={6}
                placeholder="123456"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 dark:text-white text-center text-2xl tracking-widest
                           focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || mfaCode.length !== 6}
              className="w-full px-4 py-2 text-white bg-yellow-500 rounded-lg font-semibold hover:bg-yellow-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition"
            >
              {loading ? 'Verifying...' : 'Verify Identity'}
            </button>
          </form>
        )}

        {/* --- VIEW 2: PASSWORD UPDATE FORM (Only shown if MFA verified or not needed) --- */}
        {!needsMfa && isMfaVerified && (
          <form onSubmit={handlePasswordUpdate} className="space-y-4 animate-fade-in-up">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={!isSessionReady || loading}
                  placeholder="••••••••"
                  className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                            bg-white dark:bg-gray-700 dark:text-white
                            focus:ring-yellow-500 focus:border-yellow-500 
                            disabled:bg-gray-100 dark:disabled:bg-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={!isSessionReady || loading}
                  placeholder="••••••••"
                  className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                            bg-white dark:bg-gray-700 dark:text-white
                            focus:ring-yellow-500 focus:border-yellow-500 
                            disabled:bg-gray-100 dark:disabled:bg-gray-600"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={!isSessionReady || loading || newPassword.length < 6}
              className="w-full px-4 py-2 text-white bg-yellow-500 rounded-lg font-semibold hover:bg-yellow-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition"
            >
              {loading ? 'Updating...' : 'Set New Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}