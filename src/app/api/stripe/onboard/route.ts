import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: Request) {
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' as any });
        const cookieStore = await cookies();
        const oaCookie = cookieStore.get('oa_company_id');
        
        let userId = null;
        let companyId = oaCookie?.value;

        // Try getting user if possible
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            userId = user.id;
        }

        // If no company ID cookie, try fetching from user membership
        if (!companyId && userId) {
             const { data: membership } = await supabase
                .from('company_memberships')
                .select('company_id')
                .eq('user_id', userId)
                .single();
             if (membership) companyId = membership.company_id;
        }

        if (!companyId) return new NextResponse('Unauthorized: No company found', { status: 401 });

        const { data: company } = await supabase
            .from('companies')
            .select('*')
            .eq('id', companyId)
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

        // Redirect directly to the Stripe URL
        return NextResponse.redirect(accountLink.url);
    } catch (error: any) {
        console.error('Stripe Onboard Error:', error);
        return new NextResponse(`Error: ${error.message}`, { status: 500 });
    }
}