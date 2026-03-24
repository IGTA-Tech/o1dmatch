'use client';

import { useState, useCallback } from 'react';
import { O1Criterion } from '@/types/enums';

export interface UploadProgress {
  status: 'idle' | 'uploading' | 'extracting' | 'classifying' | 'complete' | 'error';
  progress: number;
  message: string;
}

export interface UploadResult {
  success: boolean;
  document_id?: string;
  status?: string;
  criterion?: string;
  criterion_name?: string;
  score_impact?: number;
  extraction?: {
    success: boolean;
    method?: string;
    confidence?: number;
    error?: string;
  };
  classification?: {
    confidence?: string;
    reasoning?: string;
  };
  message?: string;
  error?: string;
}

// Returned by the classify-only call (pre-upload, on file drop)
export interface ClassifyResult {
  criterion:           string;   // top suggestion — backward compat
  confidence:          number;   // top suggestion confidence — 0–100
  reasoning:           string;   // top suggestion reasoning
  criterion_name:      string;   // top suggestion human-readable name
  extraction_keywords: string[];
  // All ranked suggestions (top 3) returned by AI
  suggestions: {
    criterion:      string;
    criterion_name: string;
    confidence:     number;
    reasoning:      string;
  }[];
}

export function useDocumentUpload() {
  const [progress, setProgress] = useState<UploadProgress>({
    status: 'idle',
    progress: 0,
    message: '',
  });
  const [result, setResult] = useState<UploadResult | null>(null);

  const reset = useCallback(() => {
    setProgress({ status: 'idle', progress: 0, message: '' });
    setResult(null);
  }, []);

  // ── NEW: classify-only, called on file drop before the user submits ────────
  const classify = useCallback(async (file: File): Promise<ClassifyResult | null> => {
    try {
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/talent/classify-document', {
        method: 'POST',
        body:   fd,
      });

      if (!res.ok) return null;

      const data = await res.json();
      if (!data.success) return null;

      return {
        criterion:           data.criterion,
        confidence:          data.confidence,
        reasoning:           data.reasoning,
        criterion_name:      data.criterion_name,
        extraction_keywords: data.extraction_keywords || [],
        suggestions:         data.suggestions        || [],
      };
    } catch {
      return null;
    }
  }, []);

  // ── EXISTING: full upload pipeline — unchanged ─────────────────────────────
  const upload = useCallback(
    async (
      file:        File,
      title:       string,
      description?: string,
      criterion?:  O1Criterion,
    ): Promise<UploadResult> => {
      setResult(null);

      try {
        setProgress({ status: 'uploading',   progress: 10, message: 'Uploading document...' });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        if (description) formData.append('description', description);
        if (criterion)   formData.append('criterion',   criterion);

        setProgress({ status: 'uploading',   progress: 30, message: 'Processing upload...' });
        setProgress({ status: 'extracting',  progress: 50, message: 'Extracting text from document...' });
        setProgress({ status: 'classifying', progress: 70, message: 'Classifying document with AI...' });

        const response = await fetch('/api/process-document', {
          method: 'POST',
          body:   formData,
        });

        setProgress({ status: 'classifying', progress: 90, message: 'Finalizing...' });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }

        const uploadResult: UploadResult = { success: true, ...data.data };

        setResult(uploadResult);
        setProgress({
          status:   'complete',
          progress: 100,
          message:  data.data.message || 'Upload complete!',
        });

        return uploadResult;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        const errorResult: UploadResult = { success: false, error: errorMessage };

        setResult(errorResult);
        setProgress({ status: 'error', progress: 0, message: errorMessage });

        return errorResult;
      }
    },
    []
  );

  return {
    classify,   // ← new
    upload,
    progress,
    result,
    reset,
    isUploading: progress.status !== 'idle' && progress.status !== 'complete' && progress.status !== 'error',
    isComplete:  progress.status === 'complete',
    isError:     progress.status === 'error',
  };
}