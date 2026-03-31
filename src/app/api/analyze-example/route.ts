import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI();

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    const response = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: `You are a content pattern analyst. Analyze the given content example and extract the writing patterns that make it effective. Focus on:
1. Opening pattern (how it hooks the reader)
2. Sentence rhythm (short vs long, fragments, etc.)
3. Structural pattern (how ideas flow)
4. Voice markers (unique phrases, tone indicators)
5. Closing pattern (how it ends)

Return a concise 2-3 sentence summary of the key patterns. Be specific about what makes this content work.`,
        },
        { role: 'user', content: `Analyze this content:\n\n${content}` },
      ],
      temperature: 0.5,
      max_tokens: 300,
    });

    const patterns = response.choices[0]?.message?.content || '';
    return NextResponse.json({ patterns });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
