'use client';

import { Check, X, Plus } from 'lucide-react';
import { O1Criterion, O1_CRITERIA } from '@/types/enums';
import { EvidenceSummary } from '@/types/models';
import { Progress } from '@/components/ui';
import { cn } from '@/lib/utils';

interface CriteriaBreakdownProps {
  breakdown: EvidenceSummary;
  criteriaMet: O1Criterion[];
  showUploadButtons?: boolean;
  onUpload?: (criterion: O1Criterion) => void;
}

export function CriteriaBreakdown({
  breakdown,
  criteriaMet,
  showUploadButtons = false,
  onUpload,
}: CriteriaBreakdownProps) {
  const criteria = Object.keys(O1_CRITERIA) as O1Criterion[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">O-1 Criteria</h3>
        <span className="text-sm text-gray-500">
          {criteriaMet.length} of 8 met (need 3)
        </span>
      </div>

      <div className="space-y-3">
        {criteria.map((criterion) => {
          const info = O1_CRITERIA[criterion];
          const evidence = breakdown[criterion];
          const isMet = criteriaMet.includes(criterion);
          const score = evidence?.score || 0;
          const maxScore = info.maxScore;

          return (
            <div
              key={criterion}
              className={cn(
                'p-4 rounded-lg border',
                isMet ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isMet ? (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                      <X className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <span className="font-medium text-gray-900">{info.name}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {score}/{maxScore}
                  </span>
                  {showUploadButtons && onUpload && (
                    <button
                      onClick={() => onUpload(criterion)}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </button>
                  )}
                </div>
              </div>

              <Progress
                value={score}
                max={maxScore}
                size="sm"
                colorByScore
              />

              {evidence?.evidence_count !== undefined && evidence.evidence_count > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {evidence.evidence_count} document{evidence.evidence_count !== 1 ? 's' : ''} uploaded
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Compact version for cards
export function CriteriaBadges({
  criteriaMet,
  maxShow = 4,
}: {
  criteriaMet: O1Criterion[];
  maxShow?: number;
}) {
  const shown = criteriaMet.slice(0, maxShow);
  const remaining = criteriaMet.length - maxShow;

  return (
    <div className="flex flex-wrap gap-1">
      {shown.map((criterion) => (
        <span
          key={criterion}
          className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full"
        >
          {O1_CRITERIA[criterion].name}
        </span>
      ))}
      {remaining > 0 && (
        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
          +{remaining} more
        </span>
      )}
    </div>
  );
}
