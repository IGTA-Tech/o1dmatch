import { NextRequest, NextResponse } from 'next/server';
import { pdf } from '@react-pdf/renderer';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { InterestLetterPDF, InterestLetterData } from '@/lib/pdf/InterestLetterPDF';
import { CommitmentLevel } from '@/types/enums';
import React from 'react';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { letter_id } = body;

    if (!letter_id) {
      return NextResponse.json(
        { error: 'letter_id is required' },
        { status: 400 }
      );
    }

    // Get the letter with related data
    const { data: letter } = await adminSupabase
      .from('interest_letters')
      .select(`
        *,
        employer:employer_profiles(*),
        agency:agency_profiles(*),
        talent:talent_profiles(candidate_id, first_name, last_name)
      `)
      .eq('id', letter_id)
      .single();

    if (!letter) {
      return NextResponse.json(
        { error: 'Letter not found' },
        { status: 404 }
      );
    }

    // Verify user owns this letter (employer or agency)
    const isEmployer = letter.employer?.user_id === user.id;
    const isAgency = letter.agency?.user_id === user.id;

    if (!isEmployer && !isAgency) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Prepare data for PDF
    const source = letter.employer || letter.agency;

    const pdfData: InterestLetterData = {
      // Company Info
      companyName: source?.company_name || source?.agency_name || 'Company',
      legalName: source?.legal_name,
      streetAddress: source?.street_address,
      city: source?.city,
      state: source?.state,
      zipCode: source?.zip_code,
      country: source?.country,
      companyDescription: source?.company_description || source?.agency_description,

      // Signatory Info
      signatoryName: source?.signatory_name || source?.contact_name || 'Authorized Representative',
      signatoryTitle: source?.signatory_title,
      signatoryEmail: source?.signatory_email || source?.contact_email,
      signatoryPhone: source?.signatory_phone || source?.contact_phone,

      // Letter Details
      talentName: letter.talent
        ? `${letter.talent.first_name} ${letter.talent.last_name}`
        : 'Candidate',
      candidateId: letter.talent?.candidate_id || 'CAND-XXXXXX',
      commitmentLevel: letter.commitment_level as CommitmentLevel,
      jobTitle: letter.job_title,
      department: letter.department,
      salaryMin: letter.salary_min,
      salaryMax: letter.salary_max,
      salaryPeriod: letter.salary_period,
      engagementType: letter.engagement_type,
      startTiming: letter.start_timing,
      durationYears: letter.duration_years,
      workArrangement: letter.work_arrangement,
      locations: letter.locations,
      dutiesDescription: letter.duties_description,
      whyO1Required: letter.why_o1_required,

      // Generated
      letterDate: letter.sent_at || new Date().toISOString(),
      letterId: letter.id,
    };

    // Generate PDF
    const pdfDocument = React.createElement(InterestLetterPDF, { data: pdfData });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfInstance = pdf(pdfDocument as any);
    const pdfBlob = await pdfInstance.toBlob();
    const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer());

    // Upload to Supabase Storage
    const fileName = `letter-${letter.id}-${Date.now()}.pdf`;
    const storagePath = `letters/${letter.employer_id || letter.agency_id}/${fileName}`;

    const { error: uploadError } = await adminSupabase.storage
      .from('documents')
      .upload(storagePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('PDF upload error:', uploadError);
      throw new Error('Failed to upload PDF');
    }

    // Get public URL
    const { data: urlData } = adminSupabase.storage
      .from('documents')
      .getPublicUrl(storagePath);

    const pdfUrl = urlData.publicUrl;

    // Update letter with PDF URL
    await adminSupabase
      .from('interest_letters')
      .update({ pdf_url: pdfUrl })
      .eq('id', letter_id);

    // Return PDF directly if requested
    if (request.headers.get('Accept') === 'application/pdf') {
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        pdf_url: pdfUrl,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
