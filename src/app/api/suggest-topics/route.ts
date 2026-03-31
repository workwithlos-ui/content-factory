import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brandProfile, industry, company, targetAudience } = body;

    const systemPrompt = `You are a content strategist who has generated $10M+ in attributed pipeline through organic content. You don't think in "topics." You think in "content that moves people closer to buying."

Given the user's Brand Intelligence Profile, generate 10 content ideas that are:

1. TIED TO A PAIN POINT: Each idea must address a specific problem their ideal customer has. Not a general industry topic. A specific frustration, fear, or desire from their profile.

2. POSITIONED AROUND THEIR WEDGE: Each idea should subtly (or overtly) position the user's approach as superior to the alternative. Use their competitive wedge.

3. MAPPED TO THE BUYER JOURNEY:
   - 3 ideas for AWARENESS (people who don't know they have the problem yet)
   - 4 ideas for CONSIDERATION (people who know the problem but are evaluating solutions)
   - 3 ideas for DECISION (people who are close to buying and need the final push)

4. FORMATTED AS SPECIFIC ANGLES, NOT GENERIC TOPICS:
   Bad: "The importance of AI in business"
   Good: "Why your $5,000/month AI tools are actually making your team 30% slower (and the 15-minute fix)"

5. EACH IDEA INCLUDES: The hook (first line that stops the scroll), the recommended framework, the key proof point, and which platform it's best suited for.

CRITICAL RULES:
- NEVER suggest fabricated case studies or fake data as proof points. Use real frameworks, methodologies, and processes.
- Every hook must be specific enough that the reader thinks "this is about ME."
- Proof points should reference real business principles, named frameworks, or the user's own positioning data.

Generate ideas that make the user think "I NEED to write about this today."

IMPORTANT: Return ONLY a valid JSON array. No markdown, no code blocks, no explanation.`;

    const userPrompt = `BRAND INTELLIGENCE PROFILE:
${brandProfile ? JSON.stringify(brandProfile, null, 2) : 'No profile available'}

COMPANY: ${company || 'Not specified'}
INDUSTRY: ${industry || 'General'}
TARGET AUDIENCE: ${targetAudience || 'Not specified'}

Generate 10 topic ideas as a JSON array. Use EXACTLY these field names:
[
  {
    "id": "topic-1",
    "hook": "The exact first line of the content - must be specific and scroll-stopping",
    "angle": "2-sentence description of the strategic angle and why it works for their positioning",
    "recommendedFramework": "one of: pas, before-after-bridge, contrarian-proof, most-people-think, story-lesson-action, data-insight-application, question-answer-framework, myth-busting, step-by-step, case-study, prediction-preparation, old-way-new-way",
    "keyProofPoint": "The specific real framework, methodology, or business principle to reference (NOT fabricated data)",
    "bestPlatform": "one of: linkedin, twitter, email, blog, instagram, youtube, video-script",
    "journeyStage": "one of: awareness, consideration, decision"
  }
]

Return 3 awareness, 4 consideration, 3 decision stage ideas. Number the ids as topic-1 through topic-10.`;

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

    let ideas;
    try {
      ideas = JSON.parse(cleaned);
    } catch {
      // Try to extract JSON array from the response
      const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        try {
          ideas = JSON.parse(arrayMatch[0]);
        } catch {
          return NextResponse.json({ error: 'Failed to parse topics', raw: cleaned }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: 'Failed to parse topics', raw: cleaned }, { status: 500 });
      }
    }

    // Normalize field names to match what the frontend expects
    const normalizedIdeas = (Array.isArray(ideas) ? ideas : []).map((idea: any, idx: number) => ({
      id: idea.id || `topic-${idx + 1}`,
      hook: idea.hook || idea.title || '',
      angle: idea.angle || idea.description || '',
      recommendedFramework: idea.recommendedFramework || idea.framework || 'story-lesson-action',
      keyProofPoint: idea.keyProofPoint || idea.proofPoint || '',
      bestPlatform: idea.bestPlatform || idea.platform || 'linkedin',
      journeyStage: idea.journeyStage || idea.buyerStage || idea.stage || 'awareness',
    }));

    // Return as "ideas" to match what the frontend expects
    return NextResponse.json({ ideas: normalizedIdeas });
  } catch (error: any) {
    console.error('Topic generation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate topics' }, { status: 500 });
  }
}
