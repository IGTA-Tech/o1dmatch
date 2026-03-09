// src/app/api/admin/letters/review/route.ts

import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
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

    console.log('[review] ── START ──────────────────────────────────────');
    console.log('[review] letterId:', letterId);
    console.log('[review] action:', action);
    console.log('[review] adminNotes:', adminNotes);

    if (!letterId || !action) {
      return NextResponse.json({ error: 'Letter ID and action are required' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "approve" or "reject"' }, { status: 400 });
    }

    // Service role client — bypasses RLS for agency_profiles and agency_clients lookups
    const supabaseService = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get letter details with talent and employer info
    console.log('[review] STEP 1: Fetching letter from interest_letters...');
    const { data: letter, error: letterError } = await supabase
      .from('interest_letters')
      .select(`
        *,
        employer_id,
        agency_id,
        agency_client_id,
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

    console.log('[review] letter fetch error:', letterError);
    console.log('[review] letter.id:', letter?.id);
    console.log('[review] letter.employer_id (raw FK):', letter?.employer_id);
    console.log('[review] letter.agency_id:', (letter as any)?.agency_id);
    console.log('[review] letter.client_id:', (letter as any)?.client_id);
    console.log('[review] letter.source_type:', (letter as any)?.source_type);
    console.log('[review] letter.employer?.id:', letter?.employer?.id);
    console.log('[review] letter.employer?.company_name:', letter?.employer?.company_name);
    console.log('[review] letter.employer?.signatory_email:', letter?.employer?.signatory_email);
    console.log('[review] letter.talent?.user_id:', letter?.talent?.user_id);

    if (letterError || !letter) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }

    // Update letter status
    console.log('[review] STEP 2: Updating letter status to:', action === 'approve' ? 'sent/approved' : 'rejected/rejected');
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
      console.error('[review] STEP 2 FAILED - update error:', updateError);
      return NextResponse.json({ error: 'Failed to update letter' }, { status: 500 });
    }
    console.log('[review] STEP 2: Letter status updated OK');

    // If approved, create in-app notification for talent
    if (action === 'approve' && letter.talent?.user_id) {
      console.log('[review] STEP 3: Creating in-app notification for talent user_id:', letter.talent.user_id);
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
        console.error('[review] STEP 3 FAILED - notification error:', notificationError);
      } else {
        console.log('[review] STEP 3: In-app notification created OK');
      }
    } else {
      console.log('[review] STEP 3: Skipped (action is reject or no talent user_id)');
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    console.log('[review] baseUrl:', baseUrl);

    // Shared letter details used in emails
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
    console.log('[review] STEP 4: Talent email — talent.user_id:', letter.talent?.user_id);
    if (letter.talent?.user_id) {
      try {
        const { data: talentProfile, error: talentProfileErr } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', letter.talent.user_id)
          .single();

        console.log('[review] STEP 4: talentProfile fetch error:', talentProfileErr);
        console.log('[review] STEP 4: talentProfile.email:', talentProfile?.email);

        if (talentProfile?.email) {
          console.log('[review] STEP 4: Sending talent email to:', talentProfile.email);
          const talentEmailRes = await fetch(`${baseUrl}/api/send-letter-review-notification`, {
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
          console.log('[review] STEP 4: Talent email API response status:', talentEmailRes.status);
        } else {
          console.log('[review] STEP 4: SKIPPED — no talent email found');
        }
      } catch (emailError) {
        console.error('[review] STEP 4 FAILED:', emailError);
      }
    } else {
      console.log('[review] STEP 4: SKIPPED — no talent user_id on letter');
    }

    // ── Email to Employer (approve only) ─────────────────────────────────────
    console.log('[review] STEP 5: Employer email — action:', action, '| signatory_email:', letter.employer?.signatory_email);
    if (action === 'approve' && letter.employer?.signatory_email) {
      try {
        console.log('[review] STEP 5: Sending employer email to:', letter.employer.signatory_email);
        const employerEmailRes = await fetch(`${baseUrl}/api/send-employer-letter-approved-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toEmail: letter.employer.signatory_email,
            signatoryName: letter.employer.signatory_name || 'there',
            ...sharedLetterPayload,
          }),
        });
        console.log('[review] STEP 5: Employer email API response status:', employerEmailRes.status);
      } catch (emailError) {
        console.error('[review] STEP 5 FAILED:', emailError);
      }
    } else {
      console.log('[review] STEP 5: SKIPPED — action is reject or no employer signatory_email');
    }

    // ── Emails to Agency + Agency Client (approve only, agency-sourced letters) ─
    // Schema confirmed:
    //   interest_letters.agency_id        → agency_profiles.id  (direct FK)
    //   interest_letters.agency_client_id → agency_clients.id   (direct FK)
    // Only fires when letter.agency_id is set. Does NOT touch employer block above.
    const agencyId       = (letter as any).agency_id;
    const agencyClientId = (letter as any).agency_client_id;

    console.log('[review] STEP 6: Agency check — action:', action, '| agency_id:', agencyId, '| agency_client_id:', agencyClientId);

    if (action === 'approve' && agencyId) {
      // Email to Agency — agency_id is a direct FK to agency_profiles.id
      console.log('[review] STEP 6a: Fetching agency_profiles WHERE id =', agencyId);
      try {
        const { data: agencyProfile, error: agencyProfileErr } = await supabaseService
          .from('agency_profiles')
          .select('contact_email, contact_name, agency_name')
          .eq('id', agencyId)
          .single();

        console.log('[review] STEP 6a: fetch error:', agencyProfileErr);
        console.log('[review] STEP 6a: agencyProfile:', agencyProfile);

        if (agencyProfile?.contact_email) {
          console.log('[review] STEP 6a: Sending agency email to:', agencyProfile.contact_email);
          const agencyEmailRes = await fetch(`${baseUrl}/api/send-employer-letter-approved-notification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              toEmail: agencyProfile.contact_email,
              signatoryName: agencyProfile.contact_name || agencyProfile.agency_name || 'there',
              ...sharedLetterPayload,
            }),
          });
          console.log('[review] STEP 6a: Agency email API status:', agencyEmailRes.status);
        } else {
          console.log('[review] STEP 6a: SKIPPED — no contact_email on agency_profiles row');
        }
      } catch (emailError) {
        console.error('[review] STEP 6a FAILED:', emailError);
      }

      // Email to Agency Client — agency_client_id is a direct FK to agency_clients.id
      console.log('[review] STEP 6b: agency_client_id check:', agencyClientId);
      if (agencyClientId) {
        try {
          console.log('[review] STEP 6b: Fetching agency_clients WHERE id =', agencyClientId);
          const { data: agencyClient, error: agencyClientErr } = await supabaseService
            .from('agency_clients')
            .select('signatory_email, signatory_name')
            .eq('id', agencyClientId)
            .single();

          console.log('[review] STEP 6b: fetch error:', agencyClientErr);
          console.log('[review] STEP 6b: agencyClient:', agencyClient);

          if (agencyClient?.signatory_email) {
            console.log('[review] STEP 6b: Sending agency client email to:', agencyClient.signatory_email);
            const clientEmailRes = await fetch(`${baseUrl}/api/send-employer-letter-approved-notification`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                toEmail: agencyClient.signatory_email,
                signatoryName: agencyClient.signatory_name || 'there',
                ...sharedLetterPayload,
              }),
            });
            console.log('[review] STEP 6b: Agency client email API status:', clientEmailRes.status);
          } else {
            console.log('[review] STEP 6b: SKIPPED — no signatory_email on agency_clients row');
          }
        } catch (emailError) {
          console.error('[review] STEP 6b FAILED:', emailError);
        }
      } else {
        console.log('[review] STEP 6b: SKIPPED — agency_client_id is null on this letter');
      }
    } else {
      console.log('[review] STEP 6: SKIPPED — action is reject or agency_id is null/undefined');
    }


    console.log('[review] ── END ────────────────────────────────────────');

    return NextResponse.json({
      success: true,
      message: `Letter ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      letterId,
      status: newStatus,
    });

  } catch (error) {
    console.error('[review] UNCAUGHT ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}