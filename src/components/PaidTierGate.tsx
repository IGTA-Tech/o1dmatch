'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';

interface PaidTierGateProps {
  children: ReactNode;
  /** Title shown in the upgrade prompt */
  featureName?: string;
  /** Description shown below the title */
  featureDescription?: string;
}

export default function PaidTierGate({
  children,
  featureName = 'This Feature',
  featureDescription = 'Upgrade your plan to access this tool and unlock the full power of O1DMatch.',
}: PaidTierGateProps) {
  const [tier, setTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTier = async () => {
      try {
        const response = await fetch('/api/talent/tier');
        if (response.ok) {
          const data = await response.json();
          setTier(data.tier || 'profile_only');
        } else {
          setTier('profile_only');
        }
      } catch {
        setTier('profile_only');
      } finally {
        setLoading(false);
      }
    };

    fetchTier();
  }, []);

  // Still loading — show nothing (avoids flash)
  if (loading) {
    return (
      <div className="animate-pulse space-y-4 p-6">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  // Paid user — render page content normally
  if (tier && tier !== 'profile_only') {
    return <>{children}</>;
  }

  // Free user — show blurred content + upgrade overlay
  return (
    <div className="relative min-h-[70vh]">
      {/* Blurred page content skeleton */}
      <div className="pointer-events-none select-none" aria-hidden="true">
        <div className="filter blur-[6px] opacity-60">
          {children}
        </div>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-start justify-center pt-24 z-10">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 max-w-md w-full mx-4 text-center">
          {/* Lock icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, #D4A84B, #E8C97A)' }}
          >
            <Lock className="w-8 h-8 text-[#0B1D35]" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-[#0B1D35] mb-2">
            {featureName} Requires a Paid Plan
          </h2>

          {/* Description */}
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            {featureDescription}
          </p>

          {/* What you get */}
          <div className="bg-[#FAFAF7] rounded-xl p-4 mb-6 text-left">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Included in paid plans
            </p>
            <div className="space-y-2.5">
              {[
                'O-1 Visa Scoring & Analysis',
                'AI Visa Evaluations',
                'Social Media Scanner (USCIS Risk Check)',
                'Priority visibility for employers',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#D4A84B] flex-shrink-0" />
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/dashboard/talent/billing"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{
              background: '#D4A84B',
              color: '#0B1D35',
            }}
          >
            View Plans & Upgrade
            <ArrowRight className="w-4 h-4" />
          </Link>

          <p className="text-xs text-gray-400 mt-3">
            Plans start at $100/month. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}