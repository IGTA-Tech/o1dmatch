// src/app/(dashboard)/dashboard/admin/users/StatusToggle.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { toggleProfileStatus } from './actions';

interface StatusToggleProps {
  userId: string;
  role: string;
  currentStatus: string | null;
}

export function StatusToggle({ userId, role, currentStatus }: StatusToggleProps) {
  const router = useRouter();
  const [selected, setSelected] = useState(currentStatus ?? 'enabled');
  const [savedStatus, setSavedStatus] = useState(currentStatus ?? 'enabled');
  const [showSaved, setShowSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (currentStatus === null) {
    return <span className="text-xs text-gray-400">—</span>;
  }

  const isDirty = selected !== savedStatus;

  const handleSave = () => {
    setErrorMsg(null);
    const newStatus = selected as 'enabled' | 'disabled';

    startTransition(async () => {
      const result = await toggleProfileStatus(userId, role, newStatus);

      if (result.success) {
        setSavedStatus(newStatus);
        setShowSaved(true);
        setTimeout(() => {
          setShowSaved(false);
          // Refresh page data only after transition is fully done
          router.refresh();
        }, 1500);
      } else {
        setErrorMsg(result.error ?? 'Update failed');
        setSelected(savedStatus); // revert dropdown
      }
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <select
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value);
            setErrorMsg(null);
            setShowSaved(false);
          }}
          disabled={isPending}
          className={`px-2 py-1 rounded-lg border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50
            ${selected === 'enabled'
              ? 'bg-green-50 border-green-300 text-green-700'
              : 'bg-red-50 border-red-300 text-red-700'
            }`}
        >
          <option value="enabled">Enabled</option>
          <option value="disabled">Disabled</option>
        </select>

        {/* Save button */}
        {isDirty && !isPending && (
          <button
            onClick={handleSave}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Save
          </button>
        )}

        {/* Spinner */}
        {isPending && (
          <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin shrink-0" />
        )}

        {/* Success tick */}
        {showSaved && (
          <span className="flex items-center gap-0.5 text-xs text-green-600 font-medium">
            <Check className="w-3.5 h-3.5" /> Saved
          </span>
        )}
      </div>

      {/* Inline error */}
      {errorMsg && (
        <span className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="w-3 h-3 shrink-0" /> {errorMsg}
        </span>
      )}
    </div>
  );
}