import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const O1_CRITERIA_PROMPT = `
You are an expert immigration attorney specializing in O-1 visas (Extraordinary Ability).
Analyze the provided document and classify it against the 8 USCIS O-1A criteria.

The 8 criteria keys and their meanings:
- "awards": Prizes or awards for excellence in the field of endeavor
- "membership": Membership in associations requiring outstanding achievement
- "media": Published material in professional/major trade publications or major media about the person
- "judging": Participation as a judge of the work of others in the same or allied field
- "contributions": Original scientific, scholarly, artistic, athletic, or business-related contributions of major significance
- "publications": Authorship of scholarly articles in professional journals or major media in the field
- "critical_role": Performance of a critical or essential role for organizations or establishments with distinguished reputations
- "salary": High salary or other remuneration commanding significantly above others in the field

Respond ONLY with a valid JSON object (no markdown fences, no explanation) in this exact format:
{
  "suggestions": [
    {
      "criterion": "<one of the 8 keys above>",
      "criterion_name": "<human readable name>",
      "confidence": <integer 0-100>,
      "reasoning": "<one sentence explaining why this criterion applies>"
    },
    {
      "criterion": "<second best match key>",
      "criterion_name": "<human readable name>",
      "confidence": <integer 0-100>,
      "reasoning": "<one sentence>"
    },
    {
      "criterion": "<third best match key>",
      "criterion_name": "<human readable name>",
      "confidence": <integer 0-100>,
      "reasoning": "<one sentence>"
    }
  ],
  "extraction_keywords": ["<key phrase 1>", "<key phrase 2>", "<key phrase 3>", "<key phrase 4>"]
}

Rules:
- Always return exactly 3 suggestions, ranked from highest to lowest confidence
- Each criterion key must be unique across the 3 suggestions
- If only 1-2 criteria clearly apply, set confidence below 30 for the remaining slots
- confidence must be an integer between 0 and 100
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
      max_tokens: 1024,
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

    // Parse and sort suggestions descending by confidence
    const suggestions: { criterion: string; criterion_name: string; confidence: number; reasoning: string }[] =
      Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
    suggestions.sort((a, b) => b.confidence - a.confidence);

    if (suggestions.length === 0) {
      return NextResponse.json({ error: 'No suggestions returned by AI' }, { status: 500 });
    }

    // Top suggestion drives backward-compatible top-level fields
    const top = suggestions[0];

    return NextResponse.json({
      success:             true,
      // Backward-compat fields (existing consumers unaffected)
      criterion:           top.criterion,
      confidence:          top.confidence,
      reasoning:           top.reasoning,
      criterion_name:      top.criterion_name,
      extraction_keywords: parsed.extraction_keywords || [],
      // New: full ranked list
      suggestions,
    });
  } catch (err) {
    console.error('classify-document error:', err);
    return NextResponse.json(
      { error: 'Classification failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}