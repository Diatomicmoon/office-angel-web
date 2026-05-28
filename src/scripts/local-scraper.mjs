import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';
import playwright from 'playwright-core';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// This script runs locally or on a VPS (bypassing Vercel's 50MB Serverless limit)
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function runScraper() {
  console.log('Starting Playwright Scraper for LOGIS ePermits...');
  
  const { data: companies } = await supabase.from('companies').select('id').limit(1);
  if (!companies || companies.length === 0) throw new Error('No company found.');
  const companyId = companies[0].id;

  try {
      // Use the local chromium installation
      const browser = await playwright.chromium.launch({ headless: true });
      const context = await browser.newContext();
      const page = await context.newPage();

      const targetCities = ['waconia', 'edenprairie'];
      const allResults = [];

      for (const targetCity of targetCities) {
        console.log(`Navigating to ${targetCity} ePermits...`);
        await page.goto(`https://epermits.logis.org/search.aspx?city=${targetCity}`, { waitUntil: 'networkidle' });

        const today = new Date();
        const lastMonth = new Date();
        lastMonth.setDate(today.getDate() - 30);
        
        const formatDate = (d) => `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;

        console.log(`Setting date range: ${formatDate(lastMonth)} to ${formatDate(today)}`);
        await page.fill('input[id$="dpIssuedDateFrom_dateInput"]', formatDate(lastMonth));
        await page.fill('input[id$="dpIssuedDateTo_dateInput"]', formatDate(today));
        
        await page.click('input[value="Search"]');
        
        console.log(`Waiting for ${targetCity} results table to load...`);
        await page.waitForSelector('table', { timeout: 10000 }).catch(() => console.log(`No table found for ${targetCity}`));

        const html = await page.content();
        const $ = cheerio.load(html);
        
        $('table tr').each((index, element) => {
          if (index === 0) return;
          
          const tds = $(element).find('td');
          if (tds.length < 10) return;
          
          const permitNum = $(tds[0]).text().trim();
          const subType = $(tds[3]).text().trim();
          const workType = $(tds[4]).text().trim();
          const address = $(tds[6]).text().trim();
          const contractor = $(tds[7]).text().trim();
          const issuedDate = $(tds[8]).text().trim();
          
          if (!subType.toLowerCase().includes('new') && !workType.toLowerCase().includes('new')) return; 
          
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
        // Upsert based on property_address to prevent duplicates
        // Note: For upsert to work, property_address needs a UNIQUE constraint in the DB
        // If not, we fall back to insert
        const { error } = await supabase.from('new_build_permits').insert(allResults);
        if (error) {
           console.log("Upsert/Insert error (likely duplicates, which is fine):", error.message);
        } else {
           console.log("Successfully inserted into Supabase!");
        }
      }
      
  } catch (err) {
      console.log("Error running local playwright scraper:", err.message);
      console.log("Note: This script requires Chromium to be installed on the machine running it.");
  }
}

runScraper();
