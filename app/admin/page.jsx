'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

const ST = ['new', 'reviewed', 'quoted', 'won', 'lost'];
const csv = rows => [['ref', 'date', 'source', 'name', 'phone', 'email', 'status', 'details'], ...rows.map(r => [r.ref, r.created_at, r.source, r.name, r.phone, r.email, r.status, JSON.stringify(r.payload)])].map(l => l.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
const CSS = `body{margin:0;background:#f4f6fa;font:14px system-ui,sans-serif;color:#0b1f3a}.w{max-width:1100px;margin:0 auto;padding:24px}.top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}h1{font-size:22px}.bar{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}button,select,input{font:inherit;padding:8px 12px;border-radius:8px;border:1px solid #cdd5e0;background:#fff}button{cursor:pointer}button.on,button.p{background:#0b1f3a;color:#fff;border-color:#0b1f3a}.card{background:#fff;border:1px solid #e1e6ee;border-radius:12px;padding:14px 16px;margin-bottom:10px}.row{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center}.m{color:#5b6b82;font-size:12px}.tag{background:#fdb913;color:#0b1f3a;border-radius:6px;padding:2px 8px;font-weight:700;font-size:12px}pre{white-space:pre-wrap;background:#f4f6fa;border-radius:8px;padding:10px;margin:10px 0 0}form{max-width:340px;margin:12vh auto;display:grid;gap:10px}`;

export default function Admin() {
  const [session, setSession] = useState(null), [rows, setRows] = useState([]), [email, setEmail] = useState(''), [pw, setPw] = useState(''), [err, setErr] = useState(''), [flt, setFlt] = useState('all'), [open, setOpen] = useState(null);

  const sb = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
    return createClient(url, key);
  }, []);

  const isConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  useEffect(() => {
    if (!isConfigured) return;
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: l } = sb.auth.onAuthStateChange((_, s) => setSession(s));
    return () => l.subscription.unsubscribe();
  }, [sb, isConfigured]);

  const load = async () => {
    if (!isConfigured) return;
    const { data, error } = await sb.from('inquiries').select('*').order('created_at', { ascending: false }).limit(500);
    error ? setErr(error.message) : setRows(data || []);
  };

  useEffect(() => {
    if (session) load();
  }, [session]);

  const login = async e => {
    e.preventDefault();
    if (!isConfigured) {
      setErr('Supabase environment variables not configured in Vercel.');
      return;
    }
    const { error } = await sb.auth.signInWithPassword({ email, password: pw });
    setErr(error?.message || '');
  };

  const setStatus = async (id, status) => {
    if (!isConfigured) return;
    await sb.from('inquiries').update({ status }).eq('id', id);
    setRows(r => r.map(x => x.id === id ? { ...x, status } : x));
  };

  const exportCsv = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv(rows)], { type: 'text/csv' }));
    a.download = 'inquiries.csv';
    a.click();
  };

  if (!isConfigured) {
    return (
      <>
        <style>{CSS}</style>
        <main className="w">
          <h1>Heniten Admin Portal</h1>
          <div className="card" style={{ marginTop: '20px', borderLeft: '4px solid #fdb913' }}>
            <p><strong>Database Connection Required</strong></p>
            <p className="m">Please configure <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your Vercel Project Settings (Settings &rarr; Environment Variables) to enable the inquiries dashboard.</p>
          </div>
        </main>
      </>
    );
  }

  if (!session) return (
    <>
      <style>{CSS}</style>
      <form onSubmit={login}>
        <h1>Heniten Admin</h1>
        <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input placeholder="Password" type="password" value={pw} onChange={e => setPw(e.target.value)} required />
        <button className="p">Sign in</button>
        <div className="m">{err}</div>
      </form>
    </>
  );

  const shown = rows.filter(r => flt === 'all' || r.status === flt);
  return (
    <>
      <style>{CSS}</style>
      <main className="w">
        <div className="top">
          <h1>Inquiries ({shown.length})</h1>
          <div className="bar">
            <button onClick={load}>Refresh</button>
            <button onClick={exportCsv}>Export CSV</button>
            <button onClick={() => sb.auth.signOut()}>Sign out</button>
          </div>
        </div>
        <div className="bar">
          {['all', ...ST].map(s => (
            <button key={s} className={flt === s ? 'on' : ''} onClick={() => setFlt(s)}>{s}</button>
          ))}
        </div>
        {err && <div className="card">{err}</div>}
        {shown.map(r => (
          <div className="card" key={r.id}>
            <div className="row">
              <div>
                <b>{r.name}</b> <span className="tag">{r.ref}</span> <span className="m">{r.source} · {new Date(r.created_at).toLocaleString()}</span>
                <div className="m">{[r.phone, r.email].filter(Boolean).join(' · ')}</div>
              </div>
              <div className="row">
                <select value={r.status} onChange={e => setStatus(r.id, e.target.value)}>
                  {ST.map(s => <option key={s}>{s}</option>)}
                </select>
                <button onClick={() => setOpen(open === r.id ? null : r.id)}>{open === r.id ? 'Hide' : 'Details'}</button>
              </div>
            </div>
            {open === r.id && <pre>{Object.entries(r.payload || {}).map(([k, v]) => `${k}: ${v}`).join('\n')}</pre>}
          </div>
        ))}
      </main>
    </>
  );
}
