import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function test() {
  try {
    const conversation = [
      { role: "system", content: "You are 'Halo'." },
      { role: "user", content: "did the permit clear" }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: conversation
    });

    console.log(JSON.stringify(response.choices[0].message, null, 2));
  } catch (e) {
    console.error(e);
  }
}
test();
