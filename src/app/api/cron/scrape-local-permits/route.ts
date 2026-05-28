import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  console.log('Starting Custom Local Permit Scraper...');

  try {
    const { data: companies } = await supabase.from('companies').select('id').limit(1);
    
    // FIX: TypeScript was mad because we didn't check if 'companies' was null before grabbing the ID!
    if (!companies || companies.length === 0) {
      throw new Error('No company found.');
    }
    
    const companyId = companies[0].id;

    console.log("Scraper engine built and ready to parse City HTML.");

    return NextResponse.json({ 
      success: true, 
      message: "Custom scraper template ready. Need target City URL to map HTML."
    });

  } catch (error: any) {
    console.error("Scraper failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
