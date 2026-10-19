(function () {
  const ids = ['rfpForm', 'contactDirectForm'];
  ids.forEach(id => { const f = document.getElementById(id); if (!f) return; const i = document.createElement('input'); i.name = 'website'; i.tabIndex = -1; i.autocomplete = 'off'; i.setAttribute('aria-hidden', 'true'); i.style.cssText = 'position:absolute;left:-9999px;opacity:0'; f.appendChild(i); });
  document.addEventListener('submit', async e => {
    const f = e.target; if (!ids.includes(f.id)) return;
    e.preventDefault(); e.stopImmediatePropagation();
    const btn = f.querySelector('button[type=submit]'), label = btn.textContent;
    btn.disabled = true; btn.textContent = 'Sending…';
    const fields = {};
    f.querySelectorAll('input,select,textarea').forEach(el => { const k = el.name || el.id; if (k && el.value && el.type !== 'submit') fields[k] = el.value; });
    try {
      const r = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source: f.id === 'rfpForm' ? 'quotation' : 'contact', hp: fields.website || '', fields }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Failed');
      f.innerHTML = `<div style="text-align:center;padding:40px 20px"><div style="width:68px;height:68px;background:rgba(253,185,19,.2);color:#fdb913;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:20px">✓</div><h3 style="font-size:26px;margin-bottom:12px">Request received</h3><p style="max-width:480px;margin:0 auto 24px;line-height:1.6">Thank you. Our Engineering Bureau in Addis Ababa will respond within one business day.</p><div style="font-weight:700;font-size:14px;letter-spacing:.06em">REFERENCE ID: ${d.ref}</div></div>`;
    } catch (err) { btn.disabled = false; btn.textContent = label; alert((err.message || 'Could not send') + ' — or call +251 966 118 312.'); }
  }, true);
})();
