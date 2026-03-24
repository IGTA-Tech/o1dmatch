'use client';

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload, FileText, Check, AlertCircle, Loader2,
  Sparkles, CheckCircle2, Trash2,
} from 'lucide-react';
import { useDocumentUpload, ClassifyResult } from '@/hooks/useDocumentUpload';
import type { UploadResult } from '@/hooks/useDocumentUpload';
// import { ConfidenceIndicator } from './ConfidenceIndicator';
import { O1Criterion, O1_CRITERIA } from '@/types/enums';

// ── Types ──────────────────────────────────────────────────────────────────
type AiStep = 'idle' | 'reading' | 'parsing' | 'matching' | 'scoring' | 'done' | 'error';

interface FileEntry {
  id: string;
  file: File;
  title: string;
  description: string;
  /** One file can be assigned to MULTIPLE criteria — each becomes a separate evidence record */
  criteria: O1Criterion[];
  aiStep: AiStep;
  aiResult: ClassifyResult | null;
  aiOverridden: boolean;
  uploadStatus: 'pending' | 'uploading' | 'done' | 'error';
  uploadedCount: number;
  errorMsg?: string;
}

interface DocumentUploaderProps {
  onUploadComplete?: () => void;
  onCancel?: () => void;
  preselectedCriterion?: O1Criterion | null;
}

// ── Compact inline AI panel ────────────────────────────────────────────────
function InlineAIPanel({ step, result }: { step: AiStep; result: ClassifyResult | null }) {
  if (step === 'idle') return null;

  const labels: Partial<Record<AiStep, string>> = {
    reading:  'Extracting text via OCR…',
    parsing:  'Parsing document structure…',
    matching: 'Matching O-1 criteria…',
    scoring:  'Computing confidence score…',
    done:     'AI Classification Complete',
    error:    'Classification failed',
  };

  const progress =
    step === 'reading'  ? 18 :
    step === 'parsing'  ? 42 :
    step === 'matching' ? 68 :
    step === 'scoring'  ? 88 :
    step === 'done'     ? 100 : 0;

  const isDone  = step === 'done';
  const isError = step === 'error';

  return (
    <div className={`rounded-lg border overflow-hidden ${
      isDone  ? 'border-green-200'  :
      isError ? 'border-red-200'    :
                'border-purple-200'
    }`}>
      <div className={`flex items-center gap-2 px-3 py-1.5 ${
        isDone  ? 'bg-green-600'  :
        isError ? 'bg-red-600'    :
                  'bg-gradient-to-r from-purple-600 to-indigo-600'
      }`}>
        {isDone ? (
          <CheckCircle2 className="w-3 h-3 text-white flex-shrink-0" />
        ) : isError ? (
          <AlertCircle className="w-3 h-3 text-white flex-shrink-0" />
        ) : (
          <Loader2 className="w-3 h-3 text-white animate-spin flex-shrink-0" />
        )}
        <span className="text-white font-medium text-xs">{labels[step]}</span>
      </div>

      {!isDone && !isError && (
        <div className="px-3 py-2 bg-purple-50">
          <div className="h-1 bg-purple-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {isDone && result && (
        <div className="px-3 py-2 bg-green-50 space-y-2">
          <p className="text-xs font-semibold text-green-800 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI Suggestions — click to select
          </p>
          {(result.suggestions && result.suggestions.length > 0
            ? result.suggestions
            : [{ criterion: result.criterion, criterion_name: result.criterion_name, confidence: result.confidence, reasoning: result.reasoning }]
          ).map((s, idx) => (
            <div
              key={s.criterion}
              className="flex items-center gap-2 rounded-lg bg-white border border-green-200 px-2.5 py-2"
            >
              {/* Rank badge */}
              <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                idx === 0 ? 'bg-purple-600 text-white' :
                idx === 1 ? 'bg-purple-300 text-purple-900' :
                            'bg-gray-200 text-gray-600'
              }`}>
                {idx + 1}
              </span>
              <span className="flex-1 text-xs font-medium text-gray-800 truncate">{s.criterion_name}</span>
              {/* Confidence mini-bar */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      s.confidence >= 85 ? 'bg-green-500' :
                      s.confidence >= 60 ? 'bg-yellow-500' :
                                           'bg-red-400'
                    }`}
                    style={{ width: `${s.confidence}%` }}
                  />
                </div>
                <span className={`text-[10px] font-semibold w-7 text-right ${
                  s.confidence >= 85 ? 'text-green-700' :
                  s.confidence >= 60 ? 'text-yellow-700' :
                                       'text-red-600'
                }`}>{s.confidence}%</span>
              </div>
            </div>
          ))}
          {result.reasoning && (
            <p className="text-[11px] text-gray-400 italic border-t border-green-200 pt-1.5 leading-relaxed">
              {result.reasoning}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── File card ──────────────────────────────────────────────────────────────
function FileCard({
  entry,
  onRemove,
  onTitleChange,
  onDescriptionChange,
  onToggleCriterion,
  disabled,
}: {
  entry: FileEntry;
  onRemove: (id: string) => void;
  onTitleChange: (id: string, val: string) => void;
  onDescriptionChange: (id: string, val: string) => void;
  onToggleCriterion: (id: string, criterion: O1Criterion) => void;
  disabled: boolean;
}) {
  const isDone      = entry.uploadStatus === 'done';
  const isError     = entry.uploadStatus === 'error';
  const isUploading = entry.uploadStatus === 'uploading';

  return (
    <div className={`rounded-xl border p-4 space-y-3 transition-colors ${
      isDone      ? 'border-green-200 bg-green-50/60' :
      isError     ? 'border-red-200 bg-red-50/60'     :
      isUploading ? 'border-blue-200 bg-blue-50/60'   :
                    'border-gray-200 bg-white'
    }`}>
      {/* File header */}
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg flex-shrink-0 ${
          isDone  ? 'bg-green-100' : isError ? 'bg-red-100' : 'bg-gray-100'
        }`}>
          {isDone ? (
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          ) : isUploading ? (
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          ) : (
            <FileText className="w-4 h-4 text-gray-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-700 truncate">{entry.file.name}</p>
          <p className="text-xs text-gray-400">{(entry.file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        {isDone ? (
          <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full whitespace-nowrap">
            ✓ Uploaded
          </span>
        ) : !disabled ? (
          <button
            type="button"
            onClick={() => onRemove(entry.id)}
            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove file"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {!isDone && (
        <>
          {/* Title */}
          <input
            type="text"
            value={entry.title}
            onChange={e => onTitleChange(entry.id, e.target.value)}
            disabled={disabled}
            placeholder="Document title *"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg
              focus:ring-1 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-100 disabled:cursor-not-allowed"
          />

          {/* Inline AI panel */}
          <InlineAIPanel step={entry.aiStep} result={entry.aiResult} />

          {/* Multi-criteria selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-700">
                O-1 Criteria *
                {entry.criteria.length > 0 && (
                  <span className="ml-1.5 font-semibold text-blue-600">
                    ({entry.criteria.length} selected)
                  </span>
                )}
              </label>
              {entry.aiStep === 'done' && entry.aiResult && (
                <span className="flex items-center gap-1 text-xs text-purple-600 font-medium">
                  <Sparkles className="w-3 h-3" />
                  AI suggested
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(O1_CRITERIA) as O1Criterion[]).map(key => {
                const isSelected = entry.criteria.includes(key);

                // Find this criterion's rank in AI suggestions (0-indexed, -1 = not suggested)
                const suggestions = entry.aiResult?.suggestions ?? (
                  entry.aiResult ? [{ criterion: entry.aiResult.criterion, confidence: entry.aiResult.confidence }] : []
                );
                const suggestionIdx = suggestions.findIndex(s => s.criterion === key);
                const isAiSuggested = suggestionIdx !== -1;
                const aiConfidence  = isAiSuggested ? suggestions[suggestionIdx].confidence : null;
                const rankLabel     = suggestionIdx === 0 ? '1' : suggestionIdx === 1 ? '2' : suggestionIdx === 2 ? '3' : null;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onToggleCriterion(entry.id, key)}
                    disabled={disabled}
                    title={`${O1_CRITERIA[key].description}${aiConfidence !== null ? ` • AI: ${aiConfidence}% confidence` : ''}`}
                    className={`flex items-start gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium
                      border text-left transition-all leading-tight
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : isAiSuggested
                        ? 'bg-purple-50 text-purple-800 border-purple-300 hover:bg-purple-100'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                      }`}
                  >
                    {/* Icon / rank badge */}
                    <span className="flex-shrink-0 mt-0.5 w-3.5 h-3.5 block">
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : rankLabel ? (
                        <span className={`flex w-3.5 h-3.5 rounded-full items-center justify-center text-[8px] font-bold leading-none ${
                          suggestionIdx === 0 ? 'bg-purple-600 text-white' :
                          suggestionIdx === 1 ? 'bg-purple-300 text-purple-900' :
                                               'bg-gray-300 text-gray-700'
                        }`}>
                          {rankLabel}
                        </span>
                      ) : null}
                    </span>
                    <span className="flex-1">{O1_CRITERIA[key].name}</span>
                    {/* Confidence % for AI-suggested ones */}
                    {isAiSuggested && !isSelected && aiConfidence !== null && (
                      <span className={`text-[9px] font-bold ml-auto flex-shrink-0 ${
                        aiConfidence >= 85 ? 'text-green-600' :
                        aiConfidence >= 60 ? 'text-yellow-600' :
                                             'text-red-500'
                      }`}>
                        {aiConfidence}%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {entry.criteria.length === 0 && entry.aiStep !== 'idle' && (
              <p className="mt-1.5 text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                Select at least one criterion to enable upload
              </p>
            )}
          </div>

          {/* Optional description */}
          <input
            type="text"
            value={entry.description}
            onChange={e => onDescriptionChange(entry.id, e.target.value)}
            disabled={disabled}
            placeholder="Description (optional)"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg
              focus:ring-1 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </>
      )}

      {isError && entry.errorMsg && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {entry.errorMsg}
        </p>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export function DocumentUploader({
  onUploadComplete,
  onCancel,
  preselectedCriterion,
}: DocumentUploaderProps) {
  const [fileEntries,      setFileEntries]      = useState<FileEntry[]>([]);
  const [isProcessing,     setIsProcessing]     = useState(false);
  const [processProgress,  setProcessProgress]  = useState({ done: 0, total: 0 });
  const [allDone,          setAllDone]          = useState(false);
  const [summary,          setSummary]          = useState({ succeeded: 0, failed: 0 });

  const { classify, upload, reset } = useDocumentUpload();
  const abortRefs = useRef<Record<string, AbortController>>({});

  // Helper: update one entry by id (supports updater fn for derived state)
  const updateEntry = useCallback(
    (id: string, patch: Partial<FileEntry> | ((e: FileEntry) => Partial<FileEntry>)) => {
      setFileEntries(prev =>
        prev.map(e => {
          if (e.id !== id) return e;
          const updates = typeof patch === 'function' ? patch(e) : patch;
          return { ...e, ...updates };
        })
      );
    },
    []
  );

  // Run AI classification for one file — called immediately on drop
  const runClassificationFor = useCallback(
    async (entryId: string, file: File) => {
      abortRefs.current[entryId]?.abort();
      abortRefs.current[entryId] = new AbortController();

      const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

      updateEntry(entryId, { aiStep: 'reading', aiResult: null });
      await delay(600);
      updateEntry(entryId, { aiStep: 'parsing' });
      await delay(600);
      updateEntry(entryId, { aiStep: 'matching' });

      const result = await classify(file);

      await delay(500);
      updateEntry(entryId, { aiStep: 'scoring' });
      await delay(400);

      if (result) {
        updateEntry(entryId, e => ({
          aiStep:   'done' as AiStep,
          aiResult: result,
          // Auto-select the top AI suggestion only if user hasn't manually chosen yet
          criteria: !e.aiOverridden && e.criteria.length === 0
            ? [result.criterion as O1Criterion]
            : e.criteria,
        }));
      } else {
        updateEntry(entryId, { aiStep: 'error' });
      }
    },
    [classify, updateEntry]
  );

  // Dropzone — multiple files enabled
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newEntries: FileEntry[] = acceptedFiles.map(file => ({
        id:            `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        title:         file.name.replace(/\.[^/.]+$/, ''),
        description:   '',
        criteria:      preselectedCriterion ? [preselectedCriterion] : [],
        aiStep:        'idle' as AiStep,
        aiResult:      null,
        aiOverridden:  !!preselectedCriterion,
        uploadStatus:  'pending' as const,
        uploadedCount: 0,
      }));

      setFileEntries(prev => [...prev, ...newEntries]);
      // Kick off AI classification concurrently for all new files
      newEntries.forEach(entry => runClassificationFor(entry.id, entry.file));
    },
    [preselectedCriterion, runClassificationFor]
  );

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
    multiple: true,   // ← was false — now accepts multiple files at once
    disabled: isProcessing,
  });

  // Toggle a criterion on/off for a file
  const toggleCriterion = useCallback((entryId: string, criterion: O1Criterion) => {
    setFileEntries(prev =>
      prev.map(e => {
        if (e.id !== entryId) return e;
        const already = e.criteria.includes(criterion);
        return {
          ...e,
          aiOverridden: true,
          criteria: already
            ? e.criteria.filter(c => c !== criterion)
            : [...e.criteria, criterion],
        };
      })
    );
  }, []);

  // Remove a file from the queue
  const removeEntry = useCallback((id: string) => {
    abortRefs.current[id]?.abort();
    delete abortRefs.current[id];
    setFileEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  // Process entire queue sequentially
  // Each file × each selected criterion = one upload task → one evidence record
  const processQueue = async () => {
    const snapshot = fileEntries.filter(
      e => e.title.trim() && e.criteria.length > 0 && e.uploadStatus === 'pending'
    );

    type Task = { entryId: string; criterion: O1Criterion };
    const tasks: Task[] = [];
    snapshot.forEach(entry =>
      entry.criteria.forEach(criterion => tasks.push({ entryId: entry.id, criterion }))
    );

    if (tasks.length === 0) return;

    setIsProcessing(true);
    setProcessProgress({ done: 0, total: tasks.length });

    let succeeded = 0;
    let failed    = 0;

    for (let i = 0; i < tasks.length; i++) {
      const { entryId, criterion } = tasks[i];
      const entry = snapshot.find(e => e.id === entryId);
      if (!entry) continue;

      updateEntry(entryId, { uploadStatus: 'uploading' });

      try {
        const result: UploadResult = await upload(
          entry.file,
          entry.title.trim(),
          entry.description.trim() || undefined,
          criterion,
        );

        if (result.success) {
          succeeded++;
          updateEntry(entryId, e => ({ uploadedCount: e.uploadedCount + 1 }));
        } else {
          failed++;
          updateEntry(entryId, { errorMsg: result.error || 'Upload failed' });
        }
      } catch {
        failed++;
        updateEntry(entryId, { errorMsg: 'Unexpected error — please try again' });
      }

      reset();
      setProcessProgress({ done: i + 1, total: tasks.length });
    }

    // Mark each entry's final status
    setFileEntries(prev =>
      prev.map(e => {
        if (e.uploadStatus !== 'uploading') return e;
        return {
          ...e,
          uploadStatus: e.uploadedCount === e.criteria.length ? 'done' : 'error',
        };
      })
    );

    setIsProcessing(false);
    setAllDone(true);
    setSummary({ succeeded, failed });

    if (succeeded > 0) onUploadComplete?.();
  };

  const totalFiles = fileEntries.length;
  const totalTasks = fileEntries.reduce((sum, e) => sum + e.criteria.length, 0);
  const canSubmit  = fileEntries.some(e => e.title.trim() && e.criteria.length > 0) && !isProcessing;

  // ── All-done screen ───────────────────────────────────────────────────
  if (allDone) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-green-900 text-lg">Upload Complete</h3>
          <p className="text-sm text-green-700 mt-1">
            {summary.succeeded} criterion upload{summary.succeeded !== 1 ? 's' : ''} succeeded
            {summary.failed > 0 && (
              <span className="text-red-600"> · {summary.failed} failed</span>
            )}
          </p>
        </div>
        <p className="text-xs text-green-600">
          Documents are being verified automatically. Your O-1 score will update shortly.
        </p>
        {summary.failed > 0 && (
          <button
            onClick={() => {
              setAllDone(false);
              setFileEntries(prev =>
                prev
                  .filter(e => e.uploadStatus !== 'done')
                  .map(e => ({
                    ...e,
                    uploadStatus: 'pending' as const,
                    uploadedCount: 0,
                    errorMsg: undefined,
                  }))
              );
            }}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
          >
            Retry failed uploads
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`relative rounded-xl border-2 border-dashed p-6 text-center transition-colors
          ${isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer'
          }
          ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm font-medium text-gray-700">
          {isDragActive ? 'Drop files here' : 'Drag & drop files, or click to browse'}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          PDF, JPEG, PNG up to 10 MB each · Multiple files supported
        </p>
        <p className="mt-1.5 flex items-center justify-center gap-1 text-xs text-purple-600 font-medium">
          <Sparkles className="w-3 h-3" />
          AI auto-classifies each file on drop
        </p>
      </div>

      {/* File queue */}
      {fileEntries.length > 0 && (
        <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
          {fileEntries.map(entry => (
            <FileCard
              key={entry.id}
              entry={entry}
              onRemove={removeEntry}
              onTitleChange={(id, val) => updateEntry(id, { title: val })}
              onDescriptionChange={(id, val) => updateEntry(id, { description: val })}
              onToggleCriterion={toggleCriterion}
              disabled={isProcessing}
            />
          ))}
        </div>
      )}

      {/* Actions */}
      {fileEntries.length > 0 && (
        <div className="space-y-3">
          {/* Summary */}
          {!isProcessing && totalTasks > 0 && (
            <p className="text-xs text-gray-500 text-center">
              {totalFiles} file{totalFiles !== 1 ? 's' : ''} ·{' '}
              {totalTasks} evidence record{totalTasks !== 1 ? 's' : ''} will be created
              {totalTasks > totalFiles && (
                <span className="text-blue-600 ml-1">
                  ({totalTasks - totalFiles} shared across multiple criteria)
                </span>
              )}
            </p>
          )}

          {/* Upload progress */}
          {isProcessing && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-blue-700 flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Uploading… {processProgress.done} / {processProgress.total}
                </span>
                <span className="text-xs text-blue-500">
                  {Math.round((processProgress.done / processProgress.total) * 100)}%
                </span>
              </div>
              <div className="h-1.5 bg-blue-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${(processProgress.done / processProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 py-2.5 px-4 border border-gray-300 rounded-xl text-sm font-medium
                text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={processQueue}
              disabled={!canSubmit}
              className="flex-1 py-2.5 px-4 bg-blue-600 rounded-xl text-sm font-medium text-white
                hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload {totalFiles} File{totalFiles !== 1 ? 's' : ''}
                  {totalTasks > 0 && ` · ${totalTasks} Record${totalTasks !== 1 ? 's' : ''}`}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Cancel when empty */}
      {fileEntries.length === 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium
              text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Info note */}
      <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3">
        <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          Assigning a file to multiple criteria creates a separate evidence record per criterion.
          High-confidence AI matches (≥ 85%) are auto-verified. All documents are subject to review.
        </p>
      </div>
    </div>
  );
}