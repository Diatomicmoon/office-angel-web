import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const realmId = url.searchParams.get("realmId");
  const companyId = url.searchParams.get("state");

  if (!code || !companyId) {
    return NextResponse.redirect(new URL("/settings?error=quickbooks_auth_failed", req.url));
  }

  const clientId = process.env.QUICKBOOKS_CLIENT_ID || "AB92XjkDS1CCAJqWexCSXpPl5Iq2ujZDo4FOpLBBzt4Dvo0z1K";
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET || "5RYvfb0XX9uSw6YejOp6JW1YGU2BLgZqjubFjVNu";
  const redirectUri = "https://www.office-angel.com/api/quickbooks/callback";

  try {
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    
    // Exchange the code for an access token
    const tokenRes = await fetch("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${authHeader}`
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri
      })
    });

    const tokens = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error("[QUICKBOOKS OAUTH ERROR]", tokens);
      return NextResponse.redirect(new URL("/settings?error=quickbooks_token_failed", req.url));
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Save the tokens to the company row in Supabase
    await supabase.from("companies").update({
      quickbooks_access_token: tokens.access_token,
      quickbooks_refresh_token: tokens.refresh_token,
      quickbooks_realm_id: realmId,
      quickbooks_token_expires_at: new Date(Date.now() + (tokens.expires_in * 1000)).toISOString()
    }).eq("id", companyId);

    // Send them back to the settings page with a success flag
    return NextResponse.redirect(new URL("/settings?success=quickbooks_connected", req.url));

  } catch (err) {
    console.error(err);
    return NextResponse.redirect(new URL("/settings?error=quickbooks_exception", req.url));
  }
}
