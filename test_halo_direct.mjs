import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const TOOLS = [
  {
    type: "function",
    function: {
      name: "search_jobs",
      description: "Search active jobs by customer name, address, or job title. Returns job status, schedule, and assigned technician.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Name, address, or keywords" }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_technician_location",
      description: "Get the current location, status, and current job of a specific technician.",
      parameters: {
        type: "object",
        properties: {
          tech_name: { type: "string", description: "First name of the technician" }
        },
        required: ["tech_name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "check_permit_status",
      description: "Check the status of a permit by city, municipality, or address.",
      parameters: {
        type: "object",
        properties: {
          location_query: { type: "string", description: "City or address. Leave blank if unknown to get all recent permits." }
        }
      }
    }
  }
];

async function test() {
  try {
    const conversation = [
      { role: "system", content: "You are 'Halo'." },
      { role: "user", content: "did the permit clear" }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: conversation,
      tools: TOOLS,
      tool_choice: "auto",
    });

    console.log(JSON.stringify(response.choices[0].message, null, 2));
  } catch (e) {
    console.error(e);
  }
}
test();
