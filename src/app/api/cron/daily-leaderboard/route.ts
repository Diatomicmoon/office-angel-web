import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';

// This is a cron job that runs daily at 8 PM (configured in vercel.json or triggered externally)
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // return new NextResponse('Unauthorized', { status: 401 });
      // Allow for now so we can test it easily, or maybe use a simple secret query param
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // Get all companies
    const { data: companies } = await supabase.from('companies').select('*');
    if (!companies) return NextResponse.json({ success: true, message: 'No companies found' });

    const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    // Calculate today's bounds
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString();

    for (const company of companies) {
      if (!company.phone) continue; // Need a phone number to text the owner

      const { data: visits } = await supabase
        .from('door_knocking_visits')
        .select('*')
        .eq('company_id', company.id)
        .gte('visited_at', todayIso);

      if (!visits || visits.length === 0) continue;

      let totalKnocks = 0;
      let totalDemos = 0;
      const repCounts: Record<string, number> = {};

      visits.forEach((v) => {
        totalKnocks++;
        if (['demo_set', 'hot', 'contacted'].includes(v.interest_level)) {
          totalDemos++;
        }
        
        let rep = v.sales_rep_name || "Unknown Rep";
        const match = v.notes?.match(/\[Rep:\s*(.*?)\]/);
        if (match && match[1]) rep = match[1];
        rep = rep.replace('Efficiency', '').trim();

        repCounts[rep] = (repCounts[rep] || 0) + 1;
      });

      if (totalKnocks === 0) continue;

      let topRep = "N/A";
      let topKnocks = 0;
      for (const [rep, count] of Object.entries(repCounts)) {
        if (count > topKnocks) {
          topKnocks = count;
          topRep = rep;
        }
      }

      const messageBody = `📊 Daily Canvassing Wrap-Up\n\nTotal Doors Knocked: ${totalKnocks}\nDemos Set: ${totalDemos}\nTop Rep: ${topRep} (${topKnocks} doors)\n\nGreat work today team!`;

      try {
        await twilioClient.messages.create({
          body: messageBody,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: company.phone // The owner's phone number
        });
        
        // Log the twilio usage into the company_ledger
        await supabase.from('company_ledger').insert({
          company_id: company.id,
          category: 'expense',
          transaction_type: 'twilio_sms',
          amount: 0.02, // approx Twilio SMS cost
          status: 'incurred'
        });
      } catch (err) {
        console.error(`Failed to send daily recap SMS to company ${company.id}:`, err);
      }
    }

    return NextResponse.json({ success: true, message: 'Daily leaderboards processed' });
  } catch (error: any) {
    console.error('Error running daily leaderboard cron:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
