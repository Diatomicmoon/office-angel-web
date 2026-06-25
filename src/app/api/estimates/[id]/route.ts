import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { data: estimate, error } = await supabase
      .from('estimates')
      .select('*, companies(name, logo_url), estimate_items(*)')
      .eq('id', id)
      .single();

    if (error || !estimate) {
      return NextResponse.json({ error: 'Estimate not found' }, { status: 404 });
    }

    return NextResponse.json({ estimate });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle 1-Tap Approval
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 1. Get the estimate details
    const { data: estimate, error: estError } = await supabase
      .from('estimates')
      .select('*, estimate_items(*)')
      .eq('id', id)
      .single();

    if (estError || !estimate) {
      return NextResponse.json({ error: 'Estimate not found' }, { status: 404 });
    }

    if (estimate.status === 'approved') {
      return NextResponse.json({ message: 'Already approved' });
    }

    // 2. Mark as approved
    await supabase.from('estimates').update({ status: 'approved' }).eq('id', id);

    // 3. Convert to an Invoice
    // We forward the payload to the stripe invoice creation endpoint
    const origin = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin || 'https://hardhat-solutions.com';
    
    // Map items to the format expected by the invoice endpoint
    const items = estimate.estimate_items.map((item: any) => ({
      desc: item.description,
      qty: item.quantity,
      rate: item.rate
    }));

    const invoiceRes = await fetch(`${origin}/api/stripe/invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_id: estimate.company_id,
        customer_name: estimate.customer_name,
        customer_email: estimate.customer_email || '',
        customer_phone: estimate.customer_phone || '',
        items: items
      })
    });

    const invoiceData = await invoiceRes.json();

    return NextResponse.json({ 
      success: true, 
      stripe_session_url: invoiceData.stripe_session_url 
    });
  } catch (error) {
    console.error('Approval failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
