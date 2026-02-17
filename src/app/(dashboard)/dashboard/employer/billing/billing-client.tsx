'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, Badge } from '@/components/ui';
import {
  CreditCard,
  Check,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sparkles,
  CheckCircle,
  XCircle,
  X,
  Calendar,
  RefreshCw,
  Receipt,
  Clock,
  DollarSign,
  Ticket,
  Percent,
} from 'lucide-react';
import { EMPLOYER_TIERS, EmployerTier } from '@/lib/subscriptions/tiers';

interface Subscription {
  tier: EmployerTier;
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id?: string | null;
  current_period_start?: string | null;
  current_period_end: string | null;
  trial_ends_at?: string | null;
  setup_fee_paid?: boolean | null;
  letters_sent_this_month: number;
  created_at?: string | null;
  updated_at?: string | null;
}

interface BillingClientProps {
  subscription: Subscription | null;
  userId: string;
  showSuccess: boolean;
  showCanceled: boolean;
}

const DEFAULT_SUBSCRIPTION: Subscription = {
  tier: 'free',
  status: 'active',
  stripe_customer_id: null,
  stripe_subscription_id: null,
  current_period_end: null,
  letters_sent_this_month: 0,
};

export function BillingClient({ subscription: initialSubscription, userId, showSuccess, showCanceled }: BillingClientProps) {
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription>(initialSubscription || DEFAULT_SUBSCRIPTION);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'canceled'; message: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<{
    valid: boolean;
    message: string;
    promo?: { type: string; trialDays?: number; discountPercent?: number; grantsIGTAMember?: boolean };
  } | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);

  // Handle success/canceled and sync subscription
  useEffect(() => {
    console.log('BillingClient mounted - showSuccess:', showSuccess, 'showCanceled:', showCanceled, 'userId:', userId);

    if (showCanceled) {
      setStatusMessage({
        type: 'canceled',
        message: 'Payment was canceled. You can try again when you\'re ready.',
      });
    } else if (showSuccess) {
      // Start syncing
      setIsSyncing(true);
      setStatusMessage({
        type: 'success',
        message: 'Payment successful! Syncing your subscription...',
      });

      // Call sync function
      syncSubscription();
    }
  }, []); // Only run once on mount

  async function syncSubscription() {
    console.log('Starting syncSubscription for userId:', userId);
    
    try {
      const response = await fetch('/api/stripe/sync-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          userType: 'employer',
        }),
      });

      console.log('Sync response status:', response.status);
      
      const data = await response.json();
      console.log('Sync response data:', data);
      
      if (data.success) {
        console.log('Sync successful! Subscription:', data.subscription);
        setSubscription(data.subscription);
        setStatusMessage({
          type: 'success',
          message: 'Payment successful! Your subscription is now active.',
        });
        // Clean up URL after successful sync
        window.history.replaceState({}, '', '/dashboard/employer/billing');
      } else {
        console.error('Sync failed:', data.error, data.details);
        setError(`Sync failed: ${data.error}. ${data.details || ''}`);
        setStatusMessage({
          type: 'success',
          message: 'Payment received but sync failed. Click Refresh to try again.',
        });
      }
    } catch (err) {
      console.error('Sync error:', err);
      setError(`Sync error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setStatusMessage({
        type: 'success',
        message: 'Payment received but sync failed. Click Refresh to try again.',
      });
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    setError(null);
    
    // Try to sync again
    await syncSubscription();
    
    // Also refresh the page data
    router.refresh();
    setIsRefreshing(false);
  }

  async function validatePromo() {
    if (!promoCode.trim()) return;
    setValidatingPromo(true);
    try {
      const response = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, userType: 'employer' }),
      });
      const data = await response.json();
      if (data.valid) {
        let message = 'Code applied! ';
        if (data.promo.trialDays) message += `${data.promo.trialDays}-day free trial included.`;
        if (data.promo.discountPercent) message += `${data.promo.discountPercent}% discount applied.`;
        if (data.promo.grantsIGTAMember) message = 'IGTA member code verified!';
        setPromoStatus({ valid: true, message, promo: data.promo });
      } else {
        setPromoStatus({ valid: false, message: data.error || 'Invalid code' });
      }
    } catch {
      setPromoStatus({ valid: false, message: 'Failed to validate code' });
    } finally {
      setValidatingPromo(false);
    }
  }

  function clearPromo() {
    setPromoCode('');
    setPromoStatus(null);
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
          promoCode: promoStatus?.valid ? promoCode : undefined,
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

  const currentTier = subscription.tier || 'free';
  const currentTierConfig = EMPLOYER_TIERS[currentTier];
  const hasActiveSubscription = subscription.stripe_subscription_id && 
    (subscription.status === 'active' || subscription.status === 'trialing');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-600">Manage your subscription and billing settings</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || isSyncing}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing || isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Refresh'}
        </button>
      </div>

      {/* Status Message Banner */}
      {statusMessage && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl border ${
            statusMessage.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          <div className="flex items-center gap-3">
            {statusMessage.type === 'success' ? (
              isSyncing ? (
                <Loader2 className="w-5 h-5 text-green-600 flex-shrink-0 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              )
            ) : (
              <XCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            )}
            <span className="font-medium">{statusMessage.message}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className={`p-1 rounded-lg transition-colors ${
              statusMessage.type === 'success'
                ? 'hover:bg-green-100'
                : 'hover:bg-amber-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Current Plan Card */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Plan</p>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">{currentTierConfig.name}</h2>
                <Badge variant={subscription.status === 'active' || subscription.status === 'trialing' ? 'success' : 'warning'}>
                  {subscription.status || 'active'}
                </Badge>
              </div>
              <p className="text-gray-600 mt-1">
                ${currentTierConfig.price}/month
                {currentTierConfig.setupFee > 0 && ` + $${currentTierConfig.setupFee} setup`}
              </p>
            </div>

            {subscription.stripe_subscription_id && (
              <button
                onClick={handleManageBilling}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
              >
                <CreditCard className="w-4 h-4" />
                Manage Billing
              </button>
            )}
          </div>

          {/* Usage Stats */}
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
                {subscription.letters_sent_this_month || 0} / {currentTierConfig.limits.lettersPerMonth === Infinity ? '∞' : currentTierConfig.limits.lettersPerMonth}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Details Card */}
      {hasActiveSubscription && (
        <Card>
          <CardContent>
            <div className="flex items-center gap-2 mb-6">
              <Receipt className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Subscription Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Billing Period */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Current Billing Period</span>
                </div>
                <p className="font-medium text-gray-900">
                  {subscription.current_period_start 
                    ? new Date(subscription.current_period_start).toLocaleDateString()
                    : 'N/A'
                  }
                  {' - '}
                  {subscription.current_period_end 
                    ? new Date(subscription.current_period_end).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>

              {/* Next Billing Date */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Next Billing Date</span>
                </div>
                <p className="font-medium text-gray-900">
                  {subscription.current_period_end 
                    ? new Date(subscription.current_period_end).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>

              {/* Monthly Amount */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <DollarSign className="w-4 h-4" />
                  <span>Monthly Amount</span>
                </div>
                <p className="font-medium text-gray-900">
                  ${currentTierConfig.price}/month
                </p>
              </div>
            </div>

            {/* Technical Details */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <details className="group">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  View technical details
                </summary>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Subscription ID</p>
                    <p className="font-mono text-xs text-gray-700 break-all">{subscription.stripe_subscription_id}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Customer ID</p>
                    <p className="font-mono text-xs text-gray-700 break-all">{subscription.stripe_customer_id}</p>
                  </div>
                </div>
              </details>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Promo Code Section */}
      <Card>
        <CardContent>
          {!showPromoInput && !promoStatus?.valid ? (
            <button
              onClick={() => setShowPromoInput(true)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <Ticket className="w-4 h-4" />
              Have a promo code?
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Ticket className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-700">Promo Code</h3>
              </div>

              {promoStatus?.valid ? (
                /* Valid promo applied */
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        <span className="font-mono bg-green-100 px-1.5 py-0.5 rounded text-xs tracking-wider mr-2">
                          {promoCode.toUpperCase()}
                        </span>
                        {promoStatus.message}
                      </p>
                      {promoStatus.promo?.discountPercent && (
                        <p className="text-xs text-green-600 mt-0.5 flex items-center gap-1">
                          <Percent className="w-3 h-3" />
                          {promoStatus.promo.discountPercent}% off will be applied at checkout
                        </p>
                      )}
                      {promoStatus.promo?.trialDays && (
                        <p className="text-xs text-green-600 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {promoStatus.promo.trialDays}-day free trial will be applied at checkout
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={clearPromo}
                    className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                    title="Remove promo code"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Promo input */
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value.toUpperCase());
                        if (promoStatus) setPromoStatus(null);
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && validatePromo()}
                      placeholder="Enter promo code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono uppercase tracking-wider focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={validatePromo}
                      disabled={!promoCode.trim() || validatingPromo}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    >
                      {validatingPromo ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Apply'
                      )}
                    </button>
                    <button
                      onClick={() => { setShowPromoInput(false); clearPromo(); }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {promoStatus && !promoStatus.valid && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                      <XCircle className="w-4 h-4 flex-shrink-0" />
                      {promoStatus.message}
                    </div>
                  )}
                </div>
              )}
            </div>
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
                  className={`relative ${isCurrentPlan ? 'ring-2 ring-green-500' : ''} ${key === 'growth' && !isCurrentPlan ? 'ring-2 ring-blue-600' : ''}`}
                >
                  {isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Current
                      </span>
                    </div>
                  )}
                  {key === 'growth' && !isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Popular
                      </span>
                    </div>
                  )}

                  <CardContent className="pt-6">
                    <h3 className="font-bold text-gray-900">{tier.name}</h3>
                    <div className="mt-2">
                      {promoStatus?.valid && promoStatus.promo?.discountPercent && tier.price > 0 ? (
                        <>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-green-600">
                              ${Math.round(tier.price * (1 - promoStatus.promo.discountPercent / 100))}
                            </span>
                            <span className="text-gray-500">/mo</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm text-gray-400 line-through">${tier.price}/mo</span>
                            <span className="text-xs font-medium bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                              {promoStatus.promo.discountPercent}% OFF
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl font-bold">${tier.price}</span>
                          <span className="text-gray-500">/mo</span>
                        </>
                      )}
                    </div>
                    {promoStatus?.valid && promoStatus.promo?.trialDays && tier.price > 0 && (
                      <p className="text-xs font-medium text-blue-600 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {promoStatus.promo.trialDays}-day free trial
                      </p>
                    )}
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
                          className="w-full py-2 px-4 bg-green-100 text-green-700 rounded-lg text-sm font-medium border border-green-300"
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