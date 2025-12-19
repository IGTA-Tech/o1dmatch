'use client';

import { useState, useCallback } from 'react';
import { O1Criterion } from '@/types/enums';
import { EvidenceSummary } from '@/types/models';

interface ScoreResult {
  o1_score: number;
  visa_status: string;
  criteria_met: O1Criterion[];
  evidence_summary: EvidenceSummary;
  criteria_scores: Record<O1Criterion, number>;
}

interface UseScoring {
  calculateScore: (talentId: string) => Promise<ScoreResult | null>;
  loading: boolean;
  error: string | null;
}

export function useScoring(): UseScoring {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateScore = useCallback(async (talentId: string): Promise<ScoreResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/calculate-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ talent_id: talentId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to calculate score');
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to calculate score';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    calculateScore,
    loading,
    error,
  };
}
