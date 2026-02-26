'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '@/types';

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && key && url.startsWith('http') && key.length > 20);
}

interface AuthState {
  user: User | null;
  role: UserRole | null;
  employeeId: string | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    employeeId: null,
    loading: true,
  });

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Demo mode
      setState({
        user: { id: 'demo', email: 'admin@demo.com' } as User,
        role: 'admin',
        employeeId: 'e022',
        loading: false,
      });
      return;
    }

    const supabase = createClient();

    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, employee_id')
          .eq('id', user.id)
          .single();

        setState({
          user,
          role: profile?.role as UserRole ?? 'employee',
          employeeId: profile?.employee_id ?? null,
          loading: false,
        });
      } else {
        setState({ user: null, role: null, employeeId: null, loading: false });
      }
    }

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, employee_id')
            .eq('id', session.user.id)
            .single();

          setState({
            user: session.user,
            role: profile?.role as UserRole ?? 'employee',
            employeeId: profile?.employee_id ?? null,
            loading: false,
          });
        } else {
          setState({ user: null, role: null, employeeId: null, loading: false });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    await supabase.auth.signOut();
  };

  return { ...state, signOut };
}
