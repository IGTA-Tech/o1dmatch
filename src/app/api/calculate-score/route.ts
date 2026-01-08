import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { O1Criterion, O1_CRITERIA, getVisaStatus } from '@/types/enums';
import { EvidenceSummary } from '@/types/models';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { talent_id } = body;

    if (!talent_id) {
      return NextResponse.json(
        { error: 'talent_id is required' },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Get all verified documents for the talent
    const { data: documents, error: docError } = await supabase
      .from('talent_documents')
      .select('*')
      .eq('talent_id', talent_id)
      .eq('status', 'verified');

    if (docError) {
      throw docError;
    }

    // Calculate scores per criterion
    const criteriaScores: Record<O1Criterion, number> = {
      awards: 0,
      memberships: 0,
      published_material: 0,
      judging: 0,
      original_contributions: 0,
      scholarly_articles: 0,
      critical_role: 0,
      high_salary: 0,
    };

    const evidenceSummary: EvidenceSummary = {};
    const criteria = Object.keys(O1_CRITERIA) as O1Criterion[];
    const evidenceDocuments: Record<O1Criterion, string[]> = {
      awards: [],
      memberships: [],
      published_material: [],
      judging: [],
      original_contributions: [],
      scholarly_articles: [],
      critical_role: [],
      high_salary: [],
    };

    // Initialize evidence summary
    criteria.forEach((criterion) => {
      const criterionInfo = O1_CRITERIA[criterion];
      evidenceSummary[criterion] = {
        score: 0,
        max_score: criterionInfo.maxScore,
        met: false,
        evidence_count: 0,
        has: [],
        needs: criterionInfo.examples,
      };
    });

    // Sum up scores from verified documents
    documents?.forEach((doc) => {
      if (doc.criterion && doc.score_impact) {
        const criterion = doc.criterion as O1Criterion;
        const maxScore = O1_CRITERIA[criterion].maxScore;

        // Add score but cap at max for the criterion
        criteriaScores[criterion] = Math.min(
          criteriaScores[criterion] + doc.score_impact,
          maxScore
        );

        evidenceSummary[criterion]!.evidence_count += 1;
        evidenceDocuments[criterion].push(doc.title || doc.file_name);
      }
    });

    // Update evidence summary with final scores and met status
    criteria.forEach((criterion) => {
      const criterionInfo = O1_CRITERIA[criterion];
      const score = criteriaScores[criterion];
      evidenceSummary[criterion]!.score = score;
      evidenceSummary[criterion]!.met = score >= criterionInfo.threshold;
      evidenceSummary[criterion]!.has = evidenceDocuments[criterion];
    });

    // Calculate total score (sum of all criteria, max 100)
    const totalScore = Math.min(
      Object.values(criteriaScores).reduce((sum, score) => sum + score, 0),
      100
    );

    // Determine which criteria are met (score >= threshold)
    const criteriaMet: O1Criterion[] = criteria.filter(
      (criterion) => criteriaScores[criterion] >= O1_CRITERIA[criterion].threshold
    );

    // Get visa status based on score
    const { status: visaStatus } = getVisaStatus(totalScore);

    // Update talent profile
    const { error: updateError } = await supabase
      .from('talent_profiles')
      .update({
        o1_score: totalScore,
        visa_status: visaStatus,
        criteria_met: criteriaMet,
        evidence_summary: evidenceSummary,
        score_updated_at: new Date().toISOString(),
      })
      .eq('id', talent_id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      data: {
        o1_score: totalScore,
        visa_status: visaStatus,
        criteria_met: criteriaMet,
        evidence_summary: evidenceSummary,
        criteria_scores: criteriaScores,
      },
    });
  } catch (error) {
    console.error('Score calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate score' },
      { status: 500 }
    );
  }
}
