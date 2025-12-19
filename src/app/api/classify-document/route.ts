import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { O1Criterion, O1_CRITERIA } from '@/types/enums';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const CLASSIFICATION_PROMPT = `You are an expert O-1 visa document classifier. Analyze the following document content and classify it into one of the 8 O-1 visa criteria categories.

The 8 O-1 visa criteria are:
1. awards - Nationally or internationally recognized awards for excellence
2. memberships - Membership in associations requiring outstanding achievement
3. published_material - Published material about the person in major media
4. judging - Participation as a judge of others' work in the field
5. original_contributions - Original contributions of major significance
6. scholarly_articles - Authorship of scholarly articles in major publications
7. critical_role - Employment in a critical or essential capacity for distinguished organizations
8. high_salary - Command of a high salary or remuneration relative to others in the field

Based on the document, respond with a JSON object containing:
- criterion: The most applicable O-1 criterion (one of the 8 values listed above)
- confidence: Your confidence level (high, medium, or low)
- reasoning: A brief explanation of why this document fits the criterion
- score_impact: Estimated score impact (1-15) based on the strength of the evidence

Document content:
`;

interface ClassificationResult {
  criterion: O1Criterion;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  score_impact: number;
}

async function classifyWithOpenAI(content: string): Promise<ClassificationResult> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are an expert immigration document classifier specializing in O-1 visa applications. Respond only with valid JSON.',
      },
      {
        role: 'user',
        content: CLASSIFICATION_PROMPT + content,
      },
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  return {
    criterion: result.criterion as O1Criterion,
    confidence: result.confidence || 'medium',
    reasoning: result.reasoning || '',
    score_impact: result.score_impact || 5,
  };
}

async function classifyWithAnthropic(content: string): Promise<ClassificationResult> {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: CLASSIFICATION_PROMPT + content + '\n\nRespond with valid JSON only.',
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  const responseText = textBlock && 'text' in textBlock ? textBlock.text : '{}';

  // Extract JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  const result = JSON.parse(jsonMatch?.[0] || '{}');

  return {
    criterion: result.criterion as O1Criterion,
    confidence: result.confidence || 'medium',
    reasoning: result.reasoning || '',
    score_impact: result.score_impact || 5,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, title, description } = body;

    if (!content && !title) {
      return NextResponse.json(
        { error: 'Content or title is required' },
        { status: 400 }
      );
    }

    const documentText = `Title: ${title || 'Untitled'}\n${description ? `Description: ${description}\n` : ''}Content: ${content || 'No content available'}`;

    let result: ClassificationResult;

    // Try OpenAI first, fall back to Anthropic
    try {
      result = await classifyWithOpenAI(documentText);
    } catch (openaiError) {
      console.error('OpenAI classification failed, trying Anthropic:', openaiError);
      try {
        result = await classifyWithAnthropic(documentText);
      } catch (anthropicError) {
        console.error('Anthropic classification also failed:', anthropicError);
        throw new Error('Both AI providers failed');
      }
    }

    // Validate the criterion
    if (!O1_CRITERIA[result.criterion]) {
      // Default to a reasonable category if classification fails
      result.criterion = 'original_contributions';
      result.confidence = 'low';
      result.reasoning = 'Could not confidently classify the document';
      result.score_impact = 3;
    }

    return NextResponse.json({
      success: true,
      data: {
        criterion: result.criterion,
        criterion_name: O1_CRITERIA[result.criterion].name,
        confidence: result.confidence,
        reasoning: result.reasoning,
        score_impact: result.score_impact,
      },
    });
  } catch (error) {
    console.error('Classification error:', error);
    return NextResponse.json(
      { error: 'Failed to classify document' },
      { status: 500 }
    );
  }
}
