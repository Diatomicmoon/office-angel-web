import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[VAPI TOOLS] Webhook payload:", JSON.stringify(body, null, 2));

    const message = body.message;
    if (!message || message.type !== 'tool-calls') {
      return NextResponse.json({ error: 'Invalid tool-calls webhook payload' }, { status: 400 });
    }

    const toolCalls = message.toolCalls || [];
    let systemPhoneNumberRaw = message.call?.system?.number || message.call?.phoneNumber?.number || message.phoneNumber?.number;
    let systemPhoneNumber = systemPhoneNumberRaw;
    if (systemPhoneNumberRaw && systemPhoneNumberRaw.includes('sip:')) {
      const match = systemPhoneNumberRaw.match(/sip:([^@]+)@/);
      if (match) systemPhoneNumber = match[1];
    }

    // Get company id securely
    let companyId = null;
    if (systemPhoneNumber) {
      const { data: company } = await supabase()
        .from('companies')
        .select('id')
        .eq('phone_number', systemPhoneNumber)
        .single();
      companyId = company?.id;
    }

    const results = [];

    for (const toolCall of toolCalls) {
      const { id, function: func } = toolCall;
      const args = func.arguments || {};
      
      console.log(`[VAPI TOOLS] Executing ${func.name} with args:`, args);

      if (func.name === 'check_availability') {
        // Mock availability for beta
        const date = args.date || new Date().toISOString().split('T')[0];
        results.push({
          toolCallId: id,
          result: `Availability for ${date}: 8:00 AM, 10:00 AM, 1:00 PM, 3:30 PM are all open.`
        });
      } 
      else if (func.name === 'create_dispatch_ticket' || func.name === 'book_appointment') {
        if (!companyId) {
          results.push({
            toolCallId: id,
            result: "Error: Could not identify company to book under. Ask the caller to hold and notify an admin."
          });
          continue;
        }

        // Create job ticket
        const { data: job, error } = await supabase()
          .from('jobs')
          .insert([
            {
              company_id: companyId,
              title: args.issue_description || 'Service Call',
              status: 'Lead',
              address: args.address || null,
              notes: `Customer Name: ${args.customer_name || 'Unknown'}\nPhone: ${args.customer_phone || 'Unknown'}\nUrgency: ${args.urgency || 'Normal'}\nIssue: ${args.issue_description}`,
              priority: args.urgency === 'high' ? 'high' : 'medium'
            }
          ])
          .select('id')
          .single();

        if (error) {
          console.error("[VAPI TOOLS] Error booking job:", error);
          results.push({
            toolCallId: id,
            result: "Error booking appointment. Please try again."
          });
        } else {
          console.log(`[VAPI TOOLS] Created dispatch ticket: ${job.id}`);
          results.push({
            toolCallId: id,
            result: `Successfully created dispatch ticket. Job ID: ${job.id}. Tell the user the ticket is on the board.`
          });
        }
      } else {
        results.push({
          toolCallId: id,
          result: "Unknown function call."
        });
      }
    }

    // Return the array of tool call results
    return NextResponse.json({
      results
    });

  } catch (error) {
    console.error("[VAPI TOOLS] Error processing tool call:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
