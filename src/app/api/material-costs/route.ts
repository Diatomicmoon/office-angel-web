import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resolveCompanyIdOrThrow } from '@/lib/tenant';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Trade type → relevant search keywords for retail scraping
const TRADE_KEYWORDS: Record<string, string[]> = {
  electrical: ['wire', 'breaker', 'conduit', 'outlet', 'panel', 'romex', 'EMT', 'junction box'],
  plumbing: ['copper pipe', 'PVC fitting', 'ball valve', 'p-trap', 'solder', 'flux', 'coupling'],
  hvac: ['refrigerant', 'capacitor', 'contactor', 'filter', 'duct tape', 'flex duct'],
  cleaning: ['microfiber', 'mop', 'degreaser', 'bleach', 'bucket', 'trash bags'],
  landscaping: ['mulch', 'fertilizer', 'edging', 'spray paint', 'blower', 'trimmer line'],
  general: ['screws', 'lumber', 'drywall', 'paint', 'caulk', 'tape'],
};

export async function GET(req: Request) {
  try {
    const { companyId } = await resolveCompanyIdOrThrow();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    let query = supabase
      .from('material_costs')
      .select('*')
      .eq('company_id', companyId)
      .order('last_seen', { ascending: false });

    if (search) query = query.ilike('item_name', `%${search}%`);
    if (category) query = query.eq('category', category);

    const { data: items, error } = await query.limit(100);
    if (error) throw error;

    return NextResponse.json({ items: items || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { companyId } = await resolveCompanyIdOrThrow();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    const body = await req.json();
    const { action, query: searchQuery, tradeType } = body;

    // Action: search live retail prices via SerpAPI
    if (action === 'retail_search') {
      const serpApiKey = process.env.SERP_API_KEY;
      if (!serpApiKey) {
        return NextResponse.json({ error: 'SerpAPI key not configured' }, { status: 500 });
      }

      const stores = ['Home Depot', 'Menards', "Lowe's"];
      const results: any[] = [];

      for (const store of stores) {
        const serpQuery = `${searchQuery} ${store} price`;
        const serpUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(serpQuery)}&api_key=${serpApiKey}&num=3`;
        
        try {
          const res = await fetch(serpUrl);
          const data = await res.json();
          
          if (data.shopping_results) {
            for (const item of data.shopping_results.slice(0, 2)) {
              results.push({
                store,
                title: item.title,
                price: item.price,
                link: item.link,
                thumbnail: item.thumbnail
              });
            }
          }
        } catch (e) {
          console.error(`SerpAPI error for ${store}:`, e);
        }
      }

      // Use GPT-4o to parse and rank the results
      if (results.length > 0) {
        const completion = await openai.chat.completions.create({
          model:  'gpt-4o-mini',
          messages: [{
            role: 'user',
            content: `You are a ${tradeType || 'contractor'} materials pricing assistant. The user searched for: "${searchQuery}". Here are the live retail results:\n\n${JSON.stringify(results, null, 2)}\n\nReturn ONLY valid JSON array of the top 5 best matches sorted by relevance:\n[{"store": "...", "title": "...", "price": "...", "link": "...", "match_score": 1-10, "note": "why this matches"}]`
          }],
          temperature: 0,
          response_format: { type: 'json_object' }
        });

        const parsed = JSON.parse(completion.choices[0].message.content || '{}');
        return NextResponse.json({ retail_results: parsed.results || results });
      }

      return NextResponse.json({ retail_results: [] });
    }

    // Action: manually add/update an item
    if (action === 'upsert') {
      const { item_name, last_price, unit, supplier, category } = body;
      const price = parseFloat(last_price);

      const { data: existing } = await supabase
        .from('material_costs')
        .select('*')
        .eq('company_id', companyId)
        .ilike('item_name', item_name)
        .single();

      if (existing) {
        const newCount = (existing.price_count || 1) + 1;
        const newAvg = ((existing.avg_price * existing.price_count) + price) / newCount;
        await supabase.from('material_costs').update({
          last_price: price,
          avg_price: Math.round(newAvg * 100) / 100,
          min_price: Math.min(existing.min_price || price, price),
          max_price: Math.max(existing.max_price || price, price),
          price_count: newCount,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }).eq('id', existing.id);
      } else {
        await supabase.from('material_costs').insert([{
          company_id: companyId,
          item_name,
          unit: unit || 'each',
          last_price: price,
          avg_price: price,
          min_price: price,
          max_price: price,
          price_count: 1,
          supplier: supplier || 'Manual Entry',
          category: category || null,
          source: 'manual'
        }]);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
