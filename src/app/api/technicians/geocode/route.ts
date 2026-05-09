import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

async function getCompanyId() {
  let companyId = process.env.OFFICE_ANGEL_COMPANY_ID;
  if (!companyId) {
    const { data } = await sb().from("companies").select("id").order("created_at", { ascending: true }).limit(1);
    companyId = data?.[0]?.id;
  }
  return companyId;
}

async function geocode(address: string, apiKey: string) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  const json: any = await res.json().catch(() => null);
  const loc = json?.results?.[0]?.geometry?.location;
  if (!loc) return null;
  const lat = Number(loc.lat);
  const lng = Number(loc.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

// Quick demo helper: turn last_location_address into last_location lat/lng.
// POST /api/technicians/geocode
export async function POST() {
  try {
    const apiKey =
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      "";

    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "Missing Google Maps API key. Set GOOGLE_MAPS_API_KEY (preferred) or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY." },
        { status: 400 }
      );
    }

    const companyId = await getCompanyId();
    if (!companyId) return NextResponse.json({ ok: false, error: "No company configured." }, { status: 400 });

    const { data: techs, error } = await sb()
      .from("technicians")
      .select("id, name, last_location, last_location_address")
      .eq("company_id", companyId)
      .order("updated_at", { ascending: false });

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

    const targets = (techs || [])
      .filter((t: any) => !t.last_location && t.last_location_address)
      .slice(0, 20);

    let updated = 0;
    const results: any[] = [];

    for (const t of targets) {
      const loc = await geocode(String(t.last_location_address), apiKey);
      if (!loc) {
        results.push({ id: t.id, name: t.name, address: t.last_location_address, ok: false });
        continue;
      }

      const { error: uErr } = await sb()
        .from("technicians")
        .update({
          last_location: { ...loc, source: "geocode", accuracy: null },
          updated_at: new Date().toISOString(),
        })
        .eq("id", t.id)
        .eq("company_id", companyId);

      if (uErr) {
        results.push({ id: t.id, name: t.name, address: t.last_location_address, ok: false, error: uErr.message });
      } else {
        updated++;
        results.push({ id: t.id, name: t.name, address: t.last_location_address, ok: true, ...loc });
      }
    }

    return NextResponse.json({ ok: true, updated, attempted: targets.length, results });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}

