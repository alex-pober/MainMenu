/**
 * Utility functions for working with Supabase
 */
import { createClient } from '@/lib/supabase/client';

/**
 * Get the Supabase client singleton
 * This is useful for components that need direct access to the client
 * without using the useSupabase hook (e.g., in utility functions)
 */
export function getSupabaseClient() {
  return createClient();
}

/**
 * Execute a Supabase query with the singleton client
 * This is useful for one-off queries that don't need to maintain
 * the client reference
 */
export async function withSupabase<T>(
  callback: (supabase: ReturnType<typeof createClient>) => Promise<T>
): Promise<T> {
  const supabase = createClient();
  return callback(supabase);
}
