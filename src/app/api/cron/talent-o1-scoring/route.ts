import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const SCORING_API_BASE = (process.env.SCORING_API_BASE || 'https://uscis-scoring-tool-paid-production.up.railway.app/api/v1').trim();
const SCORING_API_KEY = (process.env.SCORING_API_KEY || '').trim();
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const CRON_SECRET = process.env.CRON_SECRET || '';

// Batch sizes to stay within 60s Vercel timeout
const NEW_SCORING_BATCH = 3;    // Create up to 3 new scoring sessions per run
const PENDING_CHECK_BATCH = 20; // Check up to 20 pending sessions per run

function getAdminClient() {
  return createSupabaseAdmin(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─── Helper: Call external scoring API ───
async function scoringApiFetch(path: string, options: RequestInit = {}) {
  const url = `${SCORING_API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${SCORING_API_KEY}`,
      ...(options.headers || {}),
    },
  });
  return res;
}

// ─── Helper: Download a file as a Blob ───
async function downloadFile(fileUrl: string): Promise<{ blob: Blob; filename: string } | null> {
  try {
    const res = await fetch(fileUrl);
    if (!res.ok) {
      console.error(`[cron/talent-scoring] Failed to download file: ${res.status} ${fileUrl}`);
      return null;
    }
    const blob = await res.blob();
    const urlPath = new URL(fileUrl).pathname;
    const filename = urlPath.split('/').pop() || 'document.pdf';
    return { blob, filename };
  } catch (err) {
    console.error(`[cron/talent-scoring] File download error:`, err);
    return null;
  }
}

// ─── PHASE A: Check pending scoring jobs for completed results ───
async function harvestResults(supabase: ReturnType<typeof getAdminClient>) {
  const results = { checked: 0, completed: 0, failed: 0, errors: [] as string[] };

  const { data: allJobs, error: fetchErr } = await supabase
    .from('talent_scoring_jobs')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(PENDING_CHECK_BATCH * 2);

  console.log(`[cron/talent-scoring] Phase A query result: ${allJobs?.length ?? 'null'} total jobs, error: ${fetchErr ? JSON.stringify(fetchErr) : 'none'}`);

  if (fetchErr) {
    console.error('[cron/talent-scoring] Failed to fetch jobs:', fetchErr);
    return results;
  }

  // Filter pending jobs in JS
  const pendingJobs = (allJobs || []).filter((j) => j.status === 'pending');
  console.log(`[cron/talent-scoring] Found ${pendingJobs.length} pending jobs out of ${allJobs?.length ?? 0} total`);

  if (pendingJobs.length === 0) {
    console.log('[cron/talent-scoring] No pending jobs to check.');
    return results;
  }

  console.log(`[cron/talent-scoring] Checking ${pendingJobs.length} pending jobs...`);

  for (const job of pendingJobs) {
    results.checked++;
    try {
      // Call external API to check session status
      const res = await scoringApiFetch(`/sessions/${job.session_id}`);
      const json = await res.json();

      const apiStatus = json?.data?.status || json?.status;
      const apiResults = json?.data?.results;

      console.log(`[cron/talent-scoring] Session ${job.session_id} API status: "${apiStatus}", hasResults: ${!!apiResults}, overallScore: ${apiResults?.overallScore ?? 'N/A'}`);

      if (apiStatus === 'completed' && apiResults?.overallScore != null) {
        const overallScore = Math.round(Number(apiResults.overallScore));
        console.log(`[cron/talent-scoring] ✅ SUCCESS - Session ${job.session_id} | Talent ${job.talent_id} | Score: ${overallScore}`);

        // Update talent_profiles.o1_score
        const { error: updateTalentErr } = await supabase
          .from('talent_profiles')
          .update({
            o1_score: overallScore,
            score_updated_at: new Date().toISOString(),
            criteria_met: mapCriteriaFromScores(apiResults.criteriaScores || []) as string[],
          })
          .eq('id', job.talent_id);

        if (updateTalentErr) {
          console.error(`[cron/talent-scoring] ❌ DB UPDATE FAILED - Talent ${job.talent_id} | Error: ${JSON.stringify(updateTalentErr)}`);
          results.errors.push(`${job.talent_id}: talent update failed`);
        } else {
          console.log(`[cron/talent-scoring] ✅ DB UPDATED - Talent ${job.talent_id} | o1_score set to ${overallScore}`);
        }

        // Mark job as completed
        await supabase
          .from('talent_scoring_jobs')
          .update({
            status: 'completed',
            overall_score: overallScore,
            criteria_scores: apiResults.criteriaScores || [],
            api_response: json,
            completed_at: new Date().toISOString(),
          })
          .eq('id', job.id);

        results.completed++;

      } else if (apiStatus === 'failed' || apiStatus === 'error') {
        const errorMsg = json?.data?.errorMessage || json?.data?.error || json?.error || 'Unknown error';
        console.error(`[cron/talent-scoring] ❌ SCORING FAILED - Session ${job.session_id} | Talent ${job.talent_id} | Reason: ${errorMsg}`);

        await supabase
          .from('talent_scoring_jobs')
          .update({
            status: 'failed',
            error_message: errorMsg,
            api_response: json,
            completed_at: new Date().toISOString(),
          })
          .eq('id', job.id);

        results.failed++;

      } else {
        // Still processing — check if job is too old (> 24 hours)
        const jobAge = Date.now() - new Date(job.created_at).getTime();
        const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

        if (jobAge > MAX_AGE_MS) {
          console.error(`[cron/talent-scoring] ⏱️ TIMEOUT - Session ${job.session_id} | Talent ${job.talent_id} | Age: ${Math.round(jobAge / 3600000)}h`);
          await supabase
            .from('talent_scoring_jobs')
            .update({
              status: 'failed',
              error_message: 'Scoring timed out after 24 hours',
              completed_at: new Date().toISOString(),
            })
            .eq('id', job.id);
          results.failed++;
        } else {
          console.log(`[cron/talent-scoring] Session ${job.session_id} still processing (${apiStatus}).`);
        }
      }

      // Rate limit protection
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.error(`[cron/talent-scoring] ❌ API CHECK ERROR - Session ${job.session_id} | ${err instanceof Error ? err.message : 'Unknown error'}`);
      results.errors.push(`${job.session_id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  return results;
}

// ─── PHASE B: Create new scoring sessions for talents needing scores ───
async function createNewScoringJobs(supabase: ReturnType<typeof getAdminClient>) {
  const results = { queued: 0, skipped: 0, errors: [] as string[] };

  // Find talents that have uploaded documents but don't have a pending scoring job
  const { data: allJobsForExclude } = await supabase
    .from('talent_scoring_jobs')
    .select('talent_id, status');

  const excludeIds = (allJobsForExclude || [])
    .filter((j) => j.status === 'pending')
    .map((j) => j.talent_id);
  console.log(`[cron/talent-scoring] Phase B: found ${excludeIds.length} pending jobs to exclude. IDs: ${JSON.stringify(excludeIds)}`);

  // Get distinct talent_ids from talent_documents
  const { data: talentIdsWithDocs, error: docQueryErr } = await supabase
    .from('talent_documents')
    .select('talent_id')
    .not('talent_id', 'is', null);

  if (docQueryErr) {
    console.error('[cron/talent-scoring] Failed to fetch talent_documents:', docQueryErr);
    return results;
  }

  // Deduplicate talent IDs
  const uniqueTalentIds = Array.from(new Set((talentIdsWithDocs || []).map((d) => d.talent_id)));

  // Filter out talents that already have pending jobs
  const eligibleIds = uniqueTalentIds.filter((id) => !excludeIds.includes(id));

  if (eligibleIds.length === 0) {
    console.log('[cron/talent-scoring] No talents with documents need scoring.');
    return results;
  }

  // Get talent profiles for eligible IDs, prioritize never-scored and oldest-scored
  const { data: talents, error: talentErr } = await supabase
    .from('talent_profiles')
    .select('id, first_name, last_name, o1_score, score_updated_at')
    .in('id', eligibleIds)
    .order('score_updated_at', { ascending: true, nullsFirst: true })
    .limit(NEW_SCORING_BATCH);

  if (talentErr) {
    console.error('[cron/talent-scoring] Failed to fetch talents:', talentErr);
    return results;
  }

  if (!talents || talents.length === 0) {
    console.log('[cron/talent-scoring] No talents need scoring.');
    return results;
  }

  console.log(`[cron/talent-scoring] Processing ${talents.length} talents for scoring...`);

  for (const talent of talents) {
    try {
      const talentName = `${talent.first_name} ${talent.last_name}`.trim();
      console.log(`[cron/talent-scoring] Scoring talent: ${talentName} (${talent.id})`);

      // 1. Fetch all documents for this talent
      const { data: documents, error: docsErr } = await supabase
        .from('talent_documents')
        .select('id, title, file_url, file_name, file_type')
        .eq('talent_id', talent.id)
        .order('created_at', { ascending: true });

      if (docsErr || !documents || documents.length === 0) {
        console.error(`[cron/talent-scoring] No documents found for talent ${talent.id}`);
        results.errors.push(`${talent.id}: no documents found`);
        results.skipped++;
        continue;
      }

      console.log(`[cron/talent-scoring] Found ${documents.length} documents for talent ${talent.id}`);

      // 2. Create scoring session
      const createRes = await scoringApiFetch('/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visaType: 'O-1A',
          documentType: 'full_petition',
          beneficiaryName: talentName,
        }),
      });
      const createJson = await createRes.json();

      if (!createJson.success || !(createJson.sessionId || createJson.data?.sessionId)) {
        console.error(`[cron/talent-scoring] Failed to create session for ${talent.id}. Status: ${createRes.status}. Response:`, JSON.stringify(createJson));
        results.errors.push(`${talent.id}: session creation failed - ${createJson.error?.message || createJson.error || createJson.message || JSON.stringify(createJson)}`);
        results.skipped++;
        continue;
      }

      const sessionId = createJson.sessionId || createJson.data?.sessionId;
      console.log(`[cron/talent-scoring] Created session ${sessionId} for talent ${talent.id}`);

      // 3. Download and upload each document to the session
      let uploadedCount = 0;
      for (const doc of documents) {
        try {
          const fileData = await downloadFile(doc.file_url);
          if (!fileData) {
            console.error(`[cron/talent-scoring] Could not download doc "${doc.title}" for talent ${talent.id}`);
            continue;
          }

          const formData = new FormData();
          formData.append('sessionId', sessionId);
          formData.append('document', fileData.blob, doc.file_name || fileData.filename);

          const uploadRes = await fetch(`${SCORING_API_BASE}/sessions/upload`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${SCORING_API_KEY}`,
            },
            body: formData,
          });
          const uploadJson = await uploadRes.json();

          if (uploadJson.success || uploadJson.data) {
            uploadedCount++;
            console.log(`[cron/talent-scoring] Uploaded "${doc.title}" (${uploadedCount}/${documents.length})`);
          } else {
            console.error(`[cron/talent-scoring] Failed to upload "${doc.title}":`, uploadJson);
          }

          // Small delay between uploads
          await new Promise((r) => setTimeout(r, 200));
        } catch (uploadErr) {
          console.error(`[cron/talent-scoring] Upload error for doc ${doc.id}:`, uploadErr);
        }
      }

      if (uploadedCount === 0) {
        console.error(`[cron/talent-scoring] ❌ UPLOAD FAILED - Talent ${talent.id} (${talentName}) | All ${documents.length} document uploads failed`);
        results.errors.push(`${talent.id}: all document uploads failed`);
        results.skipped++;
        continue;
      }

      console.log(`[cron/talent-scoring] Uploaded ${uploadedCount}/${documents.length} documents to session ${sessionId}`);

      // 4. Trigger scoring
      const scoreRes = await scoringApiFetch('/sessions/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const scoreJson = await scoreRes.json();

      if (!scoreRes.ok && scoreRes.status !== 202 && !scoreJson.success && !scoreJson.data) {
        console.error(`[cron/talent-scoring] Failed to trigger scoring for ${talent.id}:`, scoreJson);
        results.errors.push(`${talent.id}: scoring trigger failed`);
        results.skipped++;
        continue;
      }

      console.log(`[cron/talent-scoring] ✅ QUEUED - Talent ${talent.id} (${talentName}) | Session ${sessionId} | Docs uploaded: ${uploadedCount}/${documents.length}`);

      // 5. Track the job in talent_scoring_jobs
      const { error: insertErr } = await supabase
        .from('talent_scoring_jobs')
        .insert({
          talent_id: talent.id,
          session_id: sessionId,
          status: 'pending',
        });

      if (insertErr) {
        console.error(`[cron/talent-scoring] ❌ TRACKING INSERT FAILED - Talent ${talent.id} | Error: ${JSON.stringify(insertErr)}`);
        results.errors.push(`${talent.id}: tracking insert failed`);
      }

      results.queued++;

      // Rate limit between talents
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.error(`[cron/talent-scoring] ❌ ERROR - Talent ${talent.id} | ${err instanceof Error ? err.message : 'Unknown error'}`);
      results.errors.push(`${talent.id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      results.skipped++;
    }
  }

  return results;
}

// ─── Helper: Map criteria scores to O1 criterion enum values ───
function mapCriteriaFromScores(criteriaScores: Array<{ criterionName?: string; rating?: string; score?: number; [key: string]: unknown }>): string[] {
  // Only include criteria that are rated "strong" or "moderate" (score >= 50)
  const met: string[] = [];

  for (const c of criteriaScores) {
    const rating = (c.rating || '').toLowerCase();
    const score = c.score || 0;
    if (rating !== 'strong' && rating !== 'moderate' && score < 50) continue;

    const name = (c.criterionName || '').toLowerCase();
    let mapped: string | null = null;

    if (name.includes('award') || name.includes('prize')) mapped = 'awards';
    else if (name.includes('membership')) mapped = 'membership';
    else if (name.includes('press') || name.includes('media') || name.includes('published material')) mapped = 'press';
    else if (name.includes('judging') || name.includes('judge')) mapped = 'judging';
    else if (name.includes('original') || name.includes('contribution')) mapped = 'original_contributions';
    else if (name.includes('scholarly') || name.includes('authorship') || name.includes('publication')) mapped = 'scholarly_articles';
    else if (name.includes('exhibition') || name.includes('showcase')) mapped = 'exhibitions';
    else if (name.includes('leading') || name.includes('critical') || name.includes('role')) mapped = 'critical_role';
    else if (name.includes('salary') || name.includes('remuneration') || name.includes('compensation')) mapped = 'high_salary';
    else if (name.includes('commercial') || name.includes('success')) mapped = 'commercial_success';

    if (mapped) met.push(mapped);
  }

  return met;
}

// ─── MAIN CRON HANDLER ───
export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    console.error('[cron/talent-scoring] Unauthorized request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // phase=queue   → Phase B only (create new scoring jobs)
  // phase=harvest → Phase A only (check pending, update o1_score)
  // no param      → both phases (default)
  const phase = req.nextUrl.searchParams.get('phase');

  console.log('[cron/talent-scoring] Starting weekly talent O-1 scoring...');
  console.log(`[cron/talent-scoring] API Base: ${SCORING_API_BASE}`);
  console.log(`[cron/talent-scoring] API Key present: ${SCORING_API_KEY.length > 0} (${SCORING_API_KEY.substring(0, 8)}...)`);
  console.log(`[cron/talent-scoring] Phase: ${phase || 'all'}`);

  const supabase = getAdminClient();

  try {
    // Debug: check table state
    const { data: allJobs, error: countErr, count } = await supabase
      .from('talent_scoring_jobs')
      .select('id, talent_id, status, session_id', { count: 'exact' });
    console.log(`[cron/talent-scoring] DEBUG - Total rows in talent_scoring_jobs: ${count ?? allJobs?.length ?? 'null'}, error: ${countErr ? JSON.stringify(countErr) : 'none'}`);
    if (allJobs && allJobs.length > 0) {
      console.log(`[cron/talent-scoring] DEBUG - Sample rows:`, JSON.stringify(allJobs.slice(0, 3)));
    }

    let harvestReport = { checked: 0, completed: 0, failed: 0, errors: [] as string[] };
    let createReport = { queued: 0, skipped: 0, errors: [] as string[] };

    // Phase A: Check pending jobs and harvest completed results
    if (phase !== 'queue') {
      console.log('[cron/talent-scoring] === Phase A: Harvesting results ===');
      harvestReport = await harvestResults(supabase);
    }

    // Phase B: Create new scoring jobs for talents needing scores
    if (phase !== 'harvest') {
      console.log('[cron/talent-scoring] === Phase B: Creating new scoring jobs ===');
      createReport = await createNewScoringJobs(supabase);
    }

    const summary = {
      timestamp: new Date().toISOString(),
      phase: phase || 'all',
      harvest: harvestReport,
      newJobs: createReport,
    };

    // Structured log for Vercel
    console.log('========================================');
    console.log('[cron/talent-scoring] 📊 RUN SUMMARY');
    console.log(`  Phase: ${phase || 'all'}`);
    console.log(`  Harvest: checked=${harvestReport.checked} completed=${harvestReport.completed} failed=${harvestReport.failed} errors=${harvestReport.errors.length}`);
    console.log(`  New Jobs: queued=${createReport.queued} skipped=${createReport.skipped} errors=${createReport.errors.length}`);
    if (harvestReport.errors.length > 0) console.error(`  Harvest Errors: ${harvestReport.errors.join(' | ')}`);
    if (createReport.errors.length > 0) console.error(`  New Job Errors: ${createReport.errors.join(' | ')}`);
    console.log('========================================');
    return NextResponse.json({ success: true, summary });
  } catch (err) {
    console.error(`[cron/talent-scoring] 🔥 FATAL ERROR: ${err instanceof Error ? err.message : 'Unknown error'}`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}