import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key';
const supabase = createClient(supabaseUrl, supabaseKey);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' as any });

export async function POST(req: Request) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Get the user's company
        const { data: membership } = await supabase
            .from('company_memberships')
            .select('company_id')
            .eq('user_id', user.id)
            .single();
            
        if (!membership) return NextResponse.json({ error: 'No company attached to user' }, { status: 400 });

        const { data: company } = await supabase
            .from('companies')
            .select('*')
            .eq('id', membership.company_id)
            .single();

        let accountId = company.stripe_account_id;

        // Create a connected account if they don't have one yet
        if (!accountId) {
            const account = await stripe.accounts.create({
                type: 'standard', // 'standard' puts the liability and dashboard access fully on the contractor
            });
            accountId = account.id;
            
            // Save the Stripe Account ID to the company
            await supabase
                .from('companies')
                .update({ stripe_account_id: accountId })
                .eq('id', company.id);
        }

        const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

        // Generate the onboarding link
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${origin}/financials?stripe_refresh=true`,
            return_url: `${origin}/financials?stripe_return=true`,
            type: 'account_onboarding',
        });

        return NextResponse.json({ url: accountLink.url });
    } catch (error: any) {
        console.error('Stripe Onboard Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}