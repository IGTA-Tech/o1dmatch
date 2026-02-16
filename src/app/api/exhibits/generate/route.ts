import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) { try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    const { data: employer } = await supabase
      .from('employer_profiles').select('id').eq('user_id', user.id).single();
    if (!employer) return NextResponse.json({ error: 'Employer not found' }, { status: 404 });

    // Verify the employer matches
    if (body.employerId && body.employerId !== employer.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const record = {
      employer_id: employer.id,
      case_id: body.caseId || null,
      name: body.name || 'Exhibit Package',
      status: body.status || 'completed',
      visa_type: body.visaType || null,
      numbering_style: body.numberingStyle || 'letters',
      beneficiary_name: body.beneficiaryName || null,
      total_exhibits: body.totalExhibits || 0,
      total_pages: body.totalPages || null,
      file_size: body.fileSize || null,
      download_url: body.downloadUrl || null,
      enable_toc: body.enableToc ?? true,
      enable_cover_pages: body.enableCoverPages ?? true,
      delivery_method: body.deliveryMethod || 'download',
      recipient_email: body.recipientEmail || null,
      drive_link: body.driveLink || null,
    };

    const { data: pkg, error: insertError } = await supabase
      .from('exhibit_packages')
      .insert(record)
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, packageId: pkg.id });
  } catch (error: unknown) {
    console.error('Generate save error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}