import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import {
  extractDocumentText,
  determineAutoVerificationStatus,
} from '@/lib/extraction';
import { O1_CRITERIA, O1Criterion } from '@/types/enums';

// Internal function to call the classify-document endpoint
async function classifyDocument(
  content: string,
  title: string,
  origin: string
): Promise<{
  criterion: O1Criterion;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  score_impact: number;
}> {
  const response = await fetch(`${origin}/api/classify-document`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, title }),
  });

  if (!response.ok) {
    throw new Error('Classification failed');
  }

  const result = await response.json();
  return result.data;
}

// Convert confidence string to percentage
function confidenceToPercentage(
  confidence: 'high' | 'medium' | 'low'
): number {
  switch (confidence) {
    case 'high':
      return 90;
    case 'medium':
      return 70;
    case 'low':
      return 50;
    default:
      return 50;
  }
}

// Validate if criterion is valid O1Criterion
function isValidCriterion(criterion: string): criterion is O1Criterion {
  return Object.keys(O1_CRITERIA).includes(criterion);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get talent profile
    const { data: talentProfile } = await supabase
      .from('talent_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!talentProfile) {
      return NextResponse.json(
        { error: 'Talent profile not found' },
        { status: 404 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string | null;
    const userSelectedCriterion = formData.get('criterion') as string | null; // Get user-selected criterion

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Validate user-selected criterion if provided
    let validatedCriterion: O1Criterion | null = null;
    if (userSelectedCriterion && isValidCriterion(userSelectedCriterion)) {
      validatedCriterion = userSelectedCriterion;
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PDF, JPEG, PNG, GIF, WEBP' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique file path
    const fileExt = file.name.split('.').pop() || 'pdf';
    const fileName = `${talentProfile.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await adminSupabase.storage
      .from('evidence')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = adminSupabase.storage
      .from('evidence')
      .getPublicUrl(uploadData.path);

    const fileUrl = urlData.publicUrl;

    // Extract text from document
    const extractionResult = await extractDocumentText(buffer, file.type);

    if (!extractionResult.success || !extractionResult.text) {
      // Still save the document but mark it for manual review
      // Use user-selected criterion if provided
      const { data: document, error: insertError } = await adminSupabase
        .from('talent_documents')
        .insert({
          talent_id: talentProfile.id,
          title,
          file_name: file.name,
          description: description || null,
          file_url: fileUrl,
          file_type: file.type,
          file_size: file.size,
          status: 'pending',
          criterion: validatedCriterion, // Use user-selected criterion
          extraction_method: extractionResult.method,
          extraction_confidence: extractionResult.confidence,
          ai_notes: 'Text extraction failed - manual review required',
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        return NextResponse.json(
          { error: 'Failed to save document' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          document_id: document.id,
          status: 'pending',
          criterion: validatedCriterion,
          criterion_name: validatedCriterion ? O1_CRITERIA[validatedCriterion]?.name : null,
          message: 'Document uploaded but text extraction failed. Manual review required.',
          extraction: {
            success: false,
            error: extractionResult.error,
          },
        },
      });
    }

    // Classify the extracted text (AI will suggest a criterion)
    let classification;
    try {
      classification = await classifyDocument(
        extractionResult.text.substring(0, 15000), // Limit text length for API
        title,
        request.nextUrl.origin
      );
    } catch (classifyError) {
      console.error('Classification error:', classifyError);

      // Save document without AI classification, use user-selected criterion
      const { data: document, error: insertError } = await adminSupabase
        .from('talent_documents')
        .insert({
          talent_id: talentProfile.id,
          title,
          file_name: file.name,
          description: description || null,
          file_url: fileUrl,
          file_type: file.type,
          file_size: file.size,
          status: 'pending',
          criterion: validatedCriterion, // Use user-selected criterion
          extraction_method: extractionResult.method,
          extraction_confidence: extractionResult.confidence,
          extracted_text: extractionResult.text.substring(0, 50000),
          ai_notes: 'AI classification failed - manual review required',
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        return NextResponse.json(
          { error: 'Failed to save document' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          document_id: document.id,
          status: 'pending',
          criterion: validatedCriterion,
          criterion_name: validatedCriterion ? O1_CRITERIA[validatedCriterion]?.name : null,
          message: 'Document uploaded but classification failed. Manual review required.',
          extraction: {
            success: true,
            method: extractionResult.method,
            confidence: extractionResult.confidence,
          },
        },
      });
    }

    // Determine final criterion: user-selected takes priority, otherwise use AI classification
    const finalCriterion = validatedCriterion || classification.criterion;

    // Determine auto-verification status
    const classificationConfidence = confidenceToPercentage(classification.confidence);
    const autoStatus = determineAutoVerificationStatus(
      extractionResult.confidence,
      classificationConfidence,
      classification.score_impact
    );

    // Save document with classification
    const { data: document, error: insertError } = await adminSupabase
      .from('talent_documents')
      .insert({
        talent_id: talentProfile.id,
        title,
        file_name: file.name,
        description: description || null,
        file_url: fileUrl,
        file_type: file.type,
        file_size: file.size,
        status: autoStatus,
        criterion: finalCriterion, // Use user-selected or AI-classified criterion
        auto_classified_criterion: classification.criterion, // Store AI suggestion separately
        extraction_method: extractionResult.method,
        extraction_confidence: extractionResult.confidence,
        classification_confidence: classification.confidence, // This is enum: 'high', 'medium', 'low'
        extracted_text: extractionResult.text.substring(0, 50000),
        ai_reasoning: classification.reasoning,
        ai_notes:
          autoStatus === 'verified'
            ? 'Auto-verified based on high confidence extraction and classification'
            : autoStatus === 'needs_review'
              ? 'Awaiting manual review - medium confidence classification'
              : 'Pending review - low confidence extraction or classification',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save document' },
        { status: 500 }
      );
    }

    // If auto-verified, recalculate the talent's O-1 score
    if (autoStatus === 'verified') {
      try {
        await fetch(`${request.nextUrl.origin}/api/calculate-score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ talent_id: talentProfile.id }),
        });
      } catch (scoreError) {
        console.error('Score calculation error:', scoreError);
        // Don't fail the request if score calculation fails
      }
    }

    // Log activity
    await adminSupabase.from('activity_log').insert({
      user_id: user.id,
      action: 'document_uploaded',
      entity_type: 'talent_document',
      entity_id: document.id,
      metadata: {
        title,
        criterion: finalCriterion,
        user_selected_criterion: validatedCriterion,
        ai_classified_criterion: classification.criterion,
        auto_status: autoStatus,
        extraction_method: extractionResult.method,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        document_id: document.id,
        status: autoStatus,
        criterion: finalCriterion,
        criterion_name: O1_CRITERIA[finalCriterion]?.name,
        extraction: {
          success: true,
          method: extractionResult.method,
          confidence: extractionResult.confidence,
        },
        classification: {
          confidence: classification.confidence,
          reasoning: classification.reasoning,
          ai_suggested_criterion: classification.criterion,
          ai_suggested_criterion_name: O1_CRITERIA[classification.criterion]?.name,
        },
        message:
          autoStatus === 'verified'
            ? 'Document verified automatically!'
            : autoStatus === 'needs_review'
              ? 'Document uploaded and classified. Awaiting admin review.'
              : 'Document uploaded. Manual review required.',
      },
    });
  } catch (error) {
    console.error('Process document error:', error);
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    );
  }
}