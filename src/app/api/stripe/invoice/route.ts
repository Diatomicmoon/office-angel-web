import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16' as any,
  });
  try {
    const { company_id, customer_name, customer_email, customer_phone, items } = await req.json();

    if (!company_id || !customer_name || !customer_email || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let totalAmount = 0;
    for (const item of items) {
      totalAmount += item.qty * item.rate;
    }

    // Insert invoice
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        company_id,
        customer_name,
        customer_email,
        customer_phone,
        amount: totalAmount,
        status: 'pending',
      })
      .select()
      .single();

    if (invoiceError) {
      console.error('Error inserting invoice:', invoiceError);
      return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
    }

    const invoiceId = invoiceData.id;

    // Insert invoice items
    const invoiceItemsToInsert = items.map((item: any) => ({
      invoice_id: invoiceId,
      description: item.desc,
      quantity: item.qty,
      rate: item.rate,
      amount: item.qty * item.rate,
    }));

    const { error: invoiceItemsError } = await supabase
      .from('invoice_items')
      .insert(invoiceItemsToInsert);

    if (invoiceItemsError) {
      console.error('Error inserting invoice items:', invoiceItemsError);
      return NextResponse.json({ error: 'Failed to create invoice items' }, { status: 500 });
    }

    // Check for Stripe integration
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('stripe_account_id')
      .eq('id', company_id)
      .single();

    if (companyError) {
      console.error('Error fetching company:', companyError);
      return NextResponse.json({ error: 'Failed to fetch company details' }, { status: 500 });
    }

    if (companyData?.stripe_account_id) {
      const lineItems = items.map((item: any) => ({
        price_data: {
          currency: 'usd', // Assuming USD, could be dynamic
          product_data: {
            name: item.desc,
          },
          unit_amount: Math.round(item.rate * 100), // Stripe expects amount in cents
        },
        quantity: item.qty,
      }));

      const requestUrl = new URL(req.url);
      const origin = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin || 'https://hardhat-solutions.com';
      const successUrl = `${origin}/financials?invoice_id=${invoiceId}&status=success`;
      const cancelUrl = `${origin}/financials?invoice_id=${invoiceId}&status=cancel`;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: invoiceId,
        metadata: {
          invoice_id: invoiceId,
          company_id: company_id,
        },
      }, {
        stripeAccount: companyData.stripe_account_id,
      });

      // Update invoice with Stripe session details
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          stripe_session_id: session.id,
          stripe_payment_link: session.url,
        })
        .eq('id', invoiceId);

      if (updateError) {
        console.error('Error updating invoice with Stripe session:', updateError);
        return NextResponse.json({ error: 'Failed to update invoice with Stripe session' }, { status: 500 });
      }

      // Try to send SMS if Twilio credentials exist
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER && customer_phone) {
        try {
          const twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
          await twilioClient.messages.create({
            body: `Hi ${customer_name}, here is your invoice from Hard Hat Solutions for $${totalAmount.toFixed(2)}. You can pay securely online here: ${session.url}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: customer_phone.startsWith('+1') ? customer_phone : `+1${customer_phone}`
          });
          console.log(`Sent SMS invoice to ${customer_phone}`);
        } catch (smsError) {
          console.error('Failed to send SMS via Twilio:', smsError);
          // Don't fail the request if just SMS fails
        }
      }

      return NextResponse.json({ invoice: invoiceData, stripe_session_url: session.url });
    } else {
      // No Stripe integration, return manual invoice
      return NextResponse.json({ invoice: invoiceData, message: 'Invoice created manually, no Stripe integration found for this company.' });
    }
  } catch (error) {
    console.error('Stripe invoice creation failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}