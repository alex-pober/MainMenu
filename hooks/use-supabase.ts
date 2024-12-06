import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient, User } from '@supabase/supabase-js';

interface UseSupabaseOptions {
  requireAuth?: boolean;
}

let supabaseInstance: SupabaseClient | null = null;

export function useSupabase(options: UseSupabaseOptions = { requireAuth: false }) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setError('Missing Supabase environment variables');
      setIsLoading(false);
      return;
    }

    try {
      if (!supabaseInstance) {
        supabaseInstance = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
      }

      setClient(supabaseInstance);

      // Get initial session
      supabaseInstance.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          console.log('Initial session found:', session.user.id);
          setUser(session.user);
        } else {
          console.log('No initial session found');
          setUser(null);
        }
        setIsLoading(false);
      });

      // Listen for auth changes
      const { data: { subscription } } = supabaseInstance.auth.onAuthStateChange(
        async (_event, session) => {
          if (session?.user) {
            console.log('Auth state changed - User:', session.user.id);
            setUser(session.user);
          } else {
            console.log('Auth state changed - No user');
            setUser(null);
          }
          setIsLoading(false);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    } catch (e) {
      console.error('Error initializing Supabase client:', e);
      setError(e instanceof Error ? e.message : 'Failed to initialize Supabase');
      setIsLoading(false);
    }
  }, []);

  // Check for required auth
  useEffect(() => {
    if (options.requireAuth && !isLoading && !user) {
      setError('Authentication required');
    }
  }, [options.requireAuth, isLoading, user]);

  return {
    client: supabaseInstance,
    user,
    error,
    isLoading,
  };
}
