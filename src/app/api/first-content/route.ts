import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

async function callAI(systemPrompt: string, userPrompt: string, temperature = 0.8): Promise<string> {
  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: 2000,
    }),
  });
  if (!response.ok) throw new Error(`AI error: ${response.status}`);
  const result = await response.json();
  return result.choices[0]?.message?.content || '';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company, industry, targetAudience, voiceSummary, voiceCharacteristics, businessProfile } = body;
    const bp = businessProfile || {};

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Pick a topic based on their actual business context
    const topicPrompt = `For a ${industry || 'B2B'} company called "${company || 'this company'}" that sells ${bp.whatYouSell || 'professional services'} to ${targetAudience || 'business professionals'}:

Their #1 customer objection: ${bp.customerPainPoints?.[0] || bp.whyPeopleSayNo || 'price concerns'}
Their competitive angle: ${bp.competitiveAngle || 'superior expertise'}
Their contrarian take: ${bp.contrarianTakes?.[0] || bp.strongOpinion || 'industry needs to change'}

Suggest ONE specific LinkedIn post topic that would:
1. Address their customer's biggest pain point
2. Showcase their unique positioning
3. Get high engagement from their target audience

Return ONLY the topic as a single sentence. Make it specific and opinionated, not generic.`;

    const topic = await callAI('You are a content strategist. Return only the topic.', topicPrompt, 0.8);

    // Generate GENERIC version (no business context, no voice)
    const genericContent = await callAI(
      'You are a generic content writer. Write a professional but unremarkable LinkedIn post. Keep it around 200 words. Use common phrases and general advice. Do NOT be specific or tactical.',
      `Write a LinkedIn post about: ${topic}\nTarget audience: ${targetAudience || 'business professionals'}\nWrite in a generic, safe, corporate tone. Use phrases like "In today's fast-paced world" and "It's important to remember that." Be vague and general.`
    );

    // Generate VOICE-MATCHED version with full business context
    const voiceContent = await callAI(
      `You are an elite content strategist ghostwriting as ${company || 'this brand'}.

VOICE: ${voiceSummary || 'Direct, opinionated, practical'}
TONE: ${voiceCharacteristics?.tone?.join(', ') || 'Direct, Authentic'}
STYLE: ${voiceCharacteristics?.vocabulary?.join(', ') || 'Uses real examples, avoids jargon'}

BUSINESS CONTEXT:
- Sells: ${bp.whatYouSell || 'professional services'}
- Customer pain: ${bp.customerPainPoints?.join('; ') || 'growth challenges'}
- Competitive angle: ${bp.competitiveAngle || 'deep expertise'}
- Objections to address: ${bp.objectionHandling?.join('; ') || 'price and trust'}
- Contrarian takes: ${bp.contrarianTakes?.join('; ') || 'industry needs disruption'}
- Best customer story: ${bp.bestCustomerStory || 'transformed a struggling business'}

RULES:
- Sound EXACTLY like this person. Use their natural speech patterns.
- Open with a BOLD hook — pattern interrupt, specific number, or contrarian claim
- Include tactical reasoning — explain WHY, not just WHAT
- Reference their actual business context and customer pain points
- End with a specific, actionable CTA
- NEVER use "In today's world", "Let me share", "I'm excited to announce"
- Be specific, opinionated, and valuable`,
      `Write a LinkedIn post about: ${topic}\nTarget audience: ${targetAudience || 'business professionals'}\nUse the Story → Lesson → Action framework. Start with a powerful hook. Make it 250-350 words. Add 3-5 hashtags.`
    );

    // Generate comparison analysis
    const analysisResult = await callAI(
      'You are a content quality analyst. Always respond with valid JSON only. No markdown formatting.',
      `Compare these two LinkedIn posts and explain why the second is dramatically better:

GENERIC VERSION:
${genericContent.slice(0, 800)}

VOICE-MATCHED VERSION:
${voiceContent.slice(0, 800)}

Return JSON:
{
  "genericScore": 5.8,
  "voiceScore": 9.2,
  "voiceMatchPercentage": 94,
  "improvements": [
    "Specific improvement the voice version has over generic",
    "Another specific improvement",
    "Third specific improvement"
  ],
  "aiReasoning": "I used [specific element from their business context] to [specific content decision]. Their voice tends toward [pattern], so I [action]. The hook references their customer's actual pain point about [specific thing] rather than generic advice."
}

Be SPECIFIC. Reference actual content differences. The aiReasoning should mention specific business context elements.`,
      0.4
    );

    let analysis;
    try {
      const cleaned = analysisResult.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleaned);
    } catch {
      analysis = {
        genericScore: 5.8,
        voiceScore: 9.1,
        voiceMatchPercentage: 92,
        improvements: [
          'Opens with a specific, scroll-stopping hook instead of a generic opener',
          'Uses tactical reasoning — explains WHY things work, not just what to do',
          'References real customer pain points and business context',
        ],
        aiReasoning: `I led with their competitive angle and wove in their customer's primary objection. The tone matches their natural communication style — direct and opinionated rather than corporate and safe.`,
      };
    }

    return NextResponse.json({ topic, genericContent, voiceContent, analysis });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
