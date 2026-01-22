// src/app/api/letters/send-for-review/route.ts

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// You'll need to install: npm install nodemailer
// And add types: npm install -D @types/nodemailer
import nodemailer from 'nodemailer';

// Configure your email transporter
// For production, use a service like SendGrid, AWS SES, etc.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { letterId } = body;

    if (!letterId) {
      return NextResponse.json({ error: 'Letter ID is required' }, { status: 400 });
    }

    // Get employer profile
    const { data: employerProfile } = await supabase
      .from('employer_profiles')
      .select('id, company_name, signatory_name, signatory_email')
      .eq('user_id', user.id)
      .single();

    if (!employerProfile) {
      return NextResponse.json({ error: 'Employer profile not found' }, { status: 404 });
    }

    // Get letter details
    const { data: letter, error: letterError } = await supabase
      .from('interest_letters')
      .select(`
        *,
        talent:talent_profiles(
          id,
          first_name,
          last_name,
          user_id
        )
      `)
      .eq('id', letterId)
      .eq('employer_id', employerProfile.id)
      .single();

    if (letterError || !letter) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }

    // Update letter status to pending_review
    const { error: updateError } = await supabase
      .from('interest_letters')
      .update({
        admin_status: 'pending_review',
        status: 'pending_review',
        updated_at: new Date().toISOString(),
      })
      .eq('id', letterId);

    if (updateError) {
      console.error('Error updating letter:', updateError);
      return NextResponse.json({ error: 'Failed to update letter status' }, { status: 500 });
    }

    // Get admin email from settings
    const { data: adminSetting } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'admin_notification_email')
      .single();

    const adminEmail = adminSetting?.value || process.env.ADMIN_EMAIL || 'admin@example.com';

    // Get talent name
    const talentName = letter.talent 
      ? `${letter.talent.first_name} ${letter.talent.last_name}`
      : 'Unknown Talent';

    // Send email to admin
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const reviewUrl = `${appUrl}/dashboard/admin/letters/${letterId}`;

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@o1dmatch.com',
        to: adminEmail,
        subject: `[Review Required] New Interest Letter from ${employerProfile.company_name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e40af;">New Interest Letter Requires Review</h2>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Letter Details</h3>
              <p><strong>From Company:</strong> ${employerProfile.company_name}</p>
              <p><strong>Signatory:</strong> ${employerProfile.signatory_name}</p>
              <p><strong>To Talent:</strong> ${talentName}</p>
              <p><strong>Job Title:</strong> ${letter.job_title}</p>
              <p><strong>Commitment Level:</strong> ${letter.commitment_level}</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <div style="margin: 20px 0;">
              <a href="${reviewUrl}" 
                 style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Review Letter
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            
            <p style="color: #6b7280; font-size: 14px;">
              This email was sent from O1DMatch. Please review and approve/reject the letter.
            </p>
          </div>
        `,
        text: `
          New Interest Letter Requires Review
          
          From Company: ${employerProfile.company_name}
          Signatory: ${employerProfile.signatory_name}
          To Talent: ${talentName}
          Job Title: ${letter.job_title}
          
          Review at: ${reviewUrl}
        `,
      });

      console.log('Admin notification email sent successfully');
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Don't fail the request if email fails, letter is already updated
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Letter sent for review',
      letterId 
    });

  } catch (error) {
    console.error('Error in send-for-review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
