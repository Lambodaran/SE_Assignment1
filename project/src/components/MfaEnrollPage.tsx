// src/components/MfaEnrollPage.tsx
import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../lib/supabaseClient';
import { QrCode, ShieldCheck } from 'lucide-react';

interface MfaEnrollPageProps {
  onSuccess: () => void; 
}

export default function MfaEnrollPage({ onSuccess }: MfaEnrollPageProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [factorId, setFactorId] = useState('');

  // 1. Get the QR code from Supabase
  useEffect(() => {
    const enrollMfa = async () => {
      setLoading(true);
      setMessage('Setting up MFA...');
      const supabase = getSupabaseClient();
      
      // 1. Clean up old factors
      const { data: factorsData, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) {
        setMessage(`Error checking factors: ${listError.message}`);
        setLoading(false);
        return;
      }
      if (factorsData && factorsData.all) {
        const unverifiedTotpFactors = factorsData.all.filter(
          (factor) => factor?.factor_type === 'totp' && factor?.status === 'unverified' && factor?.id
        );
        if (unverifiedTotpFactors.length > 0) {
          setMessage('Cleaning up old factors...');
          await Promise.all(
            unverifiedTotpFactors.map(factor => supabase.auth.mfa.unenroll(factor.id))
          );
        }
      }

      // 2. Enroll a new factor
      setMessage('Generating QR code...');
      const friendlyName = `BananaBrain-TOTP-${Date.now()}`;
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: friendlyName
      });

      if (error) {
        setMessage(`Error: ${error.message}`);
        setLoading(false);
        return;
      }
      
      if (!data?.totp?.qr_code) {
        setMessage('Error: Supabase returned no QR code. Please try refreshing.');
        setLoading(false);
        return;
      }

      setQrCodeUrl(data.totp.qr_code);
      setFactorId(data.id); 
      
      setMessage('Scan the QR code with your authenticator app (e.g., Google Authenticator).');
      setLoading(false);
    };

    enrollMfa();
  }, []); 

  // 2. Verify the 6-digit code from the app
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('Verifying code...');

    const supabase = getSupabaseClient();
    
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: factorId,
      code: code,
    });

    setLoading(false);

    if (error) {
      setMessage(`Verification failed: ${error.message}`);
    } else {
      setMessage('Success! MFA is now enabled.');
      setTimeout(() => {
        onSuccess();
      }, 1000);
    }
  };

  return (
    // THEME UPDATE: Main Gradient Background
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 to-orange-400 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors duration-500">
      
      {/* THEME UPDATE: Card Background & Text */}
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 space-y-6 transition-colors duration-300">
        
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white flex items-center justify-center gap-2">
          <ShieldCheck className="w-8 h-8 text-yellow-500" />
          Enable MFA
        </h2>
        
        {/* THEME UPDATE: Message Box */}
        <p className="p-3 rounded-lg text-center text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 transition-colors">
          {message}
        </p>

        {/* --- QR Code Display --- */}
        {/* THEME UPDATE: Border Color */}
        <div className="flex justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700/50">
          {qrCodeUrl ? (
            <img src={qrCodeUrl} alt="MFA QR Code" className="w-48 h-48 rounded-md" />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center">
              <QrCode className="w-16 h-16 text-gray-400 dark:text-gray-500 animate-pulse" />
            </div>
          )}
        </div>

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
            disabled={loading || code.length !== 6 || !qrCodeUrl}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-yellow-500 rounded-lg font-semibold hover:bg-yellow-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition"
          >
            {loading ? 'Verifying...' : 'Enable and Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}