export const dynamic = 'force-dynamic';
export const maxDuration = 60;

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getCompanyId(supabase: any) {
  let companyId = process.env.OFFICE_ANGEL_COMPANY_ID;
  if (!companyId) {
    const { data } = await supabase.from("companies").select("id").order("created_at", { ascending: true }).limit(1);
    companyId = data?.[0]?.id;
  }
  return companyId;
}

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
          location_query: { type: "string", description: "City or address" }
        },
        required: ["location_query"]
      }
    }
  }
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
    );
    const companyId = await getCompanyId(supabase);

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const systemPrompt = {
      role: "system",
      content: "You are 'Halo', the internal AI assistant for Hard Hat Solutions. You help dispatchers and office staff quickly find information about jobs, technicians, and permits without them having to click through menus. Use the provided tools to query the database. Keep your answers concise, direct, and professional."
    };

    const conversation = [systemPrompt, ...messages];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: conversation,
      tools: TOOLS as any,
      tool_choice: "auto",
    });

    const responseMessage = response.choices[0].message;

    // If the model doesn't want to call a tool, just return its text answer.
    if (!responseMessage.tool_calls) {
      return NextResponse.json({ message: responseMessage });
    }

    // Process tool calls
    const toolCalls = responseMessage.tool_calls;
    conversation.push(responseMessage);

    for (const toolCall of toolCalls) {
      if (toolCall.type !== "function") continue;
      
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);
      let functionResult = "";

      if (functionName === "search_jobs") {
        const { data } = await supabase
          .from("jobs")
          .select("title, address, status, scheduled_start, technicians(name), customers(first_name, last_name)")
          .eq("company_id", companyId)
          .ilike("title", `%${functionArgs.query}%`)
          .limit(3);
        
        // If title fails, try address
        let finalData = data;
        if (!data || data.length === 0) {
           const { data: altData } = await supabase
            .from("jobs")
            .select("title, address, status, scheduled_start, technicians(name), customers(first_name, last_name)")
            .eq("company_id", companyId)
            .ilike("address", `%${functionArgs.query}%`)
            .limit(3);
           finalData = altData;
        }

        functionResult = JSON.stringify(finalData && finalData.length > 0 ? finalData : { error: "No matching jobs found." });
      } 
      
      else if (functionName === "get_technician_location") {
        const { data } = await supabase
          .from("technicians")
          .select("name, status, last_location_address, current_job_title, updated_at")
          .eq("company_id", companyId)
          .ilike("name", `%${functionArgs.tech_name}%`)
          .limit(1);
        functionResult = JSON.stringify(data && data.length > 0 ? data[0] : { error: "Technician not found." });
      }

      else if (functionName === "check_permit_status") {
        const { data } = await supabase
          .from("permits")
          .select("municipality, permit_number, status, fee_amount")
          .eq("company_id", companyId)
          .ilike("municipality", `%${functionArgs.location_query}%`)
          .limit(3);
        functionResult = JSON.stringify(data && data.length > 0 ? data : { error: "No permits found for that location." });
      }

      conversation.push({
        tool_call_id: toolCall.id,
        role: "tool",
        name: functionName,
        content: functionResult,
      });
    }

    // Second call to get the synthesized response
    const finalResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: conversation,
    });

    return NextResponse.json({ message: finalResponse.choices[0].message });

  } catch (error: any) {
    console.error("Halo Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
