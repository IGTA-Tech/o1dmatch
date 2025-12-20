import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { sendEmail, applicationReceived } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get talent profile
    const { data: talentProfile } = await supabase
      .from('talent_profiles')
      .select('id, candidate_id, o1_score')
      .eq('user_id', user.id)
      .single();

    if (!talentProfile) {
      return NextResponse.json(
        { error: 'Talent profile not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { job_id, cover_letter } = body;

    if (!job_id) {
      return NextResponse.json(
        { error: 'job_id is required' },
        { status: 400 }
      );
    }

    // Check if job exists and is active
    const { data: job } = await adminSupabase
      .from('job_listings')
      .select('id, title, employer_id, status, min_score')
      .eq('id', job_id)
      .single();

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.status !== 'active') {
      return NextResponse.json(
        { error: 'This job is no longer accepting applications' },
        { status: 400 }
      );
    }

    // Check if already applied
    const { data: existingApp } = await supabase
      .from('job_applications')
      .select('id')
      .eq('job_id', job_id)
      .eq('talent_id', talentProfile.id)
      .single();

    if (existingApp) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 400 }
      );
    }

    // Create application
    const { data: application, error: appError } = await adminSupabase
      .from('job_applications')
      .insert({
        job_id,
        talent_id: talentProfile.id,
        employer_id: job.employer_id,
        cover_letter: cover_letter || null,
        status: 'submitted',
        score_at_application: talentProfile.o1_score || 0,
      })
      .select()
      .single();

    if (appError) {
      throw appError;
    }

    // Increment application count on job
    await adminSupabase.rpc('increment_applications', { job_id: job.id });

    // Log activity
    await adminSupabase.from('activity_log').insert({
      user_id: user.id,
      action: 'application_submitted',
      entity_type: 'job_application',
      entity_id: application.id,
      metadata: {
        job_id,
        job_title: job.title,
      },
    });

    // Send email notification to employer
    try {
      const { data: employer } = await adminSupabase
        .from('employer_profiles')
        .select('signatory_email, signatory_name, company_name')
        .eq('id', job.employer_id)
        .single();

      if (employer?.signatory_email) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        await sendEmail({
          to: employer.signatory_email,
          template: applicationReceived({
            employerName: employer.signatory_name || employer.company_name || 'Hiring Manager',
            candidateId: talentProfile.candidate_id,
            jobTitle: job.title,
            o1Score: talentProfile.o1_score || 0,
            dashboardUrl: `${baseUrl}/dashboard/employer/jobs`,
          }),
        });
      }
    } catch (emailError) {
      console.error('Failed to send application received email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      data: {
        application_id: application.id,
        status: application.status,
      },
    });
  } catch (error) {
    console.error('Application submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'talent';
    const status = searchParams.get('status');

    if (role === 'talent') {
      // Get talent profile
      const { data: talentProfile } = await supabase
        .from('talent_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!talentProfile) {
        return NextResponse.json(
          { error: 'Talent profile not found' },
          { status: 404 }
        );
      }

      let query = supabase
        .from('job_applications')
        .select(`
          *,
          job:job_listings(
            id,
            title,
            salary_min,
            salary_max,
            work_arrangement,
            locations,
            employer:employer_profiles(
              company_name,
              logo_url
            )
          )
        `)
        .eq('talent_id', talentProfile.id)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data: applications, error } = await query;

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: applications,
      });
    } else if (role === 'employer') {
      // Get employer profile
      const { data: employerProfile } = await supabase
        .from('employer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!employerProfile) {
        return NextResponse.json(
          { error: 'Employer profile not found' },
          { status: 404 }
        );
      }

      const jobId = searchParams.get('job_id');

      let query = supabase
        .from('job_applications')
        .select(`
          *,
          talent:talent_profiles(
            candidate_id,
            current_job_title,
            city,
            state,
            o1_score,
            visa_status,
            criteria_met
          ),
          job:job_listings(
            id,
            title
          )
        `)
        .eq('employer_id', employerProfile.id)
        .order('created_at', { ascending: false });

      if (jobId) {
        query = query.eq('job_id', jobId);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data: applications, error } = await query;

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: applications,
      });
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  } catch (error) {
    console.error('Applications fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { application_id, action } = body;

    if (!application_id || !action) {
      return NextResponse.json(
        { error: 'application_id and action are required' },
        { status: 400 }
      );
    }

    // Check if user is employer or talent
    const { data: employerProfile } = await supabase
      .from('employer_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const { data: talentProfile } = await supabase
      .from('talent_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // Get application
    const { data: application } = await adminSupabase
      .from('job_applications')
      .select('*')
      .eq('id', application_id)
      .single();

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (employerProfile) {
      if (application.employer_id !== employerProfile.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Employer actions: shortlist, reject, interview_requested
      if (!['shortlist', 'reject', 'interview_requested', 'under_review'].includes(action)) {
        return NextResponse.json(
          { error: 'Invalid action for employer' },
          { status: 400 }
        );
      }

      const statusMap: Record<string, string> = {
        shortlist: 'shortlisted',
        reject: 'rejected',
        interview_requested: 'interview_requested',
        under_review: 'under_review',
      };

      const newStatus = statusMap[action];

      const { error: updateError } = await adminSupabase
        .from('job_applications')
        .update({ status: newStatus })
        .eq('id', application_id);

      if (updateError) throw updateError;

      // Log activity
      await adminSupabase.from('activity_log').insert({
        user_id: user.id,
        action: `application_${action}`,
        entity_type: 'job_application',
        entity_id: application_id,
      });

      return NextResponse.json({
        success: true,
        data: { status: newStatus },
      });
    } else if (talentProfile) {
      if (application.talent_id !== talentProfile.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Talent actions: withdraw
      if (action !== 'withdraw') {
        return NextResponse.json(
          { error: 'Invalid action for talent' },
          { status: 400 }
        );
      }

      const { error: updateError } = await adminSupabase
        .from('job_applications')
        .update({ status: 'withdrawn' })
        .eq('id', application_id);

      if (updateError) throw updateError;

      // Log activity
      await adminSupabase.from('activity_log').insert({
        user_id: user.id,
        action: 'application_withdrawn',
        entity_type: 'job_application',
        entity_id: application_id,
      });

      return NextResponse.json({
        success: true,
        data: { status: 'withdrawn' },
      });
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch (error) {
    console.error('Application update error:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}
