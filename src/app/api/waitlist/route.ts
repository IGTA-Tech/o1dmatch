import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendEmail, waitlistAdminNotification } from '@/lib/email';

// Offers by category
const OFFERS: Record<string, string> = {
  talent: '50% off yearly subscription ($250/year instead of $500/year)',
  employer: '3 months FREE access',
  agency: '3 months FREE access',
  lawyer: '3 months FREE access',
};

// Notification email
const WAITLIST_EMAIL = 'waitlist@o1dmatch.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { category, email, full_name } = body;

    if (!category || !email || !full_name) {
      return NextResponse.json(
        { error: 'Missing required fields: category, email, full_name' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['talent', 'employer', 'agency', 'lawyer'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be: talent, employer, agency, or lawyer' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get admin client (bypasses RLS for insert)
    const supabase = await createAdminClient();

    // Extract UTM parameters from body
    const utmParams = {
      signup_source: body.signup_source || null,
      utm_source: body.utm_source || null,
      utm_medium: body.utm_medium || null,
      utm_campaign: body.utm_campaign || null,
    };

    // Build insert data based on category
    const insertData: Record<string, unknown> = {
      email: email.toLowerCase().trim(),
      full_name: full_name.trim(),
      category,
      ...utmParams,
    };

    // Add category-specific fields
    if (category === 'talent') {
      insertData.primary_field = body.primary_field || null;
      insertData.current_visa_status = body.current_visa_status || null;
      insertData.biggest_challenge = body.biggest_challenge || null;
      insertData.timeline_urgency = body.timeline_urgency || null;
    } else if (category === 'employer') {
      insertData.company_name = body.company_name || null;
      insertData.job_title = body.job_title || null;
      insertData.company_size = body.company_size || null;
      insertData.industry = body.industry || null;
      insertData.hiring_volume = body.hiring_volume || null;
      insertData.biggest_challenge = body.biggest_challenge || null;
    } else if (category === 'agency') {
      insertData.agency_name = body.agency_name || null;
      insertData.job_title = body.job_title || null;
      insertData.agency_size = body.agency_size || null;
      insertData.annual_placements = body.annual_placements || null;
      insertData.international_experience = body.international_experience || null;
      insertData.primary_industries = body.primary_industries || null;
      insertData.client_demand = body.client_demand || null;
    } else if (category === 'lawyer') {
      insertData.law_firm = body.law_firm || null;
      insertData.bar_state = body.bar_state || null;
      insertData.years_experience = body.years_experience || null;
      insertData.monthly_o1_cases = body.monthly_o1_cases || null;
      insertData.specializations = body.specializations || null;
      insertData.acquisition_challenge = body.acquisition_challenge || null;
      insertData.office_location = body.office_location || null;
    }

    // Insert into waitlist
    const { data, error } = await supabase
      .from('waitlist')
      .insert(insertData)
      .select('id, queue_position, category, email, full_name')
      .single();

    if (error) {
      // Check for duplicate entry
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This email is already on the waitlist for this category' },
          { status: 409 }
        );
      }
      console.error('Waitlist insert error:', error);
      return NextResponse.json(
        { error: 'Failed to join waitlist' },
        { status: 500 }
      );
    }

    // Send notification email to admin
    try {
      const offer = OFFERS[category] || 'Early access';

      // Build form data for email (exclude common fields already shown)
      const formData: Record<string, unknown> = {};
      const excludeFields = ['email', 'full_name', 'category', 'signup_source', 'utm_source', 'utm_medium', 'utm_campaign'];

      Object.entries(insertData).forEach(([key, value]) => {
        if (!excludeFields.includes(key) && value !== null) {
          formData[key] = value;
        }
      });

      await sendEmail({
        to: WAITLIST_EMAIL,
        template: waitlistAdminNotification({
          category,
          fullName: full_name,
          email,
          queuePosition: data.queue_position,
          formData,
          offer,
        }),
      });
    } catch (emailError) {
      // Log but don't fail the request if email fails
      console.error('Failed to send waitlist notification email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the waitlist!',
      data: {
        queue_position: data.queue_position,
        category: data.category,
        offer: OFFERS[category],
      },
    });
  } catch (error) {
    console.error('Waitlist API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
