import { useEffect, useState } from 'react';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

export function useSupabase() {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setError('Missing Supabase environment variables');
      return;
    }

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          },
          db: {
            schema: 'public'
          }
        }
      );

      setClient(supabase);

      // Get initial user
      supabase.auth.getUser().then(({ data: { user }, error }) => {
        if (error) {
          console.error('Error fetching user:', error);
          return;
        }
        setUser(user);
      });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null);
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize Supabase client');
    }
  }, []);

  return { client, user, error };
}
