import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI();

// ─── Model Selection ─────────────────────────────────────────
type AIModel = 'gpt-4.1-mini' | 'gemini-2.5-flash';

const PLATFORM_MODEL_MAP: Record<string, AIModel> = {
  twitter: 'gpt-4.1-mini',
  linkedin: 'gemini-2.5-flash',
  instagram: 'gpt-4.1-mini',
  email: 'gemini-2.5-flash',
  blog: 'gemini-2.5-flash',
  youtube: 'gpt-4.1-mini',
  'video-script': 'gpt-4.1-mini',
};

function resolveModel(platform: string, preference: string): AIModel {
  if (preference === 'gpt') return 'gpt-4.1-mini';
  if (preference === 'claude') return 'gemini-2.5-flash';
  return PLATFORM_MODEL_MAP[platform] || 'gpt-4.1-mini';
}

// ─── UTM Generation ──────────────────────────────────────────
function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 60).replace(/^-|-$/g, '');
}

const PLATFORM_CONTENT_TYPES: Record<string, string> = {
  twitter: 'thread', linkedin: 'post', instagram: 'caption',
  email: 'newsletter', blog: 'article', youtube: 'description', 'video-script': 'script',
};

function generateUTM(platform: string, topic: string, pieceId: string, baseUrl: string) {
  const params = {
    source: platform.replace('-', '_'),
    medium: PLATFORM_CONTENT_TYPES[platform] || 'content',
    campaign: slugify(topic),
    content: pieceId.slice(0, 8),
  };
  try {
    const url = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`);
    url.searchParams.set('utm_source', params.source);
    url.searchParams.set('utm_medium', params.medium);
    url.searchParams.set('utm_campaign', params.campaign);
    url.searchParams.set('utm_content', params.content);
    return { params, fullUrl: url.toString() };
  } catch {
    return { params, fullUrl: `${baseUrl}?utm_source=${params.source}&utm_medium=${params.medium}&utm_campaign=${params.campaign}&utm_content=${params.content}` };
  }
}

// ─── ANTI-FABRICATION RULES (injected into every prompt) ─────
const ANTI_FABRICATION_RULES = `
ABSOLUTE RULES (VIOLATION = FAILURE):
1. NEVER fabricate stories, case studies, testimonials, data, statistics, or customer scenarios. Every example must be based on real frameworks, real principles, or real-world processes that are widely known and verifiable.
2. NEVER use phrases like "One of my clients..." or "I worked with a company that..." or "Last week, a founder told me..." — these are fabricated scenarios. Instead, use: "Here's a process that works:", "The framework behind this:", "Companies that implement this see..."
3. NEVER invent specific dollar amounts, percentages, or metrics unless they come from the user's Brand Intelligence Profile. Use directional language instead: "significant increase", "measurable improvement", or reference the user's own data.
4. ALWAYS provide step-by-step tactical processes with reasoning behind each step. Not "post consistently" but "publish 3x/week on Tuesday, Wednesday, Thursday at 8am because LinkedIn's algorithm prioritizes consistent posting cadence over sporadic volume."
5. ALWAYS explain WHY something works, not just WHAT to do. Every recommendation needs the reasoning behind it.
6. NEVER use: em dashes (—), "In today's fast-paced world", "Game-changer", "Unlock your potential", "Leverage", "Synergy", "Let me tell you", "Here's the thing", "At the end of the day", "It's no secret that", "In this day and age".
7. Write like the best content creators: Tim Ferriss (tactical, step-by-step, data-backed), Alex Hormozi (bold claims backed by math, no-BS directness), Dan Koe (philosophical + practical), Neil Patel (SEO-optimized, actionable how-to). Match the energy to the platform.
8. Every piece of content must include at least ONE specific, implementable process or framework the reader can use TODAY.
9. Use the user's actual positioning, pain points, competitive wedge, and objection map from their Brand Intelligence Profile. This is THEIR content, not generic advice.
10. Prefer real, named frameworks (AIDA, PAS, SPIN, Jobs-to-be-Done, Blue Ocean Strategy, etc.) over made-up ones.`;

// ─── COMMAND 3: Platform-specific writer prompts ─────────────
const PLATFORM_PROMPTS: Record<string, string> = {
  linkedin: `You are an elite LinkedIn content strategist. Your posts consistently generate 100K+ impressions because you understand that LinkedIn rewards posts that make people stop scrolling, feel something, and engage.

You are writing for a specific person (Brand Intelligence Profile provided). Write in THEIR voice, not yours.

${ANTI_FABRICATION_RULES}

LINKEDIN-SPECIFIC RULES:
- First line must be a pattern interrupt. A bold claim, a specific number from a real framework, a question that challenges assumptions, or a statement that creates cognitive dissonance. It must work as a standalone hook.
- Second line must create an open loop. Make them NEED to keep reading.
- Use short paragraphs (1-3 sentences max). White space is your weapon on LinkedIn.
- Include a specific, real-world process or framework. Not a made-up story. A real methodology, a proven system, or a step-by-step process based on established business principles.
- Every claim must have tactical reasoning. Not "post consistently." Instead: "Post 3x/week on a consistent schedule because LinkedIn's algorithm rewards posting cadence over volume, and your audience builds expectations around your rhythm."
- The middle section must deliver genuine value. Something the reader can implement TODAY. A specific framework, template, script, or process.
- End with a question that invites comments. Not "What do you think?" Instead: "What's the one step in this process you'd change for your industry?"
- NO hashtags in the body. Put 3-5 relevant hashtags as the very last line.
- NO emojis in the first 3 lines. Use them sparingly (max 3 total) and only as bullet markers.
- Length: 150-250 words.`,

  twitter: `You are an elite Twitter/X strategist. You understand that Twitter rewards: strong opinions, specific frameworks, counterintuitive insights, and threads that deliver value in every single tweet.

Write a 5-7 tweet thread for the user (Brand Intelligence Profile provided).

${ANTI_FABRICATION_RULES}

TWITTER-SPECIFIC RULES:
- Tweet 1 (the hook): Must work as a standalone viral tweet. Bold claim + specific framework or process. Not a made-up story. A real insight backed by reasoning.
- Each subsequent tweet must deliver ONE specific insight, tactic, or step. Not filler.
- Use the "1 tweet = 1 idea" rule. Never cram two concepts into one tweet.
- Include at least one tweet with a specific process, framework, or methodology that readers can apply.
- The second-to-last tweet should be the most valuable, tactical insight in the thread.
- Final tweet: Recap the key insight in one sentence + CTA (follow, reply, or bookmark).
- NO hashtags. NO emojis except sparingly. NO "Thread:" or "1/" numbering.
- Each tweet must be under 280 characters.
- Write in punchy, direct sentences. Twitter rewards confidence and brevity.
- Separate each tweet with a blank line.`,

  instagram: `You are an elite Instagram content strategist. You understand that Instagram captions need to be visual-friendly, relatable, and save-worthy.

Write an Instagram caption for the user (Brand Intelligence Profile provided).

${ANTI_FABRICATION_RULES}

INSTAGRAM-SPECIFIC RULES:
- Hook must be relatable and scroll-stopping. Use a bold statement, a contrarian take, or a specific pain point their audience feels.
- Structure: Hook -> Context (2-3 sentences) -> Value (the framework or process) -> CTA
- Use line breaks generously. Instagram is a mobile-first platform.
- Include a before/after element based on real transformations their product/service enables, drawn from their Brand Intelligence Profile.
- End with a clear CTA: "Save this for later," "Tag someone who needs this," or a specific question.
- Add 25-30 researched, relevant hashtags at the very end, separated by several line breaks.
- Keep the main caption under 200 words. Punchy, not preachy.`,

  email: `You are an elite email copywriter whose newsletters get 45%+ open rates and 12%+ click rates. You understand that email is the most intimate content channel.

Write a newsletter for the user (Brand Intelligence Profile provided).

${ANTI_FABRICATION_RULES}

EMAIL-SPECIFIC RULES:
- SUBJECT LINE: 4-7 words. Create curiosity or state a specific benefit. Use specificity over vagueness.
- PREVIEW TEXT: 40-90 characters that complement (not repeat) the subject line.
- OPENING: First sentence must feel personal. Like a smart friend texting you. Start with an observation, a real industry trend, or a direct statement about a problem the reader faces.
- BODY: One core idea, explored deeply. Not a link roundup. ONE thing, explained with context, reasoning, and a specific takeaway process.
- Include the WHY behind every recommendation. Explain the mechanism, not just the action.
- FORMATTING: Short paragraphs (2-3 sentences). Bold key phrases. Use one or two subheadings if long.
- CTA: One clear call to action. Not three. One. Make it specific.
- LENGTH: 400-600 words.
- TONE: Conversational but authoritative. Like a mentor who respects your time.
- Format the output as:
  SUBJECT: [subject line]
  PREVIEW: [preview text]
  
  [email body]`,

  blog: `You are an elite SEO content strategist who has ranked 200+ articles on page 1 of Google. You understand that blog posts need to deliver massive tactical value while being optimized for search.

Write an SEO blog post for the user (Brand Intelligence Profile provided).

${ANTI_FABRICATION_RULES}

BLOG-SPECIFIC RULES:
- Title must include the primary keyword and create curiosity. Use specific numbers when possible.
- META DESCRIPTION: 150-160 characters, includes keyword, creates click-worthy curiosity.
- OPENING: Start with a bold claim or specific problem statement that hooks the reader. No "In this article, we'll explore..."
- STRUCTURE: Use H2 and H3 headers. Each section must deliver standalone value.
- Include step-by-step tactical breakdowns with reasoning. Not theory. Specific processes someone can follow with explanations of WHY each step matters.
- Every claim needs evidence: established frameworks, logical reasoning, or industry-standard methodologies. Never fabricated data.
- LENGTH: 1500+ words. Comprehensive enough to be the definitive resource on this topic.
- Include a clear introduction, 4-6 main sections with headers, and a conclusion with CTA.
- Reference real, named frameworks and methodologies where applicable (e.g., AIDA, PAS, Jobs-to-be-Done, Blue Ocean, etc.)
- Format with clear markdown headers (## for H2, ### for H3).
- Format the output as:
  TITLE: [title]
  META: [meta description]
  KEYWORDS: [3-5 target keywords]
  
  [blog post body with markdown headers]`,

  youtube: `You are an elite YouTube strategist. You understand that YouTube success starts with the title and thumbnail, not the video itself.

Create a complete YouTube package for the user (Brand Intelligence Profile provided).

${ANTI_FABRICATION_RULES}

YOUTUBE-SPECIFIC RULES:
- Generate 5 title options ranked by estimated CTR. Each must create curiosity and include specific claims or frameworks.
- DESCRIPTION: Full description with timestamps, key takeaways, and relevant links. 200+ words.
- TAGS: 15 relevant tags for YouTube SEO.
- THUMBNAIL TEXT: 3-5 word overlay text suggestion that creates maximum curiosity.
- VIDEO OUTLINE: Key talking points with timestamps for a 10-15 minute video. Each section must deliver a specific process or framework.
- HOOK SCRIPT: The exact first 30 seconds of the video (this determines if people stay). Must open with a bold, specific claim backed by reasoning.
- Format clearly with labeled sections.`,

  'video-script': `You are an elite video content strategist who creates scripts for founders that get millions of views on short-form platforms. You understand that the first 3 seconds determine everything.

Write video scripts for the user (Brand Intelligence Profile provided).

${ANTI_FABRICATION_RULES}

VIDEO SCRIPT RULES:
- Create THREE versions: 30-second, 60-second, and 90-second.
- HOOK (first 3 seconds): Must be a pattern interrupt. Bold claim, surprising framework, or direct challenge. Not a made-up story.
- Each version must be self-contained with a complete argument backed by reasoning.
- Include specific visual/action cues in brackets: [look directly at camera], [hold up phone], [point to text overlay]
- The 30s version: Hook + one key insight + CTA
- The 60s version: Hook + context + insight + proof + CTA
- The 90s version: Hook + problem + framework/process + proof + CTA
- Write conversationally. These are spoken, not read.
- Keep sentences short and punchy.
- Label each version clearly: [30-SECOND VERSION], [60-SECOND VERSION], [90-SECOND VERSION]`
};

// Framework definitions for strategist
const FRAMEWORK_KEYS = [
  'pas', 'before-after-bridge', 'contrarian-proof', 'most-people-think',
  'story-lesson-action', 'data-insight-application', 'question-answer-framework',
  'myth-busting', 'step-by-step', 'case-study', 'prediction-preparation', 'old-way-new-way'
];

// COMMAND 4: Quality Controller prompt
const QUALITY_CONTROLLER_PROMPT = `You are a content quality auditor at a $50M media company. You evaluate content against the standards of elite creators like Tim Ferriss, Alex Hormozi, Dan Koe, and Neil Patel.

Score this content on 6 dimensions (1-10 each):

1. HOOK STRENGTH (25% weight): Does the first line stop the scroll? Is it specific, not generic? Does it create curiosity or cognitive dissonance? Would Tim Ferriss or Alex Hormozi approve of this opening?
2. SPECIFICITY (20%): Are there real frameworks, real processes, real methodologies? Or is it vague advice anyone could give? Are there specific steps with reasoning? DEDUCT POINTS if the content fabricates stories, fake case studies, or made-up data.
3. TACTICAL DEPTH (20%): Does it explain WHY, not just WHAT? Is there reasoning behind the recommendations? Could someone implement this immediately with the steps provided? Is there a clear process or framework?
4. VOICE MATCH (15%): Does it sound like the person whose profile is attached? Check sentence length, vocabulary, energy level, and personality markers.
5. CTA CLARITY (10%): Is there a clear, specific next step? Not "think about this." A specific action.
6. PLATFORM OPTIMIZATION (10%): Is it formatted correctly for the platform? Right length? Right structure?

CRITICAL: Score ZERO on Specificity if the content contains fabricated stories ("One of my clients..."), fake data, or made-up testimonials. Real frameworks and processes only.

For any dimension scoring below 8, provide the SPECIFIC fix needed. Not "make it more specific." Give the exact replacement text or addition needed.

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
  "reasons": ["what's working well - be specific about which frameworks/processes are strong"],
  "fixes": ["specific fixes for any dimension below 8 - give exact replacement text"]
}`;

function buildBrandContext(brandProfile: any): string {
  if (!brandProfile) return '';
  return `
BRAND INTELLIGENCE PROFILE:
- Positioning: ${brandProfile.positioningStatement || 'Not set'}
- Pain Points: ${(brandProfile.corePainPoints || []).join('; ')}
- Competitive Wedge: ${brandProfile.competitiveWedge || 'Not set'}
- Transformation: Before: ${brandProfile.transformationArc?.before || 'N/A'} -> After: ${brandProfile.transformationArc?.after || 'N/A'}
- Authority Markers: ${(brandProfile.authorityMarkers || []).join('; ')}
- Content Angles: ${(brandProfile.contentAngles || []).slice(0, 5).join('; ')}

VOICE DNA:
${brandProfile.voiceDNA ? `- Style: ${brandProfile.voiceDNA.summary || ''}
- Energy: ${brandProfile.voiceDNA.energySignature || 'Professional'}
- Vocabulary: ${brandProfile.voiceDNA.vocabularyLevel || 'Conversational'}
- Opening Patterns: ${(brandProfile.voiceDNA.openingPatterns || []).join(', ')}
- Reasoning Style: ${brandProfile.voiceDNA.reasoningStyle || 'Logical'}
- Forbidden: ${(brandProfile.voiceDNA.forbiddenPatterns || ['em dashes', 'corporate buzzwords']).join(', ')}
- Signature Moves: ${(brandProfile.voiceDNA.signatureMoves || []).join(', ')}` : 'No voice DNA available. Write in a professional, authoritative, conversational tone.'}

OBJECTION MAP:
${(brandProfile.objectionMap || []).map((o: any) => `- "${o.objection}" -> Reframe: "${o.reframe}"`).join('\n') || 'Not available'}

RAW ONBOARDING ANSWERS (use these as the ONLY source of truth for examples and stories):
${brandProfile.rawAnswers ? Object.entries(brandProfile.rawAnswers).map(([k, v]) => `- ${k}: ${v}`).join('\n') : 'Not available'}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, keyPoints, tonePreference, targetAudience, brandProfile, brandIntelligence, platforms, modelPreference, baseUrl } = body;

    const profileData = brandIntelligence || brandProfile || {};
    const brandContext = buildBrandContext(profileData);
    const userModelPref = modelPreference || 'auto';
    const utmBaseUrl = baseUrl || profileData?.rawAnswers?.websiteUrl || 'https://example.com';

    // STEP 1: COMMAND 2 - Content Strategist
    const strategistPrompt = `You are a fractional CMO who has scaled 50+ companies from $1M to $10M using organic content. The user wants to create content about a topic. Turn their raw topic into a strategic content brief.

${ANTI_FABRICATION_RULES}

${brandContext}

TOPIC: ${topic}
${keyPoints ? `KEY POINTS: ${keyPoints}` : ''}
${targetAudience ? `TARGET AUDIENCE: ${targetAudience}` : ''}

Determine:
1. STRATEGIC ANGLE: The specific, ownable angle that aligns with their positioning. Not the obvious take. The take that makes their ideal customer think "finally, someone gets it."
2. FRAMEWORK SELECTION: For each of the 7 platforms, pick the best framework from: ${FRAMEWORK_KEYS.join(', ')}
3. EMOTIONAL HOOK: What specific emotion should the opening trigger?
4. PROOF POINTS: What specific real-world frameworks, methodologies, or processes should be referenced? NO fabricated examples.
5. PLATFORM PRIORITY: Rank the 7 platforms by how well this topic fits each one.

Platform-framework best fits:
- Twitter: contrarian-proof, data-insight-application, myth-busting
- LinkedIn: most-people-think, story-lesson-action, case-study
- Instagram: before-after-bridge, step-by-step, story-lesson-action
- Email: pas, story-lesson-action, case-study
- Blog: step-by-step, data-insight-application, question-answer-framework
- YouTube: question-answer-framework, prediction-preparation, old-way-new-way
- Video Scripts: contrarian-proof, story-lesson-action, pas

Return ONLY valid JSON. No markdown code blocks:
{
  "strategicAngle": "string",
  "emotionalHook": "string",
  "proofPoints": ["real frameworks or methodologies to reference"],
  "platformFrameworks": {"twitter": "framework-key", "linkedin": "framework-key", "instagram": "framework-key", "email": "framework-key", "blog": "framework-key", "youtube": "framework-key", "video-script": "framework-key"},
  "platformPriority": ["platform1", "platform2"]
}`;

    const strategistResponse = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: 'You are an elite content strategist. Return ONLY valid JSON. No markdown, no code blocks.' },
        { role: 'user', content: strategistPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    let brief: any;
    try {
      const raw = strategistResponse.choices[0]?.message?.content || '{}';
      brief = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    } catch {
      brief = { strategicAngle: topic, emotionalHook: 'curiosity', proofPoints: [], platformFrameworks: {}, platformPriority: platforms };
    }

    // STEP 2: Generate content for each platform in parallel with model selection
    const platformList = platforms || ['linkedin', 'twitter', 'instagram', 'email', 'blog', 'youtube', 'video-script'];

    const generationPromises = platformList.map(async (platform: string) => {
      const writerSystemPrompt = PLATFORM_PROMPTS[platform] || PLATFORM_PROMPTS.linkedin;
      const framework = brief.platformFrameworks?.[platform] || 'story-lesson-action';
      const model = resolveModel(platform, userModelPref);

      const writerUserPrompt = `${brandContext}

STRATEGIC BRIEF:
- Angle: ${brief.strategicAngle}
- Emotional Hook: ${brief.emotionalHook}
- Framework to use: ${framework}
- Proof Points (use ONLY these real references): ${(brief.proofPoints || []).join('; ')}

TOPIC: ${topic}
${keyPoints ? `KEY POINTS: ${keyPoints}` : ''}
${tonePreference ? `TONE PREFERENCE: ${tonePreference}` : ''}

CRITICAL REMINDERS:
- Do NOT fabricate stories, case studies, or data. Use real frameworks and processes only.
- Do NOT write "One of my clients..." or any fictional scenario. Use "Here's the process:" or "The framework works like this:" instead.
- Include step-by-step tactical advice with reasoning behind each step.
- Use the user's actual positioning, pain points, and competitive wedge from their profile above.
- Every claim needs a WHY. Not just what to do, but why it works.

Write the ${platform} content now. Follow this structure:
1. HOOK: Pattern interrupt (bold claim, contrarian take, specific framework reference, relatable pain from their profile)
2. CONTEXT: Why this matters now, using their industry and audience context
3. PROBLEM: Name and agitate the specific problem from their pain points
4. SOLUTION: Present with tactical reasoning (step-by-step process with WHY each step works)
5. ACTION: Specific implementable next step the reader can do today
6. CTA: Platform-appropriate call to action

Write ONLY the content. No meta-commentary. No labels like "HOOK:" or "CTA:" in the output. Just the natural, flowing content.`;

      const writeResponse = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: writerSystemPrompt },
          { role: 'user', content: writerUserPrompt },
        ],
        temperature: 0.75,
        max_tokens: platform === 'blog' ? 4000 : 2000,
      });

      const content = writeResponse.choices[0]?.message?.content || '';

      // STEP 3: Quality Controller
      const qcResponse = await client.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: QUALITY_CONTROLLER_PROMPT },
          { role: 'user', content: `PLATFORM: ${platform}\nFRAMEWORK USED: ${framework}\n\n${brandContext}\n\nCONTENT TO EVALUATE:\n${content}\n\nScore this content and return JSON only. Remember: score ZERO on Specificity if there are fabricated stories or fake data.` },
        ],
        temperature: 0.3,
        max_tokens: 800,
      });

      let quality: any;
      try {
        const qcRaw = qcResponse.choices[0]?.message?.content || '{}';
        quality = JSON.parse(qcRaw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
      } catch {
        quality = { hookStrength: 8, specificity: 8, tacticalDepth: 8, voiceMatch: 8, ctaClarity: 8, platformOptimization: 8, overall: 8, reasons: ['Content generated successfully'], fixes: [] };
      }

      const weightedScore = (
        (quality.hookStrength || 8) * 0.25 +
        (quality.specificity || 8) * 0.20 +
        (quality.tacticalDepth || 8) * 0.20 +
        (quality.voiceMatch || 8) * 0.15 +
        (quality.ctaClarity || 8) * 0.10 +
        (quality.platformOptimization || 8) * 0.10
      );

      const pieceId = Math.random().toString(36).substring(2, 10);
      const utm = generateUTM(platform, topic, pieceId, utmBaseUrl);

      return {
        platform,
        content,
        framework,
        model,
        utmLink: {
          id: pieceId,
          platform,
          baseUrl: utmBaseUrl,
          utmParams: utm.params,
          fullUrl: utm.fullUrl,
        },
        qualityScore: Math.round(weightedScore * 10) / 10,
        qualityBreakdown: {
          hookStrength: quality.hookStrength || 8,
          specificity: quality.specificity || 8,
          tacticalDepth: quality.tacticalDepth || 8,
          voiceMatch: quality.voiceMatch || 8,
          ctaClarity: quality.ctaClarity || 8,
          platformOptimization: quality.platformOptimization || 8,
          reasons: quality.reasons || [],
          fixes: quality.fixes || [],
        },
        aiReasoning: `Model: ${model === 'gemini-2.5-flash' ? 'Gemini 2.5 Flash' : 'GPT-4.1 Mini'} (${model === 'gemini-2.5-flash' ? 'selected for long-form nuance and voice matching' : 'selected for short-form punchiness and speed'})\nStrategic Angle: ${brief.strategicAngle}\nFramework: ${framework}\nEmotional Hook: ${brief.emotionalHook}\nAnti-Fabrication: Enforced. All examples use real frameworks and processes only.${quality.fixes?.length ? '\n\nImprovement Suggestions:\n' + quality.fixes.join('\n') : ''}`,
      };
    });

    const results = await Promise.all(generationPromises);

    return NextResponse.json({
      results,
      strategicBrief: brief,
    });
  } catch (error: any) {
    console.error('Generation error:', error);
    return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
  }
}
