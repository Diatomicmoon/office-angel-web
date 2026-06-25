import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  );

  console.log('Starting Auto Bid Generation for Scraped Permits...');

  try {
    const { data: companies } = await supabase.from('companies').select('id').limit(1);
    if (!companies || companies.length === 0) throw new Error('No company found.');
    const companyId = companies[0]?.id;

    // 1. Fetch permits that don't have a generated bid yet
    // To do this simply, we'll check permits where notes doesn't contain "ESTIMATED_BID"
    const { data: permits, error: permitError } = await supabase
      .from('new_build_permits')
      .select('*')
      .eq('company_id', companyId)
      .not('notes', 'ilike', '%ESTIMATED_BID%')
      .limit(5);

    if (permitError) throw permitError;
    if (!permits || permits.length === 0) {
      return NextResponse.json({ success: true, message: 'No new permits to estimate.' });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    let estimatedCount = 0;

    for (const permit of permits) {
      // 2. Feed the permit description into GPT to calculate rough sqft, fixtures, and cost
      const prompt = `You are a Master Electrician acting as the "Pro Bid Writer" for an electrical contractor.
Analyze this permit pulled by a builder for a new construction project.
Based on the description, estimate the electrical rough-in and finish costs.

Permit Details:
Address: ${permit.property_address}, ${permit.city}
Contractor: ${permit.contractor_name}
Description / Notes: ${permit.notes}

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

      try {
        const response = await openai.chat.completions.create({
          model:  "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        });

        const estimation = JSON.parse(response.choices[0].message.content || '{}');
        
        // 3. Update the permit record with the new estimation data
        // For now, we will append it to the notes field so it shows up in the UI, 
        // until we add dedicated columns for bids.
        const updatedNotes = `${permit.notes}\n\n[ESTIMATED_BID]\nTotal Bid: $${estimation.total_bid}\nMaterial: $${estimation.material_cost} | Labor: $${estimation.labor_cost}\nFixtures: ~${estimation.estimated_fixtures} based on ${estimation.estimated_sqft} sqft.`;

        await supabase
          .from('new_build_permits')
          .update({ notes: updatedNotes })
          .eq('id', permit.id);

        // Optional: Could also auto-generate a Job ticket here in the 'jobs' table
        
        estimatedCount++;
      } catch (err) {
        console.error(`Failed to generate bid for ${permit.property_address}:`, err);
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: permits.length,
      bids_generated: estimatedCount 
    });

  } catch (error: any) {
    console.error("Bid generation failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
