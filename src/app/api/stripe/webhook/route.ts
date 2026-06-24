import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' as any });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
        console.error('Webhook Error:', err.message);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the specific event when a customer pays
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const invoiceId = session.metadata?.invoice_id;
        const companyId = session.metadata?.company_id;
        
        if (invoiceId && companyId) {
            // 1. Mark invoice as paid
            const { data: invoice } = await supabase.from('invoices')
                .update({ status: 'paid' })
                .eq('id', invoiceId)
                .select()
                .single();

            if (invoice) {
                // 2. Log the revenue directly into the company's ledger
                await supabase.from('company_ledger').insert({
                    company_id: companyId,
                    category: 'revenue',
                    transaction_type: 'job_payment',
                    amount: invoice.amount,
                    status: 'paid',
                    reference_id: invoice.job_id
                });
                
                // 3. Mark the Job as completed/paid (optional, depending on flow)
                if (invoice.job_id) {
                    await supabase.from('jobs')
                        .update({ status: 'paid' })
                        .eq('id', invoice.job_id);
                }
            }
        }
    }

    return NextResponse.json({ received: true });
}