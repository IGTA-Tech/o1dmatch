'use client';

interface ConfidenceIndicatorProps {
  confidence: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ConfidenceIndicator({
  confidence,
  label,
  showPercentage = true,
  size = 'sm',
}: ConfidenceIndicatorProps) {
  const getColorClasses = (conf: number) => {
    if (conf >= 85) return { bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500' };
    if (conf >= 60) return { bg: 'bg-yellow-100', text: 'text-yellow-700', bar: 'bg-yellow-500' };
    return { bg: 'bg-red-100', text: 'text-red-700', bar: 'bg-red-500' };
  };

  const getLabel = (conf: number) => {
    if (conf >= 85) return 'High';
    if (conf >= 60) return 'Medium';
    return 'Low';
  };

  const colors = getColorClasses(confidence);
  const confidenceLabel = label || getLabel(confidence);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-full ${colors.bg} ${sizeClasses[size]}`}>
      <div className="relative h-1.5 w-12 overflow-hidden rounded-full bg-gray-200">
        <div
          className={`absolute left-0 top-0 h-full rounded-full ${colors.bar} transition-all`}
          style={{ width: `${Math.min(confidence, 100)}%` }}
        />
      </div>
      <span className={`font-medium ${colors.text}`}>
        {confidenceLabel}
        {showPercentage && ` (${Math.round(confidence)}%)`}
      </span>
    </div>
  );
}

// Simple badge version for inline use
export function ConfidenceBadge({
  confidence,
  size = 'sm',
}: {
  confidence: 'high' | 'medium' | 'low' | number;
  size?: 'sm' | 'md';
}) {
  const getConfidenceValue = () => {
    if (typeof confidence === 'number') return confidence;
    switch (confidence) {
      case 'high':
        return 90;
      case 'medium':
        return 70;
      case 'low':
        return 40;
      default:
        return 50;
    }
  };

  const value = getConfidenceValue();
  const label = typeof confidence === 'string' ? confidence : undefined;

  return (
    <ConfidenceIndicator
      confidence={value}
      label={label}
      showPercentage={typeof confidence === 'number'}
      size={size}
    />
  );
}
