// src/app/api/agency/profile/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify agency role
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userProfile?.role !== 'agency') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { profileId, ...updateData } = body;

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }

    // Verify ownership
    const { data: agencyProfile } = await supabase
      .from('agency_profiles')
      .select('id, user_id')
      .eq('id', profileId)
      .eq('user_id', user.id)
      .single();

    if (!agencyProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Only allow specific fields to be updated
    const allowedFields = [
      'agency_name', 'legal_name', 'agency_website', 'agency_description',
      'street_address', 'city', 'state', 'zip_code', 'country',
      'contact_name', 'contact_email', 'contact_phone',
    ];

    const sanitized: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in updateData) {
        sanitized[key] = updateData[key];
      }
    }

    const { error } = await supabase
      .from('agency_profiles')
      .update({ ...sanitized, updated_at: new Date().toISOString() })
      .eq('id', profileId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Agency profile update error:', error);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Agency profile API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}