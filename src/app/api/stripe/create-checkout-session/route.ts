import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2023-10-16' as any,
});

export async function POST(req: Request) {
  try {
    const { estimateId, amount, customerEmail, description } = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'link'], // Apple/Google pay are included by default in checkout sessions now based on device
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: description || 'Hard Hat Solutions Service Invoice',
            },
            unit_amount: Math.round(amount * 100), // convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://hardhat-solutions.com'}/invoice-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://hardhat-solutions.com'}/invoice-cancel`,
      customer_email: customerEmail || undefined,
      metadata: {
        estimateId: estimateId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating Stripe checkout session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
