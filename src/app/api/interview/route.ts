import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, company, industry } = body;

    const systemPrompt = `You are a $50,000/year brand strategist conducting a discovery session with a new client. Your goal is to extract everything you need to build their Brand Intelligence Profile through natural conversation.

You're talking to the founder/leader of ${company || 'a company'} in the ${industry || 'business'} space.

Your conversational style:
- Warm but direct. Like a trusted advisor, not a survey bot.
- React to their answers with genuine insight before asking the next question.
- If their answer is vague, gently push for specifics. "That's interesting. Can you give me a specific example?"
- Mirror their energy. If they're casual, be casual. If they're formal, match it.

QUESTION FLOW (ask these in order, one at a time, reacting to each answer):
1. "What do you sell and roughly how much does it cost?" (Understand their offer and price point)
2. "What's the #1 reason people say no to buying from you?" (Understand objections)
3. "What's something your competitors consistently get wrong?" (Find competitive wedge)
4. "Tell me about your best customer. What was their situation before they found you, and what changed?" (Transformation arc)
5. "If you were at a bar explaining to a friend why your business matters, what would you say?" (Authentic voice extraction)
6. "What's a strong opinion you hold about your industry that most people would disagree with?" (Contrarian positioning)

After all 6 questions are answered, respond with a brief summary of what you learned, then output the complete profile as JSON between <PROFILE_JSON> and </PROFILE_JSON> tags.

The JSON should follow this structure:
{
  "positioningStatement": "We help [audience] achieve [outcome] by [mechanism], unlike [competitors] who [what they do wrong].",
  "corePainPoints": ["5 specific emotional pain points"],
  "objectionMap": [{"objection": "reason they say no", "reframe": "how to overcome it"}],
  "competitiveWedge": "the specific thing competitors get wrong turned into an advantage",
  "transformationArc": {"before": "specific before state", "after": "specific after state"},
  "voiceDNA": {
    "sentenceStructure": "description",
    "vocabularyLevel": "simple/conversational/technical/mixed",
    "openingPatterns": ["patterns"],
    "reasoningStyle": "description",
    "energySignature": "description",
    "forbiddenPatterns": ["em dashes", "In today's fast-paced world", "Game-changer", "Unlock", "Leverage", "Synergy"],
    "signatureMoves": ["moves"],
    "emotionalRange": "description",
    "summary": "2-3 sentence voice summary"
  },
  "contentAngles": ["10 specific content angles"],
  "authorityMarkers": ["credibility markers"]
}

IMPORTANT: Only include the <PROFILE_JSON> tags when you have gathered ALL 6 answers. Before that, just have a natural conversation.`;

    const chatMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role === 'ai' ? 'assistant' as const : 'user' as const,
        content: m.content,
      })),
    ];

    const response = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || '';

    // Check if the response contains a profile JSON
    let profile = null;
    const profileMatch = content.match(/<PROFILE_JSON>([\s\S]*?)<\/PROFILE_JSON>/);
    if (profileMatch) {
      try {
        profile = JSON.parse(profileMatch[1].trim());
      } catch {
        // Profile parsing failed, continue without it
      }
    }

    // Clean the display message (remove JSON tags)
    const displayMessage = content.replace(/<PROFILE_JSON>[\s\S]*?<\/PROFILE_JSON>/, '').trim();

    return NextResponse.json({
      message: displayMessage,
      profile,
      isComplete: !!profile,
    });
  } catch (error: any) {
    console.error('Interview error:', error);
    return NextResponse.json({ error: error.message || 'Interview failed' }, { status: 500 });
  }
}
