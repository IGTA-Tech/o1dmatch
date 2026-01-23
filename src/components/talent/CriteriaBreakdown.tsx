'use client';

import { Check, X, Plus, FileText } from 'lucide-react';
import { O1Criterion, O1_CRITERIA } from '@/types/enums';
import { cn } from '@/lib/utils';

interface DocumentCounts {
  total: number;
  verified: number;
  pending: number;
  needsReview: number;
  rejected: number;
}

interface CriteriaBreakdownProps {
  // Document counts per criterion
  documentCounts: Record<string, DocumentCounts>;
  criteriaMet: O1Criterion[];
  showUploadButtons?: boolean;
  onUpload?: (criterion: O1Criterion) => void;
}

export function CriteriaBreakdown({
  documentCounts,
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
          const counts = documentCounts[criterion] || { total: 0, verified: 0, pending: 0, needsReview: 0, rejected: 0 };
          const isMet = criteriaMet.includes(criterion);

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
                  {/* Document Count Display */}
                  <div className="flex items-center gap-1 text-sm">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {counts.total} doc{counts.total !== 1 ? 's' : ''}
                    </span>
                    {counts.verified > 0 && (
                      <span className="text-green-600 ml-1">
                        ({counts.verified} verified)
                      </span>
                    )}
                  </div>
                  
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

              {/* Progress bar showing verified vs total */}
              {counts.total > 0 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={cn(
                        'h-2 rounded-full transition-all',
                        counts.verified > 0 ? 'bg-green-500' : 'bg-gray-400'
                      )}
                      style={{
                        width: counts.total > 0 
                          ? `${Math.min((counts.verified / counts.total) * 100, 100)}%`
                          : '0%'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Status breakdown */}
              {counts.total > 0 && (counts.pending > 0 || counts.needsReview > 0) && (
                <div className="flex gap-3 mt-2 text-xs">
                  {counts.pending > 0 && (
                    <span className="text-gray-500">
                      {counts.pending} pending
                    </span>
                  )}
                  {counts.needsReview > 0 && (
                    <span className="text-yellow-600">
                      {counts.needsReview} needs review
                    </span>
                  )}
                  {counts.rejected > 0 && (
                    <span className="text-red-500">
                      {counts.rejected} rejected
                    </span>
                  )}
                </div>
              )}

              {/* Description */}
              {info.description && (
                <p className="text-xs text-gray-500 mt-2">
                  {info.description}
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