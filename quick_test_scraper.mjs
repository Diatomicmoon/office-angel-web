import * as cheerio from 'cheerio';
import playwright from 'playwright-core';

async function runTest() {
  console.log('Testing LOGIS scraper for Mound, Minnetonka, and Orono...');
  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const targetCities = ['mound', 'minnetonka', 'orono'];
  const allResults = [];

  for (const targetCity of targetCities) {
    console.log(`\nNavigating to ${targetCity} ePermits...`);
    try {
      const response = await page.goto(`https://epermits.logis.org/search.aspx?city=${targetCity}`, { waitUntil: 'networkidle', timeout: 15000 });
      
      if (!response || !response.ok()) {
        console.log(`Failed to load or not a LOGIS city: ${targetCity} (Status: ${response?.status()})`);
        continue;
      }

      const today = new Date();
      const lastMonth = new Date();
      lastMonth.setDate(today.getDate() - 30);
      const formatDate = (d) => `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;

      try {
        await page.fill('input[id$="dpIssuedDateFrom_dateInput"]', formatDate(lastMonth));
        await page.fill('input[id$="dpIssuedDateTo_dateInput"]', formatDate(today));
        await page.click('input[value="Search"]');
        await page.waitForSelector('table', { timeout: 5000 });
      } catch (err) {
        console.log(`UI elements missing for ${targetCity}. Probably not a standard LOGIS portal.`);
        continue;
      }

      const html = await page.content();
      const $ = cheerio.load(html);

      let count = 0;
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

        allResults.push({
          city: targetCity,
          address,
          contractor,
          permitNum,
          issuedDate
        });
        count++;
      });
      console.log(`Found ${count} new build permits in ${targetCity}.`);
    } catch (e) {
      console.log(`Error on ${targetCity}:`, e.message);
    }
  }
  await browser.close();

  console.log('\n--- SCRAPE RESULTS (Sample) ---');
  console.log(JSON.stringify(allResults.slice(0, 5), null, 2));
  if (allResults.length > 5) console.log(`...and ${allResults.length - 5} more.`);
}
runTest();
