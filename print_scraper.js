const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const cheerio = require('cheerio');
async function run() {
  const url = 'https://epermits.logis.org/search.aspx?city=wa';
  const homeRes = await fetch('https://epermits.logis.org/home.aspx?city=wa');
  let cookies = homeRes.headers.get('set-cookie');
  const initialRes = await fetch(url, { headers: { 'Cookie': cookies || '' } });
  let $ = cheerio.load(await initialRes.text());
  
  const form = new URLSearchParams();
  form.append('__EVENTTARGET', '');
  form.append('__EVENTARGUMENT', '');
  form.append('__VIEWSTATE', $('#__VIEWSTATE').val());
  form.append('__VIEWSTATEGENERATOR', $('#__VIEWSTATEGENERATOR').val());
  form.append('m$m$b$b$dpIssuedDateFrom$dateInput', '2026-05-19-00-00-00');
  form.append('m_m_b_b_dpIssuedDateFrom_dateInput_ClientState', `{"enabled":true,"emptyMessage":"","validationText":"2026-05-19-00-00-00","valueAsString":"2026-05-19-00-00-00","minDateStr":"1980-01-01-00-00-00","maxDateStr":"2099-12-31-00-00-00","lastSetTextBoxValue":"5/19/2026"}`);
  form.append('m$m$b$b$dpIssuedDateTo$dateInput', '2026-06-02-00-00-00');
  form.append('m_m_b_b_dpIssuedDateTo_dateInput_ClientState', `{"enabled":true,"emptyMessage":"","validationText":"2026-06-02-00-00-00","valueAsString":"2026-06-02-00-00-00","minDateStr":"1980-01-01-00-00-00","maxDateStr":"2099-12-31-00-00-00","lastSetTextBoxValue":"6/2/2026"}`);
  form.append('m$m$b$b$btnSearch', 'Search');

  let postRes = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': cookies }, body: form.toString() });
  let resultHtml = await postRes.text();
  let $res = cheerio.load(resultHtml);
  
  $res('table tr').each((i, el) => {
     if (i===0) return;
     const tds = $res(el).find('td');
     if (tds.length < 8) return;
     
     const permitNum = $res(tds[0]).text().trim();
     if (!permitNum.startsWith('WA')) return;
     console.log(permitNum, $res(tds[6]).text().trim(), $res(tds[3]).text().trim(), $res(tds[4]).text().trim());
  });
}
run();
