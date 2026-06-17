import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  // Extract companyId from URL query
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId');

  if (!companyId) {
    return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
  }

  // Define Google OAuth configuration
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'https://hardhat-solutions.com'}/api/google-marketing/callback`;
  
  // Scopes needed for Google Business Profile Management & Analytics
  const scope = encodeURIComponent('https://www.googleapis.com/auth/business.manage');

  // Generate the Google OAuth URL (offline access for refresh token)
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${companyId}`;

  return NextResponse.redirect(authUrl);
}
