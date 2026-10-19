import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { sql } from '@/lib/db';

const bad = (error, status = 400) => NextResponse.json({ error }, { status });

async function notify(r) {
  const text = `New ${r.source.toUpperCase()} [${r.ref}]\nName: ${r.name}\nContact: ${r.phone || ''} ${r.email || ''}\n` +
    JSON.stringify(r.payload, null, 2).slice(0, 1500);

  const jobs = [];
  if (process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL) {
    jobs.push(
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.MAIL_FROM || 'Heniten Website <noreply@heniten.com>',
          to: process.env.NOTIFY_EMAIL.split(',').map(s => s.trim()),
          reply_to: r.email || undefined,
          subject: `[Heniten] New ${r.source.toUpperCase()} ${r.ref}`,
          text,
        }),
      })
    );
  }

  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    jobs.push(
      fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text,
        }),
      })
    );
  }

  await Promise.allSettled(jobs);
}

export async function POST(req) {
  let b;
  try {
    b = await req.json();
  } catch {
    return bad('Bad request');
  }

  // Honeypot check for bots
  if (b.hp) return NextResponse.json({ ref: 'HN-000000' });

  const f = b.fields || {};
  if (JSON.stringify(f).length > 8000) return bad('Message too long', 413);

  const pick = re => Object.entries(f).find(([k]) => re.test(k))?.[1] ?? null;
  const name = pick(/full.?name|contact.?name|client.?name|^name$/i) ?? pick(/name/i);
  const phone = pick(/phone|tel/i);
  const email = pick(/e-?mail/i);

  if (!name || !(phone || email)) {
    return bad('Please provide your name and a phone number or email.');
  }

  const rawIp = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  const ip = createHash('sha256').update(rawIp).digest('hex').slice(0, 24);

  try {
    // Rate limit check: max 5 requests per hour per IP
    const rateCheck = await sql`
      SELECT count(*)::int as count
      FROM inquiries
      WHERE ip = ${ip}
        AND created_at >= NOW() - INTERVAL '1 hour'
    `;

    const count = rateCheck[0]?.count || 0;
    if (count >= 5) {
      return bad('Too many requests. Please try again later or call +251 966 118 312.', 429);
    }

    const ref = 'HN-' + Math.floor(100000 + Math.random() * 900000);
    const source = b.source === 'quotation' ? 'quotation' : 'contact';
    const payloadJson = JSON.stringify(f);

    const inserted = await sql`
      INSERT INTO inquiries (ref, source, name, phone, email, payload, ip, status)
      VALUES (${ref}, ${source}, ${name}, ${phone}, ${email}, ${payloadJson}::jsonb, ${ip}, 'new')
      RETURNING ref
    `;

    const row = { ref: inserted[0].ref, source, name, phone, email, payload: f };
    await notify(row);

    return NextResponse.json({ ref: row.ref });
  } catch (err) {
    console.error('Inquiry error:', err);
    return bad('Could not save your request. Please try again or call +251 966 118 312 directly.', 500);
  }
}

// GET inquiries for admin (with auth check)
export async function GET(req) {
  const { getAdminSession } = await import('@/lib/auth');
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rows = await sql`
      SELECT id, ref, source, name, phone, email, payload, status, created_at
      FROM inquiries
      ORDER BY created_at DESC
      LIMIT 200
    `;
    return NextResponse.json({ rows });
  } catch (err) {
    console.error('Error fetching inquiries:', err);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}

// PATCH inquiry status for admin
export async function PATCH(req) {
  const { getAdminSession } = await import('@/lib/auth');
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status } = await req.json();
    if (!id || !status) return bad('Missing id or status');

    await sql`
      UPDATE inquiries
      SET status = ${status}
      WHERE id = ${id}
    `;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error updating inquiry status:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
