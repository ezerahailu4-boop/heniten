import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { admin } from '@/lib/supabase';
const bad = (error, status = 400) => NextResponse.json({ error }, { status });
async function notify(r) {
  const text = `New ${r.source} ${r.ref}\n${r.name} | ${r.phone || ''} ${r.email || ''}\n` + JSON.stringify(r.payload, null, 1).slice(0, 1500);
  const jobs = [];
  if (process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL) jobs.push(fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: process.env.MAIL_FROM, to: process.env.NOTIFY_EMAIL.split(','), reply_to: r.email || undefined, subject: `[Heniten] ${r.source} ${r.ref}`, text }) }));
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) jobs.push(fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text }) }));
  await Promise.allSettled(jobs);
}
export async function POST(req) {
  let b; try { b = await req.json(); } catch { return bad('Bad request'); }
  if (b.hp) return NextResponse.json({ ref: 'HN-000000' });
  const f = b.fields || {};
  if (JSON.stringify(f).length > 8000) return bad('Message too long', 413);
  const pick = re => Object.entries(f).find(([k]) => re.test(k))?.[1] ?? null;
  const name = pick(/full.?name|contact.?name|client.?name|^name$/i) ?? pick(/name/i);
  const phone = pick(/phone|tel/i), email = pick(/e-?mail/i);
  if (!name || !(phone || email)) return bad('Please provide your name and a phone number or email.');
  const ip = createHash('sha256').update((req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim()).digest('hex').slice(0, 24);
  const sb = admin();
  const { count } = await sb.from('inquiries').select('id', { count: 'exact', head: true }).eq('ip', ip).gte('created_at', new Date(Date.now() - 36e5).toISOString());
  if ((count || 0) >= 5) return bad('Too many requests. Please try again later.', 429);
  const row = { ref: 'HN-' + Math.floor(100000 + Math.random() * 900000), source: b.source === 'quotation' ? 'quotation' : 'contact', name, phone, email, payload: f, ip };
  const { error } = await sb.from('inquiries').insert(row);
  if (error) return bad('Could not save your request.', 500);
  await notify(row);
  return NextResponse.json({ ref: row.ref });
}
