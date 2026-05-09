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

async function geocodeOnce(address: string, apiKey: string) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  const json: any = await res.json().catch(() => null);
  const status = json?.status;
  const error_message = json?.error_message;
  const loc = json?.results?.[0]?.geometry?.location;
  if (!loc) return { ok: false as const, status, error_message };
  const lat = Number(loc.lat);
  const lng = Number(loc.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return { ok: false as const, status, error_message };
  return { ok: true as const, lat, lng, status, error_message };
}

async function geocode(address: string, apiKey: string) {
  const a = String(address || '').trim();
  if (!a) return { ok: false as const, status: 'EMPTY', error_message: 'Empty address' };

  // Attempt 1: raw address
  const r1 = await geocodeOnce(a, apiKey);
  if (r1.ok) return r1;

  // Attempt 2: if no state present, try adding MN (demo is Twin Cities)
  const hasState = /\b(MN|Minnesota)\b/i.test(a);
  const r2 = !hasState ? await geocodeOnce(`${a}, MN`, apiKey) : r1;
  if ((r2 as any).ok) return r2 as any;

  // Attempt 3: handle "Shop - City" style labels
  if (a.includes('-')) {
    const tail = a.split('-').slice(1).join('-').trim();
    if (tail) {
      const r3 = await geocodeOnce(`${tail}, MN`, apiKey);
      if (r3.ok) return r3;
      return { ok: false as const, status: r3.status || r2.status || r1.status, error_message: r3.error_message || r2.error_message || r1.error_message };
    }
  }

  return { ok: false as const, status: (r2 as any)?.status || r1.status, error_message: (r2 as any)?.error_message || r1.error_message };
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
      if (!loc.ok) {
        results.push({ id: t.id, name: t.name, address: t.last_location_address, ok: false, status: loc.status, error: loc.error_message || null });
        continue;
      }

      const { error: uErr } = await sb()
        .from("technicians")
        .update({
          last_location: { lat: loc.lat, lng: loc.lng, source: "geocode", accuracy: null },
          updated_at: new Date().toISOString(),
        })
        .eq("id", t.id)
        .eq("company_id", companyId);

      if (uErr) {
        results.push({ id: t.id, name: t.name, address: t.last_location_address, ok: false, error: uErr.message });
      } else {
        updated++;
        results.push({ id: t.id, name: t.name, address: t.last_location_address, ok: true, lat: loc.lat, lng: loc.lng });
      }
    }

    return NextResponse.json({ ok: true, updated, attempted: targets.length, results });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
