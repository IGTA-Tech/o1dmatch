'use client';

import { useState } from 'react';
import { X, Info, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface DemoBannerProps {
  dismissible?: boolean;
}

export function DemoBanner({ dismissible = true }: DemoBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">
            <span className="font-bold">Demo Mode:</span> This is a demonstration site with simulated data.
            No real transactions, emails, or API calls are made.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/IGTA-Tech/o1dmatch"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm font-medium hover:underline whitespace-nowrap"
          >
            View Source
            <ExternalLink className="w-4 h-4" />
          </Link>
          {dismissible && (
            <button
              onClick={() => setDismissed(true)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
