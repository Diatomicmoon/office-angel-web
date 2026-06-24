import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', { apiVersion: '2023-10-16' as any });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
    try {
        const { jobId, amount, customerEmail } = await req.json();

        if (!jobId || !amount) {
            return NextResponse.json({ error: 'Missing jobId or amount' }, { status: 400 });
        }

        const { data: job } = await supabase.from('jobs').select('company_id').eq('id', jobId).single();
        if (!job) throw new Error('Job not found');

        const { data: company } = await supabase.from('companies').select('stripe_account_id').eq('id', job.company_id).single();
        if (!company?.stripe_account_id) throw new Error('Company has not connected a Stripe account yet.');

        const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

        // 1. Create invoice record in our DB first
        const { data: invoice, error: invoiceError } = await supabase.from('invoices').insert({
            company_id: job.company_id,
            job_id: jobId,
            amount: amount,
            status: 'pending'
        }).select().single();

        if (invoiceError) throw invoiceError;

        // 2. Generate a Stripe Checkout Session on the Connected Account
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: customerEmail,
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: `Invoice for Job #${jobId.slice(0,8)}` },
                    unit_amount: Math.round(amount * 100), // Stripe uses cents
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${origin}/p/job/${jobId}?payment=success`,
            cancel_url: `${origin}/p/job/${jobId}?payment=canceled`,
            client_reference_id: invoice.id,
            metadata: { 
                invoice_id: invoice.id, 
                job_id: jobId,
                company_id: job.company_id 
            },
        }, {
            stripeAccount: company.stripe_account_id // Routes the money directly to the contractor
        });

        // 3. Save the session info to the invoice
        await supabase.from('invoices').update({
            stripe_session_id: session.id,
            stripe_payment_link: session.url
        }).eq('id', invoice.id);

        return NextResponse.json({ url: session.url, invoice_id: invoice.id });
    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}