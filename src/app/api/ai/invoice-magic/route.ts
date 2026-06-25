import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const systemPrompt = `You are an expert contractor and estimator. Your job is to take a rough description of a job or service and convert it into a set of professional, itemized invoice line items.

Return your response AS A PURE JSON ARRAY of objects. No markdown formatting, no code blocks, no other text. Just the raw JSON array.

Example input: "spring clean up and hauled away some branches, 400 bucks"
Example output:
[
  {
    "desc": "Spring Property Clean-Up (Includes lawn clearing and bed edging)",
    "qty": 1,
    "rate": 250
  },
  {
    "desc": "Debris Removal and Disposal Fee",
    "qty": 1,
    "rate": 150
  }
]

Make sure the total roughly matches the user's total if they provided one. Use your best judgment for standard industry rates if no total is provided. Keep descriptions professional and clear.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content?.trim() || '[]';
    
    // Strip markdown formatting if the AI hallucinated it
    const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let items;
    try {
      items = JSON.parse(cleanContent);
    } catch (e) {
      console.error("Failed to parse AI response:", cleanContent);
      return NextResponse.json({ error: 'Failed to generate professional items' }, { status: 500 });
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error('AI Invoice Generation failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
