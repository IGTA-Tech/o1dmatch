'use client';

import { useEffect, useState, useCallback } from 'react';
import { DEMO_MODE } from '@/lib/demo/config';
import { DemoAuth, getDemoAuthState, type DemoSession } from '@/lib/demo/demo-auth';
import type { Profile } from '@/types/models';
import { UserRole } from '@/types/enums';

interface DemoAuthState {
  user: DemoSession['user'] | null;
  session: DemoSession | null;
  profile: Profile | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Demo-aware authentication hook
 * Uses mock auth in demo mode, otherwise falls back to real Supabase auth
 */
export function useDemoAuth() {
  const [state, setState] = useState<DemoAuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    error: null,
  });

  // Initialize auth state
  useEffect(() => {
    if (!DEMO_MODE) {
      // Not in demo mode - mark as loaded (real auth handled elsewhere)
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    // Demo mode - check for existing session
    const authState = getDemoAuthState();
    setState({
      user: authState.user,
      session: authState.session,
      profile: authState.profile,
      loading: false,
      error: null,
    });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!DEMO_MODE) {
      throw new Error('Demo auth not available outside demo mode');
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    const result = await DemoAuth.signIn(email, password);

    if (!result.success) {
      const error = new Error(result.error || 'Sign in failed');
      setState(prev => ({ ...prev, loading: false, error }));
      throw error;
    }

    setState({
      user: result.session!.user,
      session: result.session!,
      profile: result.session!.profile,
      loading: false,
      error: null,
    });

    return result.session;
  }, []);

  const signUp = useCallback(async (
    email: string,
    password: string,
    role: UserRole,
    fullName: string
  ) => {
    if (!DEMO_MODE) {
      throw new Error('Demo auth not available outside demo mode');
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    const result = await DemoAuth.signUp(email, password, role);

    if (!result.success) {
      const error = new Error(result.error || 'Sign up failed');
      setState(prev => ({ ...prev, loading: false, error }));
      throw error;
    }

    // Get the new session
    const authState = getDemoAuthState();
    setState({
      user: authState.user,
      session: authState.session,
      profile: authState.profile,
      loading: false,
      error: null,
    });

    return authState.session;
  }, []);

  const signOut = useCallback(async () => {
    if (!DEMO_MODE) {
      throw new Error('Demo auth not available outside demo mode');
    }

    setState(prev => ({ ...prev, loading: true }));
    await DemoAuth.signOut();
    setState({
      user: null,
      session: null,
      profile: null,
      loading: false,
      error: null,
    });
  }, []);

  const switchRole = useCallback(async (role: UserRole) => {
    if (!DEMO_MODE) {
      throw new Error('Demo auth not available outside demo mode');
    }

    setState(prev => ({ ...prev, loading: true }));
    const session = await DemoAuth.switchRole(role);
    setState({
      user: session.user,
      session: session,
      profile: session.profile,
      loading: false,
      error: null,
    });
    return session;
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!DEMO_MODE) {
      throw new Error('Demo auth not available outside demo mode');
    }
    await DemoAuth.resetPassword(email);
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    if (!DEMO_MODE) {
      throw new Error('Demo auth not available outside demo mode');
    }
    await DemoAuth.updatePassword(newPassword);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!DEMO_MODE) return;

    const authState = getDemoAuthState();
    setState(prev => ({ ...prev, profile: authState.profile }));
  }, []);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    switchRole,
    resetPassword,
    updatePassword,
    refreshProfile,
    isAuthenticated: !!state.user,
    isAdmin: state.profile?.role === UserRole.ADMIN,
    isTalent: state.profile?.role === UserRole.TALENT,
    isEmployer: state.profile?.role === UserRole.EMPLOYER,
    isAgency: state.profile?.role === UserRole.AGENCY,
    isLawyer: state.profile?.role === UserRole.LAWYER,
    isDemoMode: DEMO_MODE,
    availableRoles: DemoAuth.getAvailableRoles(),
  };
}
