const fs = require('fs');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

async function run() {
  const executablePath = await chromium.executablePath();
  // If executablePath fails, fallback to standard puppeteer
  const browser = await puppeteer.launch({
    executablePath: executablePath || '/usr/bin/google-chrome',
    args: chromium.args || ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });

  const templates = [
    {
      id: 'carousel_1_new',
      html: `
        <html>
          <body style="margin:0; padding:0; width:1080px; height:1080px; background-color:#0a0a0a; color:white; font-family:-apple-system, system-ui, sans-serif; display:flex; flex-direction:column; justify-content:center; align-items:center; position:relative; overflow:hidden;">
            <div style="position:absolute; top:0; left:0; right:0; bottom:0; opacity:0.3; background-image:url('https://images.unsplash.com/photo-1582282577233-a3d8b31a89c9?q=80&w=2000&auto=format&fit=crop'); background-size:cover; background-position:center;"></div>
            <div style="position:absolute; top:0; left:0; right:0; bottom:0; background:linear-gradient(to bottom, rgba(10,10,10,0.8), rgba(10,10,10,0.95));"></div>
            
            <div style="z-index:10; text-align:center; padding:80px;">
              <h1 style="font-size:100px; font-weight:900; line-height:1.1; margin-bottom:40px; text-transform:uppercase; letter-spacing:-2px;">
                Keep It A <span style="color:#f97316;">Buck</span>.
              </h1>
              <p style="font-size:48px; font-weight:600; color:#e5e5e5; line-height:1.3; max-width:900px; margin:0 auto;">
                Do you actually know where your vans are right now?
              </p>
              <div style="margin-top:80px; width:120px; height:12px; background-color:#f97316; margin-left:auto; margin-right:auto;"></div>
            </div>
          </body>
        </html>
      `
    },
    {
      id: 'carousel_2_new',
      html: `
        <html>
          <body style="margin:0; padding:0; width:1080px; height:1080px; background-color:#0a0a0a; color:white; font-family:-apple-system, system-ui, sans-serif; display:flex; flex-direction:column; padding:80px; box-sizing:border-box; position:relative;">
            
            <h2 style="font-size:40px; font-weight:800; color:#3b82f6; text-transform:uppercase; letter-spacing:4px; margin-bottom:20px;">Level 1</h2>
            <h1 style="font-size:85px; font-weight:900; line-height:1.1; margin-bottom:60px; margin-top:0;">THE INVISIBLE<br/>TIMECLOCK.</h1>
            
            <div style="flex:1; background-color:#171717; border-radius:30px; border:2px solid #333; position:relative; overflow:hidden; display:flex; justify-content:center; align-items:center;">
              <div style="position:absolute; inset:0; opacity:0.4; background-image:url('https://maps.wikimedia.org/osm-intl/16/15745/23696.png'); background-size:cover; filter:invert(1) hue-rotate(180deg) contrast(1.5);"></div>
              
              <!-- Map UI Element -->
              <div style="z-index:10; width:400px; height:400px; border-radius:50%; border:4px dashed #3b82f6; background-color:rgba(59,130,246,0.1); display:flex; justify-content:center; align-items:center; position:relative;">
                <div style="width:20px; height:20px; background-color:#3b82f6; border-radius:50%; box-shadow:0 0 30px 10px rgba(59,130,246,0.6);"></div>
                <div style="position:absolute; top:-40px; background-color:#3b82f6; color:white; padding:10px 20px; border-radius:10px; font-weight:bold; font-size:24px;">30ft Geofence</div>
              </div>
            </div>

            <p style="font-size:36px; font-weight:500; color:#a3a3a3; line-height:1.4; margin-top:60px; margin-bottom:0;">
              <span style="color:white; font-weight:700;">They pull up?</span> Clocked in.<br/>
              <span style="color:white; font-weight:700;">They drive off?</span> Clocked out.<br/>
              No more "I forgot to hit the button" excuses.
            </p>
          </body>
        </html>
      `
    },
    {
      id: 'carousel_3_new',
      html: `
        <html>
          <body style="margin:0; padding:0; width:1080px; height:1080px; background-color:#0a0a0a; color:white; font-family:-apple-system, system-ui, sans-serif; display:flex; flex-direction:column; padding:80px; box-sizing:border-box; position:relative;">
            
            <h2 style="font-size:40px; font-weight:800; color:#f97316; text-transform:uppercase; letter-spacing:4px; margin-bottom:20px;">Level 2</h2>
            <h1 style="font-size:85px; font-weight:900; line-height:1.1; margin-bottom:60px; margin-top:0;">THE GOD<br/>VIEW.</h1>
            
            <div style="flex:1; display:flex; gap:40px;">
              
              <!-- Dashboard -->
              <div style="flex:2; background-color:#171717; border-radius:30px; border:2px solid #333; padding:30px; display:flex; flex-direction:column;">
                <div style="display:flex; gap:10px; margin-bottom:30px;">
                  <div style="width:15px; height:15px; border-radius:50%; background-color:#ef4444;"></div>
                  <div style="width:15px; height:15px; border-radius:50%; background-color:#eab308;"></div>
                  <div style="width:15px; height:15px; border-radius:50%; background-color:#22c55e;"></div>
                </div>
                <div style="flex:1; background-color:#262626; border-radius:15px; padding:20px; display:flex; flex-direction:column; gap:20px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; padding:20px; background-color:#333; border-radius:10px; border-left:6px solid #22c55e;">
                    <div style="font-size:28px; font-weight:bold;">Truck 01 (Sprinter)</div>
                    <div style="font-size:24px; color:#22c55e; font-weight:bold;">65 MPH</div>
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:center; padding:20px; background-color:#333; border-radius:10px; border-left:6px solid #f97316;">
                    <div style="font-size:28px; font-weight:bold;">Truck 04 (Transit)</div>
                    <div style="font-size:24px; color:#f97316; font-weight:bold;">IDLE (15m)</div>
                  </div>
                </div>
              </div>

              <!-- Hardware -->
              <div style="flex:1; background-color:#171717; border-radius:30px; border:2px solid #f97316; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:40px;">
                <div style="width:120px; height:160px; background-color:#0a0a0a; border:4px solid #333; border-radius:10px; position:relative; margin-bottom:40px;">
                  <div style="position:absolute; bottom:-10px; left:10px; right:10px; height:20px; background-color:#444; border-radius:5px;"></div>
                  <div style="position:absolute; top:20px; left:20px; width:15px; height:15px; background-color:#22c55e; border-radius:50%; box-shadow:0 0 15px #22c55e;"></div>
                </div>
                <h3 style="font-size:32px; margin:0; color:#f97316;">OBD-II<br/>TRACKER</h3>
              </div>

            </div>

            <p style="font-size:36px; font-weight:500; color:#a3a3a3; line-height:1.4; margin-top:60px; margin-bottom:0;">
              Hardwired fleet tracking. Real-time location, speed, and live routing.<br/>
              <span style="color:white; font-weight:700;">Unplug-proof. Bulletproof.</span>
            </p>
          </body>
        </html>
      `
    },
    {
      id: 'carousel_4_new',
      html: `
        <html>
          <body style="margin:0; padding:0; width:1080px; height:1080px; background-color:#f97316; color:white; font-family:-apple-system, system-ui, sans-serif; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:80px; box-sizing:border-box;">
            
            <h1 style="font-size:110px; font-weight:900; line-height:1; margin-bottom:40px; text-transform:uppercase; letter-spacing:-2px; color:#0a0a0a;">
              Stop<br/>Babysitting.<br/>Start Scaling.
            </h1>
            
            <p style="font-size:42px; font-weight:600; color:white; line-height:1.4; max-width:800px; margin-bottom:80px;">
              We build custom AI operating systems for the trades.
            </p>

            <div style="background-color:#0a0a0a; padding:30px 60px; border-radius:20px;">
              <span style="font-size:36px; font-weight:800; letter-spacing:2px; color:white;">LINK IN BIO TO BOOK A DEMO</span>
            </div>

            <div style="position:absolute; bottom:60px; display:flex; align-items:center; gap:20px;">
              <div style="width:60px; height:60px; background-color:#0a0a0a; border-radius:12px; display:flex; justify-content:center; align-items:center;">
                <div style="width:30px; height:30px; border:4px solid white; border-radius:6px; position:relative;">
                   <div style="position:absolute; top:-12px; left:5px; width:12px; height:12px; background-color:white; border-radius:50%;"></div>
                </div>
              </div>
              <span style="font-size:32px; font-weight:800; color:#0a0a0a; letter-spacing:1px;">HARD HAT SOLUTIONS</span>
            </div>
          </body>
        </html>
      `
    }
  ];

  for (const t of templates) {
    await page.setContent(t.html);
    await page.screenshot({ path: t.id + '.png' });
    console.log('Generated ' + t.id + '.png');
  }

  await browser.close();
}

// Ignore Spaticuz chromium locally if missing
run().catch(async (e) => {
    const puppeteer2 = require('puppeteer');
    const browser = await puppeteer2.launch({
      executablePath: '/usr/bin/google-chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });
  
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });
  
    const templates = [
      {
        id: 'carousel_1_new',
        html: `
          <html>
            <body style="margin:0; padding:0; width:1080px; height:1080px; background-color:#0a0a0a; color:white; font-family:-apple-system, system-ui, sans-serif; display:flex; flex-direction:column; justify-content:center; align-items:center; position:relative; overflow:hidden;">
              <div style="position:absolute; top:0; left:0; right:0; bottom:0; opacity:0.3; background-image:url('https://images.unsplash.com/photo-1582282577233-a3d8b31a89c9?q=80&w=2000&auto=format&fit=crop'); background-size:cover; background-position:center;"></div>
              <div style="position:absolute; top:0; left:0; right:0; bottom:0; background:linear-gradient(to bottom, rgba(10,10,10,0.8), rgba(10,10,10,0.95));"></div>
              
              <div style="z-index:10; text-align:center; padding:80px;">
                <h1 style="font-size:100px; font-weight:900; line-height:1.1; margin-bottom:40px; text-transform:uppercase; letter-spacing:-2px;">
                  Keep It A <span style="color:#f97316;">Buck</span>.
                </h1>
                <p style="font-size:48px; font-weight:600; color:#e5e5e5; line-height:1.3; max-width:900px; margin:0 auto;">
                  Do you actually know where your vans are right now?
                </p>
                <div style="margin-top:80px; width:120px; height:12px; background-color:#f97316; margin-left:auto; margin-right:auto;"></div>
              </div>
            </body>
          </html>
        `
      },
      {
        id: 'carousel_2_new',
        html: `
          <html>
            <body style="margin:0; padding:0; width:1080px; height:1080px; background-color:#0a0a0a; color:white; font-family:-apple-system, system-ui, sans-serif; display:flex; flex-direction:column; padding:80px; box-sizing:border-box; position:relative;">
              
              <h2 style="font-size:40px; font-weight:800; color:#3b82f6; text-transform:uppercase; letter-spacing:4px; margin-bottom:20px;">Level 1</h2>
              <h1 style="font-size:85px; font-weight:900; line-height:1.1; margin-bottom:60px; margin-top:0;">THE INVISIBLE<br/>TIMECLOCK.</h1>
              
              <div style="flex:1; background-color:#171717; border-radius:30px; border:2px solid #333; position:relative; overflow:hidden; display:flex; justify-content:center; align-items:center;">
                <div style="position:absolute; inset:0; opacity:0.4; background-image:url('https://maps.wikimedia.org/osm-intl/16/15745/23696.png'); background-size:cover; filter:invert(1) hue-rotate(180deg) contrast(1.5);"></div>
                
                <!-- Map UI Element -->
                <div style="z-index:10; width:400px; height:400px; border-radius:50%; border:4px dashed #3b82f6; background-color:rgba(59,130,246,0.1); display:flex; justify-content:center; align-items:center; position:relative;">
                  <div style="width:20px; height:20px; background-color:#3b82f6; border-radius:50%; box-shadow:0 0 30px 10px rgba(59,130,246,0.6);"></div>
                  <div style="position:absolute; top:-40px; background-color:#3b82f6; color:white; padding:10px 20px; border-radius:10px; font-weight:bold; font-size:24px;">30ft Geofence</div>
                </div>
              </div>
  
              <p style="font-size:36px; font-weight:500; color:#a3a3a3; line-height:1.4; margin-top:60px; margin-bottom:0;">
                <span style="color:white; font-weight:700;">They pull up?</span> Clocked in.<br/>
                <span style="color:white; font-weight:700;">They drive off?</span> Clocked out.<br/>
                No more "I forgot to hit the button" excuses.
              </p>
            </body>
          </html>
        `
      },
      {
        id: 'carousel_3_new',
        html: `
          <html>
            <body style="margin:0; padding:0; width:1080px; height:1080px; background-color:#0a0a0a; color:white; font-family:-apple-system, system-ui, sans-serif; display:flex; flex-direction:column; padding:80px; box-sizing:border-box; position:relative;">
              
              <h2 style="font-size:40px; font-weight:800; color:#f97316; text-transform:uppercase; letter-spacing:4px; margin-bottom:20px;">Level 2</h2>
              <h1 style="font-size:85px; font-weight:900; line-height:1.1; margin-bottom:60px; margin-top:0;">THE GOD<br/>VIEW.</h1>
              
              <div style="flex:1; display:flex; gap:40px;">
                
                <!-- Dashboard -->
                <div style="flex:2; background-color:#171717; border-radius:30px; border:2px solid #333; padding:30px; display:flex; flex-direction:column;">
                  <div style="display:flex; gap:10px; margin-bottom:30px;">
                    <div style="width:15px; height:15px; border-radius:50%; background-color:#ef4444;"></div>
                    <div style="width:15px; height:15px; border-radius:50%; background-color:#eab308;"></div>
                    <div style="width:15px; height:15px; border-radius:50%; background-color:#22c55e;"></div>
                  </div>
                  <div style="flex:1; background-color:#262626; border-radius:15px; padding:20px; display:flex; flex-direction:column; gap:20px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:20px; background-color:#333; border-radius:10px; border-left:6px solid #22c55e;">
                      <div style="font-size:28px; font-weight:bold;">Truck 01 (Sprinter)</div>
                      <div style="font-size:24px; color:#22c55e; font-weight:bold;">65 MPH</div>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:20px; background-color:#333; border-radius:10px; border-left:6px solid #f97316;">
                      <div style="font-size:28px; font-weight:bold;">Truck 04 (Transit)</div>
                      <div style="font-size:24px; color:#f97316; font-weight:bold;">IDLE (15m)</div>
                    </div>
                  </div>
                </div>
  
                <!-- Hardware -->
                <div style="flex:1; background-color:#171717; border-radius:30px; border:2px solid #f97316; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:40px;">
                  <div style="width:120px; height:160px; background-color:#0a0a0a; border:4px solid #333; border-radius:10px; position:relative; margin-bottom:40px;">
                    <div style="position:absolute; bottom:-10px; left:10px; right:10px; height:20px; background-color:#444; border-radius:5px;"></div>
                    <div style="position:absolute; top:20px; left:20px; width:15px; height:15px; background-color:#22c55e; border-radius:50%; box-shadow:0 0 15px #22c55e;"></div>
                  </div>
                  <h3 style="font-size:32px; margin:0; color:#f97316;">OBD-II<br/>TRACKER</h3>
                </div>
  
              </div>
  
              <p style="font-size:36px; font-weight:500; color:#a3a3a3; line-height:1.4; margin-top:60px; margin-bottom:0;">
                Hardwired fleet tracking. Real-time location, speed, and live routing.<br/>
                <span style="color:white; font-weight:700;">Unplug-proof. Bulletproof.</span>
              </p>
            </body>
          </html>
        `
      },
      {
        id: 'carousel_4_new',
        html: `
          <html>
            <body style="margin:0; padding:0; width:1080px; height:1080px; background-color:#f97316; color:white; font-family:-apple-system, system-ui, sans-serif; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:80px; box-sizing:border-box;">
              
              <h1 style="font-size:110px; font-weight:900; line-height:1; margin-bottom:40px; text-transform:uppercase; letter-spacing:-2px; color:#0a0a0a;">
                Stop<br/>Babysitting.<br/>Start Scaling.
              </h1>
              
              <p style="font-size:42px; font-weight:600; color:white; line-height:1.4; max-width:800px; margin-bottom:80px;">
                We build custom AI operating systems for the trades.
              </p>
  
              <div style="background-color:#0a0a0a; padding:30px 60px; border-radius:20px;">
                <span style="font-size:36px; font-weight:800; letter-spacing:2px; color:white;">LINK IN BIO TO BOOK A DEMO</span>
              </div>
  
              <div style="position:absolute; bottom:60px; display:flex; align-items:center; gap:20px;">
                <div style="width:60px; height:60px; background-color:#0a0a0a; border-radius:12px; display:flex; justify-content:center; align-items:center;">
                  <div style="width:30px; height:30px; border:4px solid white; border-radius:6px; position:relative;">
                     <div style="position:absolute; top:-12px; left:5px; width:12px; height:12px; background-color:white; border-radius:50%;"></div>
                  </div>
                </div>
                <span style="font-size:32px; font-weight:800; color:#0a0a0a; letter-spacing:1px;">HARD HAT SOLUTIONS</span>
              </div>
            </body>
          </html>
        `
      }
    ];
  
    for (const t of templates) {
      await page.setContent(t.html);
      await page.screenshot({ path: '../' + t.id + '.png' });
      console.log('Generated ' + t.id + '.png');
    }
  
    await browser.close();
});
