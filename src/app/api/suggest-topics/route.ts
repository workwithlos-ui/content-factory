import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brandProfile, industry } = body;

    const systemPrompt = `You are a content strategist who has generated $10M+ in attributed pipeline through organic content. You don't think in "topics." You think in "content that moves people closer to buying."

Given the user's Brand Intelligence Profile, generate 10 content ideas that are:

1. TIED TO A PAIN POINT: Each idea must address a specific problem their ideal customer has. Not a general industry topic. A specific frustration, fear, or desire.

2. POSITIONED AROUND THEIR WEDGE: Each idea should subtly (or overtly) position the user's approach as superior to the alternative.

3. MAPPED TO THE BUYER JOURNEY:
   - 3 ideas for AWARENESS (people who don't know they have the problem yet)
   - 4 ideas for CONSIDERATION (people who know the problem but are evaluating solutions)
   - 3 ideas for DECISION (people who are close to buying and need the final push)

4. FORMATTED AS SPECIFIC ANGLES, NOT GENERIC TOPICS:
   Bad: "The importance of AI in business"
   Good: "Why your $5,000/month AI tools are actually making your team 30% slower (and the 15-minute fix)"

5. EACH IDEA INCLUDES: The hook (first line), the framework to use, the key proof point, and which platform it's best suited for.

Generate ideas that make the user think "I NEED to write about this today."

IMPORTANT: Return ONLY valid JSON array. No markdown, no code blocks.`;

    const userPrompt = `BRAND INTELLIGENCE PROFILE:
${brandProfile ? JSON.stringify(brandProfile, null, 2) : 'No profile available'}

INDUSTRY: ${industry || 'General'}

Generate 10 topic ideas as a JSON array:
[
  {
    "hook": "The exact first line of the content",
    "angle": "2-sentence description of the strategic angle",
    "framework": "one of: pas, before-after-bridge, contrarian-proof, most-people-think, story-lesson-action, data-insight-application, question-answer-framework, myth-busting, step-by-step, case-study, prediction-preparation, old-way-new-way",
    "proofPoint": "The specific evidence or example to include",
    "bestPlatform": "one of: linkedin, twitter, email, blog, instagram, youtube, video-script",
    "buyerStage": "one of: awareness, consideration, decision"
  }
]

Return 3 awareness, 4 consideration, 3 decision stage ideas.`;

    const response = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 3000,
    });

    const raw = response.choices[0]?.message?.content || '[]';
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let topics;
    try {
      topics = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'Failed to parse topics', raw: cleaned }, { status: 500 });
    }

    return NextResponse.json({ topics });
  } catch (error: any) {
    console.error('Topic generation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate topics' }, { status: 500 });
  }
}
