// src/components/VerifyMfaPage.tsx
import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../lib/supabaseClient';
import { ShieldCheck } from 'lucide-react';
import { AuthMfaChallenge } from '@supabase/supabase-js';

interface VerifyMfaPageProps {
  onSuccess: () => void; // Function to tell App.tsx we are verified
}

export default function VerifyMfaPage({ onSuccess }: VerifyMfaPageProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Enter the 6-digit code from your authenticator app.');
  
  // --- THIS IS THE FIX ---
  // We must store the challenge AND the factorId separately
  const [challenge, setChallenge] = useState<AuthMfaChallenge | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null); // <-- NEW STATE
  // --- END OF FIX ---

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
      
      // --- THIS IS THE FIX ---
      // 1. Save the factorId so we can use it later
      setFactorId(totpFactor.id); 
      // --- END OF FIX ---

      // 2. Create a "challenge" for that factor
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id,
      });

      if (challengeError) {
        setMessage(`Error: ${challengeError.message}`);
        setLoading(false);
        return;
      }
      
      setChallenge(challengeData); // Save the challenge
      setLoading(false);
      setMessage('Enter the 6-digit code from your authenticator app.');
    };

    createMfaChallenge();
  }, []); // Empty array ensures this runs only once

  // 2. Handle the verification of the code
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // --- THIS IS THE FIX ---
    // Check for both factorId AND challenge
    if (!challenge || !factorId) { 
      setMessage('Error: No challenge created. Please refresh and try again.');
      return;
    }
    // --- END OF FIX ---
    
    setLoading(true);
    setMessage('Verifying code...');

    const supabase = getSupabaseClient();
    
    // 3. Verify the code against the challenge
    const { error } = await supabase.auth.mfa.verify({
      // --- THIS IS THE FIX ---
      factorId: factorId, // <-- Use our saved factorId
      // --- END OF FIX ---
      challengeId: challenge.id,
      code: code,
    });

    setLoading(false);
    if (error) {
      setMessage(`Verification failed: ${error.message}`);
    } else {
      // Success!
      setMessage('Success! Logging you in...');
      
      // Tell App.tsx that we are verified and it can proceed
      setTimeout(() => {
        onSuccess();
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 flex items-center justify-center gap-2">
          <ShieldCheck className="w-8 h-8 text-yellow-500" />
          MFA Verification
        </h2>
        
        <p className={`p-3 rounded-lg text-center ${message.includes('Error') || message.includes('failed') ? 'bg-red-100 text-red-700' : (message.includes('Success!') ? 'bg-green-100 text-green-700' : 'text-gray-600 bg-gray-50')}`}>
          {message}
        </p> 

        <form onSubmit={handleVerifySubmit} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">Verification Code</label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 text-center text-2xl tracking-[0.3em]"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || code.length !== 6 || !challenge}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-yellow-500 rounded-lg font-semibold hover:bg-yellow-600 disabled:bg-gray-400 transition"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>
    </div>
  );
}