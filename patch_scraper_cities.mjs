import fs from 'fs';

let content = fs.readFileSync('office-angel-web/src/app/api/cron/scrape-local-permits/route.ts', 'utf8');

const oldCities = `const TARGET_CITIES = [
  { name: 'Eden Prairie', state: 'MN', url: 'https://epermits.logis.org/search.aspx?city=edenprairie' },
  { name: 'Chanhassen', state: 'MN', url: 'https://epermits.logis.org/search.aspx?city=chanhassen' },
  { name: 'Minnetonka', state: 'MN', url: 'https://epermits.logis.org/search.aspx?city=minnetonka' },
  { name: 'Edina', state: 'MN', url: 'https://epermits.logis.org/search.aspx?city=edina' },
  { name: 'Bloomington', state: 'MN', url: 'https://epermits.logis.org/search.aspx?city=bloomington' }
];`;

const newCities = `const TARGET_CITIES = [
  // Carver County
  { name: 'Chaska', state: 'MN', url: 'https://epermits.logis.org/search.aspx?city=chaska' },
  { name: 'Victoria', state: 'MN', url: 'https://epermits.logis.org/search.aspx?city=victoria' },
  { name: 'Waconia', state: 'MN', url: 'https://epermits.logis.org/search.aspx?city=waconia' },
  { name: 'Carver', state: 'MN', url: 'https://epermits.logis.org/search.aspx?city=carver' },
  { name: 'Chanhassen', state: 'MN', url: 'https://epermits.logis.org/search.aspx?city=chanhassen' },
  // Hennepin County
  { name: 'Eden Prairie', state: 'MN', url: 'https://epermits.logis.org/search.aspx?city=edenprairie' },
  { name: 'Minnetonka', state: 'MN', url: 'https://epermits.logis.org/search.aspx?city=minnetonka' },
  { name: 'Edina', state: 'MN', url: 'https://epermits.logis.org/search.aspx?city=edina' },
  { name: 'Bloomington', state: 'MN', url: 'https://epermits.logis.org/search.aspx?city=bloomington' },
  { name: 'Plymouth', state: 'MN', url: 'https://epermits.logis.org/search.aspx?city=plymouth' },
  { name: 'Maple Grove', state: 'MN', url: 'https://epermits.logis.org/search.aspx?city=maplegrove' }
];`;

content = content.replace(oldCities, newCities);

fs.writeFileSync('office-angel-web/src/app/api/cron/scrape-local-permits/route.ts', content);
console.log("Patched Scraper Cities.");
