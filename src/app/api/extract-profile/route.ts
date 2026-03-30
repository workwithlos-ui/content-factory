import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { answers, industry, company, targetAudience } = body;

    const systemPrompt = `You are a $50,000/year brand strategist conducting a discovery session. The user has answered basic questions about their business. Your job is to extract a complete Brand Intelligence Profile from their answers.

From their responses, identify and output a structured JSON with:

1. POSITIONING STATEMENT: One sentence that captures what they do differently. Format: "We help [specific audience] achieve [specific outcome] by [unique mechanism], unlike [competitors] who [what competitors do wrong]."

2. CORE PAIN POINTS (5): The specific, emotional problems their customers face BEFORE finding them. Not surface-level. The 2am-staring-at-the-ceiling problems. Use their "best customer" story to reverse-engineer these.

3. OBJECTION MAP (5): The real reasons people say no, paired with the reframe that overcomes each one. Use their "#1 reason people say no" answer as the anchor.

4. COMPETITIVE WEDGE: The specific thing competitors get wrong, turned into a positioning advantage. This becomes the foundation of contrarian content.

5. TRANSFORMATION ARC: The before/after story of their ideal customer. Before state (specific pain, emotion, situation) -> After state (specific outcome, emotion, situation). This drives all storytelling.

6. VOICE DNA: Extracted from their "bar conversation" answer and any content samples. Capture: sentence length preference, vocabulary level (simple/technical/mixed), humor style (none/dry/bold), energy level (calm authority/high energy/provocative), signature phrases, opening patterns, reasoning style, emotional range, forbidden patterns (corporate buzzwords they would never use), signature moves.

7. CONTENT ANGLES (10): Specific content topics derived from their pain points, competitive wedge, and transformation arc. Each angle should be a specific claim or insight, not a generic topic. Bad: "AI in business." Good: "Why your AI tools are making your team slower, not faster."

8. AUTHORITY MARKERS: What makes them credible? Years in business, number of customers, specific results achieved, credentials. These get woven into content naturally.

Be specific. Be opinionated. If their answers are vague, make intelligent inferences based on their industry and price point. A $500/month service has different pain points than a $50,000 engagement.

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks. Just the JSON object.`;

    const userPrompt = `BUSINESS CONTEXT:
Company: ${company || 'Not specified'}
Industry: ${industry || 'Not specified'}
Target Audience: ${targetAudience || 'Not specified'}

ONBOARDING ANSWERS:

Q: "What do you sell and how much does it cost?"
A: ${answers.whatYouSell || 'Not answered'}

Q: "What's the #1 reason people say no to buying from you?"
A: ${answers.whyPeopleSayNo || 'Not answered'}

Q: "What's something your competitors get wrong?"
A: ${answers.competitorWeakness || 'Not answered'}

Q: "Tell me about your best customer. What was their problem before they found you?"
A: ${answers.bestCustomerStory || 'Not answered'}

Q: "What would you say to a friend at a bar about why your business matters?"
A: ${answers.barExplanation || 'Not answered'}

Q: "What's a strong opinion you hold about your industry that most people disagree with?"
A: ${answers.strongOpinion || 'Not answered'}

${answers.contentSamples?.length ? `CONTENT SAMPLES:\n${answers.contentSamples.join('\n\n---\n\n')}` : ''}

Extract the complete Brand Intelligence Profile as JSON with these exact keys:
{
  "positioningStatement": "string",
  "corePainPoints": ["string", "string", "string", "string", "string"],
  "objectionMap": [{"objection": "string", "reframe": "string"}],
  "competitiveWedge": "string",
  "transformationArc": {"before": "string", "after": "string"},
  "voiceDNA": {
    "sentenceStructure": "string describing their sentence patterns",
    "vocabularyLevel": "string (simple/conversational/technical/mixed)",
    "openingPatterns": ["string"],
    "reasoningStyle": "string",
    "energySignature": "string",
    "forbiddenPatterns": ["string"],
    "signatureMoves": ["string"],
    "emotionalRange": "string",
    "summary": "2-3 sentence summary of their voice"
  },
  "contentAngles": ["string x10"],
  "authorityMarkers": ["string"]
}`;

    const response = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const raw = response.choices[0]?.message?.content || '{}';
    // Strip any markdown code fences
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let profile;
    try {
      profile = JSON.parse(cleaned);
    } catch {
      // If JSON parse fails, return a structured error with the raw text
      return NextResponse.json({ error: 'Failed to parse profile', raw: cleaned }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('Extract profile error:', error);
    return NextResponse.json({ error: error.message || 'Failed to extract profile' }, { status: 500 });
  }
}
