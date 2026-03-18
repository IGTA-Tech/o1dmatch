// src/app/api/letters/talent-response-notify/route.ts

import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Service role client — used to bypass RLS when inserting notifications
const supabaseService = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify talent is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { letterId, action } = body;

    if (!letterId || !action) {
      return NextResponse.json({ error: 'letterId and action are required' }, { status: 400 });
    }

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'action must be accept or decline' }, { status: 400 });
    }

    // Get letter with employer profile, talent profile, and agency info
    const { data: letter, error: letterError } = await supabase
      .from('interest_letters')
      .select(`
        id,
        job_title,
        commitment_level,
        engagement_type,
        work_arrangement,
        salary_min,
        salary_max,
        salary_negotiable,
        locations,
        start_timing,
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
          user_id,
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

    // Normalize joined relations — Supabase can return arrays or single objects
    // depending on FK direction; handle both to avoid TypeScript/runtime errors.
    const talent   = Array.isArray(letter.talent)   ? letter.talent[0]   : letter.talent;
    const employer = Array.isArray(letter.employer) ? letter.employer[0] : letter.employer;

    // Security: verify the caller is the talent on this letter
    if (talent?.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const sharedPayload = {
      jobTitle:        letter.job_title,
      companyName:     employer?.company_name || 'A company',
      commitmentLevel: letter.commitment_level  || '',
      engagementType:  letter.engagement_type   || '',
      workArrangement: letter.work_arrangement  || '',
      salaryMin:       letter.salary_min  ?? null,
      salaryMax:       letter.salary_max  ?? null,
      salaryNegotiable: letter.salary_negotiable ?? false,
      locations: Array.isArray(letter.locations)
        ? letter.locations.join(', ')
        : (letter.locations || ''),
      startTiming: letter.start_timing || '',
    };

    const talentName = talent
      ? `${talent.first_name} ${talent.last_name}`.trim()
      : 'The talent';

    // ── In-app notification to Employer ──────────────────────────────────────
    // Uses supabaseService to bypass RLS (inserting for employer's user_id, not talent's)
    if (employer?.user_id) {
      const notificationTitle = action === 'accept'
        ? `${talentName} accepted your interest letter!`
        : `${talentName} declined your interest letter`;

      const notificationMessage = action === 'accept'
        ? `${talentName} has accepted and signed your interest letter for the position of ${letter.job_title}. You can now view their signed letter.`
        : `${talentName} has declined your interest letter for the position of ${letter.job_title}.`;

      const { error: notificationError } = await supabaseService
        .from('notifications')
        .insert({
          user_id: employer.user_id,
          type: action === 'accept' ? 'letter_accepted' : 'letter_declined',
          title: notificationTitle,
          message: notificationMessage,
          data: {
            letter_id: letterId,
            talent_name: talentName,
            job_title: letter.job_title,
            action,
          },
        });

      if (notificationError) {
        console.error('[talent-response-notify] In-app notification error:', notificationError);
      } else {
        console.log('[talent-response-notify] In-app notification sent to employer user:', employer.user_id);
      }
    }

    // ── Email to Employer ─────────────────────────────────────────────────────
    if (employer?.signatory_email) {
      try {
        // For accept: reuse the signature-forwarded email (talent signed + forwarded directly)
        // For decline: use a generic talent-response notification email
        const emailEndpoint = action === 'accept'
          ? '/api/send-employer-signature-forwarded-notification'
          : '/api/send-employer-letter-declined-notification';

        await fetch(`${baseUrl}${emailEndpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toEmail:       employer.signatory_email,
            signatoryName: employer.signatory_name || 'there',
            talentName,
            ...sharedPayload,
          }),
        });

        console.log(`[talent-response-notify] Employer email sent to: ${employer.signatory_email}`);
      } catch (emailErr) {
        console.warn('[talent-response-notify] Employer email failed (non-critical):', emailErr);
      }
    }

    // ── Emails to Agency + Agency Client (if applicable) ─────────────────────
    const agencyId       = letter.agency_id;
    const agencyClientId = letter.agency_client_id;

    if (agencyId) {
      try {
        const { data: agencyProfile } = await supabaseService
          .from('agency_profiles')
          .select('contact_email, contact_name, agency_name')
          .eq('id', agencyId)
          .single();

        if (agencyProfile?.contact_email) {
          const emailEndpoint = action === 'accept'
            ? '/api/send-employer-signature-forwarded-notification'
            : '/api/send-employer-letter-declined-notification';

          await fetch(`${baseUrl}${emailEndpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              toEmail:       agencyProfile.contact_email,
              signatoryName: agencyProfile.contact_name || agencyProfile.agency_name || 'there',
              talentName,
              ...sharedPayload,
            }),
          });

          console.log('[talent-response-notify] Agency email sent to:', agencyProfile.contact_email);
        }
      } catch (err) {
        console.warn('[talent-response-notify] Agency email failed (non-critical):', err);
      }
    }

    if (agencyClientId) {
      try {
        const { data: agencyClient } = await supabaseService
          .from('agency_clients')
          .select('signatory_email, signatory_name, company_name')
          .eq('id', agencyClientId)
          .single();

        if (agencyClient?.signatory_email) {
          const emailEndpoint = action === 'accept'
            ? '/api/send-employer-signature-forwarded-notification'
            : '/api/send-employer-letter-declined-notification';

          await fetch(`${baseUrl}${emailEndpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              toEmail:       agencyClient.signatory_email,
              signatoryName: agencyClient.signatory_name || 'there',
              talentName,
              ...sharedPayload,
              companyName: agencyClient.company_name || sharedPayload.companyName,
            }),
          });

          console.log('[talent-response-notify] Agency client email sent to:', agencyClient.signatory_email);
        }
      } catch (err) {
        console.warn('[talent-response-notify] Agency client email failed (non-critical):', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Employer notified of talent ${action}`,
    });

  } catch (error) {
    console.error('[talent-response-notify] Uncaught error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}