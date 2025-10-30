// supabase/functions/send-mfa-code/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@3.2.0';
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // 1. Get the user who is logged in
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 2. Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await bcrypt.hash(code);
    
    // 3. Set expiry time (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // 4. Save the hashed code to the database
    const { error: insertError } = await supabaseClient
      .from('mfa_challenges')
      .insert({
        user_id: user.id,
        code_hash: codeHash,
        expires_at: expiresAt,
        verified: false
      });

    if (insertError) throw new Error(`Database error: ${insertError.message}`);
    
    // 5. Send the *plain* code via email
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set');
    const resend = new Resend(RESEND_API_KEY);

    await resend.emails.send({
      from: 'onboarding@resend.dev', // <-- REPLACE THIS
      to: user.email!,
      subject: 'Your Banana Brain 2FA Code',
      html: `
        <div>
          <h2>Your 6-digit code is:</h2>
          <h1 style="font-size: 3rem; letter-spacing: 5px;">${code}</h1>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `,
    });

    return new Response(JSON.stringify({ success: true, message: 'MFA code sent.' }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});