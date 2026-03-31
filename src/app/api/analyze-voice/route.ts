import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { samples, interviewAnswers, existingProfile } = body;

    const systemPrompt = `You are a world-class linguistic analyst specializing in personal brand voice. You can identify the DNA of someone's communication style from a small sample.

Your analysis must be precise, specific, and based ONLY on what you observe in the provided content. Never fabricate or assume characteristics that aren't evident in the samples.

Analyze the provided content samples (or interview answers) and extract:

1. SENTENCE STRUCTURE: Average length, variation pattern, use of fragments vs complete sentences, rhetorical questions frequency. Give specific examples from their content.

2. VOCABULARY LEVEL: Simple (8th grade), conversational (college), technical (industry jargon), mixed. Identify specific words they use frequently (these are signature words to keep).

3. OPENING PATTERNS: How do they typically start? Bold claim? Question? Story? Data point? Observation? Cite specific examples from their content.

4. REASONING STYLE: Do they use analogies? Data? Logical arguments? Appeals to authority? Identify their primary and secondary persuasion modes with examples.

5. ENERGY SIGNATURE: Rate each on a 1-10 scale:
   - Calm authority (McKinsey partner)
   - High energy (Gary Vee)
   - Provocative challenger (contrarian)
   - Empathetic guide (therapist)
   - Technical expert (professor)
   Pick the dominant one and describe it.

6. FORBIDDEN PATTERNS: Words, phrases, or structures they NEVER use based on the samples. Always include these universal forbidden patterns: em dashes, "In today's fast-paced world", "Game-changer", "Unlock", "Leverage", "Synergy", "At the end of the day", "It's no secret that".

7. SIGNATURE MOVES: Unique patterns that make their content recognizable. Maybe they always end with a question. Maybe they use a specific transition phrase. Maybe they bold their key insight. Be specific.

8. EMOTIONAL RANGE: What emotions do they express? Frustration? Excitement? Humor? Vulnerability? What do they lean into vs avoid?

9. CONFIDENCE SCORE: How confident are you in this analysis? 0-100. More samples = higher confidence.

Output a Voice DNA Profile as JSON.

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks.`;

    const contentToAnalyze = samples?.length
      ? `CONTENT SAMPLES (${samples.length} provided):\n${samples.map((s: string, i: number) => `--- Sample ${i + 1} ---\n${s}`).join('\n\n')}`
      : interviewAnswers
        ? `INTERVIEW ANSWERS:\n${Object.entries(interviewAnswers).map(([k, v]) => `Q: ${k}\nA: ${v}`).join('\n\n')}`
        : 'No content provided';

    const existingContext = existingProfile
      ? `\n\nEXISTING BRAND PROFILE CONTEXT:\n- Positioning: ${existingProfile.positioningStatement || 'N/A'}\n- Industry context: This person works in ${existingProfile.industry || 'their industry'}\n- Use this context to better understand their vocabulary and references, but base voice analysis ONLY on the actual content samples.`
      : '';

    const response = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `${contentToAnalyze}${existingContext}\n\nReturn the Voice DNA Profile as JSON:\n{\n  "sentenceStructure": "detailed description with examples",\n  "vocabularyLevel": "simple/conversational/technical/mixed - with specific word examples",\n  "openingPatterns": ["pattern1 with example", "pattern2 with example"],\n  "reasoningStyle": "detailed description of how they persuade",\n  "energySignature": "dominant type + description",\n  "forbiddenPatterns": ["pattern1", "pattern2", "em dashes", "corporate buzzwords"],\n  "signatureMoves": ["move1 with example", "move2 with example"],\n  "emotionalRange": "description of emotional palette",\n  "summary": "2-3 sentence voice summary that captures their unique style",\n  "confidence": 75\n}` },
      ],
      temperature: 0.6,
      max_tokens: 2000,
    });

    const raw = response.choices[0]?.message?.content || '{}';
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let voiceDNA;
    try {
      voiceDNA = JSON.parse(cleaned);
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          voiceDNA = JSON.parse(jsonMatch[0]);
        } catch {
          return NextResponse.json({ error: 'Failed to parse voice DNA', raw: cleaned }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: 'Failed to parse voice DNA', raw: cleaned }, { status: 500 });
      }
    }

    return NextResponse.json({ voiceDNA });
  } catch (error: any) {
    console.error('Voice analysis error:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze voice' }, { status: 500 });
  }
}
