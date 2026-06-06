import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const companyId = searchParams.get('state'); // We passed companyId as state

    if (!code || !companyId) {
      return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`;

    // 1. Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      throw new Error(tokenData.error_description || 'Failed to exchange token');
    }

    // 2. Save tokens to Supabase
    // Note: We need a companies or company_settings table with these columns
    await supabase.from('companies').update({
      google_access_token: tokenData.access_token,
      google_refresh_token: tokenData.refresh_token,
      google_token_expiry: new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    }).eq('id', companyId);

    // 3. Redirect back to marketing page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/marketing?auth=success`);
  } catch (error) {
    console.error('[Google OAuth Callback] Error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/marketing?auth=error`);
  }
}
