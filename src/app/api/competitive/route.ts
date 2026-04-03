import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

async function fetchPageContent(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return '';
    const html = await res.text();
    // Strip HTML tags, collapse whitespace, take first 4000 chars
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 4000);
  } catch {
    return '';
  }
}

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
      max_tokens: 2500,
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
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'Please provide a competitor URL' }, { status: 400 });
    }

    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    const domain = new URL(cleanUrl).hostname.replace('www.', '');

    // Actually fetch the competitor page for real analysis
    const pageContent = await fetchPageContent(cleanUrl);

    const systemPrompt = `You are an elite competitive intelligence analyst specializing in content strategy, brand positioning, and market gaps. You analyze real competitor websites to find exploitable gaps.

ANALYSIS RULES:
- Base analysis on the ACTUAL page content provided. If page content is available, use it directly.
- If page content is empty, infer from domain name and industry context.
- Be specific, tactical, and revenue-focused in your analysis.
- Content briefs must be genuinely useful — specific angles that would outperform the competitor.
- Never fabricate specific traffic metrics. Focus on strategic positioning gaps.
- Output ONLY valid JSON. No markdown, no code blocks, no preamble.`;

    const userPrompt = `Analyze this competitor: ${cleanUrl} (domain: ${domain})

${pageContent ? `ACTUAL PAGE CONTENT SCRAPED:\n${pageContent}` : 'Note: Page content unavailable. Analyze based on domain and industry knowledge.'}

Provide deep competitive intelligence:
1. Company name and actual positioning from their content
2. Their messaging strategy and what they lead with
3. 4-5 specific content strengths you can see
4. 4-5 specific weaknesses or gaps in their content strategy
5. 5-6 high-value content gaps you could exploit
6. 5 specific content briefs to outperform them (each needs: title, strategic angle, platform, why it beats them)

Return as JSON:
{
  "name": "Company Name",
  "url": "${cleanUrl}",
  "positioningAnalysis": "2-3 sentence analysis based on actual content",
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3", "specific strength 4"],
  "weaknesses": ["specific weakness 1", "specific weakness 2", "specific weakness 3", "specific weakness 4"],
  "contentGaps": ["gap 1", "gap 2", "gap 3", "gap 4", "gap 5"],
  "contentBriefs": [
    {"title": "Specific title", "angle": "Exactly why this outperforms them and what makes it different", "platform": "LinkedIn"},
    {"title": "Specific title", "angle": "Strategic angle", "platform": "X/Twitter"},
    {"title": "Specific title", "angle": "Strategic angle", "platform": "YouTube"},
    {"title": "Specific title", "angle": "Strategic angle", "platform": "Email"},
    {"title": "Specific title", "angle": "Strategic angle", "platform": "LinkedIn"}
  ],
  "dataFound": ${pageContent ? 'true' : 'false'}
}`;

    const raw = await callClaude(systemPrompt, userPrompt);
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let insight;
    try {
      insight = JSON.parse(cleaned);
    } catch {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insight = JSON.parse(jsonMatch[0]);
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
