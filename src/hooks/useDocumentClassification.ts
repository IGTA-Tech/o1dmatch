'use client';

import { useState, useCallback } from 'react';
import { O1Criterion } from '@/types/enums';

interface ClassificationResult {
  criterion: O1Criterion;
  criterion_name: string;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  score_impact: number;
}

interface UseDocumentClassification {
  classifyDocument: (content: string, title?: string, description?: string) => Promise<ClassificationResult | null>;
  loading: boolean;
  error: string | null;
}

export function useDocumentClassification(): UseDocumentClassification {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const classifyDocument = useCallback(async (
    content: string,
    title?: string,
    description?: string
  ): Promise<ClassificationResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/classify-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, title, description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to classify document');
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to classify document';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    classifyDocument,
    loading,
    error,
  };
}
