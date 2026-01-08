import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { sendEmail, interestLetterReceived, letterResponse } from '@/lib/email';
import { COMMITMENT_LEVELS, CommitmentLevel } from '@/types/enums';
import { getEmployerUsageLimits, incrementLetterCount } from '@/lib/subscriptions/limits';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      talent_id,
      source_type,
      job_id,
      application_id,
      commitment_level,
      job_title,
      department,
      salary_min,
      salary_max,
      salary_period,
      salary_negotiable,
      engagement_type,
      start_timing,
      duration_years,
      work_arrangement,
      locations,
      duties_description,
      why_o1_required,
    } = body;

    // Validate required fields
    if (!talent_id || !commitment_level || !job_title || !duties_description || !why_o1_required) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const adminSupabase = await createAdminClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get employer profile
    const { data: employerProfile } = await supabase
      .from('employer_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Check for agency profile if not employer
    let agencyProfile = null;
    if (!employerProfile) {
      const { data: agency } = await supabase
        .from('agency_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      agencyProfile = agency;
    }

    if (!employerProfile && !agencyProfile) {
      return NextResponse.json(
        { error: 'Must be an employer or agency to send letters' },
        { status: 403 }
      );
    }

    // Check usage limits for employers
    if (employerProfile) {
      const limits = await getEmployerUsageLimits(user.id);
      if (!limits.canSendLetter) {
        return NextResponse.json(
          {
            error: 'Letter limit reached',
            message: `You have used all ${limits.maxLettersPerMonth} letters for this month. Upgrade your plan to send more.`,
            limits: {
              sent: limits.lettersSentThisMonth,
              max: limits.maxLettersPerMonth,
              tier: limits.tier,
            },
          },
          { status: 403 }
        );
      }
    }

    // Get talent profile to verify they exist
    const { data: talentProfile } = await adminSupabase
      .from('talent_profiles')
      .select('id, candidate_id, first_name, last_name, email')
      .eq('id', talent_id)
      .single();

    if (!talentProfile) {
      return NextResponse.json(
        { error: 'Talent not found' },
        { status: 404 }
      );
    }

    // Create the interest letter
    const letterData = {
      talent_id,
      employer_id: employerProfile?.id || null,
      agency_id: agencyProfile?.id || null,
      source_type,
      job_id: job_id || null,
      application_id: application_id || null,
      commitment_level,
      job_title,
      department: department || null,
      salary_min: salary_min || null,
      salary_max: salary_max || null,
      salary_period: salary_period || 'year',
      salary_negotiable: salary_negotiable || false,
      engagement_type: engagement_type || 'full_time',
      start_timing: start_timing || null,
      duration_years: duration_years || 3,
      work_arrangement: work_arrangement || 'on_site',
      locations: locations || [],
      duties_description,
      why_o1_required,
      status: 'sent',
      sent_at: new Date().toISOString(),
    };

    const { data: letter, error: letterError } = await adminSupabase
      .from('interest_letters')
      .insert(letterData)
      .select()
      .single();

    if (letterError) {
      throw letterError;
    }

    // Increment letter count for employer
    if (employerProfile) {
      await incrementLetterCount(user.id);
    }

    // Update application status if this was from an application
    if (application_id) {
      await adminSupabase
        .from('job_applications')
        .update({ status: 'letter_sent' })
        .eq('id', application_id);
    }

    // Log activity
    await adminSupabase.from('activity_log').insert({
      user_id: user.id,
      action: 'letter_sent',
      entity_type: 'interest_letter',
      entity_id: letter.id,
      metadata: {
        talent_id,
        commitment_level,
        job_title,
      },
    });

    // Send email notification to talent
    const companyName = employerProfile?.company_name || agencyProfile?.agency_name || 'A company';
    const commitmentLevelInfo = COMMITMENT_LEVELS[commitment_level as CommitmentLevel];
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    try {
      await sendEmail({
        to: talentProfile.email,
        template: interestLetterReceived({
          talentName: talentProfile.first_name,
          companyName,
          jobTitle: job_title,
          commitmentLevel: commitmentLevelInfo?.name || commitment_level,
          dashboardUrl: `${baseUrl}/dashboard/talent/letters`,
        }),
      });
    } catch (emailError) {
      console.error('Failed to send interest letter notification:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      data: {
        letter_id: letter.id,
        status: letter.status,
        // Only reveal basic info, full reveal on acceptance
        talent_candidate_id: talentProfile.candidate_id,
      },
    });
  } catch (error) {
    console.error('Interest letter creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create interest letter' },
      { status: 500 }
    );
  }
}

// Handle letter response (accept/decline)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { letter_id, accept, message } = body;

    if (!letter_id || accept === undefined) {
      return NextResponse.json(
        { error: 'letter_id and accept are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const adminSupabase = await createAdminClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get talent profile
    const { data: talentProfile } = await supabase
      .from('talent_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!talentProfile) {
      return NextResponse.json(
        { error: 'Only talent can respond to letters' },
        { status: 403 }
      );
    }

    // Get the letter
    const { data: letter } = await adminSupabase
      .from('interest_letters')
      .select('*, talent:talent_profiles(*)')
      .eq('id', letter_id)
      .eq('talent_id', talentProfile.id)
      .single();

    if (!letter) {
      return NextResponse.json(
        { error: 'Letter not found' },
        { status: 404 }
      );
    }

    if (!['sent', 'viewed'].includes(letter.status)) {
      return NextResponse.json(
        { error: 'Letter has already been responded to' },
        { status: 400 }
      );
    }

    // Update letter status
    const newStatus = accept ? 'accepted' : 'declined';
    const { error: updateError } = await adminSupabase
      .from('interest_letters')
      .update({
        status: newStatus,
        responded_at: new Date().toISOString(),
        talent_response_message: message || null,
      })
      .eq('id', letter_id);

    if (updateError) {
      throw updateError;
    }

    // Log activity
    await adminSupabase.from('activity_log').insert({
      user_id: user.id,
      action: accept ? 'letter_accepted' : 'letter_declined',
      entity_type: 'interest_letter',
      entity_id: letter_id,
    });

    // If accepted, return revealed talent info
    let revealedInfo = null;
    if (accept && letter.talent) {
      revealedInfo = {
        first_name: letter.talent.first_name,
        last_name: letter.talent.last_name,
        email: letter.talent.email,
        phone: letter.talent.phone,
        linkedin_url: letter.talent.linkedin_url,
      };
    }

    // Get employer/agency info to send notification
    let employerEmail: string | null = null;
    let employerName = 'Employer';

    if (letter.employer_id) {
      const { data: employer } = await adminSupabase
        .from('employer_profiles')
        .select('signatory_email, signatory_name, company_name')
        .eq('id', letter.employer_id)
        .single();
      if (employer) {
        employerEmail = employer.signatory_email;
        employerName = employer.signatory_name || employer.company_name;
      }
    } else if (letter.agency_id) {
      const { data: agency } = await adminSupabase
        .from('agency_profiles')
        .select('contact_email, contact_name, agency_name')
        .eq('id', letter.agency_id)
        .single();
      if (agency) {
        employerEmail = agency.contact_email;
        employerName = agency.contact_name || agency.agency_name;
      }
    }

    // Send email to employer/agency
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (employerEmail) {
      try {
        await sendEmail({
          to: employerEmail,
          template: letterResponse({
            employerName,
            talentName: accept ? `${letter.talent.first_name} ${letter.talent.last_name}` : undefined,
            candidateId: letter.talent?.candidate_id || 'Unknown',
            jobTitle: letter.job_title,
            accepted: accept,
            talentEmail: accept ? letter.talent?.email : undefined,
            talentPhone: accept ? letter.talent?.phone : undefined,
            dashboardUrl: `${baseUrl}/dashboard/employer/letters`,
          }),
        });
      } catch (emailError) {
        console.error('Failed to send letter response notification:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        status: newStatus,
        revealed_info: revealedInfo,
      },
    });
  } catch (error) {
    console.error('Letter response error:', error);
    return NextResponse.json(
      { error: 'Failed to respond to letter' },
      { status: 500 }
    );
  }
}
