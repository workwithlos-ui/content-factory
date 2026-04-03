import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { fetchSharedContext, formatContextForPrompt } from '@/lib/shared-context';

const client = new OpenAI();

type AIModel = 'gpt-4.1-mini' | 'gemini-2.5-flash';

const PLATFORM_MODEL_MAP: Record<string, AIModel> = {
  twitter: 'gpt-4.1-mini',
  linkedin: 'gemini-2.5-flash',
  instagram: 'gpt-4.1-mini',
  email: 'gemini-2.5-flash',
  blog: 'gemini-2.5-flash',
};

function resolveModel(platform: string, preference: string): AIModel {
  if (preference === 'gpt') return 'gpt-4.1-mini';
  if (preference === 'claude') return 'gemini-2.5-flash';
  return PLATFORM_MODEL_MAP[platform] || 'gpt-4.1-mini';
}

// ─── THE ANTI-SLOP RULEBOOK (12 Rules) ──────────────────────
const ANTI_SLOP_RULEBOOK = `
## THE ANTI-SLOP RULEBOOK — MANDATORY FOR ALL CONTENT

You MUST follow every single one of these 12 rules. Violation of ANY rule means the content fails.

RULE 1 — LEAD WITH THE SPECIFIC
Never start with a general statement. Open with a specific data point, personal story, or contrarian claim. NOT "Content marketing is important." YES "$47,000 in pipeline from a single LinkedIn post. Here's the exact framework."

RULE 2 — USE IRREGULAR RHYTHM
Vary sentence and paragraph length drastically. Include one-word paragraphs. No perfectly balanced 3-point structures. Mix 3-word sentences with 25-word sentences. Create rhythm that feels human, not templated.

RULE 3 — MAKE CLAIMS, DON'T HEDGE
Eliminate "potentially," "might," "some people," "it's worth noting," "it's important to remember." Take definitive stances. NOT "This might help improve your results." YES "This doubles your conversion rate."

RULE 4 — NAME NAMES AND NUMBERS
Use exact dollar amounts, timeframes, named examples. Never generic placeholders. NOT "a successful company" YES "Stripe" or "when we hit $2M ARR."

RULE 5 — INJECT VOICE MARKERS
Use intentional sentence fragments. Start sentences with "And" or "But." Use abrupt topic shifts. Write like a human who has opinions, not a language model trying to be helpful.

RULE 6 — DISAGREE WITH SOMETHING
Present a strong opinion that contradicts conventional wisdom. Don't immediately validate the opposing view. Take a side. NOT "While there are many approaches..." YES "Most content advice is wrong. Here's why."

RULE 7 — INCLUDE THE FAILURE
Include mistakes, pivots, embarrassments that preceded success. Vulnerability is what separates human content from AI slop.

RULE 8 — DELETE THE FIRST PARAGRAPH
Your first draft's first paragraph is almost always throat-clearing. Delete it. Start with what was your second paragraph.

RULE 9 — USE POWER OPENINGS ONLY
Allowed opening patterns: (a) A specific number or data point, (b) A bold contrarian claim, (c) A question that challenges assumptions, (d) A short story that starts in the middle of action. BANNED openings: "In today's...", "Have you ever...", "As a...", "When it comes to...", "In the world of..."

RULE 10 — ONE IDEA, FULLY EXPLORED
Don't cover 7 shallow points. Cover 1 point with extreme depth. Go deeper than any reader expects.

RULE 11 — END WITH TENSION, NOT SUMMARY
Don't wrap up neatly. Leave the reader with a provocative question, a challenge, or an open loop. NOT "In conclusion, these 5 steps will help you..." YES "The question isn't whether this works. It's whether you'll actually do it."

RULE 12 — THE SLOP LEXICON — NEVER USE THESE WORDS/PHRASES
BANNED WORDS: crucial, vital, essential, paramount, pivotal, transformative, revolutionary, game-changing, groundbreaking, cutting-edge, innovative, robust, comprehensive, holistic, synergistic, leverage, unlock, harness, foster, cultivate, empower, navigate, delve, landscape, testament, realm, tapestry, multifaceted, nuanced, paradigm, streamline, spearhead, optimize (as buzzword), ecosystem (unless literal), deep dive (as noun), at the end of the day, when it comes to, in today's fast-paced world, it goes without saying, needless to say, in order to, the fact that, it is important to note, it's worth mentioning, as we all know, in the ever-evolving landscape.
BANNED PATTERNS: Starting with "In today's...", Using em dashes excessively, Three-part parallel structures ("X, Y, and Z" repeated), Ending with "What do you think?", Starting with "Let me tell you..."
`;

// ─── SLOP DETECTION (for Human Score) ────────────────────────
const SLOP_WORDS = ['crucial','vital','essential','paramount','pivotal','transformative','revolutionary','game-changing','groundbreaking','cutting-edge','innovative','robust','comprehensive','holistic','synergistic','leverage','unlock','harness','foster','cultivate','empower','navigate','delve','landscape','testament','realm','tapestry','multifaceted','nuanced','paradigm','streamline','spearhead','ecosystem','deep dive'];
const HEDGE_WORDS = ['potentially','might','perhaps','possibly','it seems','some people','it\'s worth noting','it\'s important to','arguably','in some cases'];
const BANNED_OPENINGS = ['in today\'s','have you ever','as a ','when it comes to','in the world of','in the ever-evolving','it goes without saying','it\'s no secret'];

function computeHumanScore(content: string) {
  const lower = content.toLowerCase();
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);

  // Check slop words
  const slopWordsFound = SLOP_WORDS.filter(w => lower.includes(w));

  // Check opening specificity
  const firstLine = content.split('\n')[0] || '';
  const openingIsSpecific = !BANNED_OPENINGS.some(b => firstLine.toLowerCase().startsWith(b)) && (/\d/.test(firstLine) || firstLine.length < 80);

  // Check irregular rhythm
  const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
  const avgLen = sentenceLengths.reduce((a, b) => a + b, 0) / (sentenceLengths.length || 1);
  const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLen, 2), 0) / (sentenceLengths.length || 1);
  const hasIrregularRhythm = variance > 30;

  // Check hedging
  const hasHedgingLanguage = HEDGE_WORDS.some(w => lower.includes(w));

  // Check specific details (numbers, $ amounts, names)
  const hasSpecificDetails = /\$[\d,]+|\d+%|\d+x|\d+ (days|weeks|months|hours|minutes)/.test(content);

  // Calculate score
  let score = 5;
  if (slopWordsFound.length === 0) score += 2;
  else score -= Math.min(slopWordsFound.length, 3);
  if (openingIsSpecific) score += 1;
  if (hasIrregularRhythm) score += 1;
  if (!hasHedgingLanguage) score += 1;
  if (hasSpecificDetails) score += 1;
  // Bonus for short paragraphs (mobile-friendly)
  if (paragraphs.some(p => p.split(/\s+/).length <= 3)) score += 0.5;

  score = Math.max(1, Math.min(10, Math.round(score)));

  const feedback: string[] = [];
  if (slopWordsFound.length > 0) feedback.push(`Found ${slopWordsFound.length} slop word(s): ${slopWordsFound.slice(0, 5).join(', ')}`);
  if (!openingIsSpecific) feedback.push('Opening is generic. Lead with a specific data point or contrarian claim.');
  if (!hasIrregularRhythm) feedback.push('Sentence rhythm is too uniform. Mix short punchy sentences with longer ones.');
  if (hasHedgingLanguage) feedback.push('Hedging language detected. Make definitive claims instead.');
  if (!hasSpecificDetails) feedback.push('No specific numbers, dollar amounts, or timeframes found. Add concrete details.');

  return {
    overall: score,
    slopWordsFound,
    openingIsSpecific,
    hasIrregularRhythm,
    hasSpecificDetails,
    hasHedgingLanguage,
    feedback,
    autoRewritten: false,
  };
}

// ─── CREATOR FRAMEWORK PROMPTS ───────────────────────────────
const CREATOR_FRAMEWORK_INSTRUCTIONS: Record<string, string> = {
  'hormozi-hook-retain-reward': `
FRAMEWORK: HORMOZI HOOK/RETAIN/REWARD
Structure your content exactly like this:
1. HOOK (first 1-2 lines): Open with shock value, a bold claim, or an irresistible question. Make it impossible to scroll past. Use a specific number or contrarian statement.
2. RETAIN (middle 60%): Deliver massive value immediately. No buildup, no fluff. Give them the exact framework, steps, or insight. Make them feel like they're getting a $10,000 consulting session for free.
3. REWARD (final lines): End with one specific, actionable takeaway they can implement in the next 60 minutes. Not vague advice. A specific action with a specific expected result.`,

  'brunson-epiphany-bridge': `
FRAMEWORK: BRUNSON EPIPHANY BRIDGE
Structure your content exactly like this:
1. BACKSTORY: Start with where you (or someone) were before the breakthrough. Paint the frustration vividly.
2. THE WALL: Describe the specific moment everything felt stuck. The conventional advice that wasn't working.
3. THE EPIPHANY: The exact moment of realization. What clicked. Be specific about what changed.
4. THE PLAN: The framework or system that emerged from the epiphany. Step by step.
5. THE RESULT: Specific, measurable outcomes. Numbers, timeframes, concrete changes.`,

  'ferriss-recipe': `
FRAMEWORK: FERRISS RECIPE METHOD
Structure your content as an intensely practical recipe:
1. Start with the specific outcome this recipe produces (with numbers if possible).
2. List exact tools, resources, or prerequisites needed.
3. Give step-by-step instructions with EXACT details — specific tools, specific settings, specific scripts, specific templates.
4. Include the "minimum effective dose" — the 20% of effort that produces 80% of results.
5. Add troubleshooting notes for common failure points.
Every sentence must be actionable. Zero theory. Zero motivation. Pure tactical execution.`,

  'welsh-paips': `
FRAMEWORK: WELSH PAIPS
Structure your content exactly like this:
1. PROBLEM: Name the specific problem your audience faces. Use their exact language. Make them feel seen.
2. AGITATE: Twist the knife. Show the consequences of NOT solving this. What it costs them in money, time, reputation.
3. INTRIGUE: Hint at a solution without revealing it yet. Create an open loop. "There's a framework that fixes this in 14 days."
4. POSITIVE FUTURE: Paint the vivid picture of life after the solution. Specific outcomes, specific feelings, specific numbers.
5. SOLUTION: Deliver the framework/system/approach. Make it feel inevitable and achievable.`,

  'koe-authority': `
FRAMEWORK: KOE AUTHORITY BUILDER
This post should establish you as a thought leader by combining:
1. A philosophical insight about your industry (the "why" behind what you do)
2. A personal growth element (what you learned, how you evolved)
3. An authoritative claim backed by your experience or data
The tone should be contemplative but confident. Like someone who has done the work and earned the right to have strong opinions. Mix abstract ideas with concrete examples.`,

  'auto': '',
};

// ─── PLATFORM-SPECIFIC WRITER PROMPTS ────────────────────────
const PLATFORM_PROMPTS: Record<string, string> = {
  linkedin: `You are writing a LinkedIn post. LinkedIn rewards posts that make people stop scrolling, feel something, and engage.

LINKEDIN RULES:
- First line MUST be a pattern interrupt. A bold claim, a specific number, or a statement that creates cognitive dissonance.
- Use short paragraphs (1-3 sentences max). White space is your weapon.
- Include a specific framework, process, or tactical insight the reader can implement today.
- End with a question that invites meaningful comments. Not "What do you think?" — something specific.
- NO hashtags in the body. Put 3-5 relevant hashtags as the very last line.
- NO emojis in the first 3 lines. Max 3 total, only as bullet markers.
- Length: 150-250 words.`,

  twitter: `You are writing a Twitter/X thread (5-7 tweets).

TWITTER RULES:
- Tweet 1 (the hook): Must work as a standalone viral tweet. Bold claim + specific insight.
- Each subsequent tweet delivers ONE specific insight or step. No filler.
- "1 tweet = 1 idea" rule. Never cram two concepts into one tweet.
- Second-to-last tweet should be the most valuable tactical insight.
- Final tweet: Recap key insight in one sentence + CTA (follow, reply, or bookmark).
- NO hashtags. NO emojis except sparingly. NO "Thread:" or numbering.
- Each tweet under 280 characters.
- Separate each tweet with a blank line.`,

  instagram: `You are writing an Instagram caption.

INSTAGRAM RULES:
- Hook must be relatable and scroll-stopping. Bold statement or specific pain point.
- Structure: Hook -> Context (2-3 sentences) -> Value (framework/process) -> CTA
- Use line breaks generously. Mobile-first.
- Include a before/after element.
- End with clear CTA: "Save this for later," "Tag someone who needs this," or a specific question.
- Add 20-25 relevant hashtags at the very end, separated by line breaks.
- Main caption under 200 words.`,

  email: `You are writing an email newsletter.

EMAIL RULES:
- SUBJECT LINE: 4-7 words. Create curiosity or state a specific benefit.
- PREVIEW TEXT: 40-90 characters that complement (not repeat) the subject line.
- OPENING: First sentence must feel personal. Like a smart friend texting you.
- BODY: One core idea, explored deeply. Not a link roundup.
- Include the WHY behind every recommendation.
- FORMATTING: Short paragraphs (2-3 sentences). Bold key phrases.
- CTA: One clear call to action. One. Make it specific.
- LENGTH: 400-600 words.
- TONE: Conversational but authoritative.
- Format as:
  SUBJECT: [subject line]
  PREVIEW: [preview text]

  [email body]`,

  blog: `You are writing an SEO blog post.

BLOG RULES:
- Title must include primary keyword and create curiosity.
- META DESCRIPTION: 150-160 characters with keyword.
- OPENING: Bold claim or specific problem statement. No "In this article..."
- STRUCTURE: H2 and H3 headers. Each section delivers standalone value.
- Step-by-step tactical breakdowns with reasoning.
- LENGTH: 1500+ words. Be the definitive resource.
- 4-6 main sections with headers, conclusion with CTA.
- Format as:
  TITLE: [title]
  META: [meta description]
  KEYWORDS: [3-5 target keywords]

  [blog post with markdown headers]`,
};

// ─── UTM GENERATION ──────────────────────────────────────────
function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 60).replace(/^-|-$/g, '');
}

function generateUTM(platform: string, topic: string, pieceId: string, baseUrl: string) {
  const params = { source: platform.replace('-', '_'), medium: platform, campaign: slugify(topic), content: pieceId.slice(0, 8) };
  try {
    const url = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(`utm_${k}`, v));
    return { params, fullUrl: url.toString() };
  } catch {
    return { params, fullUrl: `${baseUrl}?utm_source=${params.source}&utm_medium=${params.medium}&utm_campaign=${params.campaign}&utm_content=${params.content}` };
  }
}

// ─── CONTEXT BUILDERS ────────────────────────────────────────
function buildVoiceDNAContext(voiceDNA: any): string {
  if (!voiceDNA) return '';
  // Handle both manual (brandName-based) and AI-analyzed voice DNA formats
  if (voiceDNA.brandName) {
    return `
BRAND VOICE DNA (USER-DEFINED):
- Brand: ${voiceDNA.brandName}
- Voice Descriptors: ${voiceDNA.voiceDescriptors || 'Not set'}
- Style Reference: ${voiceDNA.writingStyleReference || 'Not set'}
- Phrases to USE in content: ${(voiceDNA.phrasesTheyUse || []).map((p: string) => `"${p}"`).join(', ') || 'None set'}
- Phrases to NEVER USE: ${(voiceDNA.phrasesTheyNeverUse || []).map((p: string) => `"${p}"`).join(', ') || 'None set'}
- Target Audience: ${voiceDNA.targetAudienceDescription || 'Not set'}
- Audience Pain Points: ${voiceDNA.audiencePainPoints || 'Not set'}

CRITICAL: Generated content MUST use the phrases listed above and NEVER use the banned phrases. Match the voice descriptors exactly.`;
  }
  // AI-analyzed format
  if (voiceDNA.summary || voiceDNA.contentInstructions) {
    return `
AI-ANALYZED VOICE DNA:
- Summary: ${voiceDNA.summary || ''}
- Energy: ${voiceDNA.energySignature || ''}
- Sentence Structure: ${voiceDNA.sentenceStructure || ''}
- Opening Patterns: ${(voiceDNA.openingPatterns || []).join(' | ')}
- Signature Moves: ${(voiceDNA.signatureMoves || []).join(' | ')}
- Forbidden: ${(voiceDNA.forbiddenPatterns || []).join(', ')}
${voiceDNA.contentInstructions ? `\nGENERATION INSTRUCTIONS (MANDATORY):\n${voiceDNA.contentInstructions}` : ''}`;
  }
  return '';
}

function buildExamplesContext(examples: any[]): string {
  if (!examples || examples.length === 0) return '';
  const exampleTexts = examples.slice(0, 3).map((ex: any, i: number) =>
    `EXAMPLE ${i + 1} (${ex.platform || 'general'}, ${ex.contentType || 'content'}):\n${ex.content?.slice(0, 500) || ''}`
  ).join('\n\n');
  return `
CONTENT EXAMPLES (match the tone, structure, and energy of these):
${exampleTexts}

IMPORTANT: Study these examples carefully. Match their sentence length patterns, opening style, energy level, and structural choices. These represent the IDEAL output style.`;
}

function buildAudienceContext(audience: any): string {
  if (!audience?.name) return '';
  return `
TARGET AUDIENCE PSYCHOGRAPHIC PROFILE:
- Segment: ${audience.name}
- Pain Points: ${(audience.painPoints || []).join('; ')}
- Desires: ${(audience.desires || []).join('; ')}
- Objections: ${(audience.objections || []).join('; ')}
- Language They Use: ${(audience.language || []).map((l: string) => `"${l}"`).join(', ')}
- Failed Solutions: ${(audience.failedSolutions || []).join('; ')}
- Scroll Stoppers: ${(audience.scrollStoppers || []).join('; ')}

CRITICAL: Use their EXACT language and pain points in the content. Reference their failed solutions. Address their objections. This content must feel like it was written specifically for this person.`;
}

function buildBrandContext(brandProfile: any): string {
  if (!brandProfile) return '';
  return `
BRAND INTELLIGENCE PROFILE:
- Positioning: ${brandProfile.positioningStatement || 'Not set'}
- Pain Points: ${(brandProfile.corePainPoints || []).join('; ')}
- Competitive Wedge: ${brandProfile.competitiveWedge || 'Not set'}
- Transformation: ${brandProfile.transformationArc?.before || 'N/A'} -> ${brandProfile.transformationArc?.after || 'N/A'}
- Authority Markers: ${(brandProfile.authorityMarkers || []).join('; ')}
- Content Angles: ${(brandProfile.contentAngles || []).slice(0, 5).join('; ')}
${brandProfile.voiceDNA ? `
VOICE DNA (CRITICAL — this defines how the content MUST sound):
- Voice Summary: ${brandProfile.voiceDNA.summary || ''}
- Energy Signature: ${brandProfile.voiceDNA.energySignature || 'Professional'}
- Vocabulary Level: ${brandProfile.voiceDNA.vocabularyLevel || 'Conversational'}
- Sentence Structure: ${brandProfile.voiceDNA.sentenceStructure || ''}
- Reasoning Style: ${brandProfile.voiceDNA.reasoningStyle || ''}
- Emotional Range: ${brandProfile.voiceDNA.emotionalRange || ''}
- Tone: ${(brandProfile.voiceDNA.toneDescriptors || []).join(', ')}
- Opening Patterns (USE THESE): ${(brandProfile.voiceDNA.openingPatterns || []).join(' | ')}
- Signature Moves (USE THESE): ${(brandProfile.voiceDNA.signatureMoves || []).join(' | ')}
- Forbidden Patterns (NEVER USE): ${(brandProfile.voiceDNA.forbiddenPatterns || []).join(', ')}
${brandProfile.voiceDNA.contentInstructions ? `
CONTENT GENERATION INSTRUCTIONS (MANDATORY):
${brandProfile.voiceDNA.contentInstructions}` : ''}` : ''}
${brandProfile.objectionMap?.length ? `
OBJECTION MAP:
${brandProfile.objectionMap.map((o: any) => `- "${o.objection}" -> "${o.reframe}"`).join('\n')}` : ''}`;
}

// ─── QUALITY CONTROLLER ─────────────────────────────────────
const QUALITY_CONTROLLER_PROMPT = `You are a content quality auditor. Score this content on 6 dimensions (1-10 each):

1. HOOK STRENGTH (25%): Does the first line stop the scroll? Is it specific?
2. SPECIFICITY (20%): Real frameworks, real processes? Or vague advice?
3. TACTICAL DEPTH (20%): Does it explain WHY, not just WHAT?
4. VOICE MATCH (15%): Does it sound like a real person with opinions?
5. CTA CLARITY (10%): Is there a clear, specific next step?
6. PLATFORM OPTIMIZATION (10%): Formatted correctly for the platform?

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks.
Return as:
{
  "hookStrength": number,
  "specificity": number,
  "tacticalDepth": number,
  "voiceMatch": number,
  "ctaClarity": number,
  "platformOptimization": number,
  "overall": number,
  "reasons": ["what's working well"],
  "fixes": ["specific fixes needed"]
}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      topic, keyPoints, platforms, creatorFramework, customFramework,
      voiceDNA, examples, audienceProfile, brandProfile, brandIntelligence,
      modelPreference, baseUrl, tonePreference, targetAudience,
      brandVoiceSummary, businessProfile,
    } = body;

    const profileData = brandIntelligence || brandProfile || {};
    const userModelPref = modelPreference || 'auto';
    const utmBaseUrl = baseUrl || 'https://example.com';

    // Fetch shared context from Supabase (proof bank, ICPs, voice, offers)
    const sharedCtx = await fetchSharedContext();
    const sharedContextBlock = sharedCtx ? `
=== ELIOS SHARED INTELLIGENCE (proof bank, ICPs, offers, voice baseline) ===
${formatContextForPrompt(sharedCtx)}
=== END SHARED INTELLIGENCE ===
` : '';

    // Build full context — user's localStorage data overrides shared context
    const voiceDNAContext = buildVoiceDNAContext(voiceDNA);
    const examplesContext = buildExamplesContext(examples);
    const audienceContext = buildAudienceContext(audienceProfile);
    const brandContext = buildBrandContext(profileData);

    const fullContext = [sharedContextBlock, voiceDNAContext, examplesContext, audienceContext, brandContext].filter(Boolean).join('\n');

    // Framework instruction
    const frameworkKey = creatorFramework || 'auto';
    const frameworkInstruction = frameworkKey === 'custom' && customFramework
      ? `\nCUSTOM FRAMEWORK:\n${customFramework}`
      : CREATOR_FRAMEWORK_INSTRUCTIONS[frameworkKey] || '';

    // STEP 1: Content Strategist
    const strategistPrompt = `You are an elite content strategist. Turn this topic into a strategic content brief.

${ANTI_SLOP_RULEBOOK}

${fullContext}

TOPIC: ${topic}
${keyPoints ? `KEY POINTS: ${keyPoints}` : ''}
${targetAudience ? `TARGET AUDIENCE: ${targetAudience}` : ''}
${tonePreference ? `TONE: ${tonePreference}` : ''}

Determine:
1. STRATEGIC ANGLE: The specific, ownable angle. Not the obvious take.
2. EMOTIONAL HOOK: What emotion should the opening trigger?
3. PROOF POINTS: Real frameworks, methodologies, or processes to reference.

Return ONLY valid JSON:
{
  "strategicAngle": "string",
  "emotionalHook": "string",
  "proofPoints": ["real frameworks to reference"]
}`;

    const strategistResponse = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: 'You are an elite content strategist. Return ONLY valid JSON.' },
        { role: 'user', content: strategistPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    let brief: any;
    try {
      const raw = strategistResponse.choices[0]?.message?.content || '{}';
      brief = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    } catch {
      brief = { strategicAngle: topic, emotionalHook: 'curiosity', proofPoints: [] };
    }

    // STEP 2: Generate content for each platform
    const platformList = platforms || ['linkedin', 'twitter', 'email'];

    const generationPromises = platformList.map(async (platform: string) => {
      const platformPrompt = PLATFORM_PROMPTS[platform] || PLATFORM_PROMPTS.linkedin;
      const model = resolveModel(platform, userModelPref);

      const systemPrompt = `${platformPrompt}

${ANTI_SLOP_RULEBOOK}
${frameworkInstruction}`;

      const userPrompt = `${fullContext}

STRATEGIC BRIEF:
- Angle: ${brief.strategicAngle}
- Emotional Hook: ${brief.emotionalHook}
- Proof Points: ${(brief.proofPoints || []).join('; ')}

TOPIC: ${topic}
${keyPoints ? `KEY POINTS: ${keyPoints}` : ''}

CRITICAL REMINDERS:
- Follow the Anti-Slop Rulebook. Every rule. No exceptions.
- Lead with something SPECIFIC. A number, a name, a contrarian claim.
- Vary your sentence rhythm. Mix 3-word sentences with longer ones.
- No hedging. No "might" or "potentially." Make definitive claims.
- Use the audience's exact language and pain points from the profile above.
- End with tension, not a neat summary.

Write the ${platform} content now. ONLY the content. No meta-commentary. No labels.`;

      const writeResponse = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: platform === 'blog' ? 4000 : 2000,
      });

      const content = writeResponse.choices[0]?.message?.content || '';

      // STEP 3: Quality Controller
      const qcResponse = await client.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: QUALITY_CONTROLLER_PROMPT },
          { role: 'user', content: `PLATFORM: ${platform}\n\nCONTENT:\n${content}\n\nScore this content and return JSON only.` },
        ],
        temperature: 0.3,
        max_tokens: 600,
      });

      let quality: any;
      try {
        const qcRaw = qcResponse.choices[0]?.message?.content || '{}';
        quality = JSON.parse(qcRaw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
      } catch {
        quality = { hookStrength: 7, specificity: 7, tacticalDepth: 7, voiceMatch: 7, ctaClarity: 7, platformOptimization: 7, overall: 7, reasons: [], fixes: [] };
      }

      const weightedScore = Math.round((
        (quality.hookStrength || 7) * 0.25 +
        (quality.specificity || 7) * 0.20 +
        (quality.tacticalDepth || 7) * 0.20 +
        (quality.voiceMatch || 7) * 0.15 +
        (quality.ctaClarity || 7) * 0.10 +
        (quality.platformOptimization || 7) * 0.10
      ) * 10) / 10;

      // STEP 4: Human Score (anti-slop detection)
      const humanScore = computeHumanScore(content);

      const pieceId = Math.random().toString(36).substring(2, 10);
      const utm = generateUTM(platform, topic, pieceId, utmBaseUrl);

      return {
        platform,
        content,
        framework: frameworkKey !== 'auto' ? frameworkKey : 'auto-selected',
        model,
        utmLink: { id: pieceId, platform, baseUrl: utmBaseUrl, utmParams: utm.params, fullUrl: utm.fullUrl },
        qualityScore: weightedScore,
        qualityBreakdown: {
          hookStrength: quality.hookStrength || 7,
          specificity: quality.specificity || 7,
          tacticalDepth: quality.tacticalDepth || 7,
          voiceMatch: quality.voiceMatch || 7,
          ctaClarity: quality.ctaClarity || 7,
          platformOptimization: quality.platformOptimization || 7,
          reasons: quality.reasons || [],
          fixes: quality.fixes || [],
        },
        humanScore,
        aiReasoning: `Model: ${model === 'gemini-2.5-flash' ? 'Gemini 2.5 Flash' : 'GPT-4.1 Mini'}\nAngle: ${brief.strategicAngle}\nFramework: ${frameworkKey}\nHuman Score: ${humanScore.overall}/10${humanScore.slopWordsFound.length > 0 ? `\nSlop words caught: ${humanScore.slopWordsFound.join(', ')}` : '\nNo slop detected.'}`,
      };
    });

    const results = await Promise.all(generationPromises);

    return NextResponse.json({ results, strategicBrief: brief });
  } catch (error: any) {
    console.error('Generation error:', error);
    return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
  }
}
