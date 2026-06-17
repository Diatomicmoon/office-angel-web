import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const companyId = searchParams.get('state'); // Passed back from the auth URL

  if (!code || !companyId) {
    return NextResponse.json({ error: 'Missing code or state parameter' }, { status: 400 });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'https://hardhat-solutions.com'}/api/google-marketing/callback`;

    // Exchange the authorization code for access and refresh tokens
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
      console.error('Failed to exchange Google OAuth code:', tokenData);
      return NextResponse.json({ error: 'Failed to exchange token' }, { status: 500 });
    }

    // Save tokens securely to Supabase
    const { error: dbError } = await supabase
      .from('companies')
      .update({
        google_access_token: tokenData.access_token,
        google_refresh_token: tokenData.refresh_token,
        google_auth_updated_at: new Date().toISOString()
      })
      .eq('id', companyId);

    if (dbError) {
      console.error('Error saving Google tokens to DB:', dbError);
    }

    // Redirect the user back to the marketing dashboard
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://hardhat-solutions.com'}/marketing?success=google_connected`);
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
