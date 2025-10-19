import { createClient, SupabaseClient } from '@supabase/supabase-js';

// **Your hardcoded keys**
const supabaseUrl = 'https://skmtbqujwjpppruncupc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrbXRicXVqd2pwcHBydW5jdXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyOTU0NzEsImV4cCI6MjA3NTg3MTQ3MX0.3bPoTzv1a4-4VH58isdmijnZ1HUY4Tc2Mh4IbTGZyc0';

// Use a variable to store the single, cached instance
let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
    // If the client has already been created, return the cached instance
    if (cachedClient) {
        return cachedClient;
    }
    
    // Otherwise, create the new client instance
    const newClient = createClient(supabaseUrl, supabaseAnonKey);
    
    // Cache the new instance before returning it
    cachedClient = newClient;
    
    return newClient;
}

// NOTE: We still use the function export because that was necessary to fix the initial flowType error.
