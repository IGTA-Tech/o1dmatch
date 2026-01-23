'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useDocumentUpload, UploadResult } from '@/hooks/useDocumentUpload';
import { UploadProgress } from './UploadProgress';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { O1Criterion, O1_CRITERIA } from '@/types/enums';

interface DocumentUploaderProps {
  onUploadComplete?: (result: UploadResult) => void;
  onCancel?: () => void;
  preselectedCriterion?: O1Criterion | null;
}

export function DocumentUploader({ onUploadComplete, onCancel, preselectedCriterion }: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [criterion, setCriterion] = useState<O1Criterion | ''>(preselectedCriterion || '');
  const { upload, progress, result, reset, isUploading, isComplete, isError } = useDocumentUpload();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      // Auto-set title from filename if not set
      if (!title) {
        const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
        setTitle(nameWithoutExt);
      }
    }
  }, [title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    disabled: isUploading,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;

    const uploadResult = await upload(
      file, 
      title.trim(), 
      description.trim() || undefined,
      criterion || undefined // Pass selected criterion
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
    reset();
  };

  const handleCancel = () => {
    handleReset();
    if (onCancel) {
      onCancel();
    }
  };

  // Show result screen
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
                result.status === 'verified' ? 'text-green-600' :
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
                result.classification.confidence === 'high' ? 'text-green-600' :
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

  // Show error screen
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Dropzone */}
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
              <p className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            {!isUploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
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
            <p className="mt-1 text-xs text-gray-500">
              PDF, JPEG, PNG, GIF, or WEBP up to 10MB
            </p>
          </div>
        )}
      </div>

      {/* Title Input */}
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

      {/* Criterion Selection */}
      <div>
        <label htmlFor="criterion" className="block text-sm font-medium text-gray-700">
          O-1 Criterion *
        </label>
        <select
          id="criterion"
          value={criterion}
          onChange={(e) => setCriterion(e.target.value as O1Criterion | '')}
          disabled={isUploading}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
          required
        >
          <option value="">Select a criterion...</option>
          {(Object.keys(O1_CRITERIA) as O1Criterion[]).map((key) => (
            <option key={key} value={key}>
              {O1_CRITERIA[key].name}
            </option>
          ))}
        </select>
        {criterion && O1_CRITERIA[criterion as O1Criterion]?.description && (
          <p className="mt-1 text-xs text-gray-500">
            {O1_CRITERIA[criterion as O1Criterion].description}
          </p>
        )}
      </div>

      {/* Description Input */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description (Optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isUploading}
          placeholder="Add any context that might help with classification..."
          rows={2}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </div>

      {/* Progress Bar */}
      {isUploading && (
        <UploadProgress
          status={progress.status}
          progress={progress.progress}
          message={progress.message}
        />
      )}

      {/* Action Buttons */}
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
          disabled={!file || !title.trim() || !criterion || isUploading}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload & Classify
            </>
          )}
        </button>
      </div>
    </form>
  );
}