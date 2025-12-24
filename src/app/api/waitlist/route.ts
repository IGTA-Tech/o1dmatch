import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendEmail, waitlistSignupAdmin, waitlistConfirmation } from '@/lib/email';

// Waitlist user types
type WaitlistUserType = 'talent' | 'employer' | 'agency' | 'lawyer';

interface WaitlistFormData {
  user_type: WaitlistUserType;
  email: string;
  full_name: string;
  phone?: string;

  // Talent fields
  current_job_title?: string;
  current_employer?: string;
  years_experience?: number;
  industry?: string;
  linkedin_url?: string;
  visa_status?: string;
  target_timeline?: string;

  // Employer fields
  company_name?: string;
  company_website?: string;
  company_size?: string;
  hiring_timeline?: string;
  roles_count?: number;

  // Agency fields
  agency_name?: string;
  agency_website?: string;
  clients_count?: number;

  // Lawyer fields
  firm_name?: string;
  bar_number?: string;
  o1_cases_handled?: number;
  specializations?: string[];

  // Common
  referral_source?: string;
  notes?: string;
  promo_code?: string;
}

export async function POST(request: NextRequest) {
  try {
    const adminSupabase = await createAdminClient();
    const body: WaitlistFormData = await request.json();

    // Validate required fields
    if (!body.email || !body.full_name || !body.user_type) {
      return NextResponse.json(
        { error: 'Email, full name, and user type are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate user type
    const validUserTypes: WaitlistUserType[] = ['talent', 'employer', 'agency', 'lawyer'];
    if (!validUserTypes.includes(body.user_type)) {
      return NextResponse.json(
        { error: 'Invalid user type' },
        { status: 400 }
      );
    }

    // Check if already on waitlist
    const { data: existingEntry } = await adminSupabase
      .from('waitlist')
      .select('id, status')
      .eq('email', body.email.toLowerCase())
      .eq('user_type', body.user_type)
      .single();

    if (existingEntry) {
      return NextResponse.json(
        {
          error: 'You are already on the waitlist!',
          status: existingEntry.status,
          alreadyExists: true
        },
        { status: 400 }
      );
    }

    // Prepare data for insertion
    const insertData = {
      user_type: body.user_type,
      email: body.email.toLowerCase(),
      full_name: body.full_name,
      phone: body.phone || null,

      // Talent fields
      current_job_title: body.current_job_title || null,
      current_employer: body.current_employer || null,
      years_experience: body.years_experience || null,
      industry: body.industry || null,
      linkedin_url: body.linkedin_url || null,
      visa_status: body.visa_status || null,
      target_timeline: body.target_timeline || null,

      // Employer fields
      company_name: body.company_name || null,
      company_website: body.company_website || null,
      company_size: body.company_size || null,
      hiring_timeline: body.hiring_timeline || null,
      roles_count: body.roles_count || null,

      // Agency fields
      agency_name: body.agency_name || null,
      agency_website: body.agency_website || null,
      clients_count: body.clients_count || null,

      // Lawyer fields
      firm_name: body.firm_name || null,
      bar_number: body.bar_number || null,
      o1_cases_handled: body.o1_cases_handled || null,
      specializations: body.specializations || null,

      // Common
      referral_source: body.referral_source || null,
      notes: body.notes || null,
      promo_code: body.promo_code || null,
    };

    // Insert into waitlist
    const { data: waitlistEntry, error: insertError } = await adminSupabase
      .from('waitlist')
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      console.error('Waitlist insert error:', insertError);
      throw insertError;
    }

    // Send confirmation email to user
    try {
      await sendEmail({
        to: body.email,
        template: waitlistConfirmation({
          name: body.full_name,
          userType: body.user_type,
          position: waitlistEntry.id ? 'early access' : undefined,
        }),
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    // Send notification to admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@o1dmatch.com';
      await sendEmail({
        to: adminEmail,
        template: waitlistSignupAdmin({
          userType: body.user_type,
          name: body.full_name,
          email: body.email,
          company: body.company_name || body.agency_name || body.firm_name || body.current_employer,
          priorityScore: waitlistEntry.priority_score,
        }),
      });
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the waitlist!',
      data: {
        id: waitlistEntry.id,
        position: waitlistEntry.priority_score,
      },
    });
  } catch (error) {
    console.error('Waitlist signup error:', error);
    return NextResponse.json(
      { error: 'Failed to join waitlist. Please try again.' },
      { status: 500 }
    );
  }
}

// GET - Check waitlist status (by email)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const adminSupabase = await createAdminClient();

    const { data: entries, error } = await adminSupabase
      .from('waitlist')
      .select('id, user_type, status, created_at')
      .eq('email', email.toLowerCase());

    if (error) throw error;

    if (!entries || entries.length === 0) {
      return NextResponse.json({
        onWaitlist: false,
        entries: [],
      });
    }

    return NextResponse.json({
      onWaitlist: true,
      entries: entries.map((entry) => ({
        id: entry.id,
        userType: entry.user_type,
        status: entry.status,
        joinedAt: entry.created_at,
      })),
    });
  } catch (error) {
    console.error('Waitlist check error:', error);
    return NextResponse.json(
      { error: 'Failed to check waitlist status' },
      { status: 500 }
    );
  }
}
