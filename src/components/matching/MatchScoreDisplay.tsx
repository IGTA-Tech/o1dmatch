'use client';

interface MatchScoreDisplayProps {
  score: number;
  category?: 'excellent' | 'good' | 'fair' | 'poor';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onClick?: () => void;
}

export function MatchScoreDisplay({
  score,
  category,
  size = 'md',
  showLabel = true,
  onClick,
}: MatchScoreDisplayProps) {
  const getCategory = (s: number): 'excellent' | 'good' | 'fair' | 'poor' => {
    if (s >= 85) return 'excellent';
    if (s >= 70) return 'good';
    if (s >= 50) return 'fair';
    return 'poor';
  };

  const actualCategory = category || getCategory(score);

  const getColors = () => {
    switch (actualCategory) {
      case 'excellent':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          ring: 'stroke-green-500',
          fill: 'text-green-500',
        };
      case 'good':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          ring: 'stroke-blue-500',
          fill: 'text-blue-500',
        };
      case 'fair':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          ring: 'stroke-yellow-500',
          fill: 'text-yellow-500',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          ring: 'stroke-gray-400',
          fill: 'text-gray-400',
        };
    }
  };

  const colors = getColors();

  const sizeConfig = {
    sm: { width: 48, stroke: 4, textSize: 'text-xs', labelSize: 'text-[10px]' },
    md: { width: 64, stroke: 5, textSize: 'text-sm', labelSize: 'text-xs' },
    lg: { width: 80, stroke: 6, textSize: 'text-lg', labelSize: 'text-sm' },
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const labelText = {
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
    poor: 'Limited',
  };

  return (
    <div
      className={`inline-flex flex-col items-center ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="relative" style={{ width: config.width, height: config.width }}>
        <svg
          className="transform -rotate-90"
          width={config.width}
          height={config.width}
        >
          {/* Background circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.stroke}
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            strokeWidth={config.stroke}
            strokeLinecap="round"
            className={colors.ring}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${config.textSize} ${colors.fill}`}>{score}%</span>
        </div>
      </div>
      {showLabel && (
        <span className={`mt-1 font-medium ${config.labelSize} ${colors.text}`}>
          {labelText[actualCategory]}
        </span>
      )}
    </div>
  );
}

// Simple badge version for inline use
export function MatchBadge({
  score,
  size = 'sm',
}: {
  score: number;
  size?: 'sm' | 'md';
}) {
  const getCategory = (s: number) => {
    if (s >= 85) return 'excellent';
    if (s >= 70) return 'good';
    if (s >= 50) return 'fair';
    return 'poor';
  };

  const category = getCategory(score);

  const colors = {
    excellent: 'bg-green-100 text-green-700 border-green-200',
    good: 'bg-blue-100 text-blue-700 border-blue-200',
    fair: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    poor: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${colors[category]} ${sizeClasses}`}
    >
      {score}% match
    </span>
  );
}
