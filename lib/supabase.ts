import { supabase } from './supabase/client';

export { supabase };

// Add error handling wrapper
export async function handleSupabaseError<T>(
  promise: Promise<{ data: T | null; error: any }>
): Promise<T> {
  const { data, error } = await promise;
  
  if (error) {
    console.error('Supabase error:', error);
    throw new Error(error.message || 'An unexpected error occurred');
  }
  
  if (!data) {
    throw new Error('No data returned from the database');
  }
  
  return data;
}