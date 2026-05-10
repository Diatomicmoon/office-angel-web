(function () {
  const SCRIPT = document.currentScript;
  const apiBase = (SCRIPT && SCRIPT.getAttribute('data-api-base')) || 'https://www.office-angel.com';
  const companyId = (SCRIPT && SCRIPT.getAttribute('data-company-id')) || '';
  const secret = (SCRIPT && SCRIPT.getAttribute('data-secret')) || '';

  const style = document.createElement('style');
  style.textContent = `
    .oa-btn{position:fixed;right:18px;bottom:18px;z-index:999999;background:#2563eb;color:#fff;border:0;border-radius:999px;padding:12px 14px;font:700 14px system-ui,-apple-system,Segoe UI,Roboto,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.18);cursor:pointer}
    .oa-modal{position:fixed;inset:0;z-index:999999;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.35)}
    .oa-card{width:min(520px,92vw);background:#fff;border-radius:18px;border:1px solid #e5e7eb;box-shadow:0 20px 60px rgba(0,0,0,.18);padding:16px}
    .oa-row{display:flex;gap:10px}
    .oa-row>*{flex:1}
    .oa-h{margin:0 0 4px 0;font:800 18px system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111827}
    .oa-sub{margin:0 0 12px 0;font:500 12px system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#6b7280}
    .oa-label{display:block;margin:10px 0 6px 0;font:800 11px system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#6b7280;text-transform:uppercase;letter-spacing:.08em}
    .oa-in{width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:12px;font:600 14px system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
    .oa-ta{width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:12px;font:600 14px system-ui,-apple-system,Segoe UI,Roboto,sans-serif;min-height:90px;resize:vertical}
    .oa-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:12px}
    .oa-cancel{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:10px 12px;font:800 13px system-ui,-apple-system,Segoe UI,Roboto,sans-serif;cursor:pointer}
    .oa-send{background:#2563eb;color:#fff;border:0;border-radius:12px;padding:10px 12px;font:800 13px system-ui,-apple-system,Segoe UI,Roboto,sans-serif;cursor:pointer}
    .oa-out{margin-top:10px;font:600 12px system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#6b7280}
  `;
  document.head.appendChild(style);

  const btn = document.createElement('button');
  btn.className = 'oa-btn';
  btn.textContent = 'Schedule with Office Angel';
  document.body.appendChild(btn);

  const modal = document.createElement('div');
  modal.className = 'oa-modal';
  modal.innerHTML = `
    <div class="oa-card" role="dialog" aria-modal="true">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
        <div>
          <div class="oa-h">Request Scheduling</div>
          <div class="oa-sub">We’ll text you to confirm a time.</div>
        </div>
        <button class="oa-cancel" data-oa-close>Close</button>
      </div>
      <label class="oa-label">Name</label>
      <input class="oa-in" data-oa-name placeholder="Jordan" />
      <div class="oa-row">
        <div>
          <label class="oa-label">Phone</label>
          <input class="oa-in" data-oa-phone placeholder="+16125550123" />
        </div>
        <div>
          <label class="oa-label">Address</label>
          <input class="oa-in" data-oa-address placeholder="123 Main St" />
        </div>
      </div>
      <label class="oa-label">What’s going on?</label>
      <textarea class="oa-ta" data-oa-message placeholder="Breaker keeps tripping. Best time tomorrow 9–11am."></textarea>

      <label class="oa-label">Preferred time window</label>
      <input class="oa-in" data-oa-window placeholder="tomorrow 9-11am" />
      <div class="oa-actions">
        <button class="oa-cancel" data-oa-close>Cancel</button>
        <button class="oa-send" data-oa-send>Send</button>
      </div>
      <div class="oa-out" data-oa-out></div>
    </div>
  `;
  document.body.appendChild(modal);

  function open() {
    modal.style.display = 'flex';
  }
  function close() {
    modal.style.display = 'none';
  }

  btn.addEventListener('click', open);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
  modal.querySelectorAll('[data-oa-close]').forEach((el) => el.addEventListener('click', close));

  modal.querySelector('[data-oa-send]').addEventListener('click', async () => {
    const out = modal.querySelector('[data-oa-out]');
    out.textContent = 'Sending…';

    const payload = {
      company_id: companyId || undefined,
      secret: secret || undefined,
      name: modal.querySelector('[data-oa-name]').value,
      phone: modal.querySelector('[data-oa-phone]').value,
      address: modal.querySelector('[data-oa-address]').value,
      message: [
        modal.querySelector('[data-oa-message]').value,
        modal.querySelector('[data-oa-window]').value ? `Preferred window: ${modal.querySelector('[data-oa-window]').value}` : ''
      ].filter(Boolean).join('\n'),
    };

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (secret) headers['X-Office-Angel-Secret'] = secret;

      const r = await fetch(apiBase.replace(/\/$/, '') + '/api/inbound-web', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const ok = r.ok;
      out.textContent = ok ? 'Sent ✅ Check Dispatch → AI Parking Lot.' : 'Failed ❌';
      if (ok) setTimeout(close, 800);
    } catch (e) {
      out.textContent = 'Failed ❌';
    }
  });
})();
