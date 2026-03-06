// src/app/api/admin/letters/review/route.ts

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get request body
    const body = await request.json();
    const { letterId, action, adminNotes } = body;

    if (!letterId || !action) {
      return NextResponse.json({ error: 'Letter ID and action are required' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "approve" or "reject"' }, { status: 400 });
    }

    // Get letter details with talent and employer info
    const { data: letter, error: letterError } = await supabase
      .from('interest_letters')
      .select(`
        *,
        talent:talent_profiles(
          id,
          first_name,
          last_name,
          user_id
        ),
        employer:employer_profiles(
          id,
          company_name,
          signatory_name,
          signatory_email
        )
      `)
      .eq('id', letterId)
      .single();

    if (letterError || !letter) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }

    // Update letter status
    const newStatus = action === 'approve' ? 'sent' : 'rejected';
    const newAdminStatus = action === 'approve' ? 'approved' : 'rejected';

    const { error: updateError } = await supabase
      .from('interest_letters')
      .update({
        status: newStatus,
        admin_status: newAdminStatus,
        admin_reviewed_at: new Date().toISOString(),
        admin_reviewed_by: user.id,
        admin_notes: adminNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', letterId);

    if (updateError) {
      console.error('Error updating letter:', updateError);
      return NextResponse.json({ error: 'Failed to update letter' }, { status: 500 });
    }

    // If approved, create in-app notification for talent
    if (action === 'approve' && letter.talent?.user_id) {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: letter.talent.user_id,
          type: 'letter_received',
          title: 'New Interest Letter Received!',
          message: `${letter.employer?.company_name || 'A company'} has sent you an interest letter for the position of ${letter.job_title}.`,
          data: {
            letter_id: letterId,
            employer_name: letter.employer?.company_name,
            job_title: letter.job_title,
          },
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Shared letter details used in both emails
    const sharedLetterPayload = {
      jobTitle: letter.job_title,
      companyName: letter.employer?.company_name || 'A company',
      commitmentLevel: letter.commitment_level,
      engagementType: letter.engagement_type,
      workArrangement: letter.work_arrangement,
      salaryMin: letter.salary_min ?? null,
      salaryMax: letter.salary_max ?? null,
      salaryNegotiable: letter.salary_negotiable ?? false,
      locations: Array.isArray(letter.locations)
        ? letter.locations.join(', ')
        : (letter.locations || ''),
      startTiming: letter.start_timing || '',
    };

    // ── Email to Talent ──────────────────────────────────────────────────────
    if (letter.talent?.user_id) {
      try {
        const { data: talentProfile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', letter.talent.user_id)
          .single();

        if (talentProfile?.email) {
          await fetch(`${baseUrl}/api/send-letter-review-notification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action,
              toEmail: talentProfile.email,
              talentName:
                talentProfile.full_name ||
                `${letter.talent.first_name || ''} ${letter.talent.last_name || ''}`.trim() ||
                'there',
              adminNotes: action === 'reject' ? (adminNotes || null) : null,
              ...sharedLetterPayload,
            }),
          });
        }
      } catch (emailError) {
        console.error('[review/route] Failed to send talent email notification:', emailError);
      }
    }

    // ── Email to Employer (approve only) ────────────────────────────────────
    if (action === 'approve' && letter.employer?.signatory_email) {
      try {
        await fetch(`${baseUrl}/api/send-employer-letter-approved-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toEmail: letter.employer.signatory_email,
            signatoryName: letter.employer.signatory_name || 'there',
            ...sharedLetterPayload,
          }),
        });
      } catch (emailError) {
        console.error('[review/route] Failed to send employer email notification:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Letter ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      letterId,
      status: newStatus,
    });

  } catch (error) {
    console.error('Error in letter review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}