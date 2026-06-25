const Stripe = require('stripe');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

async function run(accountId) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Spring clean up',
            },
            unit_amount: 40000,
          },
          quantity: 1,
        }
      ],
      mode: 'payment',
      success_url: 'https://hardhat-solutions.com/financials?invoice_id=test&status=success',
      cancel_url: 'https://hardhat-solutions.com/financials?invoice_id=test&status=cancel',
      client_reference_id: 'test',
      metadata: {
        invoice_id: 'test',
        company_id: process.env.OFFICE_ANGEL_COMPANY_ID,
      },
    }, {
      stripeAccount: accountId,
    });
    console.log('Success:', session.url);
  } catch (err) {
    console.error('Stripe Error:', err.message);
  }
}

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

supabase.from('companies').select('stripe_account_id').eq('id', process.env.OFFICE_ANGEL_COMPANY_ID).single().then(({data}) => {
  console.log('Stripe Account:', data?.stripe_account_id);
  if(data?.stripe_account_id) {
    run(data.stripe_account_id);
  }
});
