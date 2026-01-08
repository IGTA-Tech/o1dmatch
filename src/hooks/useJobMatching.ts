'use client';

import { useState, useCallback } from 'react';
import { MatchResult } from '@/lib/matching';

interface JobMatch {
  job_id: string;
  title: string;
  company_name: string;
  logo_url?: string;
  salary_min?: number;
  salary_max?: number;
  work_arrangement?: string;
  locations?: string[];
  match_score: number;
  match_category: 'excellent' | 'good' | 'fair' | 'poor';
  match_summary: string;
}

interface TalentMatch {
  talent_id: string;
  candidate_id: string;
  o1_score: number;
  current_job_title?: string;
  city?: string;
  state?: string;
  visa_status?: string;
  criteria_met?: string[];
  match_score: number;
  match_category: 'excellent' | 'good' | 'fair' | 'poor';
  match_summary: string;
  breakdown?: MatchResult['breakdown'];
}

export function useJobMatching() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMatchForJob = useCallback(
    async (talentId: string, jobId: string): Promise<MatchResult | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/job-match?talent_id=${talentId}&job_id=${jobId}&mode=single`
        );

        if (!response.ok) {
          throw new Error('Failed to get match');
        }

        const data = await response.json();
        return data.data.match;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get match');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getBestJobMatches = useCallback(
    async (talentId: string, limit = 10): Promise<JobMatch[]> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/job-match?talent_id=${talentId}&mode=jobs&limit=${limit}`
        );

        if (!response.ok) {
          throw new Error('Failed to get job matches');
        }

        const data = await response.json();
        return data.data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get matches');
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getBestTalentMatches = useCallback(
    async (jobId: string, limit = 20): Promise<TalentMatch[]> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/job-match?job_id=${jobId}&mode=talents&limit=${limit}`
        );

        if (!response.ok) {
          throw new Error('Failed to get talent matches');
        }

        const data = await response.json();
        return data.data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get matches');
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    getMatchForJob,
    getBestJobMatches,
    getBestTalentMatches,
  };
}
