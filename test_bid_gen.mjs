import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import OpenAI from 'openai';

async function test() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = `You are a Master Electrician acting as the "Pro Bid Writer" for an electrical contractor.
Analyze this permit pulled by a builder for a new construction project.
Based on the description, estimate the electrical rough-in and finish costs.

Permit Details:
Address: 100 Eden Prairie Pkwy, Eden Prairie
Contractor: LENNAR HOMES
Description / Notes: Sqft/Desc: New 4,200 sqft Custom Home | Permit: BLD-24-001

If the square footage is mentioned, use an industry average of about 1 device/fixture per 25 sqft.
Assume standard material costs ($1.50/ft for wire, standard decora devices, etc.) and standard labor rates ($120/hr).
Output a JSON object with the rough estimated totals. Do not include markdown formatting.
{
  "estimated_sqft": number,
  "estimated_fixtures": number,
  "material_cost": number,
  "labor_cost": number,
  "total_bid": number,
  "confidence": "high" | "medium" | "low"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  console.log(response.choices[0].message.content);
}
test();
