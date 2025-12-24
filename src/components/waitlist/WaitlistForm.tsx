'use client';

import { useState } from 'react';
import { Loader2, Check, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';

export type WaitlistUserType = 'talent' | 'employer' | 'agency' | 'lawyer';

interface FormStep {
  title: string;
  fields: React.ReactNode;
}

interface WaitlistFormProps {
  userType: WaitlistUserType;
  steps: FormStep[];
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  formData: Record<string, unknown>;
}

export function WaitlistForm({
  userType,
  steps,
  onSubmit,
  formData,
}: WaitlistFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLastStep) {
      handleNext();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSubmit({ ...formData, user_type: userType });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">You&apos;re on the list!</h2>
        <p className="text-lg text-gray-600 mb-6 max-w-md mx-auto">
          Thank you for joining the O1DMatch waitlist. We&apos;ll notify you as soon as we launch!
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-blue-800 text-sm">
            Check your email for a confirmation message. Early waitlist members get priority access!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  index < currentStep
                    ? 'bg-green-500 text-white'
                    : index === currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 w-12 sm:w-24 mx-2 rounded transition-colors ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((step, index) => (
            <span
              key={index}
              className={`text-xs sm:text-sm ${
                index === currentStep ? 'text-blue-600 font-medium' : 'text-gray-500'
              }`}
              style={{ width: `${100 / steps.length}%`, textAlign: 'center' }}
            >
              {step.title}
            </span>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="min-h-[300px]">
          {steps[currentStep].fields}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Joining...
              </>
            ) : isLastStep ? (
              'Join Waitlist'
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Reusable form field components
export function FormInput({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  value,
  onChange,
  icon: Icon,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors`}
        />
      </div>
    </div>
  );
}

export function FormSelect({
  label,
  name,
  options,
  required = false,
  value,
  onChange,
  placeholder = 'Select an option',
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FormTextarea({
  label,
  name,
  placeholder,
  required = false,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
      />
    </div>
  );
}
