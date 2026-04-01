import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

async function callClaude(system: string, user: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: user }],
      system,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Claude API error');
  return data.content?.[0]?.text || '{}';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { samples, interviewAnswers, existingProfile } = body;

    const systemPrompt = `You are a world-class linguistic analyst specializing in personal brand voice DNA extraction. Your job is to find the exact fingerprint of how someone writes — the patterns that make their content instantly recognizable.

ANALYSIS RULES:
- Base analysis ONLY on the actual provided samples or interview answers
- Never fabricate characteristics not evidenced in the content
- Be hyper-specific — quote exact phrases, words, structures you observe
- Identify what makes this person's writing DIFFERENT from generic AI content
- The output will be used to generate content that sounds exactly like this person
- Output ONLY valid JSON. No markdown, no code blocks, no preamble.`;

    const contentToAnalyze = samples?.length
      ? `CONTENT SAMPLES (${samples.length} provided):\n${samples
          .map((s: string, i: number) => `--- Sample ${i + 1} ---\n${s}`)
          .join('\n\n')}`
      : interviewAnswers
      ? `INTERVIEW ANSWERS:\n${Object.entries(interviewAnswers)
          .map(([k, v]) => `Q: ${k}\nA: ${v}`)
          .join('\n\n')}`
      : 'No content provided - generate a generic professional voice profile.';

    const existingContext = existingProfile
      ? `\n\nEXISTING BRAND PROFILE CONTEXT:\n- Positioning: ${existingProfile.positioningStatement || 'N/A'}\n- Industry: ${existingProfile.industry || 'N/A'}\n- Use this to better understand their vocabulary and references.`
      : '';

    const userPrompt = `${contentToAnalyze}${existingContext}

Analyze this content and extract a complete Voice DNA Profile. Be forensically specific.

Return as JSON:
{
  "sentenceStructure": "Exact description: avg sentence length, fragment usage, question frequency. Quote 1-2 examples directly from their content.",
  "vocabularyLevel": "simple/conversational/technical/mixed. List 5-8 SPECIFIC words they use frequently that are signature to them.",
  "openingPatterns": ["Pattern 1 with direct example from content", "Pattern 2 with example", "Pattern 3 with example"],
  "reasoningStyle": "How do they persuade? Analogies? Data? Direct assertion? Storytelling? Describe their primary method with an example.",
  "energySignature": "One of: Calm Authority / High Energy / Provocative Challenger / Empathetic Guide / Technical Expert. Plus 2-sentence description.",
  "forbiddenPatterns": ["pattern they never use 1", "pattern they never use 2", "em dashes", "In today's fast-paced world", "Game-changer", "Leverage", "Synergy", "Unlock", "Paradigm shift"],
  "signatureMoves": ["Specific unique pattern 1 with example", "Specific unique pattern 2 with example", "Specific unique pattern 3"],
  "emotionalRange": "What emotions do they express or avoid? Specific description.",
  "toneDescriptors": ["descriptor1", "descriptor2", "descriptor3", "descriptor4", "descriptor5"],
  "summary": "2-3 sentences capturing their unique voice that could be used as a system prompt instruction.",
  "contentInstructions": "3-4 specific instructions for generating content in their voice. E.g. 'Always use short punchy sentences. Never use passive voice. Lead with the specific number or result.'",
  "confidence": 85
}`;

    const raw = await callClaude(systemPrompt, userPrompt);
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let voiceDNA;
    try {
      voiceDNA = JSON.parse(cleaned);
    } catch {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          voiceDNA = JSON.parse(jsonMatch[0]);
        } catch {
          return NextResponse.json(
            { error: 'Failed to parse voice DNA', raw: cleaned },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Failed to parse voice DNA', raw: cleaned },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ voiceDNA });
  } catch (error: any) {
    console.error('Voice analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze voice' },
      { status: 500 }
    );
  }
}
