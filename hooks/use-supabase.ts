import { useEffect, useState } from 'react';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

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

    try {
      const supabase = createClient();
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
      
    } catch (e) {
      setError('Failed to initialize Supabase client');
      setIsLoading(false);
      return;
    }


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
