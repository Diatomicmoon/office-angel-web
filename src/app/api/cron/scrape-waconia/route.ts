import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';
import chromium from '@sparticuz/chromium';
import playwright from 'playwright-core';

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  console.log('Starting Playwright Scraper for Waconia (LOGIS)...');

  try {
    const { data: companies } = await supabase.from('companies').select('id').limit(1);
    if (!companies || companies.length === 0) throw new Error('No company found.');
    const companyId = companies[0]?.id;

    // Launch headless Chromium (Optimized for Vercel Serverless Functions)
    const executablePath = await chromium.executablePath();
    const browser = await playwright.chromium.launch({
      args: chromium.args,
      executablePath: executablePath || undefined,
      headless: true,
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    // Target Cities using LOGIS
    const targetCities = ['waconia', 'edenprairie'];
    const allResults: any[] = [];

    for (const targetCity of targetCities) {
      console.log(`Navigating to ${targetCity} ePermits...`);
      await page.goto(`https://epermits.logis.org/search.aspx?city=${targetCity}`, { waitUntil: 'networkidle' });

      // Calculate dates (Last 7 days for nightly run)
      const today = new Date();
      const lastWeek = new Date();
      lastWeek.setDate(today.getDate() - 7);
      
      const formatDate = (d: Date) => `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;

      // Fill out the search form
      console.log(`Setting date range: ${formatDate(lastWeek)} to ${formatDate(today)}`);
      await page.fill('input[name$="txtIssuedDateFrom"]', formatDate(lastWeek));
      await page.fill('input[name$="txtIssuedDateTo"]', formatDate(today));
      
      await page.click('input[value="Search"]');
      
      console.log(`Waiting for ${targetCity} results table to load...`);
      await page.waitForSelector('table', { timeout: 10000 }).catch(() => console.log(`No table found for ${targetCity}`));

      const html = await page.content();
      const $ = cheerio.load(html);
      
      $('table tr').each((index, element) => {
        if (index === 0) return; // Skip header
        
        const tds = $(element).find('td');
        if (tds.length < 10) return;
        
        const permitNum = $(tds[0]).text().trim();
        const subType = $(tds[3]).text().trim();
        const workType = $(tds[4]).text().trim();
        const address = $(tds[6]).text().trim();
        const contractor = $(tds[7]).text().trim();
        const issuedDate = $(tds[8]).text().trim();
        
        if (!subType.toLowerCase().includes('new') && !workType.toLowerCase().includes('new')) {
           return; 
        }
        
        const issueDateObj = new Date(issuedDate || Date.now());
        const estimatedCompletion = new Date(issueDateObj);
        estimatedCompletion.setMonth(estimatedCompletion.getMonth() + 6);
        
        allResults.push({
          company_id: companyId,
          property_address: address,
          city: targetCity === 'edenprairie' ? 'Eden Prairie' : 'Waconia',
          state: 'MN',
          contractor_name: contractor,
          permit_date: issueDateObj.toISOString().split('T')[0],
          estimated_completion_date: estimatedCompletion.toISOString().split('T')[0],
          status: 'foundation',
          notes: `Permit: ${permitNum} | Builder: ${contractor}`
        });
      });
    }

    await browser.close();

    console.log(`Scraped ${allResults.length} total new build permits across LOGIS cities.`);

    if (allResults.length > 0) {
      const { error } = await supabase.from('new_build_permits').insert(allResults);
      if (error) throw error;
    }

    return NextResponse.json({ success: true, count: allResults.length, data: allResults });

  } catch (error: any) {
    console.error("Scraper failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}