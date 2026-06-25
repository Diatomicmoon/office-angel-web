const OpenAI = require('openai');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function run() {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Say "hello"' }],
      max_tokens: 5
    });
    console.log('Success:', response.choices[0].message.content);
  } catch (err) {
    console.error('Error:', err.message);
  }
}
run();
