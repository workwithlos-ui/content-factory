import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI();

const ANTI_SLOP_RULEBOOK = `
ANTI-SLOP RULES (MANDATORY):
1. Lead with the specific — never a general statement.
2. Use irregular rhythm — vary sentence length drastically.
3. Make claims, don't hedge — no "potentially," "might," "some people."
4. Name names and numbers — exact amounts, timeframes, examples.
5. Inject voice markers — fragments, "And"/"But" starters, abrupt shifts.
6. Disagree with something — contrarian stance without validating the other side.
7. Include the failure — mistakes and pivots that preceded success.
8. Delete the first paragraph — start with what would have been paragraph 2.
9. Power openings only — specific number, bold claim, challenging question, or mid-action story.
10. One idea, fully explored — depth over breadth.
11. End with tension — provocative question or challenge, not a summary.
12. NEVER use: crucial, vital, essential, paramount, pivotal, transformative, revolutionary, game-changing, groundbreaking, cutting-edge, innovative, robust, comprehensive, holistic, synergistic, leverage, unlock, harness, foster, cultivate, empower, navigate, delve, landscape, testament, realm, tapestry, multifaceted, nuanced, paradigm.
`;

const SLOP_WORDS = ['crucial','vital','essential','paramount','pivotal','transformative','revolutionary','game-changing','groundbreaking','cutting-edge','innovative','robust','comprehensive','holistic','synergistic','leverage','unlock','harness','foster','cultivate','empower','navigate','delve','landscape','testament','realm','tapestry','multifaceted','nuanced','paradigm'];
const HEDGE_WORDS = ['potentially','might','perhaps','possibly','it seems','some people','it\'s worth noting','it\'s important to'];
const BANNED_OPENINGS = ['in today\'s','have you ever','as a ','when it comes to','in the world of','in the ever-evolving'];

function computeHumanScore(content: string) {
  const lower = content.toLowerCase();
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const slopWordsFound = SLOP_WORDS.filter(w => lower.includes(w));
  const firstLine = content.split('\n')[0] || '';
  const openingIsSpecific = !BANNED_OPENINGS.some(b => firstLine.toLowerCase().startsWith(b)) && (/\d/.test(firstLine) || firstLine.length < 80);
  const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
  const avgLen = sentenceLengths.reduce((a, b) => a + b, 0) / (sentenceLengths.length || 1);
  const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLen, 2), 0) / (sentenceLengths.length || 1);
  const hasIrregularRhythm = variance > 30;
  const hasHedgingLanguage = HEDGE_WORDS.some(w => lower.includes(w));
  const hasSpecificDetails = /\$[\d,]+|\d+%|\d+x|\d+ (days|weeks|months|hours|minutes)/.test(content);
  let score = 5;
  if (slopWordsFound.length === 0) score += 2; else score -= Math.min(slopWordsFound.length, 3);
  if (openingIsSpecific) score += 1;
  if (hasIrregularRhythm) score += 1;
  if (!hasHedgingLanguage) score += 1;
  if (hasSpecificDetails) score += 1;
  score = Math.max(1, Math.min(10, Math.round(score)));
  const feedback: string[] = [];
  if (slopWordsFound.length > 0) feedback.push(`Slop words: ${slopWordsFound.join(', ')}`);
  if (!openingIsSpecific) feedback.push('Opening is generic.');
  if (!hasIrregularRhythm) feedback.push('Rhythm too uniform.');
  if (hasHedgingLanguage) feedback.push('Hedging language detected.');
  if (!hasSpecificDetails) feedback.push('No specific numbers or details.');
  return { overall: score, slopWordsFound, openingIsSpecific, hasIrregularRhythm, hasSpecificDetails, hasHedgingLanguage, feedback, autoRewritten: false };
}

const PLATFORM_INSTRUCTIONS: Record<string, string> = {
  linkedin: 'Remix as a LinkedIn post (150-250 words). Short paragraphs. Pattern-interrupt opening. End with engaging question. 3-5 hashtags at end.',
  twitter: 'Remix as a Twitter/X thread (5-7 tweets). Each tweet under 280 chars. Bold hook tweet 1. One idea per tweet. No numbering. Separate with blank lines.',
  instagram: 'Remix as an Instagram caption (under 200 words). Relatable hook. Line breaks. Before/after element. CTA at end. 20-25 hashtags at very end.',
  email: 'Remix as an email newsletter (400-600 words). Format: SUBJECT: [line]\\nPREVIEW: [line]\\n\\n[body]. One core idea. Personal tone. One CTA.',
  blog: 'Remix as an SEO blog post (1500+ words). Format: TITLE: [title]\\nMETA: [description]\\nKEYWORDS: [keywords]\\n\\n[body with ## headers]. Comprehensive.',
};

function buildContext(voiceDNA: any, examples: any[], audienceProfile: any, brandProfile: any): string {
  const parts: string[] = [];
  if (voiceDNA?.brandName) {
    parts.push(`BRAND VOICE: ${voiceDNA.brandName}. Style: ${voiceDNA.voiceDescriptors || ''}. Reference: ${voiceDNA.writingStyleReference || ''}. Use phrases: ${(voiceDNA.phrasesTheyUse || []).join(', ')}. Never use: ${(voiceDNA.phrasesTheyNeverUse || []).join(', ')}.`);
  }
  if (examples?.length > 0) {
    parts.push(`STYLE EXAMPLES:\n${examples.slice(0, 2).map((e: any) => e.content?.slice(0, 300)).join('\n---\n')}`);
  }
  if (audienceProfile?.name) {
    parts.push(`AUDIENCE: ${audienceProfile.name}. Pain: ${(audienceProfile.painPoints || []).join('; ')}. Desires: ${(audienceProfile.desires || []).join('; ')}. Language: ${(audienceProfile.language || []).join(', ')}.`);
  }
  if (brandProfile?.positioningStatement) {
    parts.push(`BRAND: ${brandProfile.positioningStatement}. Wedge: ${brandProfile.competitiveWedge || ''}.`);
  }
  return parts.join('\n\n');
}

export async function POST(req: NextRequest) {
  try {
    const { sourceContent, targetPlatforms, creatorFramework, voiceDNA, examples, audienceProfile, brandProfile } = await req.json();
    const context = buildContext(voiceDNA, examples, audienceProfile, brandProfile);

    const promises = (targetPlatforms || ['linkedin', 'twitter', 'email']).map(async (platform: string) => {
      const instruction = PLATFORM_INSTRUCTIONS[platform] || PLATFORM_INSTRUCTIONS.linkedin;

      const response = await client.chat.completions.create({
        model: platform === 'blog' || platform === 'email' ? 'gemini-2.5-flash' : 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `You are an elite content remixer. Take the source content and remix it for a specific platform while maintaining the core message and voice.

${ANTI_SLOP_RULEBOOK}

${context}

${instruction}

Write ONLY the remixed content. No meta-commentary.`,
          },
          { role: 'user', content: `SOURCE CONTENT TO REMIX:\n\n${sourceContent}\n\nRemix this for ${platform}. Follow all anti-slop rules. Match the brand voice.` },
        ],
        temperature: 0.8,
        max_tokens: platform === 'blog' ? 4000 : 2000,
      });

      const content = response.choices[0]?.message?.content || '';
      const humanScore = computeHumanScore(content);
      const pieceId = Math.random().toString(36).substring(2, 10);

      return {
        id: pieceId,
        projectId: '',
        platform,
        content,
        qualityScore: humanScore.overall,
        humanScore,
        framework: creatorFramework || 'auto',
        model: platform === 'blog' || platform === 'email' ? 'gemini-2.5-flash' : 'gpt-4.1-mini',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    const results = await Promise.all(promises);
    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Remix error:', error);
    return NextResponse.json({ error: error.message || 'Remix failed' }, { status: 500 });
  }
}
