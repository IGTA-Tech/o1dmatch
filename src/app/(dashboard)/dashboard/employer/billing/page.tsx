'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, Badge } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import {
  CreditCard,
  Check,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { EMPLOYER_TIERS, EmployerTier } from '@/lib/subscriptions/tiers';

interface Subscription {
  tier: EmployerTier;
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  letters_sent_this_month: number;
}

export default function EmployerBillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  async function loadSubscription() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('employer_subscriptions')
      .select('*')
      .eq('employer_id', user.id)
      .single();

    if (data) {
      setSubscription(data as Subscription);
    } else {
      // Create default free subscription
      setSubscription({
        tier: 'free',
        status: 'active',
        stripe_customer_id: null,
        stripe_subscription_id: null,
        current_period_end: null,
        letters_sent_this_month: 0,
      });
    }

    setLoading(false);
  }

  async function handleUpgrade(tier: EmployerTier) {
    if (tier === 'free') return;

    setUpgrading(tier);
    setError(null);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType: 'employer',
          tier,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to start checkout');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setUpgrading(null);
    }
  }

  async function handleManageBilling() {
    try {
      const response = await fetch('/api/stripe/billing-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userType: 'employer' }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to open billing portal');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const currentTier = subscription?.tier || 'free';
  const currentTierConfig = EMPLOYER_TIERS[currentTier];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-gray-600">Manage your subscription and billing settings</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Current Plan */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Plan</p>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">{currentTierConfig.name}</h2>
                <Badge variant={subscription?.status === 'active' ? 'success' : 'warning'}>
                  {subscription?.status || 'active'}
                </Badge>
              </div>
              <p className="text-gray-600 mt-1">
                ${currentTierConfig.price}/month
                {currentTierConfig.setupFee > 0 && ` + $${currentTierConfig.setupFee} setup`}
              </p>
            </div>

            {subscription?.stripe_subscription_id && (
              <button
                onClick={handleManageBilling}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
              >
                <CreditCard className="w-4 h-4" />
                Manage Billing
              </button>
            )}
          </div>

          {/* Usage */}
          <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Active Job Posts</p>
              <p className="text-2xl font-bold text-gray-900">
                0 / {currentTierConfig.limits.activeJobs === Infinity ? '∞' : currentTierConfig.limits.activeJobs}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Letters This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {subscription?.letters_sent_this_month || 0} / {currentTierConfig.limits.lettersPerMonth === Infinity ? '∞' : currentTierConfig.limits.lettersPerMonth}
              </p>
            </div>
          </div>

          {subscription?.current_period_end && (
            <p className="text-sm text-gray-500 mt-4">
              Next billing date: {new Date(subscription.current_period_end).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Plans</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {(Object.entries(EMPLOYER_TIERS) as [EmployerTier, typeof EMPLOYER_TIERS[EmployerTier]][]).map(
            ([key, tier]) => {
              const isCurrentPlan = key === currentTier;
              const isUpgrade = Object.keys(EMPLOYER_TIERS).indexOf(key) > Object.keys(EMPLOYER_TIERS).indexOf(currentTier);

              return (
                <Card
                  key={key}
                  className={`relative ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''} ${key === 'growth' ? 'ring-2 ring-blue-600' : ''}`}
                >
                  {key === 'growth' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Popular
                      </span>
                    </div>
                  )}

                  <CardContent className="pt-6">
                    <h3 className="font-bold text-gray-900">{tier.name}</h3>
                    <div className="mt-2">
                      <span className="text-2xl font-bold">${tier.price}</span>
                      <span className="text-gray-500">/mo</span>
                    </div>
                    {tier.setupFee > 0 && (
                      <p className="text-sm text-gray-500">+ ${tier.setupFee} setup</p>
                    )}

                    <div className="mt-4 space-y-2 text-sm">
                      <p className="font-medium text-gray-900">
                        {tier.limits.activeJobs === Infinity ? 'Unlimited' : tier.limits.activeJobs} jobs
                      </p>
                      <p className="font-medium text-gray-900">
                        {tier.limits.lettersPerMonth === Infinity ? 'Unlimited' : tier.limits.lettersPerMonth} letters/mo
                      </p>
                    </div>

                    <ul className="mt-4 space-y-2">
                      {tier.features.slice(0, 3).map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                          <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4">
                      {isCurrentPlan ? (
                        <button
                          disabled
                          className="w-full py-2 px-4 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium"
                        >
                          Current Plan
                        </button>
                      ) : key === 'free' ? (
                        <button
                          disabled
                          className="w-full py-2 px-4 border border-gray-300 text-gray-500 rounded-lg text-sm font-medium"
                        >
                          Free Tier
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpgrade(key)}
                          disabled={upgrading !== null}
                          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {upgrading === key ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              {isUpgrade ? 'Upgrade' : 'Switch'}
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
