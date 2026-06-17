import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.goto('https://onemoreyard.my.canva.site/our-work');
  // Wait using a promise
  await new Promise(r => setTimeout(r, 5000));
  
  const text = await page.evaluate(() => document.body.innerText);
  console.log("TEXT EXTRACTED:\n", text.replace(/\n\s*\n/g, '\n'));
  
  // Also dump a quick HTML snippet to see if it rendered
  const h = await page.content();
  console.log("\nHTML LENGTH:", h.length);
  
  await browser.close();
})();
