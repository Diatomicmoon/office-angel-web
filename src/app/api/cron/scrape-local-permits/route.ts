import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  console.log('Starting Custom Local Permit Scraper...');

  try {
    const { data: companies } = await supabase.from('companies').select('id').limit(1);
    
    if (!companies || companies.length === 0) {
      throw new Error('No company found.');
    }
    
    const companyId = companies[0]?.id;

    // --- EDEN PRAIRIE (LOGIS) SCRAPER ENGINE ---
    // URL would be something like: https://epermits.logis.org/search.aspx?city=edenprairie (Example)
    // Note: LOGIS is usually an ASP.NET WebForms site, which requires sending __VIEWSTATE 
    // or using a headless browser (Puppeteer/Playwright) if a simple GET doesn't work.
    // For now, this Cheerio logic parses the exact HTML table structure.
    
    // const response = await fetch(URL_WITH_PROPER_PAYLOAD);
    // const html = await response.text();
    
    // MOCK HTML for demonstration based on the screenshot provided
    const html = `
      <table>
        <tr>
          <th>Permit #</th><th></th><th>Permit Type</th><th>Sub Type</th><th>Work Type</th>
          <th>Description</th><th>Address</th><th>Contractor</th><th>Issued Date</th>
          <th>Applied Date</th><th>Final Date</th><th>Expiration Date</th><th>Cancelled Date</th><th>ePermit</th>
        </tr>
        <tr>
          <td>EP205449</td><td>Inspections</td><td>Building</td><td>SFD/Remodel</td><td>Repair</td>
          <td>14' Reparative Drain Tile</td><td>16072 Baywood La</td><td>AFFORDABLE EGRESS WINDOWS</td><td>5/27/2026</td>
          <td>5/6/2026</td><td></td><td></td><td></td><td>Y</td>
        </tr>
      </table>
    `;
    
    const $ = cheerio.load(html);
    const results: any[] = [];
    
    // Parse the table rows based on the columns from the screenshot
    $('table tr').each((index, element) => {
      // Skip the header row
      if (index === 0) return;
      
      const tds = $(element).find('td');
      if (tds.length < 10) return;
      
      const permitNum = $(tds[0]).text().trim();
      const permitType = $(tds[2]).text().trim();
      const subType = $(tds[3]).text().trim();
      const workType = $(tds[4]).text().trim();
      const description = $(tds[5]).text().trim();
      const address = $(tds[6]).text().trim();
      const contractor = $(tds[7]).text().trim();
      const issuedDate = $(tds[8]).text().trim();
      
      // Filter for New Construction (We can adjust the exact string matching 'New' or 'Apartments')
      // For this example we just parse everything to show it works
      
      // We will estimate completion date to be 6 months from issue date for New Builds
      const issueDateObj = new Date(issuedDate || Date.now());
      const estimatedCompletion = new Date(issueDateObj);
      estimatedCompletion.setMonth(estimatedCompletion.getMonth() + 6);
      
      results.push({
        company_id: companyId,
        property_address: address,
        city: 'Chanhassen', // or Victoria, Chaska, Waconia, Burnsville, Savage based on target
        state: 'MN',
        zip_code: '', // Might need a geocoder step or default zip if not provided
        contractor_name: contractor,
        contractor_phone: null,
        permit_date: issueDateObj.toISOString().split('T')[0],
        estimated_completion_date: estimatedCompletion.toISOString().split('T')[0],
        status: 'foundation',
        notes: `Permit: ${permitNum} | Type: ${subType} - ${workType} | Desc: ${description}`
      });
    });

    console.log(`Parsed ${results.length} rows from HTML.`);

    // If we had real results, we would insert them into Supabase here:
    // const { error } = await supabase.from('new_build_permits').insert(results);

    return NextResponse.json({ 
      success: true, 
      parsed_count: results.length,
      sample_data: results[0]
    });

  } catch (error: any) {
    console.error("Scraper failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
