'use client';

import { useEffect, useState, useCallback } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/models';
import { UserRole } from '@/types/enums';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: Error | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    error: null,
  });

  const supabase = createClient();

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data as Profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }, [supabase]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }: { data: { session: Session | null } }) => {
      let profile = null;
      if (session?.user) {
        profile = await fetchProfile(session.user.id);
      }
      setState({
        user: session?.user ?? null,
        session,
        profile,
        loading: false,
        error: null,
      });
    });
  
    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      let profile = null;
      if (session?.user) {
        profile = await fetchProfile(session.user.id);
      }
      setState({
        user: session?.user ?? null,
        session,
        profile,
        loading: false,
        error: null,
      });
    });
  
    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  const signIn = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setState((prev) => ({ ...prev, loading: false, error }));
      throw error;
    }

    return data;
  };

  const signUp = async (
    email: string,
    password: string,
    role: UserRole,
    fullName: string
  ) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          full_name: fullName,
        },
      },
    });

    if (error) {
      setState((prev) => ({ ...prev, loading: false, error }));
      throw error;
    }

    return data;
  };

  const signOut = async () => {
    setState((prev) => ({ ...prev, loading: true }));
    await supabase.auth.signOut();
    setState({
      user: null,
      session: null,
      profile: null,
      loading: false,
      error: null,
    });
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  };

  const refreshProfile = useCallback(async () => {
    if (state.user) {
      const profile = await fetchProfile(state.user.id);
      setState((prev) => ({ ...prev, profile }));
    }
  }, [state.user, fetchProfile]);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshProfile,
    isAuthenticated: !!state.user,
    isAdmin: state.profile?.role === 'admin',
    isTalent: state.profile?.role === 'talent',
    isEmployer: state.profile?.role === 'employer',
    isAgency: state.profile?.role === 'agency',
    isLawyer: state.profile?.role === 'lawyer',
  };
}
