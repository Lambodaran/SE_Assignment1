// src/components/VerifyMfaPage.tsx
import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../lib/supabaseClient';
import { ShieldCheck } from 'lucide-react';
import { AuthMfaChallenge } from '@supabase/supabase-js';

interface VerifyMfaPageProps {
  onSuccess: () => void; 
}

export default function VerifyMfaPage({ onSuccess }: VerifyMfaPageProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Enter the 6-digit code from your authenticator app.');
  
  const [challenge, setChallenge] = useState<AuthMfaChallenge | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null); 

  // 1. Get the list of factors and create a challenge
  useEffect(() => {
    const createMfaChallenge = async () => {
      setLoading(true);
      const supabase = getSupabaseClient();
      
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      
      if (factorsError) {
        setMessage(`Error: ${factorsError.message}`);
        setLoading(false);
        return;
      }

      const totpFactor = factorsData.all.find(
        (factor) => factor && factor.id && factor.factor_type === 'totp' && factor.status === 'verified'
      );

      if (!totpFactor) {
        setMessage('Error: No verified MFA factor found. Please re-enroll.');
        setLoading(false);
        return;
      }
      
      setFactorId(totpFactor.id); 

      // 2. Create a "challenge" for that factor
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id,
      });

      if (challengeError) {
        setMessage(`Error: ${challengeError.message}`);
        setLoading(false);
        return;
      }
      
      setChallenge(challengeData); 
      setLoading(false);
      setMessage('Enter the 6-digit code from your authenticator app.');
    };

    createMfaChallenge();
  }, []); 

  // 2. Handle the verification of the code
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge || !factorId) { 
      setMessage('Error: No challenge created. Please refresh and try again.');
      return;
    }
    
    setLoading(true);
    setMessage('Verifying code...');

    const supabase = getSupabaseClient();
    
    // 3. Verify the code against the challenge
    const { error } = await supabase.auth.mfa.verify({
      factorId: factorId, 
      challengeId: challenge.id,
      code: code,
    });

    setLoading(false);
    if (error) {
      setMessage(`Verification failed: ${error.message}`);
    } else {
      setMessage('Success! Logging you in...');
      setTimeout(() => {
        onSuccess();
      }, 1000);
    }
  };

  return (
    // THEME UPDATE: Main Gradient Background
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 to-orange-400 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 
                    animate-gradient-shimmer transition-colors duration-500">
      
      {/* THEME UPDATE: Card Background & Transitions */}
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-6 
                      animate-fade-in-up transition-colors duration-300">
        
        {/* THEME UPDATE: Heading Text */}
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 dark:text-white mb-2 flex items-center justify-center gap-2 animate-bounce-in">
          <ShieldCheck className="w-8 h-8 text-yellow-500 animate-slow-pulse" />
          <span role="img" aria-label="lock" className="inline-block animate-slow-pulse">🔐</span>
          <span>MFA Verification</span>
        </h2>
        
        {/* THEME UPDATE: Message Box (Neutral state adapted for dark mode) */}
        <p className={`p-3 rounded-lg text-center transition-colors ${
            message.includes('Error') || message.includes('failed') 
            ? 'bg-red-100 text-red-700' 
            : (message.includes('Success!') 
                ? 'bg-green-100 text-green-700' 
                : 'text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700')
          }`}>
          {message}
        </p> 

        <form onSubmit={handleVerifySubmit} className="space-y-4">
          <div>
            {/* THEME UPDATE: Label Color */}
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Verification Code</label>
            
            {/* THEME UPDATE: Input Background, Text, and Border */}
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 dark:text-white
                         focus:ring-yellow-500 focus:border-yellow-500 
                         text-center text-2xl tracking-[0.3em]"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || code.length !== 6 || !challenge}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-yellow-500 rounded-lg font-semibold hover:bg-yellow-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>
    </div>
  );
}