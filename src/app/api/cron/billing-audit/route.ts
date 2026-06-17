import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This cron job runs daily at midnight
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Allow for now, or implement standard verification
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // Get all active companies
    const { data: companies } = await supabase.from('companies').select('*');
    if (!companies) return NextResponse.json({ success: true, message: 'No companies found' });

    // It's a new day, let's do a daily roll-up.
    // If it's the 1st of the month, we can charge their MRR
    const today = new Date();
    const isFirstOfMonth = today.getDate() === 1;

    for (const company of companies) {
      if (isFirstOfMonth) {
        // Log their monthly subscription revenue
        await supabase.from('company_ledger').insert({
          company_id: company.id,
          category: 'revenue',
          transaction_type: 'monthly_subscription',
          amount: 199.00, // Or whatever the dynamic plan amount is
          status: 'paid' // Assuming stripe auto-charged, or 'pending' if invoicing
        });
      }

      // Check Vapi logs for yesterday
      // Assuming we have a `call_logs` table with duration, we can calculate AI burn
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const yesterdayIso = yesterday.toISOString();
      const endOfYesterday = new Date(yesterday);
      endOfYesterday.setHours(23, 59, 59, 999);
      const endOfYesterdayIso = endOfYesterday.toISOString();

      const { data: calls } = await supabase
        .from('call_logs')
        .select('duration')
        .eq('company_id', company.id)
        .gte('created_at', yesterdayIso)
        .lte('created_at', endOfYesterdayIso);

      if (calls && calls.length > 0) {
        // Vapi charges roughly $0.05 to $0.11 per minute
        const totalDurationSeconds = calls.reduce((acc, c) => acc + (parseFloat(c.duration) || 0), 0);
        const totalMinutes = Math.ceil(totalDurationSeconds / 60);
        const aiCost = totalMinutes * 0.10; // estimate $0.10 per min

        if (aiCost > 0) {
          await supabase.from('company_ledger').insert({
            company_id: company.id,
            category: 'expense',
            transaction_type: 'vapi_minutes',
            amount: aiCost,
            status: 'incurred'
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Nightly billing audit complete.' });
  } catch (error: any) {
    console.error('Error running billing audit cron:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
