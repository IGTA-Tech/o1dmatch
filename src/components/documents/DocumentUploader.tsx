'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload, FileText, X, Check, AlertCircle, Loader2,
  Sparkles, Brain, FileSearch, CheckCircle2, ChevronDown,
} from 'lucide-react';
import { useDocumentUpload, ClassifyResult } from '@/hooks/useDocumentUpload';
import type { UploadResult } from '@/hooks/useDocumentUpload';
import { UploadProgress } from './UploadProgress';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { O1Criterion, O1_CRITERIA } from '@/types/enums';

interface DocumentUploaderProps {
  onUploadComplete?: (result: UploadResult) => void;
  onCancel?:         () => void;
  preselectedCriterion?: O1Criterion | null;
}

// ── AI Classification Panel ────────────────────────────────────────────────
type AiStep = 'idle' | 'reading' | 'parsing' | 'matching' | 'scoring' | 'done' | 'error';

const AI_STEPS: { key: AiStep; label: string; icon: typeof FileSearch }[] = [
  { key: 'reading',  label: 'Extracting text via OCR',                  icon: FileSearch  },
  { key: 'parsing',  label: 'Parsing document structure & keywords',     icon: FileText    },
  { key: 'matching', label: 'Matching against 8 O-1 USCIS criteria',     icon: Brain       },
  { key: 'scoring',  label: 'Computing classification confidence score', icon: Sparkles    },
];

function AIClassificationPanel({
  step,
  result,
}: {
  step:    AiStep;
  result:  ClassifyResult | null;
}) {
  const stepOrder: AiStep[] = ['reading', 'parsing', 'matching', 'scoring', 'done'];
  const currentIdx = stepOrder.indexOf(step);

  const progress =
    step === 'idle'  ? 0  :
    step === 'reading'  ? 18 :
    step === 'parsing'  ? 42 :
    step === 'matching' ? 68 :
    step === 'scoring'  ? 88 :
    step === 'done'     ? 100 : 0;

  return (
    <div className="rounded-lg border border-purple-200 overflow-hidden">
      {/* Header */}
      <div className={`flex items-center gap-2 px-4 py-2.5 ${
        step === 'done' ? 'bg-green-600' : 'bg-gradient-to-r from-purple-600 to-indigo-600'
      }`}>
        {step === 'done' ? (
          <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />
        ) : (
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-200 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
        )}
        <span className="text-sm font-semibold text-white">
          {step === 'done' ? '✓ AI Classification Complete' : 'AI Analyzing Document…'}
        </span>
      </div>

      <div className="bg-white p-4 space-y-3">
        {/* Steps */}
        <div className="space-y-2">
          {AI_STEPS.map((s) => {
            const stepIdx   = stepOrder.indexOf(s.key);
            const isDone    = currentIdx > stepIdx || step === 'done';
            const isRunning = stepOrder.indexOf(step) === stepIdx && step !== 'done';
            const Icon      = s.icon;

            return (
              <div
                key={s.key}
                className={`flex items-center gap-2.5 text-sm transition-opacity duration-300 ${
                  isDone || isRunning ? 'opacity-100' : 'opacity-35'
                }`}
              >
                <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                  isDone    ? 'bg-green-100'  :
                  isRunning ? 'bg-blue-100'   :
                              'bg-gray-100'
                }`}>
                  {isDone ? (
                    <Check className="w-3 h-3 text-green-600" />
                  ) : isRunning ? (
                    <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
                  ) : (
                    <Icon className="w-3 h-3 text-gray-400" />
                  )}
                </div>
                <span className={
                  isDone    ? 'text-gray-700' :
                  isRunning ? 'text-blue-700 font-medium' :
                              'text-gray-400'
                }>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              step === 'done' ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Result — shown when done */}
        {step === 'done' && result && (
          <div className="mt-2 rounded-lg bg-green-50 border border-green-200 p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Detected criterion</span>
              <span className="font-semibold text-gray-900">{result.criterion_name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Confidence</span>
              <ConfidenceIndicator confidence={result.confidence} size="sm" />
            </div>
            {result.reasoning && (
              <p className="text-xs text-gray-500 italic border-t border-green-200 pt-2">
                {result.reasoning}
              </p>
            )}
            {result.extraction_keywords?.length > 0 && (
              <div className="flex flex-wrap gap-1 border-t border-green-200 pt-2">
                {result.extraction_keywords.slice(0, 4).map((kw) => (
                  <span key={kw} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export function DocumentUploader({
  onUploadComplete,
  onCancel,
  preselectedCriterion,
}: DocumentUploaderProps) {
  const [file,        setFile]        = useState<File | null>(null);
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [criterion,   setCriterion]   = useState<O1Criterion | ''>(preselectedCriterion || '');

  // AI classification state
  const [aiStep,     setAiStep]     = useState<AiStep>('idle');
  const [aiResult,   setAiResult]   = useState<ClassifyResult | null>(null);
  const [aiOverridden, setAiOverridden] = useState(false);
  const classifyAbortRef = useRef<AbortController | null>(null);

  const { classify, upload, progress, result, reset, isUploading, isComplete, isError } =
    useDocumentUpload();

  // ── Trigger AI classification immediately on file drop ────────────────────
  const runClassification = useCallback(async (f: File) => {
    // Cancel any previous in-flight classification
    classifyAbortRef.current?.abort();
    classifyAbortRef.current = new AbortController();

    setAiResult(null);
    setAiOverridden(false);

    // Animate through steps with real API call happening concurrently
    const stepDelay = 700;
    setAiStep('reading');
    await new Promise(r => setTimeout(r, stepDelay));
    setAiStep('parsing');
    await new Promise(r => setTimeout(r, stepDelay));
    setAiStep('matching');

    // The actual API call — starts at 'reading' so it overlaps the animation
    const classifyResult = await classify(f);

    await new Promise(r => setTimeout(r, stepDelay));
    setAiStep('scoring');
    await new Promise(r => setTimeout(r, 600));

    if (classifyResult) {
      setAiResult(classifyResult);
      setAiStep('done');
      // Pre-fill criterion only if user hasn't manually changed it
      if (!aiOverridden) {
        setCriterion(classifyResult.criterion as O1Criterion);
      }
    } else {
      setAiStep('error');
    }
  }, [classify, aiOverridden]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
      // Kick off classification immediately
      runClassification(selectedFile);
    }
  }, [title, runClassification]);

  // If preselectedCriterion changes, sync it (unless overridden)
  useEffect(() => {
    if (preselectedCriterion && !aiOverridden) {
      setCriterion(preselectedCriterion);
    }
  }, [preselectedCriterion, aiOverridden]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg':      ['.jpg', '.jpeg'],
      'image/png':       ['.png'],
      'image/gif':       ['.gif'],
      'image/webp':      ['.webp'],
    },
    maxSize:  10 * 1024 * 1024,
    multiple: false,
    disabled: isUploading,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim() || !criterion) return;

    const uploadResult = await upload(
      file,
      title.trim(),
      description.trim() || undefined,
      criterion as O1Criterion,
    );

    if (uploadResult.success && onUploadComplete) {
      onUploadComplete(uploadResult);
    }
  };

  const handleReset = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setCriterion(preselectedCriterion || '');
    setAiStep('idle');
    setAiResult(null);
    setAiOverridden(false);
    reset();
  };

  const handleCancel = () => {
    handleReset();
    onCancel?.();
  };

  const handleCriterionChange = (val: string) => {
    setCriterion(val as O1Criterion | '');
    setAiOverridden(true); // user manually picked — don't auto-overwrite
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (isComplete && result?.success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
            <Check className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-medium text-green-900">Document Uploaded Successfully</h3>
            <p className="text-sm text-green-700">{result.message}</p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          {result.criterion_name && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-800">O-1 Criterion:</span>
              <span className="font-medium text-green-900">{result.criterion_name}</span>
            </div>
          )}
          {result.status && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-800">Status:</span>
              <span className={`font-medium capitalize ${
                result.status === 'verified'     ? 'text-green-600'  :
                result.status === 'needs_review' ? 'text-yellow-600' : 'text-gray-600'
              }`}>
                {result.status.replace('_', ' ')}
              </span>
            </div>
          )}
          {result.extraction && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-800">Extraction:</span>
              <ConfidenceIndicator
                confidence={result.extraction.confidence || 0}
                label={result.extraction.method || 'unknown'}
              />
            </div>
          )}
          {result.classification?.confidence && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-800">Classification Confidence:</span>
              <span className={`font-medium capitalize ${
                result.classification.confidence === 'high'   ? 'text-green-600'  :
                result.classification.confidence === 'medium' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {result.classification.confidence}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleReset}
          className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Upload Another Document
        </button>
      </div>
    );
  }

  // ── Error screen ──────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-medium text-red-900">Upload Failed</h3>
            <p className="text-sm text-red-700">{result?.error || progress.message}</p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const canSubmit = !!file && !!title.trim() && !!criterion && !isUploading && aiStep !== 'idle';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : file
              ? 'border-green-300 bg-green-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        } ${isUploading ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="h-8 w-8 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            {!isUploading && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); setAiStep('idle'); setAiResult(null); }}
                className="ml-2 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        ) : (
          <div>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm font-medium text-gray-900">
              {isDragActive ? 'Drop your file here' : 'Drag & drop your document'}
            </p>
            <p className="mt-1 text-xs text-gray-500">PDF, JPEG, PNG up to 10MB</p>
            <p className="mt-1.5 flex items-center justify-center gap-1 text-xs text-purple-600 font-medium">
              <Sparkles className="w-3 h-3" />
              AI will auto-classify on drop
            </p>
          </div>
        )}
      </div>

      {/* AI Classification Panel — appears as soon as a file is dropped */}
      {aiStep !== 'idle' && (
        <AIClassificationPanel step={aiStep} result={aiResult} />
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Document Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isUploading}
          placeholder="e.g., Award Certificate, Press Article, Recommendation Letter"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
          required
        />
      </div>

      {/* Criterion — pre-filled by AI, user can override */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="criterion" className="block text-sm font-medium text-gray-700">
            O-1 Criterion *
          </label>
          {aiStep === 'done' && aiResult && !aiOverridden && (
            <span className="flex items-center gap-1 text-xs text-purple-600 font-medium">
              <Sparkles className="w-3 h-3" />
              AI suggested
            </span>
          )}
          {aiOverridden && (
            <span className="text-xs text-gray-400">Manually selected</span>
          )}
        </div>
        <div className="relative">
          <select
            id="criterion"
            value={criterion}
            onChange={(e) => handleCriterionChange(e.target.value)}
            disabled={isUploading}
            className={`mt-0 block w-full rounded-lg border px-3 py-2 text-sm pr-8
              focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100
              appearance-none
              ${aiStep === 'done' && !aiOverridden && criterion
                ? 'border-purple-300 bg-purple-50 text-purple-900'
                : 'border-gray-300'
              }`}
            required
          >
            <option value="">
              {aiStep !== 'idle' && aiStep !== 'done' ? 'AI is classifying…' : 'Select a criterion…'}
            </option>
            {(Object.keys(O1_CRITERIA) as O1Criterion[]).map((key) => (
              <option key={key} value={key}>
                {O1_CRITERIA[key].name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        {criterion && O1_CRITERIA[criterion as O1Criterion]?.description && (
          <p className="mt-1 text-xs text-gray-500">
            {O1_CRITERIA[criterion as O1Criterion].description}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isUploading}
          placeholder="Add any context that might help with classification…"
          rows={2}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </div>

      {/* Upload progress (shown during actual upload) */}
      {isUploading && (
        <UploadProgress
          status={progress.status}
          progress={progress.progress}
          message={progress.message}
        />
      )}

      {/* Info note */}
      <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3">
        <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          Documents are analyzed with AI. High-confidence matches (≥85%) are auto-verified.
          All documents are subject to review.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isUploading}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700
            disabled:bg-blue-300 disabled:cursor-not-allowed
            flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
          ) : (
            <><Upload className="h-4 w-4" /> Upload &amp; Save</>
          )}
        </button>
      </div>
    </form>
  );
}