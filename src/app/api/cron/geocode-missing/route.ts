import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

async function geocodeOnce(address: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=us&limit=1`;
  const res = await fetch(url, { headers: { 'User-Agent': 'HardHatSolutions/1.0' } });
  const json: any = await res.json().catch(() => null);
  if (!json || json.length === 0) return null;
  const loc = json[0];
  const lat = Number(loc.lat);
  const lng = Number(loc.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

async function geocode(address: string) {
  const a = String(address || '').trim();
  if (!a) return null;
  const r1 = await geocodeOnce(a);
  if (r1) return r1;
  const hasState = /\b(MN|Minnesota)\b/i.test(a);
  if (!hasState) return await geocodeOnce(`${a}, MN`);
  return null;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.log('Unauthorized geocode cron hit');
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  );

  console.log('Starting background geocoding for missing coordinates...');

  // 1. Find jobs with an address but missing lat/lng
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, address')
    .not('address', 'is', null)
    .is('lat', null)
    .limit(10);

  if (jobs && jobs.length > 0) {
    for (const job of jobs) {
      if (!job.address) continue;
      console.log(`Geocoding job ${job.id}: ${job.address}`);
      const coords = await geocode(job.address);
      if (coords) {
        await supabase
          .from('jobs')
          .update({ lat: coords.lat, lng: coords.lng })
          .eq('id', job.id);
        console.log(`✅ Geocoded job ${job.id} -> ${coords.lat}, ${coords.lng}`);
      }
      // Respect OSM rate limits
      await new Promise(r => setTimeout(r, 1500));
    }
  } else {
    console.log('No missing job coordinates found.');
  }

  return NextResponse.json({ success: true, processed: jobs?.length || 0 });
}