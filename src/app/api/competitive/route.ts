import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'Please provide a competitor URL' }, { status: 400 });
    }

    // Clean the URL
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    const domain = new URL(cleanUrl).hostname.replace('www.', '');

    const systemPrompt = `You are a competitive intelligence analyst who specializes in content strategy and brand positioning. Given a competitor's website URL/domain, analyze their likely positioning, content strategy, and identify gaps and opportunities.

IMPORTANT RULES:
- Base your analysis on what is commonly known about companies in this space and the domain name/brand signals.
- Be specific and actionable in your analysis.
- Focus on content strategy gaps that can be exploited.
- Generate content briefs that would directly compete with and outperform their content.
- NEVER fabricate specific metrics, traffic numbers, or engagement data. Focus on strategic analysis.

Return ONLY valid JSON. No markdown, no code blocks.`;

    const userPrompt = `Analyze this competitor: ${cleanUrl} (domain: ${domain})

Based on the domain, brand name, and what is commonly known about companies with this positioning, provide:

1. Company name (infer from domain)
2. Their likely positioning and messaging strategy
3. 4-5 content strengths they likely have
4. 4-5 content weaknesses/gaps you can identify
5. 5-6 specific content gaps that a competitor could exploit
6. 5 specific content briefs designed to outperform them (each with title, strategic angle, and best platform)

Return as JSON:
{
  "name": "Company Name",
  "url": "${cleanUrl}",
  "positioningAnalysis": "2-3 sentence analysis of their positioning and messaging approach",
  "strengths": ["strength1", "strength2", "strength3", "strength4"],
  "weaknesses": ["weakness1", "weakness2", "weakness3", "weakness4"],
  "contentGaps": ["gap1", "gap2", "gap3", "gap4", "gap5"],
  "contentBriefs": [
    {"title": "Content piece title", "angle": "Strategic angle and why it outperforms them", "platform": "best platform"},
    {"title": "Content piece title", "angle": "Strategic angle", "platform": "best platform"}
  ]
}`;

    const response = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const raw = response.choices[0]?.message?.content || '{}';
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let insight;
    try {
      insight = JSON.parse(cleaned);
    } catch {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          insight = JSON.parse(jsonMatch[0]);
        } catch {
          return NextResponse.json({ error: 'Failed to parse competitive analysis' }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: 'Failed to parse competitive analysis' }, { status: 500 });
      }
    }

    return NextResponse.json({ insight });
  } catch (error: any) {
    console.error('Competitive analysis error:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze competitor' }, { status: 500 });
  }
}
