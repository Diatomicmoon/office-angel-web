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

    // Go to Waconia LOGIS permit search
    console.log("Navigating to Waconia ePermits...");
    await page.goto('https://epermits.logis.org/search.aspx?city=waconia', { waitUntil: 'networkidle' });

    // Calculate dates (Last 7 days for nightly run)
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    
    const formatDate = (d: Date) => `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;

    // Fill out the search form
    console.log(`Setting date range: ${formatDate(lastWeek)} to ${formatDate(today)}`);
    await page.fill('input[name$="txtIssuedDateFrom"]', formatDate(lastWeek)); // We'll need exact selectors for prod
    await page.fill('input[name$="txtIssuedDateTo"]', formatDate(today));
    
    // Select "New Construction" or equivalent if needed, else just search by date
    await page.click('input[value="Search"]');
    
    console.log("Waiting for results table to load...");
    // Wait for the results table to appear
    await page.waitForSelector('table', { timeout: 10000 }).catch(() => console.log("No table found or timeout"));

    // Extract the HTML of the page after the search results load
    const html = await page.content();
    await browser.close();

    // --- CHEERIO EXTRACTION ENGINE (from earlier) ---
    const $ = cheerio.load(html);
    const results: any[] = [];
    
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
      
      // Target New Builds only
      if (!subType.toLowerCase().includes('new') && !workType.toLowerCase().includes('new')) {
         return; // Skip remodels/repairs
      }
      
      // Calculate estimated completion (approx 6-8 months for a new build)
      const issueDateObj = new Date(issuedDate || Date.now());
      const estimatedCompletion = new Date(issueDateObj);
      estimatedCompletion.setMonth(estimatedCompletion.getMonth() + 6);
      
      results.push({
        company_id: companyId,
        property_address: address,
        city: 'Waconia',
        state: 'MN',
        contractor_name: contractor,
        permit_date: issueDateObj.toISOString().split('T')[0],
        estimated_completion_date: estimatedCompletion.toISOString().split('T')[0],
        status: 'foundation',
        notes: `Permit: ${permitNum} | Builder: ${contractor}`
      });
    });

    console.log(`Scraped ${results.length} new build permits for Waconia.`);

    // Insert into Supabase
    if (results.length > 0) {
      const { error } = await supabase.from('new_build_permits').insert(results);
      if (error) throw error;
    }

    return NextResponse.json({ success: true, count: results.length, data: results });

  } catch (error: any) {
    console.error("Scraper failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}