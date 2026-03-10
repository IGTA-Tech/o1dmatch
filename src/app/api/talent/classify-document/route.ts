import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const O1_CRITERIA_PROMPT = `
You are an expert immigration attorney specializing in O-1 visas (Extraordinary Ability).
Analyze the provided document and classify it against the 8 USCIS O-1A criteria.

The 8 criteria keys and their meanings:
- "awards": Prizes or awards for excellence in the field
- "membership": Membership in associations requiring outstanding achievement
- "media": Published material/press coverage about the person
- "judging": Participation as a judge of others' work in the field
- "contributions": Original scientific, scholarly, or business-related contributions of major significance
- "publications": Authorship of scholarly articles in professional journals or major media
- "critical_role": Critical or leading role in distinguished organizations or establishments
- "salary": High salary or remuneration commanding significantly above others in the field

Respond ONLY with a JSON object in this exact format (no markdown, no explanation):
{
  "criterion": "<one of the 8 keys above>",
  "confidence": <integer 0-100>,
  "reasoning": "<one sentence explaining why>",
  "criterion_name": "<human readable name>",
  "extraction_keywords": ["<key phrase 1>", "<key phrase 2>", "<key phrase 3>"]
}

If the document does not clearly match any criterion, pick the closest one and set confidence below 50.
`.trim();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type as 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

    // Build content block based on file type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let contentBlock: any;

    if (mimeType === 'application/pdf') {
      contentBlock = {
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: base64 },
      };
    } else {
      // Image types
      contentBlock = {
        type: 'image',
        source: { type: 'base64', media_type: mimeType, data: base64 },
      };
    }

    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            contentBlock,
            { type: 'text', text: O1_CRITERIA_PROMPT },
          ],
        },
      ],
    });

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('');

    // Strip any accidental markdown fences
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json({
      success: true,
      criterion: parsed.criterion,
      confidence: parsed.confidence,
      reasoning: parsed.reasoning,
      criterion_name: parsed.criterion_name,
      extraction_keywords: parsed.extraction_keywords || [],
    });
  } catch (err) {
    console.error('classify-document error:', err);
    return NextResponse.json(
      { error: 'Classification failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}