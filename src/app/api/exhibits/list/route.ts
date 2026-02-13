import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
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

    const { data: employer } = await supabase
      .from('employer_profiles').select('id, company_name').eq('user_id', user.id).single();
    if (!employer) return NextResponse.json({ error: 'Employer profile not found' }, { status: 404 });

    let packages: any[] = [];
    try { const { data } = await supabase.from('exhibit_packages').select('*').eq('employer_id', employer.id).order('created_at', { ascending: false }); packages = data || []; } catch { packages = []; }

    let cases: any[] = [];
    try { const { data } = await supabase.from('petition_cases').select('id, beneficiary_name, visa_type, status').eq('employer_id', employer.id).order('created_at', { ascending: false }); cases = data || []; } catch { cases = []; }

    return NextResponse.json({ employerId: employer.id, companyName: employer.company_name || '', packages, cases });
  } catch (error: any) {
    console.error('Exhibits list error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}