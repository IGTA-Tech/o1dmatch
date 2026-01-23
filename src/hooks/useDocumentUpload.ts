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

  const upload = useCallback(
    async (
      file: File, 
      title: string, 
      description?: string,
      criterion?: O1Criterion // Added criterion parameter
    ): Promise<UploadResult> => {
      setResult(null);

      try {
        // Start upload phase
        setProgress({
          status: 'uploading',
          progress: 10,
          message: 'Uploading document...',
        });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        if (description) {
          formData.append('description', description);
        }
        if (criterion) {
          formData.append('criterion', criterion); // Add criterion to form data
        }

        setProgress({
          status: 'uploading',
          progress: 30,
          message: 'Processing upload...',
        });

        // Extraction phase
        setProgress({
          status: 'extracting',
          progress: 50,
          message: 'Extracting text from document...',
        });

        // Classification phase
        setProgress({
          status: 'classifying',
          progress: 70,
          message: 'Classifying document with AI...',
        });

        const response = await fetch('/api/process-document', {
          method: 'POST',
          body: formData,
        });

        setProgress({
          status: 'classifying',
          progress: 90,
          message: 'Finalizing...',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }

        const uploadResult: UploadResult = {
          success: true,
          ...data.data,
        };

        setResult(uploadResult);
        setProgress({
          status: 'complete',
          progress: 100,
          message: data.data.message || 'Upload complete!',
        });

        return uploadResult;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        const errorResult: UploadResult = {
          success: false,
          error: errorMessage,
        };

        setResult(errorResult);
        setProgress({
          status: 'error',
          progress: 0,
          message: errorMessage,
        });

        return errorResult;
      }
    },
    []
  );

  return {
    upload,
    progress,
    result,
    reset,
    isUploading: progress.status !== 'idle' && progress.status !== 'complete' && progress.status !== 'error',
    isComplete: progress.status === 'complete',
    isError: progress.status === 'error',
  };
}