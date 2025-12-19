'use client';

import { useState, useCallback } from 'react';
import { CommitmentLevel, EngagementType, WorkArrangement } from '@/types/enums';

interface CreateLetterParams {
  talent_id: string;
  source_type: 'direct' | 'job_application';
  job_id?: string;
  application_id?: string;
  commitment_level: CommitmentLevel;
  job_title: string;
  department?: string;
  salary_min?: number;
  salary_max?: number;
  salary_period?: 'year' | 'month' | 'hour';
  salary_negotiable?: boolean;
  engagement_type?: EngagementType;
  start_timing?: string;
  duration_years?: number;
  work_arrangement?: WorkArrangement;
  locations?: string[];
  duties_description: string;
  why_o1_required: string;
}

interface CreateLetterResult {
  letter_id: string;
  status: string;
  talent_candidate_id: string;
}

interface RespondToLetterResult {
  status: string;
  revealed_info?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    linkedin_url?: string;
  };
}

interface UseInterestLetter {
  createLetter: (params: CreateLetterParams) => Promise<CreateLetterResult | null>;
  respondToLetter: (letterId: string, accept: boolean, message?: string) => Promise<RespondToLetterResult | null>;
  loading: boolean;
  error: string | null;
}

export function useInterestLetter(): UseInterestLetter {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createLetter = useCallback(async (params: CreateLetterParams): Promise<CreateLetterResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/interest-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create interest letter');
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create interest letter';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const respondToLetter = useCallback(async (
    letterId: string,
    accept: boolean,
    message?: string
  ): Promise<RespondToLetterResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/interest-letter', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ letter_id: letterId, accept, message }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to respond to letter');
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to respond to letter';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createLetter,
    respondToLetter,
    loading,
    error,
  };
}
