import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { voiceDNA, audienceProfile, brandProfile, competitors, currentDate } = body;

    // Build context from user's configured data
    let context = '';

    if (voiceDNA?.brandName) {
      context += `\n## BRAND CONTEXT\nBrand: ${voiceDNA.brandName}\nVoice: ${voiceDNA.voiceDescriptors}\nTarget Audience: ${voiceDNA.targetAudienceDescription}\nPain Points: ${voiceDNA.audiencePainPoints}\n`;
    }

    if (audienceProfile) {
      context += `\n## AUDIENCE PROFILE: ${audienceProfile.name}\nPain Points: ${audienceProfile.painPoints?.join(', ')}\nDesires: ${audienceProfile.desires?.join(', ')}\nObjections: ${audienceProfile.objections?.join(', ')}\nLanguage They Use: ${audienceProfile.language?.join(', ')}\nScroll Stoppers: ${audienceProfile.scrollStoppers?.join(', ')}\n`;
    }

    if (brandProfile?.competitiveWedge) {
      context += `\n## COMPETITIVE POSITIONING\nWedge: ${brandProfile.competitiveWedge}\nCore Pain Points: ${brandProfile.corePainPoints?.join(', ')}\nContent Angles: ${brandProfile.contentAngles?.join(', ')}\n`;
    }

    let competitorContext = '';
    if (competitors && competitors.length > 0) {
      competitorContext = `\n## COMPETITORS TO MONITOR\n${competitors.map((c: any) => `- ${c.name} (@${c.handle} on ${c.platform})`).join('\n')}\n`;
    }

    const systemPrompt = `You are an expert content strategist and trend analyst. Your job is to identify trending topics, generate content ideas, and provide competitive intelligence for a brand.

Current date: ${currentDate || new Date().toISOString().split('T')[0]}

${context}
${competitorContext}

You must return a JSON object with exactly this structure:
{
  "trends": [
    {
      "title": "Topic title",
      "whyTrending": "Why this is trending right now",
      "suggestedAngle": "Specific angle for content creation",
      "suggestedPlatform": "linkedin|twitter|instagram|email|blog",
      "urgency": "hot|warm|evergreen",
      "category": "trend"
    }
  ],
  "ideas": [
    {
      "title": "Content idea title",
      "whyTrending": "Why this idea matters now",
      "suggestedAngle": "Specific angle to take",
      "suggestedPlatform": "linkedin|twitter|instagram|email|blog",
      "urgency": "hot|warm|evergreen",
      "category": "idea"
    }
  ],
  "news": [
    {
      "title": "Industry news headline",
      "whyTrending": "Why this news matters to the audience",
      "suggestedAngle": "How to create content around this",
      "suggestedPlatform": "linkedin|twitter|instagram|email|blog",
      "urgency": "hot|warm|evergreen",
      "category": "news"
    }
  ],
  "competitorInsights": [
    {
      "title": "Counter-content suggestion",
      "whyTrending": "What competitors are likely doing and why to counter it",
      "suggestedAngle": "How to outperform their angle",
      "suggestedPlatform": "linkedin|twitter|instagram|email|blog",
      "urgency": "hot|warm|evergreen",
      "category": "competitor"
    }
  ]
}

RULES:
- Generate 4-5 items for each category (trends, ideas, news)
- Generate 2-3 competitor insights if competitors are provided, otherwise 0
- All content must be specific to the brand's niche and audience
- Urgency should reflect actual timeliness: "hot" = act within 24-48 hours, "warm" = this week, "evergreen" = anytime
- Suggested angles must be specific and actionable, not generic
- Platform suggestions should match the content type (e.g., hot takes on Twitter, thought leadership on LinkedIn, tutorials on blog)
- Make the "whyTrending" compelling and specific — not generic statements
- Each idea should be different enough to warrant its own piece of content
- For competitor insights, suggest content that directly counters or outperforms what competitors would post`;

    const userPrompt = `Generate trending topics, content ideas, industry news, and competitor insights for this brand. Be specific, timely, and actionable. Every suggestion should make the user think "I need to create this content TODAY."

Focus on what's actually happening in their industry right now (${currentDate || 'March 2026'}) and what their specific audience cares about.`;

    const response = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 3000,
    });

    const raw = response.choices[0]?.message?.content || '{}';

    // Parse JSON from response
    let parsed;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch {
      parsed = { trends: [], ideas: [], news: [], competitorInsights: [] };
    }

    return NextResponse.json({
      trends: parsed.trends || [],
      ideas: parsed.ideas || [],
      news: parsed.news || [],
      competitorInsights: parsed.competitorInsights || [],
    });
  } catch (error: any) {
    console.error('Trends API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate trends' }, { status: 500 });
  }
}
