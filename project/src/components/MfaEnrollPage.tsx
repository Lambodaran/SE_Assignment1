// src/components/MfaEnrollPage.tsx
import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../lib/supabaseClient';
import { QrCode, ShieldCheck } from 'lucide-react';

interface MfaEnrollPageProps {
  onSuccess: () => void; // Tell App.tsx we are done
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

      // --- THIS IS THE FIX ---
      // The 'qr_code' property is already a full data URI.
      // We don't need to btoa() or re-format it.
      setQrCodeUrl(data.totp.qr_code);
      setFactorId(data.id); 
      // --- END OF FIX ---
      
      setMessage('Scan the QR code with your authenticator app (e.g., Google Authenticator).');
      setLoading(false);
    };

    enrollMfa();
  }, []); // Runs once on page load

  // 2. Verify the 6-digit code from the app
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('Verifying code...');

    const supabase = getSupabaseClient();
    
    // This function "challenges" (asks for a code) and "verifies" it in one step
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: factorId,
      code: code,
    });

    setLoading(false);

    if (error) {
      setMessage(`Verification failed: ${error.message}`);
    } else {
      setMessage('Success! MFA is now enabled.');
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
          Enable MFA
        </h2>
        
        <p className="p-3 rounded-lg text-center text-gray-600 bg-gray-50">
          {message}
        </p>

        {/* --- QR Code Display --- */}
        <div className="flex justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
          {qrCodeUrl ? (
            <img src={qrCodeUrl} alt="MFA QR Code" className="w-48 h-48" />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center">
              <QrCode className="w-16 h-16 text-gray-400 animate-pulse" />
            </div>
          )}
        </div>

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
            disabled={loading || code.length !== 6 || !qrCodeUrl}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-yellow-500 rounded-lg font-semibold hover:bg-yellow-600 disabled:bg-gray-400 transition"
          >
            {loading ? 'Verifying...' : 'Enable and Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}