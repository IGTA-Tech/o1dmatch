/**
 * Demo Authentication System
 *
 * Provides mock authentication for the demo site without requiring Supabase.
 */

import { UserRole } from '@/types/enums';
import type { Profile } from '@/types/models';
import { DEMO_PROFILES } from './mock-data';
import { simulateDelay } from './config';

// Demo user credentials
export const DEMO_USERS = {
  talent: {
    id: 'demo-talent-1',
    email: 'sarah.chen@demo.com',
    password: 'demo123',
    role: UserRole.TALENT,
  },
  employer: {
    id: 'demo-employer-1',
    email: 'john.martinez@techcorp.demo',
    password: 'demo123',
    role: UserRole.EMPLOYER,
  },
  agency: {
    id: 'demo-agency-1',
    email: 'elite@agency.demo',
    password: 'demo123',
    role: UserRole.AGENCY,
  },
  lawyer: {
    id: 'demo-lawyer-1',
    email: 'michael.thompson@lawfirm.demo',
    password: 'demo123',
    role: UserRole.LAWYER,
  },
  admin: {
    id: 'demo-admin-1',
    email: 'admin@o1dmatch.demo',
    password: 'demo123',
    role: UserRole.ADMIN,
  },
};

// Session storage key
const DEMO_SESSION_KEY = 'demo_session';
const DEMO_USER_KEY = 'demo_user';

export interface DemoSession {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
  profile: Profile;
  expiresAt: number;
}

/**
 * Demo Authentication Service
 */
export class DemoAuth {
  /**
   * Sign in with demo credentials
   */
  static async signIn(email: string, password: string): Promise<{ success: boolean; session?: DemoSession; error?: string }> {
    await simulateDelay('auth');

    // Find matching demo user
    const demoUser = Object.values(DEMO_USERS).find(
      user => user.email.toLowerCase() === email.toLowerCase()
    );

    if (!demoUser) {
      // Allow any email with demo123 password for exploration
      if (password === 'demo123') {
        // Create a temporary talent session
        const tempSession = this.createSession(DEMO_USERS.talent.id, DEMO_USERS.talent.email, DEMO_USERS.talent.role);
        this.saveSession(tempSession);
        return { success: true, session: tempSession };
      }
      return { success: false, error: 'Invalid email or password' };
    }

    if (password !== demoUser.password && password !== 'demo123') {
      return { success: false, error: 'Invalid email or password' };
    }

    const session = this.createSession(demoUser.id, demoUser.email, demoUser.role);
    this.saveSession(session);

    return { success: true, session };
  }

  /**
   * Sign up (demo mode - instant success)
   */
  static async signUp(email: string, password: string, role: UserRole): Promise<{ success: boolean; error?: string }> {
    await simulateDelay('auth');

    // In demo mode, signup always succeeds and logs in as a demo user
    const demoUserForRole = Object.values(DEMO_USERS).find(u => u.role === role) || DEMO_USERS.talent;
    const session = this.createSession(demoUserForRole.id, email, role);
    this.saveSession(session);

    return { success: true };
  }

  /**
   * Sign out
   */
  static async signOut(): Promise<void> {
    await simulateDelay('auth');
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DEMO_SESSION_KEY);
      localStorage.removeItem(DEMO_USER_KEY);
    }
  }

  /**
   * Get current session
   */
  static getSession(): DemoSession | null {
    if (typeof window === 'undefined') return null;

    try {
      const sessionData = localStorage.getItem(DEMO_SESSION_KEY);
      if (!sessionData) return null;

      const session: DemoSession = JSON.parse(sessionData);

      // Check if expired
      if (Date.now() > session.expiresAt) {
        this.signOut();
        return null;
      }

      return session;
    } catch {
      return null;
    }
  }

  /**
   * Get current user
   */
  static getUser(): DemoSession['user'] | null {
    const session = this.getSession();
    return session?.user || null;
  }

  /**
   * Get current profile
   */
  static getProfile(): Profile | null {
    const session = this.getSession();
    return session?.profile || null;
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  /**
   * Switch to a different demo user role
   */
  static async switchRole(role: UserRole): Promise<DemoSession> {
    await simulateDelay('auth');

    const demoUser = Object.values(DEMO_USERS).find(u => u.role === role);
    if (!demoUser) {
      throw new Error(`No demo user found for role: ${role}`);
    }

    const session = this.createSession(demoUser.id, demoUser.email, demoUser.role);
    this.saveSession(session);

    return session;
  }

  /**
   * Get all available demo roles for switching
   */
  static getAvailableRoles(): { role: UserRole; email: string; name: string }[] {
    return [
      { role: UserRole.TALENT, email: DEMO_USERS.talent.email, name: 'Talent (Sarah Chen)' },
      { role: UserRole.EMPLOYER, email: DEMO_USERS.employer.email, name: 'Employer (TechCorp AI)' },
      { role: UserRole.AGENCY, email: DEMO_USERS.agency.email, name: 'Agency (Elite Talent)' },
      { role: UserRole.LAWYER, email: DEMO_USERS.lawyer.email, name: 'Lawyer (Michael Thompson)' },
      { role: UserRole.ADMIN, email: DEMO_USERS.admin.email, name: 'Admin' },
    ];
  }

  /**
   * Reset password (demo mode - always succeeds)
   */
  static async resetPassword(email: string): Promise<{ success: boolean }> {
    await simulateDelay('auth');
    return { success: true };
  }

  /**
   * Update password (demo mode - always succeeds)
   */
  static async updatePassword(newPassword: string): Promise<{ success: boolean }> {
    await simulateDelay('auth');
    return { success: true };
  }

  // Private helpers

  private static createSession(userId: string, email: string, role: UserRole): DemoSession {
    const profile = DEMO_PROFILES.find(p => p.id === userId) || {
      id: userId,
      email: email,
      full_name: 'Demo User',
      role: role,
      avatar_url: null,
      is_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return {
      user: {
        id: userId,
        email: email,
        role: role,
      },
      profile: profile,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };
  }

  private static saveSession(session: DemoSession): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(session.user));
    }
  }
}

/**
 * React hook-compatible auth state getter
 */
export function getDemoAuthState() {
  return {
    user: DemoAuth.getUser(),
    profile: DemoAuth.getProfile(),
    session: DemoAuth.getSession(),
    isAuthenticated: DemoAuth.isAuthenticated(),
    isLoading: false,
  };
}
