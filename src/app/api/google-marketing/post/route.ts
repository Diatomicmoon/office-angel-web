import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { text, platforms, companyId } = await req.json();

    if (!companyId) {
      return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });
    }

    console.log('[Marketing API] Posting update:', { text, platforms, companyId });

    // 1. Fetch company OAuth tokens
    const { data: company, error } = await supabase
      .from('companies')
      .select('google_access_token, meta_access_token')
      .eq('id', companyId)
      .single();

    if (error || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const results: any = { gmb: null, facebook: null };

    // 2. Post to Google Business Profile
    if (platforms.includes('gmb')) {
      if (!company.google_access_token) {
        results.gmb = 'Not connected';
      } else {
        // TODO: Map to actual GMB accountId/locationId for this user
        console.log('[Marketing API] Simulating GMB Post with token:', company.google_access_token.substring(0, 10) + '...');
        // Actual call:
        // const gmbResponse = await fetch(`https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/localPosts`, { ... })
        results.gmb = 'Success (Simulated)';
      }
    }

    // 3. Post to Meta (Facebook/Instagram)
    if (platforms.includes('facebook')) {
      if (!company.meta_access_token) {
        results.facebook = 'Not connected';
      } else {
        // Note: Requires resolving the specific Page ID first via `GET /me/accounts`
        const pageId = process.env.META_DEFAULT_PAGE_ID || 'me'; // 'me' works for simple user feeds, but pages need specific IDs
        console.log(`[Marketing API] Firing Graph API POST to /${pageId}/feed...`);
        
        const fbRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            access_token: company.meta_access_token
          })
        });
        
        const fbData = await fbRes.json();
        
        if (!fbRes.ok) {
          console.error('[Marketing API] Facebook Graph Error:', fbData);
          results.facebook = `Error: ${fbData.error?.message || 'Unknown error'}`;
        } else {
          console.log('[Marketing API] Facebook Success! Post ID:', fbData.id);
          results.facebook = `Success: ${fbData.id}`;
        }
      }
    }

    // 4. (Optional) Save to our database as a record of social posts
    /*
    await supabase.from('marketing_posts').insert({
      company_id: companyId,
      content: text,
      platforms: platforms,
      status: 'published',
      published_at: new Date().toISOString()
    });
    */

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('[Marketing API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
