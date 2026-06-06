import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });
    }

    const clientId = process.env.META_APP_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/meta/callback`;
    
    // Facebook Pages + Instagram scopes
    const scope = 'pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish';

    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scope)}` +
      `&state=${companyId}`;

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('[Meta OAuth] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
