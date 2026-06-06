import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';

export const maxDuration = 300; 
export const dynamic = 'force-dynamic';

const TARGET_CITIES = [
  { name: 'Waconia', state: 'MN', code: 'wa' },
  { name: 'Eden Prairie', state: 'MN', code: 'ep' },
  { name: 'Minnetonka', state: 'MN', code: 'mi' },
  { name: 'Edina', state: 'MN', code: 'ed' },
  { name: 'Maple Grove', state: 'MN', code: 'mg' }
];

export async function GET(request: Request) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder');
  console.log('Starting Live LOGIS Permit Scraper...');

  try {
    const { data: companies } = await supabase.from('companies').select('id').limit(1);
    if (!companies || companies.length === 0) throw new Error('No company found.');
    const companyId = companies[0]?.id;

    let totalParsed = 0;
    let totalInserted = 0;
    const allResults: any[] = [];

    // Calculate dates (Last 14 days)
    const today = new Date();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(today.getDate() - 14);

    const fmtDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}-00-00-00`;
    const fmtDisplay = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;

    const dateFrom = fmtDate(twoWeeksAgo);
    const dateTo = fmtDate(today);
    const displayFrom = fmtDisplay(twoWeeksAgo);
    const displayTo = fmtDisplay(today);

    for (const city of TARGET_CITIES) {
      console.log(`Scraping permit portal for: ${city.name} (${city.code})`);
      const url = `https://epermits.logis.org/search.aspx?city=${city.code}`;
      
      try {
        // Step 1: Init Session
        const homeRes = await fetch(`https://epermits.logis.org/home.aspx?city=${city.code}`);
        let cookies = homeRes.headers.get('set-cookie');

        const initialRes = await fetch(url, { headers: { 'Cookie': cookies || '' } });
        const initialHtml = await initialRes.text();
        let $ = cheerio.load(initialHtml);

        let viewState = $('#__VIEWSTATE').val() as string;
        let viewStateGenerator = $('#__VIEWSTATEGENERATOR').val() as string;

        if (!viewState) {
          console.log(`Failed to extract __VIEWSTATE for ${city.name}, skipping.`);
          continue;
        }

        // Step 2: Initial Search POST
        const form = new URLSearchParams();
        form.append('__EVENTTARGET', '');
        form.append('__EVENTARGUMENT', '');
        form.append('__VIEWSTATE', viewState);
        form.append('__VIEWSTATEGENERATOR', viewStateGenerator);
        
        form.append('m$m$b$b$dpIssuedDateFrom$dateInput', displayFrom);
        form.append('m_m_b_b_dpIssuedDateFrom_dateInput_ClientState', `{"enabled":true,"emptyMessage":"","validationText":"${dateFrom}","valueAsString":"${dateFrom}","minDateStr":"1980-01-01-00-00-00","maxDateStr":"2099-12-31-00-00-00","lastSetTextBoxValue":"${displayFrom}"}`);
        form.append('m$m$b$b$dpIssuedDateTo$dateInput', displayTo);
        form.append('m_m_b_b_dpIssuedDateTo_dateInput_ClientState', `{"enabled":true,"emptyMessage":"","validationText":"${dateTo}","valueAsString":"${dateTo}","minDateStr":"1980-01-01-00-00-00","maxDateStr":"2099-12-31-00-00-00","lastSetTextBoxValue":"${displayTo}"}`);
        
        form.append('m$m$b$b$cboPermitType', 'Building');
        form.append('m_m_b_b_cboPermitType_ClientState', '{"logEntries":[],"value":"BLD","text":"Building","enabled":true,"checkedIndices":[],"checkedItemsTextOverflows":false}');
        form.append('m$m$b$b$btnSearch', 'Search');

        let postRes = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookies || '',
            'User-Agent': 'Mozilla/5.0'
          },
          body: form.toString()
        });

        let resultHtml = await postRes.text();
        let $res = cheerio.load(resultHtml);

        // Helper to parse a page
        const parsePage = () => {
          $res('table tr').each((index, element) => {
            if (index === 0) return; // Skip header row
            const tds = $res(element).find('td');
            if (tds.length < 8) return;
            
            const permitNum = $res(tds[0]).text().trim();
            if (!permitNum.startsWith(city.code.toUpperCase())) return;

            const subType = $res(tds[3]).text().trim();
            const workType = $res(tds[4]).text().trim();
            const description = $res(tds[5]).text().trim();
            const address = $res(tds[6]).text().trim();
            const contractor = $res(tds[7]).text().trim();
            const issuedDate = $res(tds[8]).text().trim();
            
            const descLower = description.toLowerCase();
            const subTypeLower = subType.toLowerCase();
            const workTypeLower = workType.toLowerCase();

            const isNewBuild = subTypeLower.includes('new') || workTypeLower.includes('new') || descLower.includes('new sfh') || descLower.includes('new home') || descLower.includes('new construct');

            if (isNewBuild) {
              const issueDateObj = new Date(issuedDate || Date.now());
              const estimatedCompletion = new Date(issueDateObj);
              estimatedCompletion.setMonth(estimatedCompletion.getMonth() + 6);
              
              allResults.push({
                company_id: companyId,
                property_address: address,
                city: city.name,
                zip_code: '', 
                contractor_name: contractor,
                permit_date: issueDateObj.toISOString().split('T')[0],
                estimated_completion_date: estimatedCompletion.toISOString().split('T')[0],
                status: 'foundation'
              });
              totalParsed++;
            }
          });
        };

        parsePage();

        // Loop pagination up to 10 pages
        for (let pageNum = 2; pageNum <= 10; pageNum++) {
          viewState = $res('#__VIEWSTATE').val() as string;
          viewStateGenerator = $res('#__VIEWSTATEGENERATOR').val() as string;
          
          let nextTarget = '';
          $res('a').each((i, el) => {
             const href = $res(el).attr('href');
             if ($res(el).text().trim() === pageNum.toString() && href && href.includes('__doPostBack')) {
                 const match = href.match(/__doPostBack\('([^']*)'/);
                 if (match) nextTarget = match[1];
             }
          });
          
          if (!nextTarget) break; // No more pages

          const pageForm = new URLSearchParams();
          pageForm.append('__EVENTTARGET', nextTarget);
          pageForm.append('__EVENTARGUMENT', '');
          pageForm.append('__VIEWSTATE', viewState);
          pageForm.append('__VIEWSTATEGENERATOR', viewStateGenerator);

          postRes = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Cookie': cookies || '',
              'User-Agent': 'Mozilla/5.0'
            },
            body: pageForm.toString()
          });

          resultHtml = await postRes.text();
          $res = cheerio.load(resultHtml);
          parsePage();
        }
      } catch (err) {
        console.error(`Error scraping ${city.name}:`, err);
      }
    }

    console.log(`Parsed ${totalParsed} new build permits.`);

    for (const build of allResults) {
      const { data: existing } = await supabase
        .from('new_build_permits')
        .select('id')
        .eq('property_address', build.property_address)
        .eq('company_id', build.company_id)
        .limit(1);
        
      if (!existing || existing.length === 0) {
         const { error } = await supabase.from('new_build_permits').insert([build]);
         if (!error) {
            totalInserted++;
         } else {
            console.error("Insert error:", error);
         }
      }
    }

    return NextResponse.json({ 
      success: true, 
      cities_scraped: TARGET_CITIES.map(c => c.name),
      total_found: totalParsed,
      new_inserts: totalInserted
    });

  } catch (error: any) {
    console.error("Scraper route failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
