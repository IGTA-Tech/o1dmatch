'use client';

import { Upload, FileSearch, Brain, Check } from 'lucide-react';

interface UploadProgressProps {
  status: 'idle' | 'uploading' | 'extracting' | 'classifying' | 'complete' | 'error';
  progress: number;
  message: string;
}

export function UploadProgress({ status, progress, message }: UploadProgressProps) {
  const steps = [
    { id: 'uploading', label: 'Upload', icon: Upload },
    { id: 'extracting', label: 'Extract', icon: FileSearch },
    { id: 'classifying', label: 'Classify', icon: Brain },
    { id: 'complete', label: 'Done', icon: Check },
  ];

  const getCurrentStepIndex = () => {
    switch (status) {
      case 'uploading':
        return 0;
      case 'extracting':
        return 1;
      case 'classifying':
        return 2;
      case 'complete':
        return 3;
      default:
        return -1;
    }
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="rounded-lg bg-blue-50 p-4">
      {/* Step indicators */}
      <div className="mb-4 flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentIndex;
          const isComplete = index < currentIndex;

          return (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  isComplete
                    ? 'bg-green-500 text-white'
                    : isActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span
                className={`mt-1 text-xs ${
                  isActive ? 'font-medium text-blue-700' : 'text-gray-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mb-2 h-2 overflow-hidden rounded-full bg-blue-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Status message */}
      <p className="text-center text-sm text-blue-700">{message}</p>
    </div>
  );
}
