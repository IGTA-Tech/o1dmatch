#!/usr/bin/env node

// ============================================================
// FILE: scripts/import-employers.mjs
// ============================================================
// Standalone script to import employers from Google Sheet into O1DMatch
//
// Usage:
//   node scripts/import-employers.mjs
//
// Options:
//   --dry-run       Preview what would be imported without actually creating users
//   --batch=5       Number of records per API call (default: 5)
//   --start=0       Start from row index (0-based, skipping header)
//   --limit=10      Only process N records (for testing)
//   --api-url=URL   Override API URL (default: http://localhost:3000)
//
// Environment variables (or set in .env.local):
//   IMPORT_SECRET_KEY  - Must match the API route's key
//   API_BASE_URL       - Base URL of your Next.js app
//
// Prerequisites:
//   The Google Sheet must be publicly accessible (view access) OR
//   you can export it as CSV and place it at scripts/next62EmployerWithPreviousMissing.csv
// ============================================================

const SHEET_ID = '1mAdUNuSwJu-kTt8WraEzCPY-XXGyINaol3S19lXsdT0';
const SHEET_NAME = 'Employers to Post';
const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

// Parse CLI arguments
const args = process.argv.slice(2);
const getArg = (name) => {
  const arg = args.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : null;
};
const hasFlag = (name) => args.includes(`--${name}`);

const DRY_RUN = hasFlag('dry-run');
const BATCH_SIZE = parseInt(getArg('batch') || '5');
const START_INDEX = parseInt(getArg('start') || '0');
const LIMIT = getArg('limit') ? parseInt(getArg('limit')) : null;
const API_BASE_URL = getArg('api-url') || process.env.API_BASE_URL || 'http://localhost:3000';
const IMPORT_SECRET_KEY = process.env.IMPORT_SECRET_KEY || 'o1dmatch-import-2026';

// ============================================================
// CSV/TSV Parser (auto-detects delimiter, handles quoted fields)
// ============================================================
function parseCSV(text) {
  // Auto-detect delimiter: check first line for tabs vs commas
  const firstLine = text.split('\n')[0];
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const delimiter = tabCount > commaCount ? '\t' : ',';

  console.log(`   Detected delimiter: ${delimiter === '\t' ? 'TAB (TSV)' : 'COMMA (CSV)'}`);
  console.log(`   (tabs: ${tabCount}, commas: ${commaCount})\n`);

  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++; // Skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        currentRow.push(currentField.trim());
        if (currentRow.some(f => f !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
        if (char === '\r') i++; // Skip \n after \r
      } else {
        currentField += char;
      }
    }
  }

  // Don't forget the last field/row
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(f => f !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

// ============================================================
// Fetch Google Sheet as CSV
// ============================================================
async function fetchSheetData() {
  console.log('📊 Fetching Google Sheet data...');
  console.log(`   Sheet: ${SHEET_NAME}`);
  console.log(`   URL: ${SHEET_CSV_URL}\n`);

  let csvText;

  // Try fetching from Google Sheets first
  try {
    const response = await fetch(SHEET_CSV_URL);
    if (response.ok) {
      csvText = await response.text();
      console.log('✅ Successfully fetched from Google Sheets\n');
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (err) {
    console.log(`⚠️  Could not fetch from Google Sheets (${err.message})`);
    console.log('   Trying local CSV file at scripts/next62EmployerWithPreviousMissing.csv ...\n');

    // Fallback: try reading local CSV file
    try {
      const { readFileSync } = await import('fs');
      const { resolve } = await import('path');
      csvText = readFileSync(resolve(process.cwd(), 'scripts/next62EmployerWithPreviousMissing.csv'), 'utf-8');
      console.log('✅ Successfully loaded from local CSV file\n');
    } catch {
      console.error('❌ Could not find data source.');
      console.error('   Options:');
      console.error('   1. Make the Google Sheet publicly accessible (Viewer)');
      console.error('   2. Export as CSV and save to: scripts/next62EmployerWithPreviousMissing.csv');
      process.exit(1);
    }
  }

  return csvText;
}

// ============================================================
// Map spreadsheet row to employer record
// ============================================================
function mapRowToEmployer(row, headers) {
  // Column mapping based on the sheet structure:
  // A(0): Date Sent
  // B(1): Sponsor Organization
  // C(2): First Middle and Last name
  // D(3): Phone Number
  // E(4): Email
  // F(5): Employer Address
  // G(6): Title of Employer
  // H(7): Employers EIN Number TAX ID
  // I(8): How many employees
  // J(9): Previous P or O visa
  // K(10): Dates of Intended Employment
  // L(11): Year Established
  // M(12): Itinerary Questions
  // N(13): Source Row
  // O(14): Logo file path

  const get = (idx) => (row[idx] || '').trim();

  return {
    date_sent: get(0),
    company_name: get(1),
    full_name: get(2),
    phone: get(3),
    email: get(4),
    address: get(5),
    title: get(6),
    ein_number: get(7),
    num_employees: get(8),
    previous_visa: get(9),
    employment_dates: get(10),
    year_established: get(11),
    itinerary: get(12),
    source_row: get(13),
    logo: get(14),
  };
}

// ============================================================
// Read logo file and convert to base64
// ============================================================
async function readLogoAsBase64(logoPath) {
  if (!logoPath) return null;

  const { readFileSync, existsSync } = await import('fs');
  const { resolve, basename, extname } = await import('path');

  // Try multiple locations for the logo file
  const possiblePaths = [
    resolve(process.cwd(), 'public', logoPath.replace(/^\//, '')),  // public/logo/file.png
    resolve(process.cwd(), logoPath.replace(/^\//, '')),            // logo/file.png from root
    resolve(process.cwd(), 'public', logoPath),                     // public//logo/file.png (with leading /)
  ];

  for (const fullPath of possiblePaths) {
    if (existsSync(fullPath)) {
      try {
        const fileBuffer = readFileSync(fullPath);
        const base64 = fileBuffer.toString('base64');
        const filename = basename(fullPath);
        const ext = extname(fullPath).toLowerCase().replace('.', '');
        const mimeType = {
          png: 'image/png',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          gif: 'image/gif',
          svg: 'image/svg+xml',
          webp: 'image/webp',
        }[ext] || 'image/png';

        console.log(`   📷 Logo found: ${fullPath} (${(fileBuffer.length / 1024).toFixed(1)} KB)`);
        return { base64, filename, mimeType };
      } catch (err) {
        console.warn(`   ⚠️  Could not read logo file: ${fullPath} - ${err.message}`);
      }
    }
  }

  console.warn(`   ⚠️  Logo file not found for path: ${logoPath}`);
  console.warn(`      Tried: ${possiblePaths.join('\n             ')}`);
  return null;
}

// ============================================================
// Send batch to API
// ============================================================
async function sendBatch(records, batchNum) {
  const apiUrl = `${API_BASE_URL}/api/admin/import-employer`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-import-key': IMPORT_SECRET_KEY,
      },
      body: JSON.stringify(records),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error(`\n❌ Batch ${batchNum} failed: ${err.message}`);
    return {
      summary: { total: records.length, success: 0, skipped: 0, errors: records.length },
      results: records.map(r => ({
        email: r.email,
        company_name: r.company_name,
        status: 'error',
        message: err.message,
      })),
    };
  }
}

// ============================================================
// Main
// ============================================================
async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  O1DMatch Employer Import Script');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  API URL:     ${API_BASE_URL}`);
  console.log(`  Batch Size:  ${BATCH_SIZE}`);
  console.log(`  Start Index: ${START_INDEX}`);
  console.log(`  Limit:       ${LIMIT || 'ALL'}`);
  console.log(`  Dry Run:     ${DRY_RUN ? 'YES (no changes will be made)' : 'NO'}`);
  console.log('═══════════════════════════════════════════════════\n');

  // Step 1: Fetch sheet data
  const csvText = await fetchSheetData();
  const allRows = parseCSV(csvText);

  if (allRows.length < 2) {
    console.error('❌ Sheet appears empty or has only headers');
    process.exit(1);
  }

  const headers = allRows[0];
  console.log(`📋 Headers found: ${headers.slice(0, 6).join(' | ')} ...`);
  console.log(`📋 Total data rows: ${allRows.length - 1}\n`);

  // Step 2: Map rows to employer records (skip header)
  let dataRows = allRows.slice(1);

  // Apply start index and limit
  if (START_INDEX > 0) {
    dataRows = dataRows.slice(START_INDEX);
  }
  if (LIMIT) {
    dataRows = dataRows.slice(0, LIMIT);
  }

  const employers = dataRows.map(row => mapRowToEmployer(row, headers));

  // Filter out records without email
  const validEmployers = employers.filter(e => e.email && e.email.includes('@'));
  const skippedNoEmail = employers.length - validEmployers.length;

  console.log(`📊 Records to process: ${validEmployers.length}`);
  if (skippedNoEmail > 0) {
    console.log(`⚠️  Skipping ${skippedNoEmail} records with missing/invalid email\n`);

    // Show which ones are being skipped
    employers
      .filter(e => !e.email || !e.email.includes('@'))
      .forEach(e => {
        console.log(`   SKIP: "${e.company_name}" - no email`);
      });
    console.log('');
  }

  // Step 3a: Read logo files and attach base64 data
  const logosToProcess = validEmployers.filter(e => e.logo);
  if (logosToProcess.length > 0) {
    console.log(`📷 Reading ${logosToProcess.length} logo files...\n`);
    for (const emp of validEmployers) {
      if (emp.logo) {
        const logoData = await readLogoAsBase64(emp.logo);
        if (logoData) {
          emp.logo_base64 = logoData.base64;
          emp.logo_filename = logoData.filename;
          emp.logo_mime_type = logoData.mimeType;
        }
      }
    }
    console.log('');
  }

  // Step 3: Dry run preview
  if (DRY_RUN) {
    console.log('═══════════════════════════════════════════════════');
    console.log('  DRY RUN PREVIEW');
    console.log('═══════════════════════════════════════════════════\n');

    validEmployers.forEach((emp, i) => {
      console.log(`${String(i + 1).padStart(3)}. ${emp.company_name}`);
      console.log(`     Name:  ${emp.full_name}`);
      console.log(`     Email: ${emp.email}`);
      console.log(`     Phone: ${emp.phone || 'N/A'}`);
      console.log(`     Title: ${emp.title || 'N/A'}`);
      console.log(`     Addr:  ${emp.address || 'N/A'}`);
      console.log(`     EIN:   ${emp.ein_number || 'N/A'}`);
      console.log(`     Emps:  ${emp.num_employees || 'N/A'}`);
      console.log(`     Year:  ${emp.year_established || 'N/A'}`);
      console.log(`     Logo:  ${emp.logo || 'N/A'}${emp.logo_base64 ? ' ✅ (loaded)' : emp.logo ? ' ❌ (not found)' : ''}`);
      console.log('');
    });

    console.log(`\n✅ Dry run complete. ${validEmployers.length} records would be imported.`);
    console.log('   Run without --dry-run to actually import.\n');
    return;
  }

  // Step 4: Send in batches
  console.log('═══════════════════════════════════════════════════');
  console.log('  IMPORTING...');
  console.log('═══════════════════════════════════════════════════\n');

  const totalBatches = Math.ceil(validEmployers.length / BATCH_SIZE);
  let totalSuccess = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  const allResults = [];

  for (let i = 0; i < validEmployers.length; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const batch = validEmployers.slice(i, i + BATCH_SIZE);

    console.log(`📦 Batch ${batchNum}/${totalBatches} (${batch.length} records)...`);

    const response = await sendBatch(batch, batchNum);

    if (response.summary) {
      totalSuccess += response.summary.success;
      totalSkipped += response.summary.skipped;
      totalErrors += response.summary.errors;
    }

    // Print individual results
    if (response.results) {
      response.results.forEach(r => {
        const icon = r.status === 'success' ? '✅' : r.status === 'skipped' ? '⏭️ ' : '❌';
        console.log(`   ${icon} ${r.company_name} (${r.email}) - ${r.message}`);
      });
      allResults.push(...response.results);
    }

    console.log('');

    // Delay between batches
    if (i + BATCH_SIZE < validEmployers.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Step 5: Summary
  console.log('═══════════════════════════════════════════════════');
  console.log('  IMPORT COMPLETE');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  ✅ Success:  ${totalSuccess}`);
  console.log(`  ⏭️  Skipped:  ${totalSkipped}`);
  console.log(`  ❌ Errors:   ${totalErrors}`);
  console.log(`  📊 Total:    ${validEmployers.length}`);
  console.log('═══════════════════════════════════════════════════\n');

  // Save results to file
  const { writeFileSync } = await import('fs');
  const { resolve } = await import('path');
  const resultsPath = resolve(process.cwd(), 'scripts/import-results.json');
  writeFileSync(resultsPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: { totalSuccess, totalSkipped, totalErrors, total: validEmployers.length },
    results: allResults,
  }, null, 2));
  console.log(`📄 Results saved to: ${resultsPath}\n`);
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
