// src/app/api/admin/letters/forward-signature/route.ts

import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

interface ForwardLetterRow {
  id: string;
  signature_status: string;
  talent_signature_data: string | null;
  agency_id: string | null;
  agency_client_id: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Use getSession instead of getUser to avoid type issues
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user;

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const {
      letterId,
      adminNotes,
      // Employer email details passed from the client
      employerEmail,
      employerSignatoryName,
      companyName,
      jobTitle,
      commitmentLevel,
      engagementType,
      workArrangement,
      salaryMin,
      salaryMax,
      salaryNegotiable,
      locations,
      startTiming,
    } = body;

    if (!letterId) {
      return NextResponse.json({ error: 'Letter ID is required' }, { status: 400 });
    }

    // Get the letter to verify it exists and has a signature pending review
    const { data: rawLetter, error: letterError } = await supabase
      .from('interest_letters')
      .select('id, signature_status, talent_signature_data, agency_id, agency_client_id')
      .eq('id', letterId)
      .single();

    const letter = rawLetter as ForwardLetterRow | null;

    if (letterError || !letter) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }

    if (letter.signature_status !== 'admin_reviewing') {
      return NextResponse.json(
        { error: 'This letter is not pending signature review' },
        { status: 400 }
      );
    }

    if (!letter.talent_signature_data) {
      return NextResponse.json(
        { error: 'No signature found on this letter' },
        { status: 400 }
      );
    }

    // Update the letter
    const updateData: Record<string, unknown> = {
      signature_status: 'forwarded_to_employer',
      signature_reviewed_at: new Date().toISOString(),
      signature_reviewed_by: user.id,
      forwarded_to_employer_at: new Date().toISOString(),
      // ADDED: This field is checked by employer page to reveal contact info
      employer_received_signed_at: new Date().toISOString(),
    };

    // Append admin notes if provided
    if (adminNotes) {
      // Get existing admin notes and append
      const { data: existingLetter } = await supabase
        .from('interest_letters')
        .select('admin_notes')
        .eq('id', letterId)
        .single();

      if (existingLetter?.admin_notes) {
        updateData.admin_notes = `${existingLetter.admin_notes}\n\n[Signature Review] ${adminNotes}`;
      } else {
        updateData.admin_notes = `[Signature Review] ${adminNotes}`;
      }
    }

    const { error: updateError } = await supabase
      .from('interest_letters')
      .update(updateData)
      .eq('id', letterId);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update letter' },
        { status: 500 }
      );
    }

    // ── Email to Employer ────────────────────────────────────────────────────
    if (employerEmail) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        await fetch(`${baseUrl}/api/send-employer-signature-forwarded-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toEmail: employerEmail,
            signatoryName: employerSignatoryName || 'there',
            companyName: companyName || 'Your Company',
            jobTitle: jobTitle || 'the position',
            commitmentLevel: commitmentLevel || '',
            engagementType: engagementType || '',
            workArrangement: workArrangement || '',
            salaryMin: salaryMin ?? null,
            salaryMax: salaryMax ?? null,
            salaryNegotiable: salaryNegotiable ?? false,
            locations: locations || '',
            startTiming: startTiming || '',
          }),
        });
      } catch (emailError) {
        // Don't fail the forward action if email fails
        console.error('[forward-signature] Failed to send employer email:', emailError);
      }
    }

    // ── Emails to Agency + Agency Client ────────────────────────────────────
    // Uses service role client to bypass RLS on agency_profiles and agency_clients.
    // Completely separate from employer block above — does not touch any existing code.
    const agencyId       = letter.agency_id;
    const agencyClientId = letter.agency_client_id;

    if (agencyId || agencyClientId) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

      const supabaseService = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Email to Agency
      if (agencyId) {
        try {
          const { data: agencyProfile, error: agencyProfileErr } = await supabaseService
            .from('agency_profiles')
            .select('contact_email, contact_name, agency_name')
            .eq('id', agencyId)
            .single();

          console.log('[forward-signature] agency_profiles fetch error:', agencyProfileErr);
          console.log('[forward-signature] agencyProfile:', agencyProfile);

          if (agencyProfile?.contact_email) {
            await fetch(`${baseUrl}/api/send-employer-signature-forwarded-notification`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                toEmail: agencyProfile.contact_email,
                signatoryName: agencyProfile.contact_name || agencyProfile.agency_name || 'there',
                companyName: companyName || 'Your Company',
                jobTitle: jobTitle || 'the position',
                commitmentLevel: commitmentLevel || '',
                engagementType: engagementType || '',
                workArrangement: workArrangement || '',
                salaryMin: salaryMin ?? null,
                salaryMax: salaryMax ?? null,
                salaryNegotiable: salaryNegotiable ?? false,
                locations: locations || '',
                startTiming: startTiming || '',
              }),
            });
            console.log('[forward-signature] Agency email sent to:', agencyProfile.contact_email);
          }
        } catch (emailError) {
          console.error('[forward-signature] Failed to send agency email:', emailError);
        }
      }

      // Email to Agency Client
      if (agencyClientId) {
        try {
          const { data: agencyClient, error: agencyClientErr } = await supabaseService
            .from('agency_clients')
            .select('signatory_email, signatory_name, company_name')
            .eq('id', agencyClientId)
            .single();

          console.log('[forward-signature] agency_clients fetch error:', agencyClientErr);
          console.log('[forward-signature] agencyClient:', agencyClient);

          if (agencyClient?.signatory_email) {
            await fetch(`${baseUrl}/api/send-employer-signature-forwarded-notification`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                toEmail: agencyClient.signatory_email,
                signatoryName: agencyClient.signatory_name || 'there',
                companyName: agencyClient.company_name || companyName || 'Your Company',
                jobTitle: jobTitle || 'the position',
                commitmentLevel: commitmentLevel || '',
                engagementType: engagementType || '',
                workArrangement: workArrangement || '',
                salaryMin: salaryMin ?? null,
                salaryMax: salaryMax ?? null,
                salaryNegotiable: salaryNegotiable ?? false,
                locations: locations || '',
                startTiming: startTiming || '',
              }),
            });
            console.log('[forward-signature] Agency client email sent to:', agencyClient.signatory_email);
          }
        } catch (emailError) {
          console.error('[forward-signature] Failed to send agency client email:', emailError);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error forwarding signature:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}