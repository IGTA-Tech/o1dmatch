// ============================================================
// FILE: src/app/api/admin/import-employer/route.ts
// ============================================================
// API endpoint to import employer records into Supabase
// Creates auth user → trigger creates profiles + employer_profiles → updates with extra fields
// 
// Usage: POST /api/admin/import-employer
// Headers: { "x-import-key": "<IMPORT_SECRET_KEY>" }
// Body: JSON array of employer records OR single employer object
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Use service role key to bypass RLS and use admin auth
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Simple secret key to protect this endpoint
const IMPORT_SECRET_KEY = process.env.IMPORT_SECRET_KEY || 'o1dmatch-import-2026';

interface EmployerRecord {
  // From spreadsheet columns
  date_sent?: string;              // A: Date Sent
  company_name: string;            // B: Sponsor Organization
  full_name: string;               // C: First Middle and Last name
  phone?: string;                  // D: Phone Number
  email: string;                   // E: Email
  address?: string;                // F: Employer Address
  title?: string;                  // G: Title of Employer
  ein_number?: string;             // H: EIN / Tax ID
  num_employees?: string;          // I: How many employees
  previous_visa?: string;          // J: Previous P or O visa
  employment_dates?: string;       // K: Dates of Intended Employment
  year_established?: string;       // L: Year Established
  itinerary?: string;              // M: Itinerary Questions
  source_row?: string;             // N: Source Row
  logo?: string;                   // O: Logo file path
  logo_base64?: string;            // Base64 encoded logo data (sent by script)
  logo_filename?: string;          // Original filename for the logo
  logo_mime_type?: string;         // MIME type of the logo (e.g. image/png)
}

interface ImportResult {
  email: string;
  company_name: string;
  status: 'success' | 'skipped' | 'error';
  message: string;
  user_id?: string;
}

// Parse address string into components
function parseAddress(address: string): {
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
} {
  if (!address) return {};

  // Try to parse common US address formats
  // e.g. "7309 Dover Lane, Parkland, FL 33067 USA"
  // e.g. "San Francisco, CA"
  // e.g. "New York, NY"

  const parts = address.split(',').map(p => p.trim());

  if (parts.length >= 3) {
    // Full address: "street, city, state zip country"
    const street_address = parts[0];
    const city = parts[1];
    const lastPart = parts[parts.length - 1].trim();

    // Parse "FL 33067 USA" or "CA 92886 United States" or "Virginia 20166 United States"
    const stateZipMatch = lastPart.match(/^([A-Za-z\s]+?)\s+(\d{5}(?:-\d{4})?)\s*(USA|United States|US)?$/i);
    if (stateZipMatch) {
      return {
        street_address,
        city,
        state: stateZipMatch[1].trim(),
        zip_code: stateZipMatch[2],
        country: 'USA',
      };
    }

    // Just state and country: "NC United States"
    const stateCountryMatch = lastPart.match(/^([A-Z]{2})\s+(USA|United States|US)$/i);
    if (stateCountryMatch) {
      return {
        street_address,
        city,
        state: stateCountryMatch[1],
        country: 'USA',
      };
    }

    return { street_address, city, country: 'USA' };
  }

  if (parts.length === 2) {
    // "City, ST" format
    const cityStateParts = parts;
    const stateMatch = cityStateParts[1].match(/^([A-Z]{2})$/);
    if (stateMatch) {
      return { city: cityStateParts[0], state: stateMatch[1], country: 'USA' };
    }
    return { city: cityStateParts[0], state: cityStateParts[1], country: 'USA' };
  }

  // Single value - treat as location
  return { city: address, country: 'USA' };
}

// Parse year from various formats
function parseYear(yearStr: string): number | null {
  if (!yearStr) return null;
  const match = yearStr.match(/(\d{4})/);
  if (match) return parseInt(match[1]);
  // Handle "4" → could mean 4 years ago
  const num = parseInt(yearStr);
  if (num > 0 && num < 100) return null; // Skip ambiguous small numbers
  return null;
}

// Upload logo to Supabase Storage and return public URL
async function uploadLogo(
  userId: string,
  base64Data: string,
  filename: string,
  mimeType: string = 'image/png'
): Promise<string | null> {
  try {
    // Convert base64 to Buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // Create a clean filename: userId/filename
    const ext = filename.split('.').pop() || 'png';
    const storagePath = `${userId}/logo.${ext}`;

    // Upload to Supabase Storage (bucket: "logos")
    const { error } = await supabaseAdmin.storage
      .from('logos')
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true, // overwrite if exists
      });

    if (error) {
      console.error(`Logo upload error for ${userId}:`, error.message);
      return null;
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('logos')
      .getPublicUrl(storagePath);

    return publicUrlData?.publicUrl || null;
  } catch (err) {
    console.error(`Logo upload exception for ${userId}:`, err);
    return null;
  }
}

async function importSingleEmployer(record: EmployerRecord): Promise<ImportResult> {
  const { email, company_name, full_name } = record;

  // Validate required fields
  if (!email || !email.includes('@')) {
    return {
      email: email || 'MISSING',
      company_name: company_name || 'UNKNOWN',
      status: 'skipped',
      message: 'Missing or invalid email address',
    };
  }

  if (!company_name) {
    return {
      email,
      company_name: 'MISSING',
      status: 'skipped',
      message: 'Missing company name',
    };
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = (full_name || '').trim();

  try {
    // Check if user already exists in profiles
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingProfile) {
      return {
        email: cleanEmail,
        company_name,
        status: 'skipped',
        message: `User already exists with id: ${existingProfile.id}`,
        user_id: existingProfile.id,
      };
    }

    // Note: createUser will also fail on duplicate emails, so profile check above is sufficient

    // Step 1: Create auth user via admin API (auto-confirmed)
    const tempPassword = `O1D_${crypto.randomUUID().slice(0, 16)}!`;

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: cleanName,
        role: 'employer',
        company_name: company_name.trim(),
      },
    });

    if (authError || !authData?.user) {
      return {
        email: cleanEmail,
        company_name,
        status: 'error',
        message: `Failed to create auth user: ${authError?.message || 'Unknown error'}`,
      };
    }

    const userId = authData.user.id;

    // Step 2: Wait a moment for the trigger to fire
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 3: Update profiles with additional fields
    const addressParts = parseAddress(record.address || '');
    const profileUpdates: Record<string, unknown> = {
      company_name: company_name.trim(),
      location: record.address?.trim() || null,
      industry: null,
      onboarding_completed: false,
      welcome_email_sent: false,
    };

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(profileUpdates)
      .eq('id', userId);

    if (profileError) {
      console.error(`Profile update error for ${cleanEmail}:`, profileError.message);
    }

    // Step 4: Update employer_profiles with detailed fields
    const yearFounded = parseYear(record.year_established || '');
    const employerUpdates: Record<string, unknown> = {
      company_name: company_name.trim(),
      signatory_name: cleanName || company_name.trim(),
      signatory_email: cleanEmail,
      signatory_phone: record.phone?.trim() || null,
      signatory_title: record.title?.trim() || null,
      company_size: record.num_employees?.trim() || null,
      year_founded: yearFounded,
      street_address: addressParts.street_address || null,
      city: addressParts.city || null,
      state: addressParts.state || null,
      zip_code: addressParts.zip_code || null,
      country: addressParts.country || 'USA',
    };

    const { error: employerError } = await supabaseAdmin
      .from('employer_profiles')
      .update(employerUpdates)
      .eq('user_id', userId);

    if (employerError) {
      console.error(`Employer profile update error for ${cleanEmail}:`, employerError.message);
    }

    // Step 5: Upload logo if provided
    let logoUrl: string | null = null;
    if (record.logo_base64 && record.logo_filename) {
      logoUrl = await uploadLogo(
        userId,
        record.logo_base64,
        record.logo_filename,
        record.logo_mime_type || 'image/png'
      );

      if (logoUrl) {
        // Update employer_profiles with logo URL
        const { error: logoError } = await supabaseAdmin
          .from('employer_profiles')
          .update({ company_logo_url: logoUrl })
          .eq('user_id', userId);

        if (logoError) {
          console.error(`Logo URL update error for ${cleanEmail}:`, logoError.message);
        } else {
          console.log(`Logo uploaded for ${cleanEmail}: ${logoUrl}`);
        }
      }
    }

    return {
      email: cleanEmail,
      company_name,
      status: 'success',
      message: `Created successfully${profileError ? ' (profile update had warnings)' : ''}${employerError ? ' (employer update had warnings)' : ''}${logoUrl ? ' (logo uploaded)' : record.logo_base64 ? ' (logo upload failed)' : ''}`,
      user_id: userId,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return {
      email: cleanEmail,
      company_name,
      status: 'error',
      message: `Exception: ${errorMessage}`,
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify import key
    const importKey = req.headers.get('x-import-key');
    if (importKey !== IMPORT_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized. Invalid import key.' }, { status: 401 });
    }

    const body = await req.json();

    // Accept single record or array
    const records: EmployerRecord[] = Array.isArray(body) ? body : [body];

    if (records.length === 0) {
      return NextResponse.json({ error: 'No records provided' }, { status: 400 });
    }

    // Process records sequentially to avoid race conditions
    const results: ImportResult[] = [];
    for (const record of records) {
      const result = await importSingleEmployer(record);
      results.push(result);

      // Small delay between records to not overwhelm auth
      if (records.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    const summary = {
      total: results.length,
      success: results.filter(r => r.status === 'success').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      errors: results.filter(r => r.status === 'error').length,
    };

    return NextResponse.json({ summary, results }, { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Import endpoint error:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// GET endpoint to check if the API is working
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Employer import API is ready. Send POST with employer records.',
    expected_format: {
      company_name: 'Required - Sponsor Organization',
      full_name: 'Required - Contact person name',
      email: 'Required - Contact email',
      phone: 'Optional - Phone number',
      address: 'Optional - Full address',
      title: 'Optional - Person title/role',
      ein_number: 'Optional - EIN/Tax ID',
      num_employees: 'Optional - Number of employees',
      year_established: 'Optional - Year founded',
      source_row: 'Optional - Reference row from spreadsheet',
      logo: 'Optional - Logo file path from spreadsheet',
      logo_base64: 'Optional - Base64 encoded logo image',
      logo_filename: 'Optional - Logo filename',
      logo_mime_type: 'Optional - Logo MIME type (default: image/png)',
    },
  });
}