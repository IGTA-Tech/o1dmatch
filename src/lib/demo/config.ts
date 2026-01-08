/**
 * Demo Mode Configuration
 *
 * This file controls demo mode behavior for the Netlify demo site.
 * When NEXT_PUBLIC_DEMO_MODE is true, the app uses mock data instead of real APIs.
 */

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export const DEMO_CONFIG = {
  // Feature flags
  features: {
    mockAuth: true,
    mockDatabase: true,
    mockStripe: true,
    mockEmail: true,
    mockSignWell: true,
    mockAI: true,
    mockStorage: true,
  },

  // Demo user credentials
  demoUsers: {
    talent: {
      email: 'demo.talent@o1dmatch.com',
      password: 'demo123',
      name: 'Sarah Chen',
    },
    employer: {
      email: 'demo.employer@o1dmatch.com',
      password: 'demo123',
      name: 'John Martinez',
    },
    agency: {
      email: 'demo.agency@o1dmatch.com',
      password: 'demo123',
      name: 'Elite Talent Agency',
    },
    lawyer: {
      email: 'demo.lawyer@o1dmatch.com',
      password: 'demo123',
      name: 'Michael Thompson',
    },
    admin: {
      email: 'demo.admin@o1dmatch.com',
      password: 'demo123',
      name: 'Admin User',
    },
  },

  // Simulated delays (ms) to make demo feel realistic
  delays: {
    auth: 500,
    api: 300,
    upload: 1500,
    classification: 2000,
    pdfGeneration: 1000,
    emailSend: 800,
    signatureRequest: 1200,
  },

  // Demo notification messages
  notifications: {
    demoMode: 'This is a demo site with simulated data. No real transactions occur.',
    loginHint: 'Use any demo account to explore different user experiences.',
    featureSimulated: 'This feature is simulated in demo mode.',
  },
};

// Helper to check if we're in demo mode
export function isDemoMode(): boolean {
  return DEMO_MODE;
}

// Helper to get demo delay
export function getDemoDelay(action: keyof typeof DEMO_CONFIG.delays): number {
  return DEMO_CONFIG.delays[action];
}

// Helper to simulate async delay
export async function simulateDelay(action: keyof typeof DEMO_CONFIG.delays): Promise<void> {
  if (DEMO_MODE) {
    await new Promise(resolve => setTimeout(resolve, DEMO_CONFIG.delays[action]));
  }
}
