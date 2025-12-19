'use client';

import { cn } from '@/lib/utils';
import { getScoreStatus } from '@/types/enums';

interface ScoreDisplayProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showStatus?: boolean;
}

export function ScoreDisplay({
  score,
  size = 'md',
  showLabel = false,
  showStatus = false,
}: ScoreDisplayProps) {
  const { label, color } = getScoreStatus(score);

  const sizes = {
    sm: {
      container: 'w-16 h-16',
      score: 'text-xl',
      ring: 'border-4',
    },
    md: {
      container: 'w-24 h-24',
      score: 'text-2xl',
      ring: 'border-6',
    },
    lg: {
      container: 'w-32 h-32',
      score: 'text-4xl',
      ring: 'border-8',
    },
  };

  const colors = {
    green: {
      ring: 'border-green-500',
      bg: 'bg-green-50',
      text: 'text-green-700',
      badge: 'bg-green-100 text-green-800',
    },
    yellow: {
      ring: 'border-yellow-500',
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      badge: 'bg-yellow-100 text-yellow-800',
    },
    red: {
      ring: 'border-red-500',
      bg: 'bg-red-50',
      text: 'text-red-700',
      badge: 'bg-red-100 text-red-800',
    },
  };

  const colorScheme = colors[color as keyof typeof colors];
  const sizeScheme = sizes[size];

  // Calculate the progress for the circular ring
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className={cn('relative', sizeScheme.container)}>
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={
              color === 'green'
                ? '#22c55e'
                : color === 'yellow'
                ? '#eab308'
                : '#ef4444'
            }
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
          />
        </svg>

        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-bold', sizeScheme.score, colorScheme.text)}>
            {score}%
          </span>
        </div>
      </div>

      {showLabel && (
        <span className="text-sm text-gray-600 mt-2">O-1 Score</span>
      )}

      {showStatus && (
        <span
          className={cn(
            'mt-2 px-3 py-1 rounded-full text-sm font-medium',
            colorScheme.badge
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}

// Compact inline score display
export function ScoreInline({
  score,
  showLabel = true,
}: {
  score: number;
  showLabel?: boolean;
}) {
  const { label, color } = getScoreStatus(score);

  const colors = {
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
  };

  return (
    <div className="flex items-center gap-2">
      <span className={cn('text-2xl font-bold', colors[color as keyof typeof colors])}>
        {score}%
      </span>
      {showLabel && <span className="text-sm text-gray-500">{label}</span>}
    </div>
  );
}
