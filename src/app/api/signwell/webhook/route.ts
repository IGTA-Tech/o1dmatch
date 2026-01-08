import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyWebhookSignature, getSignedPdf, WebhookEvent } from '@/lib/signwell';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-signwell-signature') || '';

    // Verify webhook signature
    if (!verifyWebhookSignature(payload, signature)) {
      console.error('Invalid SignWell webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event: WebhookEvent = JSON.parse(payload);
    const adminSupabase = await createAdminClient();

    console.log('SignWell webhook event:', event.event_type, event.document_id);

    // Find the interest letter by SignWell document ID
    const { data: letter } = await adminSupabase
      .from('interest_letters')
      .select('id, talent_id, employer_id')
      .eq('signwell_document_id', event.document_id)
      .single();

    if (!letter) {
      console.warn('Letter not found for SignWell document:', event.document_id);
      // Return 200 to prevent retries for unknown documents
      return NextResponse.json({ success: true, message: 'Document not found' });
    }

    // Log the event
    await adminSupabase.from('signwell_events').insert({
      letter_id: letter.id,
      signwell_document_id: event.document_id,
      event_type: event.event_type,
      signer_email: event.signer_email,
      payload: event,
    });

    // Update letter status based on event
    switch (event.event_type) {
      case 'document.sent':
        await adminSupabase
          .from('interest_letters')
          .update({ signwell_status: 'sent' })
          .eq('id', letter.id);
        break;

      case 'document.viewed':
        await adminSupabase
          .from('interest_letters')
          .update({ signwell_status: 'viewed' })
          .eq('id', letter.id);
        break;

      case 'document.completed':
        // Get the signed PDF URL
        let signedPdfUrl = event.completed_pdf_url;
        if (!signedPdfUrl) {
          try {
            const pdfData = await getSignedPdf(event.document_id);
            signedPdfUrl = pdfData.pdf_url;
          } catch (pdfError) {
            console.error('Failed to get signed PDF:', pdfError);
          }
        }

        await adminSupabase
          .from('interest_letters')
          .update({
            signwell_status: 'signed',
            signed_pdf_url: signedPdfUrl,
            signature_completed_at: new Date().toISOString(),
            // Also update the main status to indicate it's fully signed
            status: 'signed',
          })
          .eq('id', letter.id);

        // Log activity
        await adminSupabase.from('activity_log').insert({
          user_id: null, // System action
          action: 'letter_signed',
          entity_type: 'interest_letter',
          entity_id: letter.id,
          metadata: {
            signwell_document_id: event.document_id,
            signed_pdf_url: signedPdfUrl,
          },
        });
        break;

      case 'signer.signed':
        // Individual signer has signed (but document may not be complete)
        await adminSupabase.from('activity_log').insert({
          user_id: null,
          action: 'signer_signed',
          entity_type: 'interest_letter',
          entity_id: letter.id,
          metadata: {
            signer_email: event.signer_email,
            signer_name: event.signer_name,
          },
        });
        break;

      case 'signer.declined':
        await adminSupabase
          .from('interest_letters')
          .update({ signwell_status: 'declined' })
          .eq('id', letter.id);

        await adminSupabase.from('activity_log').insert({
          user_id: null,
          action: 'signer_declined',
          entity_type: 'interest_letter',
          entity_id: letter.id,
          metadata: {
            signer_email: event.signer_email,
            signer_name: event.signer_name,
          },
        });
        break;

      case 'document.expired':
        await adminSupabase
          .from('interest_letters')
          .update({ signwell_status: 'expired' })
          .eq('id', letter.id);
        break;

      case 'document.cancelled':
        await adminSupabase
          .from('interest_letters')
          .update({ signwell_status: null, signwell_document_id: null })
          .eq('id', letter.id);
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('SignWell webhook error:', error);
    // Return 200 to prevent retries even on error
    return NextResponse.json({ success: false, error: 'Internal error' });
  }
}

// SignWell may send GET requests to verify the endpoint
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
