// src/app/(dashboard)/dashboard/admin/users/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function toggleProfileStatus(
  userId: string,
  role: string,
  newStatus: 'enabled' | 'disabled'
): Promise<{ success: boolean; error?: string }> {
  try {
    // ── 1. Auth check with the regular (session-scoped) client ──
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Not authenticated' };

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (adminProfile?.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    // ── 2. Determine target table ──
    const table =
      role === 'talent'
        ? 'talent_profiles'
        : role === 'employer'
        ? 'employer_profiles'
        : null;

    if (!table) {
      return { success: false, error: `Role "${role}" has no status field` };
    }

    // ── 3. Update using service role client (bypasses RLS) ──
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error, data } = await serviceClient
      .from(table)
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select('status');

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      return { success: false, error: `No ${role} profile found for this user` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}