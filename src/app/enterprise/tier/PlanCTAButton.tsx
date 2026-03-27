'use client';
// src/app/enterprise/tier/PlanCTAButton.tsx

import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

interface Props {
  priceId:    string | null;  // null = free / contact tier
  tierKey:    string;
  isFeatured: boolean;
}

export default function PlanCTAButton({ priceId, tierKey, isFeatured }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // Attorney partner = free, no checkout needed
  if (!priceId) {
    return (
      <a
        href="mailto:enterprise@o1dmatch.com"
        className={isFeatured ? 'o1d-price-btn-featured' : 'o1d-price-btn-default'}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', textDecoration: 'none' }}
      >
        Contact Your Account Manager <ArrowRight size={14} />
      </a>
    );
  }

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/enterprise-checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ priceId, tierKey }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? 'Failed to create checkout session');
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={isFeatured ? 'o1d-price-btn-featured' : 'o1d-price-btn-default'}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '0.4rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.75 : 1, border: 'none',
        }}
      >
        {loading
          ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Redirecting…</>
          : <>Activate Plan <ArrowRight size={14} /></>
        }
      </button>
      {error && (
        <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#EF4444', textAlign: 'center' }}>
          {error}
        </p>
      )}
    </div>
  );
}