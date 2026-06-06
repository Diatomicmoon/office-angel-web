import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const companyId = searchParams.get('state');

    if (!code || !companyId) {
      return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
    }

    const clientId = process.env.META_APP_ID;
    const clientSecret = process.env.META_APP_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/meta/callback`;

    // 1. Exchange code for short-lived access token
    const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&client_secret=${clientSecret}` +
      `&code=${code}`
    );

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      throw new Error(tokenData.error?.message || 'Failed to exchange Meta token');
    }

    // 2. Exchange short-lived token for long-lived token
    const longTokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?` +
      `grant_type=fb_exchange_token` +
      `&client_id=${clientId}` +
      `&client_secret=${clientSecret}` +
      `&fb_exchange_token=${tokenData.access_token}`
    );

    const longTokenData = await longTokenRes.json();

    // 3. Save tokens to Supabase
    await supabase.from('companies').update({
      meta_access_token: longTokenData.access_token,
      // Meta long-lived tokens typically last 60 days
      meta_token_expiry: new Date(Date.now() + (longTokenData.expires_in || 5184000) * 1000).toISOString()
    }).eq('id', companyId);

    // 4. Redirect back to marketing page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/marketing?auth=meta_success`);
  } catch (error) {
    console.error('[Meta OAuth Callback] Error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/marketing?auth=meta_error`);
  }
}
