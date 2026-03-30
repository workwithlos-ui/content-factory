import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { samples, interviewAnswers } = body;

    const systemPrompt = `You are a linguistic analyst specializing in personal brand voice. You can identify the DNA of someone's communication style from a small sample.

Analyze the provided content samples (or interview answers) and extract:

1. SENTENCE STRUCTURE: Average length, variation pattern, use of fragments vs complete sentences, rhetorical questions frequency.

2. VOCABULARY LEVEL: Simple (8th grade), conversational (college), technical (industry jargon), mixed. Identify specific words they overuse (these are signature words to keep).

3. OPENING PATTERNS: How do they typically start? Bold claim? Question? Story? Data point? Observation?

4. REASONING STYLE: Do they use analogies? Data? Stories? Logical arguments? Appeals to authority? Identify their primary and secondary persuasion modes.

5. ENERGY SIGNATURE: Calm authority (McKinsey partner), high energy (Gary Vee), provocative challenger (contrarian), empathetic guide (therapist), technical expert (professor). Rate each on a 1-10 scale and pick the dominant one.

6. FORBIDDEN PATTERNS: Words, phrases, or structures they NEVER use. These are just as important as what they do use. Always include: em dashes, "In today's fast-paced world", "Game-changer", "Unlock", "Leverage", "Synergy".

7. SIGNATURE MOVES: Unique patterns that make their content recognizable. Maybe they always end with a question. Maybe they use a specific transition phrase. Maybe they bold their key insight.

8. EMOTIONAL RANGE: Do they express frustration? Excitement? Humor? Vulnerability? What emotions do they lean into vs avoid?

Output a Voice DNA Profile as JSON.

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks.`;

    const contentToAnalyze = samples?.length
      ? `CONTENT SAMPLES:\n${samples.join('\n\n---\n\n')}`
      : interviewAnswers
        ? `INTERVIEW ANSWERS:\n${Object.entries(interviewAnswers).map(([k, v]) => `Q: ${k}\nA: ${v}`).join('\n\n')}`
        : 'No content provided';

    const response = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `${contentToAnalyze}\n\nReturn the Voice DNA Profile as JSON:\n{\n  "sentenceStructure": "description",\n  "vocabularyLevel": "simple/conversational/technical/mixed",\n  "openingPatterns": ["pattern1", "pattern2"],\n  "reasoningStyle": "description",\n  "energySignature": "dominant type + description",\n  "forbiddenPatterns": ["pattern1", "pattern2"],\n  "signatureMoves": ["move1", "move2"],\n  "emotionalRange": "description",\n  "summary": "2-3 sentence voice summary"\n}` },
      ],
      temperature: 0.6,
      max_tokens: 1500,
    });

    const raw = response.choices[0]?.message?.content || '{}';
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let voiceDNA;
    try {
      voiceDNA = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'Failed to parse voice DNA', raw: cleaned }, { status: 500 });
    }

    return NextResponse.json({ voiceDNA });
  } catch (error: any) {
    console.error('Voice analysis error:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze voice' }, { status: 500 });
  }
}
