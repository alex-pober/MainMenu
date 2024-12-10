import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient, User } from '@supabase/supabase-js';

interface UseSupabaseOptions {
  requireAuth?: boolean;
}

export function useSupabase(options: UseSupabaseOptions = { requireAuth: false }) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setError('Missing Supabase environment variables');
      setIsLoading(false);
      return;
    }

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    setClient(supabase);

    // Get initial session
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
      setIsLoading(false);
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Check for required auth
  useEffect(() => {
    if (options.requireAuth && !isLoading && !user) {
      setError('Authentication required');
    }
  }, [options.requireAuth, isLoading, user]);

  return {
    client,
    user,
    error,
    isLoading,
  };
}
