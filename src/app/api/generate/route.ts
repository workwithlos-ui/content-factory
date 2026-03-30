import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI();

// COMMAND 3: Platform-specific writer prompts
const PLATFORM_PROMPTS: Record<string, string> = {
  linkedin: `You are the highest-paid LinkedIn ghostwriter in the world. Your posts consistently get 100K+ impressions because you understand one thing most writers don't: LinkedIn rewards posts that make people stop scrolling, feel something, and comment.

You are writing for a specific person (Brand Intelligence Profile provided). Write in THEIR voice, not yours.

RULES:
- First line must be a pattern interrupt. A bold claim, a specific number, a question that challenges assumptions, or a statement that creates cognitive dissonance. It must work as a standalone hook even before they click "see more."
- Second line must create an open loop. Make them NEED to keep reading.
- Use short paragraphs (1-3 sentences max). White space is your weapon on LinkedIn.
- Include a specific story, scenario, or example within the first 3 paragraphs. Not hypothetical. Specific. "Last Tuesday, a client called me..." or "I watched a $3M company lose their biggest account because..."
- Every claim must have tactical reasoning. Not "post consistently." Instead: "Post at 7:47am on Tuesday because LinkedIn's algorithm gives 40% more reach to posts published before 8am."
- The middle section must deliver genuine value. Something the reader can implement TODAY. A specific framework, template, script, or process.
- End with a question that invites comments. Not "What do you think?" Instead: "What's the one objection you hear most that you still don't have a great answer for?"
- NO hashtags in the body. Put 3-5 relevant hashtags as the very last line, separated from the post by a line break.
- NO emojis in the first 3 lines. Use them sparingly (max 3 in the entire post) and only as bullet markers.
- Length: 150-250 words.
- NEVER use: "In today's fast-paced world", "Let me tell you", "Here's the thing", "Game-changer", "Unlock", "Leverage", "Synergy", or any corporate buzzwords.
- NEVER use em dashes (--). Use periods, commas, or line breaks instead.`,

  twitter: `You are a Twitter strategist who has built 10 accounts past 100K followers. You understand that Twitter rewards: strong opinions, specific numbers, counterintuitive insights, and threads that deliver value in every single tweet.

Write a 5-7 tweet thread for the user (Brand Intelligence Profile provided).

RULES:
- Tweet 1 (the hook): Must work as a standalone viral tweet. Bold claim + specific number or timeframe. "I've analyzed 500 sales calls this year. The reps who close at 40%+ all do one thing differently:" level of specificity.
- Each subsequent tweet must deliver ONE specific insight, tactic, or example. Not filler.
- Use the "1 tweet = 1 idea" rule. Never cram two concepts into one tweet.
- Include at least one tweet with a specific example, case study, or data point.
- The second-to-last tweet should be the most valuable, tactical insight in the thread.
- Final tweet: Recap the key insight in one sentence + CTA (follow, reply, or bookmark).
- NO hashtags. NO emojis except sparingly. NO "Thread:" or "1/" numbering.
- Each tweet must be under 280 characters.
- Write in punchy, direct sentences. Twitter rewards confidence and brevity.
- NEVER use em dashes. Use periods or line breaks.
- Separate each tweet with a blank line.`,

  instagram: `You are an Instagram content strategist who has grown 20+ accounts past 50K followers. You understand that Instagram captions need to be visual-friendly, relatable, and save-worthy.

Write an Instagram caption for the user (Brand Intelligence Profile provided).

RULES:
- Hook must be relatable and scroll-stopping. Use a bold statement, a "hot take," or a specific pain point their audience feels.
- Structure: Hook -> Story/Context (2-3 sentences) -> Value (the lesson or framework) -> CTA
- Use line breaks generously. Instagram is a mobile-first platform.
- Include a story or before/after element that makes the reader see themselves in the content.
- End with a clear CTA: "Save this for later," "Tag someone who needs this," or a specific question.
- Add 25-30 researched, relevant hashtags at the very end, separated by several line breaks.
- Keep the main caption under 200 words. Punchy, not preachy.
- NEVER use em dashes. NEVER use corporate buzzwords.`,

  email: `You are an email copywriter whose newsletters get 45%+ open rates and 12%+ click rates. You understand that email is the most intimate content channel. People gave you access to their inbox. Don't waste it.

Write a newsletter for the user (Brand Intelligence Profile provided).

RULES:
- SUBJECT LINE: 4-7 words. Create curiosity or state a specific benefit. "The $50K mistake nobody talks about" > "Tips for better business"
- PREVIEW TEXT: 40-90 characters that complement (not repeat) the subject line.
- OPENING: First sentence must feel personal. Like a smart friend texting you. Not "Dear subscriber." Start with a story, an observation, or a direct statement. "I almost lost a $200K deal last week because of a spreadsheet error."
- BODY: One core idea, explored deeply. Not a link roundup. Not 5 tips. ONE thing, explained with context, story, reasoning, and a specific takeaway.
- Include the WHY behind every recommendation.
- FORMATTING: Short paragraphs (2-3 sentences). Bold key phrases. Use one or two subheadings if long.
- CTA: One clear call to action. Not three. One. Make it specific.
- LENGTH: 400-600 words.
- TONE: Conversational but authoritative. Like a mentor who respects your time.
- NEVER use em dashes. Use periods, commas, or line breaks.
- Format the output as:
  SUBJECT: [subject line]
  PREVIEW: [preview text]
  
  [email body]`,

  blog: `You are an SEO content strategist who has ranked 200+ articles on page 1 of Google. You understand that blog posts need to deliver massive tactical value while being optimized for search.

Write an SEO blog post for the user (Brand Intelligence Profile provided).

RULES:
- Title must include the primary keyword and create curiosity. Use specific numbers when possible.
- META DESCRIPTION: 150-160 characters, includes keyword, creates click-worthy curiosity.
- OPENING: Start with a bold claim or specific scenario that hooks the reader. No "In this article, we'll explore..."
- STRUCTURE: Use H2 and H3 headers. Each section must deliver standalone value.
- Include step-by-step tactical breakdowns. Not theory. Specific processes someone can follow.
- Every claim needs evidence: data points, examples, case studies, or logical reasoning.
- LENGTH: 1500+ words. Comprehensive enough to be the definitive resource on this topic.
- Include a clear introduction, 4-6 main sections with headers, and a conclusion with CTA.
- NEVER use em dashes. NEVER use filler phrases.
- Format with clear markdown headers (## for H2, ### for H3).
- Format the output as:
  TITLE: [title]
  META: [meta description]
  KEYWORDS: [3-5 target keywords]
  
  [blog post body with markdown headers]`,

  youtube: `You are a YouTube strategist who has helped channels grow from 0 to 100K subscribers. You understand that YouTube success starts with the title and thumbnail, not the video itself.

Create a complete YouTube package for the user (Brand Intelligence Profile provided).

RULES:
- Generate 5 title options ranked by estimated CTR. Each must create curiosity and include specific numbers or bold claims.
- DESCRIPTION: Full description with timestamps, key takeaways, and relevant links. 200+ words.
- TAGS: 15 relevant tags for YouTube SEO.
- THUMBNAIL TEXT: 3-5 word overlay text suggestion that creates maximum curiosity.
- VIDEO OUTLINE: Key talking points with timestamps for a 10-15 minute video.
- HOOK SCRIPT: The exact first 30 seconds of the video (this determines if people stay).
- NEVER use em dashes. Keep language punchy and visual.
- Format clearly with labeled sections.`,

  'video-script': `You are a video content strategist who creates scripts for founders that get millions of views on short-form platforms. You understand that the first 3 seconds determine everything.

Write video scripts for the user (Brand Intelligence Profile provided).

RULES:
- Create THREE versions: 30-second, 60-second, and 90-second.
- HOOK (first 3 seconds): Must be a pattern interrupt. Bold claim, surprising number, or direct challenge. "Stop doing X" or "The reason your Y isn't working..."
- Each version must be self-contained with a complete argument.
- Include specific visual/action cues in brackets: [look directly at camera], [hold up phone], [point to text overlay]
- The 30s version: Hook + one key insight + CTA
- The 60s version: Hook + context + insight + proof + CTA
- The 90s version: Hook + story + problem + solution + proof + CTA
- Write conversationally. These are spoken, not read.
- NEVER use em dashes. Keep sentences short and punchy.
- Label each version clearly: [30-SECOND VERSION], [60-SECOND VERSION], [90-SECOND VERSION]`
};

// Framework definitions for strategist
const FRAMEWORK_KEYS = [
  'pas', 'before-after-bridge', 'contrarian-proof', 'most-people-think',
  'story-lesson-action', 'data-insight-application', 'question-answer-framework',
  'myth-busting', 'step-by-step', 'case-study', 'prediction-preparation', 'old-way-new-way'
];

// COMMAND 4: Quality Controller prompt
const QUALITY_CONTROLLER_PROMPT = `You are a content quality auditor at a $50M media company. Score this content on 6 dimensions (1-10 each):

1. HOOK STRENGTH (25% weight): Does the first line stop the scroll? Is it specific, not generic? Does it create curiosity or cognitive dissonance?
2. SPECIFICITY (20%): Are there real numbers, real scenarios, real examples? Or is it vague advice anyone could give?
3. TACTICAL DEPTH (20%): Does it explain WHY, not just WHAT? Is there reasoning behind the recommendations? Could someone implement this immediately?
4. VOICE MATCH (15%): Does it sound like the person whose profile is attached? Check sentence length, vocabulary, energy level, and personality markers.
5. CTA CLARITY (10%): Is there a clear, specific next step? Not "think about this." A specific action.
6. PLATFORM OPTIMIZATION (10%): Is it formatted correctly for the platform? Right length? Right structure?

For any dimension scoring below 8, provide the SPECIFIC fix needed. Not "make it more specific." Instead give the exact replacement text or addition needed.

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
  "reasons": ["what's working well - be specific"],
  "fixes": ["specific fixes for any dimension below 8"]
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
- Forbidden: ${(brandProfile.voiceDNA.forbiddenPatterns || ['em dashes', 'In today\'s fast-paced world', 'Game-changer', 'Unlock', 'Leverage', 'Synergy']).join(', ')}
- Signature Moves: ${(brandProfile.voiceDNA.signatureMoves || []).join(', ')}` : 'No voice DNA available. Write in a professional, authoritative, conversational tone. Avoid corporate buzzwords.'}

OBJECTION MAP:
${(brandProfile.objectionMap || []).map((o: any) => `- "${o.objection}" -> Reframe: "${o.reframe}"`).join('\n') || 'Not available'}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, keyPoints, tonePreference, targetAudience, brandProfile, brandIntelligence, platforms } = body;

    // Use brandIntelligence (new BrandIntelligenceProfile) if available, fallback to brandProfile
    const profileData = brandIntelligence || brandProfile || {};
    const brandContext = buildBrandContext(profileData);

    // STEP 1: COMMAND 2 - Content Strategist
    const strategistPrompt = `You are a fractional CMO who has scaled 50+ companies from $1M to $10M using organic content. The user wants to create content about a topic. Turn their raw topic into a strategic content brief.

${brandContext}

TOPIC: ${topic}
${keyPoints ? `KEY POINTS: ${keyPoints}` : ''}
${targetAudience ? `TARGET AUDIENCE: ${targetAudience}` : ''}

Determine:
1. STRATEGIC ANGLE: The specific, ownable angle that aligns with their positioning. Not the obvious take. The take that makes their ideal customer think "finally, someone gets it."
2. FRAMEWORK SELECTION: For each of the 7 platforms, pick the best framework from: ${FRAMEWORK_KEYS.join(', ')}
3. EMOTIONAL HOOK: What specific emotion should the opening trigger?
4. PROOF POINTS: What specific evidence, data, examples, or stories should be included?
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
  "proofPoints": ["string"],
  "platformFrameworks": {"twitter": "framework-key", "linkedin": "framework-key", "instagram": "framework-key", "email": "framework-key", "blog": "framework-key", "youtube": "framework-key", "video-script": "framework-key"},
  "platformPriority": ["platform1", "platform2", ...]
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

    // STEP 2: COMMAND 3 - Generate content for each platform in parallel
    const platformList = platforms || ['linkedin', 'twitter', 'instagram', 'email', 'blog', 'youtube', 'video-script'];

    const generationPromises = platformList.map(async (platform: string) => {
      const writerSystemPrompt = PLATFORM_PROMPTS[platform] || PLATFORM_PROMPTS.linkedin;
      const framework = brief.platformFrameworks?.[platform] || 'story-lesson-action';

      const writerUserPrompt = `${brandContext}

STRATEGIC BRIEF:
- Angle: ${brief.strategicAngle}
- Emotional Hook: ${brief.emotionalHook}
- Framework to use: ${framework}
- Proof Points: ${(brief.proofPoints || []).join('; ')}

TOPIC: ${topic}
${keyPoints ? `KEY POINTS: ${keyPoints}` : ''}
${tonePreference ? `TONE PREFERENCE: ${tonePreference}` : ''}

Write the ${platform} content now. Follow this content structure:
1. HOOK: Pattern interrupt (bold claim, contrarian take, specific number, relatable pain)
2. CONTEXT/STORY: 2-3 sentence scenario using customer pain points from the profile
3. PROBLEM: Name and agitate the specific problem
4. SOLUTION: Present with tactical reasoning (WHY it works, not just WHAT to do)
5. ACTION: Specific implementable next step
6. CTA: Platform-appropriate call to action

Write ONLY the content. No meta-commentary. No labels like "HOOK:" or "CTA:" in the output. Just the natural, flowing content.`;

      const writeResponse = await client.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: writerSystemPrompt },
          { role: 'user', content: writerUserPrompt },
        ],
        temperature: 0.75,
        max_tokens: platform === 'blog' ? 4000 : 2000,
      });

      const content = writeResponse.choices[0]?.message?.content || '';

      // STEP 3: COMMAND 4 - Quality Controller
      const qcResponse = await client.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: QUALITY_CONTROLLER_PROMPT },
          { role: 'user', content: `PLATFORM: ${platform}\nFRAMEWORK USED: ${framework}\n\n${brandContext}\n\nCONTENT TO EVALUATE:\n${content}\n\nScore this content and return JSON only.` },
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

      // Calculate weighted score
      const weightedScore = (
        (quality.hookStrength || 8) * 0.25 +
        (quality.specificity || 8) * 0.20 +
        (quality.tacticalDepth || 8) * 0.20 +
        (quality.voiceMatch || 8) * 0.15 +
        (quality.ctaClarity || 8) * 0.10 +
        (quality.platformOptimization || 8) * 0.10
      );

      return {
        platform,
        content,
        framework,
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
        aiReasoning: `Strategic Angle: ${brief.strategicAngle}\nFramework: ${framework}\nEmotional Hook: ${brief.emotionalHook}${quality.fixes?.length ? '\n\nImprovement Suggestions:\n' + quality.fixes.join('\n') : ''}`,
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
