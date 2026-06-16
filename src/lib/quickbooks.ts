import { createClient } from '@supabase/supabase-js';

const QB_CLIENT_ID = process.env.QUICKBOOKS_CLIENT_ID || "AB92XjkDS1CCAJqWexCSXpPl5Iq2ujZDo4FOpLBBzt4Dvo0z1K";
const QB_CLIENT_SECRET = process.env.QUICKBOOKS_CLIENT_SECRET || "5RYvfb0XX9uSw6YejOp6JW1YGU2BLgZqjubFjVNu";
const QB_BASE_URL = process.env.QUICKBOOKS_ENV === 'production'
  ? 'https://quickbooks.api.intuit.com'
  : 'https://sandbox-quickbooks.api.intuit.com';

/**
 * Get a valid QuickBooks access token for a company.
 * Auto-refreshes if expired. Throws if not connected.
 */
export async function getValidQBToken(companyId: string): Promise<{ accessToken: string; realmId: string }> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  const { data: company, error } = await supabase
    .from('companies')
    .select('quickbooks_access_token, quickbooks_refresh_token, quickbooks_realm_id, quickbooks_token_expires_at')
    .eq('id', companyId)
    .single();

  if (error || !company?.quickbooks_refresh_token) {
    throw new Error('QuickBooks not connected. Please connect in Settings.');
  }

  const expiresAt = company.quickbooks_token_expires_at
    ? new Date(company.quickbooks_token_expires_at)
    : new Date(0);
  const now = new Date();
  const bufferMs = 5 * 60 * 1000; // Refresh 5 minutes early

  // Token still valid
  if (company.quickbooks_access_token && expiresAt.getTime() - now.getTime() > bufferMs) {
    return {
      accessToken: company.quickbooks_access_token,
      realmId: company.quickbooks_realm_id
    };
  }

  // Token expired — auto refresh
  console.log(`[QB] Access token expired for company ${companyId}. Auto-refreshing...`);

  const authHeader = Buffer.from(`${QB_CLIENT_ID}:${QB_CLIENT_SECRET}`).toString('base64');
  const tokenRes = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${authHeader}`
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: company.quickbooks_refresh_token
    })
  });

  const tokens = await tokenRes.json();

  if (!tokenRes.ok || !tokens.access_token) {
    console.error('[QB] Token refresh failed:', tokens);
    // Clear stale tokens so user is prompted to reconnect
    await supabase.from('companies').update({
      quickbooks_access_token: null,
      quickbooks_refresh_token: null,
      quickbooks_token_expires_at: null
    }).eq('id', companyId);
    throw new Error('QuickBooks session expired. Please reconnect in Settings.');
  }

  // Save the new tokens
  const newExpiry = new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString();
  await supabase.from('companies').update({
    quickbooks_access_token: tokens.access_token,
    quickbooks_refresh_token: tokens.refresh_token || company.quickbooks_refresh_token,
    quickbooks_token_expires_at: newExpiry
  }).eq('id', companyId);

  console.log(`[QB] Token refreshed successfully for company ${companyId}. Expires: ${newExpiry}`);

  return {
    accessToken: tokens.access_token,
    realmId: company.quickbooks_realm_id
  };
}

/**
 * Make an authenticated QuickBooks API call with auto-refresh built in.
 */
export async function qbFetch(companyId: string, path: string, options: RequestInit = {}): Promise<any> {
  const { accessToken, realmId } = await getValidQBToken(companyId);

  const url = `${QB_BASE_URL}/v3/company/${realmId}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (res.status === 401) {
    // Force refresh and retry once
    throw new Error('QuickBooks auth error — token may be revoked. Please reconnect in Settings.');
  }

  return res.json();
}
