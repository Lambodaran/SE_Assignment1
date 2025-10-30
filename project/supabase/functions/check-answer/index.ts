// supabase/functions/check-answer/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { verify } from 'https://deno.land/x/djwt@v2.8/mod.ts'; // For decryption

const JWT_SECRET_KEY = Deno.env.get('JWT_SECRET_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
  }

  try {
    if (!JWT_SECRET_KEY) {
      throw new Error('JWT_SECRET_KEY is not set in environment variables');
    }

    // 1. Get the user's guess and the token from the client
    const { guess, answerToken } = await req.json();

    if (guess === undefined || !answerToken) {
      throw new Error('Missing guess or token');
    }

    // 2. Import the secret key
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(JWT_SECRET_KEY),
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign', 'verify']
    );

    // 3. Verify the token and get the payload (with the solution)
    // This will fail if the token is fake or expired
    const payload = await verify(answerToken, key);
    
    if (!payload || typeof payload.solution !== 'number') {
      throw new Error('Invalid token payload');
    }

    // 4. Compare the user's guess to the secret solution
    const isCorrect = parseInt(guess, 10) === payload.solution;

    // 5. Send back the result
    return new Response(JSON.stringify({ correct: isCorrect }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 401, // Unauthorized or bad token
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  }
});