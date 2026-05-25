export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function resolveCompany() {
  let companyId = process.env.OFFICE_ANGEL_COMPANY_ID;
  if (!companyId) {
    const { data: c0 } = await sb().from("companies").select("id").order("created_at", { ascending: true }).limit(1);
    companyId = c0?.[0]?.id;
  }
  return companyId;
}

export async function GET(req: Request) {
  try {
    const companyId = await resolveCompany();
    if (!companyId) return NextResponse.json({ visits: [] });

    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const interestFilter = url.searchParams.get("interest") || "";

    let query = sb()
      .from("door_knocking_visits")
      .select("*")
      .eq("company_id", companyId)
      .order("visited_at", { ascending: false })
      .limit(200);

    if (interestFilter) {
      query = query.eq("interest_level", interestFilter);
    }

    if (q) {
      query = query.or(
        `resident_name.ilike.%${q}%,address.ilike.%${q}%,notes.ilike.%${q}%`
      );
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ visits: [], error }, { status: 400 });

    return NextResponse.json({ visits: data || [] });
  } catch (err: any) {
    return NextResponse.json({ visits: [], error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const companyId = await resolveCompany();
    if (!companyId) return NextResponse.json({ error: "No company" }, { status: 400 });

    const body = await req.json();
    const { data, error } = await sb()
      .from("door_knocking_visits")
      .insert({
        company_id: companyId,
        resident_name: body.resident_name || null,
        address: body.address,
        city: body.city || null,
        state: body.state || null,
        zip: body.zip || null,
        latitude: body.latitude || null,
        longitude: body.longitude || null,
        interest_level: body.interest_level || "not_interested",
        notes: body.notes || null,
        phone_number: body.phone_number || null,
        email: body.email || null,
        visited_at: body.visited_at || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ visit: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const allowed = ["resident_name", "address", "city", "state", "zip", "latitude", "longitude", "interest_level", "notes", "phone_number", "email"];
    const patch: Record<string, any> = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) patch[key] = updates[key];
    }
    patch.updated_at = new Date().toISOString();

    const { data, error } = await sb()
      .from("door_knocking_visits")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ visit: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
