// src/app/(dashboard)/dashboard/admin/users/[id]/ChangeRoleButton.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Check } from 'lucide-react';
import { getSupabaseAuthData } from '@/lib/supabase/getToken';

interface ChangeRoleButtonProps {
  userId: string;
  currentRole: string;
}

const ROLES = [
  { value: 'talent', label: 'Talent' },
  { value: 'employer', label: 'Employer' },
  { value: 'lawyer', label: 'Lawyer' },
  { value: 'agency', label: 'Agency' },
  { value: 'admin', label: 'Admin' },
];

export function ChangeRoleButton({ userId, currentRole }: ChangeRoleButtonProps) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChangeRole = async () => {
    if (selectedRole === currentRole) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    try {
      const authData = getSupabaseAuthData();

      if (!authData) {
        setError('Session expired. Please log in again.');
        return;
      }

      const response = await fetch(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${authData.access_token}`,
            'apikey': anonKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            role: selectedRole,
            updated_at: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        setError(`Failed to update role: ${errorText}`);
        return;
      }

      setSuccess(true);
      
      // Refresh after short delay
      setTimeout(() => {
        router.refresh();
      }, 1000);

    } catch (err) {
      console.error('Error changing role:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {ROLES.map((role) => (
          <button
            key={role.value}
            onClick={() => setSelectedRole(role.value)}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedRole === role.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } disabled:opacity-50`}
          >
            {role.label}
            {currentRole === role.value && (
              <span className="ml-1 text-xs opacity-75">(current)</span>
            )}
          </button>
        ))}
      </div>

      {selectedRole !== currentRole && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleChangeRole}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : success ? (
              <>
                <Check className="w-4 h-4" />
                Updated!
              </>
            ) : (
              'Save Change'
            )}
          </button>
          
          <button
            onClick={() => setSelectedRole(currentRole)}
            disabled={loading}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {success && (
        <p className="text-sm text-green-600">Role updated successfully!</p>
      )}

      <p className="text-xs text-gray-500">
        Warning: Changing a user&apos;s role will affect their access permissions immediately.
      </p>
    </div>
  );
}