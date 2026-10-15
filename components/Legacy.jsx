'use client';
import { useEffect } from 'react';
const load = src => new Promise(r => { const s = document.createElement('script'); s.src = src; s.onload = r; document.body.appendChild(s); });
export default function Legacy() {
  useEffect(() => {
    if (window.__heniten) return; window.__heniten = 1;
    (async () => { await load('/assets/js/main.js'); document.dispatchEvent(new Event('DOMContentLoaded')); await load('/js/forms.js'); })();
  }, []);
  return null;
}
