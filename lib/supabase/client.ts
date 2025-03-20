import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js';

// Singleton instance
let supabaseInstance: SupabaseClient | null = null;

/**
 * Creates a singleton Supabase client instance or returns the existing one
 * This ensures we don't create a new client on every render
 */
export function createClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }
  
  // Only create a new client if one doesn't exist
  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  return supabaseInstance;
}