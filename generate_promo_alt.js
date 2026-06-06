const puppeteer = require('puppeteer');

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });

  const commonHead = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
      body {
        margin: 0; padding: 0; width: 1080px; height: 1080px;
        font-family: 'Inter', sans-serif;
        background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%);
        color: white;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        position: relative; overflow: hidden;
      }
      .bg-pattern {
        position: absolute; inset: 0; opacity: 0.15;
        background-image: radial-gradient(#ffffff 2px, transparent 2px);
        background-size: 30px 30px;
        z-index: 1;
      }
      .glow {
        position: absolute; width: 800px; height: 800px;
        background: radial-gradient(circle, rgba(59,130,246,0.6) 0%, rgba(0,0,0,0) 70%);
        top: 50%; left: 50%; transform: translate(-50%, -50%);
        z-index: 2;
      }
      .content {
        z-index: 10; text-align: center; display: flex; flex-direction: column; align-items: center;
        padding: 80px; width: 100%; box-sizing: border-box;
      }
      .badge {
        background-color: #facc15; color: #1e3a8a;
        padding: 16px 40px; border-radius: 50px;
        font-weight: 800; font-size: 28px; text-transform: uppercase;
        letter-spacing: 2px; margin-bottom: 50px;
        box-shadow: 0 10px 25px rgba(250, 204, 21, 0.3);
        display: inline-flex; align-items: center; gap: 12px;
      }
      h1 {
        font-size: 110px; font-weight: 900; line-height: 1.1; margin: 0 0 40px 0;
        text-shadow: 0 10px 30px rgba(0,0,0,0.3); letter-spacing: -2px;
      }
      .highlight { color: #facc15; }
      p {
        font-size: 44px; font-weight: 600; color: #e0e7ff; line-height: 1.4; margin: 0; max-width: 900px;
        text-shadow: 0 4px 10px rgba(0,0,0,0.2);
      }
      .glass-card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-top: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 40px; padding: 50px;
        box-shadow: 0 30px 60px rgba(0,0,0,0.4), inset 0 0 20px rgba(255,255,255,0.05);
        width: 100%; max-width: 850px;
      }
    </style>
  `;

  const generateSlide3 = (titleHtml) => `
    <html><head>${commonHead}</head><body>
      <div class="bg-pattern"></div><div class="glow"></div>
      <div class="content">
        <div class="badge">🛰️ LEVEL 2</div>
        ${titleHtml}
        
        <div class="glass-card" style="margin: 30px 0; text-align:left; padding:50px;">
           <div style="display:flex; gap:30px; align-items:center; margin-bottom:40px; border-bottom:2px solid rgba(255,255,255,0.1); padding-bottom:40px;">
             <div style="width:100px; height:100px; background:#0f172a; border-radius:20px; border:3px solid #facc15; position:relative; display:flex; justify-content:center; align-items:center; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
               <div style="position:absolute; top:12px; right:12px; width:12px; height:12px; border-radius:50%; background:#22c55e; box-shadow:0 0 15px #22c55e;"></div>
               <div style="width:50%; height:8px; background:#334155; border-radius:4px; margin-top:20px;"></div>
             </div>
             <div>
               <h2 style="margin:0 0 10px 0; font-size:42px; color:white; font-weight:800; letter-spacing:-1px;">OBD-II Hardware</h2>
               <p style="font-size:28px; color:#bfdbfe;">Unplug-proof hardwired tracking</p>
             </div>
           </div>
           
           <div style="background:rgba(0,0,0,0.4); border-radius:20px; padding:30px; display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-left:8px solid #22c55e;">
             <span style="font-size:32px; font-weight:800; color:white;">Van 01 (Sprinter)</span>
             <span style="font-size:32px; font-weight:800; color:#22c55e;">65 MPH</span>
           </div>
           <div style="background:rgba(0,0,0,0.4); border-radius:20px; padding:30px; display:flex; justify-content:space-between; align-items:center; border-left:8px solid #facc15;">
             <span style="font-size:32px; font-weight:800; color:white;">Van 04 (Transit)</span>
             <span style="font-size:32px; font-weight:800; color:#facc15;">IDLE (15m)</span>
           </div>
        </div>
      </div>
    </body></html>
  `;

  const templates = [
    { name: 'total_visibility', html: generateSlide3('<h1 style="font-size:95px;"><span class="highlight">Total</span><br/>Visibility.</h1>') },
    { name: 'absolute_control', html: generateSlide3('<h1 style="font-size:95px;"><span class="highlight">Absolute</span><br/>Control.</h1>') },
    { name: 'the_live_grid', html: generateSlide3('<h1 style="font-size:95px;">The <span class="highlight">Live</span><br/>Grid.</h1>') }
  ];

  for (let i = 0; i < templates.length; i++) {
    await page.setContent(templates[i].html);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: '../carousel_angel_3_' + templates[i].name + '.png' });
    console.log('Generated carousel_angel_3_' + templates[i].name + '.png');
  }

  await browser.close();
}

run().catch(console.error);
