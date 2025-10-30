// supabase/functions/get-question/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { create } from 'https://deno.land/x/djwt@v2.8/mod.ts'; // For encryption

const API_BASE_URL = 'https://marcconrad.com/uob/banana/api.php?out=json';
const JWT_SECRET_KEY = Deno.env.get('JWT_SECRET_KEY');

// Helper to create a signed JWT (the encrypted token)
async function createAnswerToken(solution: number) {
  if (!JWT_SECRET_KEY) {
    throw new Error('JWT_SECRET_KEY is not set in environment variables');
  }

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(JWT_SECRET_KEY),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign', 'verify']
  );

  return await create(
    { alg: 'HS512', typ: 'JWT' },
    { solution, exp: Math.floor(Date.now() / 1000) + (60 * 5) },
    key
  );
}

serve(async (req) => { // <-- Changed _req to req
  
  // --- THIS IS THE FIX ---
  // Handle the browser's "permission check" (preflight) request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { 
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' 
      } 
    });
  }
  // --- END OF FIX ---

  try {
    // 1. Fetch the real question and answer
    const response = await fetch(`${API_BASE_URL}&_=${new Date().getTime()}`);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    if (!data.question || data.solution === undefined) {
      throw new Error('Invalid data from API');
    }

    // 2. Encrypt the solution into a token
    const answerToken = await createAnswerToken(data.solution);

    // 3. Send ONLY the question and the token to the client
    const responseBody = {
      image: data.question,
      answerToken: answerToken,
    };

    return new Response(JSON.stringify(responseBody), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // Required for browser
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // Required for browser
      },
    });
  }
});