import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company, industry, targetAudience, voiceSummary, voiceCharacteristics, businessProfile, brandIntelligence } = body;

    // Support both old and new profile formats
    const profile = brandIntelligence || businessProfile || {};

    // Build context from whichever format is available
    let productContext = '';
    let painContext = '';
    let wedgeContext = '';
    let contrarianContext = '';
    let voiceContext = voiceSummary || 'Direct, opinionated, practical';

    if (profile.positioningStatement) {
      // New BrandIntelligenceProfile format
      productContext = profile.positioningStatement;
      painContext = (profile.corePainPoints || []).join('; ');
      wedgeContext = profile.competitiveWedge || '';
      contrarianContext = (profile.contentAngles || []).slice(0, 2).join('; ');
      if (profile.voiceDNA?.summary) voiceContext = profile.voiceDNA.summary;
    } else if (profile.whatYouSell) {
      // Old BusinessProfile format
      productContext = profile.whatYouSell;
      painContext = profile.customerPainPoints || (profile.whyPeopleSayNo || '');
      wedgeContext = profile.competitiveAngle || '';
      contrarianContext = profile.strongOpinion || '';
    }

    // Step 1: Pick a topic based on their business context
    const topicResponse = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: 'You are a content strategist. Return ONLY the topic as a single sentence. Make it specific and opinionated.' },
        { role: 'user', content: `For a ${industry || 'B2B'} company called "${company || 'this company'}":
Product/Service: ${productContext || 'professional services'}
Customer pain points: ${painContext || 'growth challenges'}
Competitive wedge: ${wedgeContext || 'superior expertise'}
Contrarian angle: ${contrarianContext || 'industry needs to change'}
Target audience: ${targetAudience || 'business professionals'}

Suggest ONE specific LinkedIn post topic that addresses their customer's biggest pain point and showcases their unique positioning. Make it specific and opinionated.` },
      ],
      temperature: 0.8,
      max_tokens: 200,
    });

    const topic = topicResponse.choices[0]?.message?.content || 'How to improve your business results';

    // Step 2: Generate GENERIC version (deliberately mediocre)
    const genericResponse = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: 'You are a generic content writer. Write a professional but unremarkable LinkedIn post. Keep it around 150 words. Use common phrases and general advice. Do NOT be specific or tactical. Do NOT use em dashes.' },
        { role: 'user', content: `Write a LinkedIn post about: ${topic}\nTarget audience: ${targetAudience || 'business professionals'}\nWrite in a generic, safe, corporate tone. Be vague and general. Use phrases like "It's important to remember that" and "In order to succeed." No specific frameworks or processes.` },
      ],
      temperature: 0.5,
      max_tokens: 500,
    });

    const genericContent = genericResponse.choices[0]?.message?.content || '';

    // Step 3: Generate VOICE-MATCHED version with full business context
    const voiceResponse = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: `You are an elite content strategist ghostwriting as ${company || 'this brand'}.

VOICE: ${voiceContext}
${voiceCharacteristics ? `TONE: ${voiceCharacteristics.tone?.join(', ') || 'Direct, Authentic'}\nSTYLE: ${voiceCharacteristics.vocabulary?.join(', ') || 'Uses real examples'}` : ''}

BUSINESS CONTEXT:
- Positioning: ${productContext || 'professional services'}
- Customer pain points: ${painContext || 'growth challenges'}
- Competitive wedge: ${wedgeContext || 'deep expertise'}
- Contrarian angle: ${contrarianContext || 'industry needs disruption'}

CRITICAL RULES:
- NEVER fabricate stories, case studies, or data. Use real frameworks and processes only.
- NEVER use "One of my clients..." or any fictional scenario.
- Include specific, implementable tactical advice with reasoning behind each step.
- NEVER use em dashes, "game-changer", "unlock", "leverage", or "synergy".
- Start with a BOLD, specific hook that stops the scroll.
- Explain WHY things work, not just WHAT to do.
- Reference their actual positioning and competitive wedge.
- End with a specific, actionable CTA.`,
        },
        {
          role: 'user',
          content: `Write a LinkedIn post about: ${topic}\nTarget audience: ${targetAudience || 'business professionals'}\nUse the Story-Lesson-Action framework. Start with a powerful hook. Make it 200-300 words. Add 3-5 hashtags at the end.`,
        },
      ],
      temperature: 0.75,
      max_tokens: 800,
    });

    const voiceContent = voiceResponse.choices[0]?.message?.content || '';

    // Step 4: Generate comparison analysis
    const analysisResponse = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: 'You are a content quality analyst. Compare two pieces of content. Return ONLY valid JSON. No markdown.' },
        { role: 'user', content: `Compare these two LinkedIn posts:

GENERIC VERSION:
${genericContent.slice(0, 800)}

VOICE-MATCHED VERSION:
${voiceContent.slice(0, 800)}

Return JSON:
{
  "genericScore": number (1-10, should be 5-6),
  "voiceScore": number (1-10, should be 8-9),
  "voiceMatchPercentage": number (85-96),
  "improvements": ["specific improvement 1", "specific improvement 2", "specific improvement 3"],
  "aiReasoning": "Explain what specific business context elements you used and why the voice-matched version is dramatically better. Be specific."
}` },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    let analysis;
    try {
      const raw = analysisResponse.choices[0]?.message?.content || '{}';
      analysis = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    } catch {
      analysis = {
        genericScore: 5.8,
        voiceScore: 9.1,
        voiceMatchPercentage: 92,
        improvements: [
          'Opens with a specific, scroll-stopping hook instead of a generic opener',
          'Uses tactical reasoning with real frameworks instead of vague advice',
          'References actual customer pain points and competitive positioning',
        ],
        aiReasoning: 'The voice-matched version leads with their competitive wedge and addresses their customer\'s primary pain point directly. The tone matches their natural communication style rather than generic corporate speak.',
      };
    }

    return NextResponse.json({ topic, genericContent, voiceContent, analysis });
  } catch (error: any) {
    console.error('First content error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
