import { useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const savedUser = localStorage.getItem('hsc_demo_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          // ignore
        }
      }
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      const demoUser = { id: 'demo-user-' + email, email } as User;
      localStorage.setItem('hsc_demo_user', JSON.stringify(demoUser));
      setUser(demoUser);
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      const demoUser = { id: 'demo-user-' + email, email } as User;
      localStorage.setItem('hsc_demo_user', JSON.stringify(demoUser));
      setUser(demoUser);
      return { error: null };
    }
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error ? error.message : null };
  }, []);

  const signInAsDemo = useCallback(() => {
    const demoUser = { id: 'demo-user-guest', email: 'guest@hsc.tracker' } as User;
    localStorage.setItem('hsc_demo_user', JSON.stringify(demoUser));
    setUser(demoUser);
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem('hsc_demo_user');
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
  }, []);

  return { user, loading, signInWithEmail, signUpWithEmail, signOut, signInAsDemo, isSupabaseConfigured };
}
