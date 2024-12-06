import { useEffect, useState } from 'react';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

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
    if (typeof window === 'undefined') return;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setError('Missing Supabase environment variables');
      setIsLoading(false);
      return;
    }

    try {
      if (!supabaseInstance) {
        supabaseInstance = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          {
            auth: {
              persistSession: true,
              autoRefreshToken: true,
              detectSessionInUrl: true,
              storageKey: 'mainmenu-auth',
              storage: window.localStorage
            }
          }
        );
      }
      
      setClient(supabaseInstance);

      // Always check initial session
      supabaseInstance.auth.getSession().then(({ data: { session }, error: sessionError }) => {
        if (sessionError) {
          console.error('Error fetching session:', sessionError);
          setError(sessionError.message);
          setIsLoading(false);
          return;
        }
        
        setUser(session?.user ?? null);
        setIsLoading(false);
      });

      // Listen for auth changes
      const { data: { subscription } } = supabaseInstance.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setUser(session?.user ?? null);
        setIsLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (err) {
      console.error('Error initializing Supabase client:', err);
      setError(err instanceof Error ? err.message : 'Unknown error initializing Supabase');
      setIsLoading(false);
    }
  }, []);

  return {
    client,
    user,
    error,
    isLoading
  };
}
