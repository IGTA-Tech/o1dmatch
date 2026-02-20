#!/usr/bin/env node

// ============================================================
// FILE: scripts/fetch-logos.mjs
// ============================================================
// Reads employers.csv → fetches company logos → saves to public/logo/
// → creates scripts/logo-mapping.csv with two columns:
//    Sponsor Organization, logo
//
// Usage:
//   node scripts/fetch-logos.mjs
//   node scripts/fetch-logos.mjs --dry-run
//   node scripts/fetch-logos.mjs --limit=5
// ============================================================

import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';

const args = process.argv.slice(2);
const getArg = (name) => {
  const arg = args.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.split('=').slice(1).join('=') : null;
};
const hasFlag = (name) => args.includes(`--${name}`);

const DRY_RUN = hasFlag('dry-run');
const LIMIT = getArg('limit') ? parseInt(getArg('limit')) : null;
const OUTPUT_DIR = getArg('output') || 'public/logo';
const CSV_PATH = getArg('csv') || 'scripts/employers.csv';

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
  'icloud.com', 'me.com', 'msn.com', 'live.com', 'comcast.net',
  'ymail.com', 'qq.com', 'mail.com', 'protonmail.com', 'zoho.com',
  'bitoini.com', 'rushmore.com',
]);

const DOMAIN_OVERRIDES = {
  'titan fc, llc': 'titanfighting.com',
  'midcoast tsernmen': null,
  'park slope united soccer llc': 'parkslopeunited.com',
  'rising tide academy': 'realjiujitsu.com',
  'bensalem soccer academy (celta academy pa)': 'celtaacademypa.org',
  'christopher bell racing llc': 'christopherbellracing.com',
  'brad sweet racing': 'bradsweetracing.com',
  'epic sports & entertainment, inc': null,
  'raleigh community athletics': null,
  'jzmma inc': null,
  'nemesis sports academy': null,
  '22 yards cricket club': null,
  'prvt athlete management llc': null,
  'keith kunz motorsport': 'keithkunzmotorsports.com',
  'apache dental management llc': null,
  'eventbrite, inc.': 'eventbrite.com',
  'redbubble, inc.': 'redbubble.com',
  'premier event management inc': null,
  'almg hospitality, llc': null,
  'glory international, inc': null,
  'the business of art center (dba: the manitou art center)': 'themanitouartcenter.org',
  'the new york chinese cultural center': 'nyccc.org',
  'first company management inc.': null,
  "ymha & ywha 92nd st. young men's & women's hebrew association": '92ny.org',
  'international intangible cultural heritage organization inc': null,
  'obda, llc': null,
  'dragonlegend entertainment inc': null,
  'threespace productions inc': null,
  'star zone entertainment, inc.': null,
  'empire entertainment, inc.': null,
  'cirque tacular entertainment llc': 'cirquetacular.com',
  'al entertainment group l.l.c.': null,
  'starmedia entertainment llc': null,
  'el george harris productions, llc': null,
  'viola entertainment, inc.': null,
  'sports pro development, llc': null,
  'us-china sports culture incorporation': null,
  'connecticut sports arena': null,
  'farm g & c inc.': null,
  'legacy fighting alliance (lfa)': 'lfafighting.com',
  'starfund inc': 'starfund.app',
  'sequoia games, inc.': 'sequoiagames.com',
  'lincoln holdings llc': 'monumentalsports.com',
  'key brand entertainment': 'broadwayacrossamerica.com',
  'st onge livestock': null,
  'rackleyw.a.r': 'rackleywar.com',
  'nyfg entertainment inc': null,
  'bis entertainment inc.': null,
  'world premiere events holdings, llc': null,
  'yyp entertainment': null,
  'latin plus entertainment corp': null,
  'global golf management, inc.': null,
  'asa entertainment group, llc': null,
  'needham partners llc': null,
  'subkulture entertainment, inc.': 'subkultureent.com',
  'yapsody entertainment inc.': 'yapsody.com',
  'two trees management co llc': 'twotreesny.com',
  'pensacola sports association': 'pensacolasports.org',
  'adventures in wonderland': null,
  'clear entertainment corp': null,
  'alem international management, inc.': null,
  'massimo gallotta productions, ltd.': null,
  'sjx partners, inc.': null,
  'chinese dragon sports club incorporation': null,
  'complete entertainment resources, llc': null,
  'artis contemporary israeli art fund, inc.': 'artis.art',
  'foodconnect media inc': null,
  'omaha sports commission': 'omahasports.org',
  'catfish entertainment llc': null,
  'sheik & beik entertainment': null,
  'phoenix arts management llc': null,
  'sports outreach institute, inc.': 'sportsoutreach.org',
  'foster mollison entertainment llc': null,
  'harama entertainment corp': null,
  'bond edutainment company': null,
  'hk media group llc': null,
  'mex-america entertainment group, inc': null,
  'prism partners llc': null,
  'skynet media llc': null,
  'event entertainment group, inc.': null,
  'resortsmart marketing and entertainment': null,
  'conventions, sports & leisure international, llc': 'cslintl.com',
  'ribbon productions llc': null,
  'rae entertainment group llc': null,
  'entertainment design group, inc.': null,
  'greater than entertainment llc': null,
  'piece by piece productions, inc.': null,
  'joeun entertainment, inc.': null,
};

// ── CSV Parser ──────────────────────────────────────────────
function parseCSV(text) {
  const firstLine = text.split('\n')[0];
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const delimiter = tabCount > commaCount ? '\t' : ',';

  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    if (inQuotes) {
      if (char === '"' && nextChar === '"') { currentField += '"'; i++; }
      else if (char === '"') { inQuotes = false; }
      else { currentField += char; }
    } else {
      if (char === '"') { inQuotes = true; }
      else if (char === delimiter) { currentRow.push(currentField.trim()); currentField = ''; }
      else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        currentRow.push(currentField.trim());
        if (currentRow.some(f => f !== '')) rows.push(currentRow);
        currentRow = []; currentField = '';
        if (char === '\r') i++;
      } else if (char === '\r') {
        currentRow.push(currentField.trim());
        if (currentRow.some(f => f !== '')) rows.push(currentRow);
        currentRow = []; currentField = '';
      } else { currentField += char; }
    }
  }
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(f => f !== '')) rows.push(currentRow);
  }
  while (rows.length > 0 && rows[rows.length - 1].every(f => f.trim() === '')) rows.pop();
  return rows;
}

// ── Helpers ─────────────────────────────────────────────────
function getDomain(companyName, email) {
  const key = companyName.toLowerCase().trim();
  if (DOMAIN_OVERRIDES[key] !== undefined) return DOMAIN_OVERRIDES[key];
  if (!email) return null;
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain || FREE_EMAIL_DOMAINS.has(domain)) return null;
  return domain;
}

function safeFilename(name) {
  return name.trim()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 60);
}

// ── Logo Fetchers ───────────────────────────────────────────
async function fetchClearbit(domain) {
  try {
    const r = await fetch(`https://logo.clearbit.com/${domain}`, { redirect: 'follow', signal: AbortSignal.timeout(8000) });
    if (r.ok) { const ct = r.headers.get('content-type') || ''; if (ct.includes('image')) { const buf = Buffer.from(await r.arrayBuffer()); if (buf.length > 500) return { buffer: buf, ext: ct.includes('svg') ? 'svg' : 'png', source: 'clearbit' }; } }
  } catch {} return null;
}
async function fetchGoogle(domain) {
  try {
    const r = await fetch(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`, { redirect: 'follow', signal: AbortSignal.timeout(8000) });
    if (r.ok) { const buf = Buffer.from(await r.arrayBuffer()); if (buf.length > 1000) return { buffer: buf, ext: 'png', source: 'google' }; }
  } catch {} return null;
}
async function fetchDirect(domain) {
  try {
    const r = await fetch(`https://${domain}/favicon.ico`, { redirect: 'follow', signal: AbortSignal.timeout(8000) });
    if (r.ok) { const ct = r.headers.get('content-type') || ''; if (ct.includes('image') || ct.includes('icon') || ct.includes('octet')) { const buf = Buffer.from(await r.arrayBuffer()); if (buf.length > 500) return { buffer: buf, ext: 'ico', source: 'favicon' }; } }
  } catch {} return null;
}
async function fetchLogo(domain) {
  return (await fetchClearbit(domain)) || (await fetchGoogle(domain)) || (await fetchDirect(domain)) || null;
}

// ── Main ────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  O1DMatch Company Logo Fetcher');
  console.log('═══════════════════════════════════════════════════\n');

  const fullCsvPath = resolve(process.cwd(), CSV_PATH);
  if (!existsSync(fullCsvPath)) { console.error(`❌ Not found: ${fullCsvPath}`); process.exit(1); }

  console.log(`📄 Reading: ${fullCsvPath}`);
  const rows = parseCSV(readFileSync(fullCsvPath, 'utf-8'));
  const headers = rows[0];
  const NAME_COL = headers.findIndex(h => h.toLowerCase().includes('sponsor'));
  const EMAIL_COL = headers.findIndex(h => h.toLowerCase() === 'email');

  let dataRows = rows.slice(1);
  if (LIMIT) dataRows = dataRows.slice(0, LIMIT);
  console.log(`   Rows: ${dataRows.length}\n`);

  const outputPath = resolve(process.cwd(), OUTPUT_DIR);
  if (!DRY_RUN) mkdirSync(outputPath, { recursive: true });

  // This will hold our mapping: [ { name, logoPath } ]
  const mapping = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const name = (row[NAME_COL] || '').trim();
    const email = (row[EMAIL_COL] || '').trim();
    const prefix = `[${String(i + 1).padStart(3)}/${dataRows.length}]`;

    if (!name) continue;

    const domain = getDomain(name, email);
    const filename = safeFilename(name);

    if (!domain) {
      console.log(`${prefix} ⚠️  ${name} — no domain`);
      mapping.push({ name, logoPath: '' });
      continue;
    }

    if (DRY_RUN) {
      console.log(`${prefix} 🔍 ${name} → ${domain}`);
      mapping.push({ name, logoPath: `/logo/${filename}.png` });
      continue;
    }

    process.stdout.write(`${prefix} 🔍 ${name} (${domain})... `);

    // Check disk cache
    const cachedExt = ['png', 'svg', 'ico'].find(ext => existsSync(join(outputPath, `${filename}.${ext}`)));
    if (cachedExt) {
      const p = `/logo/${filename}.${cachedExt}`;
      console.log(`⏭️  cached → ${p}`);
      mapping.push({ name, logoPath: p });
      continue;
    }

    const logo = await fetchLogo(domain);
    if (logo) {
      const logoFile = `${filename}.${logo.ext}`;
      writeFileSync(join(outputPath, logoFile), logo.buffer);
      const p = `/logo/${logoFile}`;
      console.log(`✅ ${(logo.buffer.length / 1024).toFixed(1)} KB (${logo.source}) → ${p}`);
      mapping.push({ name, logoPath: p });
    } else {
      console.log(`❌ not found`);
      mapping.push({ name, logoPath: '' });
    }

    await new Promise(r => setTimeout(r, 300));
  }

  // ── Write logo-mapping.csv ────────────────────────────────
  if (!DRY_RUN) {
    const csvLines = ['Sponsor Organization,logo'];
    for (const m of mapping) {
      // Quote company name if it contains commas
      const safeName = m.name.includes(',') ? `"${m.name}"` : m.name;
      csvLines.push(`${safeName},${m.logoPath}`);
    }
    const mappingPath = resolve(process.cwd(), 'scripts/logo-mapping.csv');
    writeFileSync(mappingPath, csvLines.join('\n') + '\n');
    console.log(`\n📋 Created: ${mappingPath}`);
  }

  // ── Summary ───────────────────────────────────────────────
  const found = mapping.filter(m => m.logoPath).length;
  const empty = mapping.filter(m => !m.logoPath).length;

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  📊 Total:    ${mapping.length}`);
  console.log(`  ✅ Found:    ${found}`);
  console.log(`  ❌ No logo:  ${empty}`);
  console.log('═══════════════════════════════════════════════════\n');
}

main().catch(err => { console.error('\n❌ Fatal error:', err); process.exit(1); });
