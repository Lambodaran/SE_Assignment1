// supabase/functions/verify-mfa-code/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
  }

  try {
    const { code } = await req.json(); // Get the 6-digit code from the user
    if (!code) throw new Error('Missing code');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // 1. Get the user who is logged in
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 2. Fetch the user's *unverified* and *unexpired* challenge
    // RLS already protects this, but we add checks for security.
    const { data: challengeData, error: fetchError } = await supabaseClient
      .from('mfa_challenges')
      .select('id, code_hash')
      .eq('user_id', user.id)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString()) // Check it's not expired
      .order('created_at', { ascending: false }) // Get the newest one
      .limit(1)
      .single();

    if (fetchError || !challengeData) {
      throw new Error('Invalid or expired code. Please try again.');
    }

    // 3. Compare the user's code with the stored hash
    const isMatch = await bcrypt.compare(code, challengeData.code_hash);

    if (!isMatch) {
      throw new Error('Invalid or expired code. Please try again.');
    }

    // 4. If it matches, mark the challenge as verified
    const { error: updateError } = await supabaseClient
      .from('mfa_challenges')
      .update({ verified: true })
      .eq('id', challengeData.id);

    if (updateError) throw new Error(`Database error: ${updateError.message}`);

    // 5. Return success
    // We will use this response in App.tsx to grant access
    return new Response(JSON.stringify({ success: true, message: 'MFA verified successfully.' }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 401, // Unauthorized or invalid
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});