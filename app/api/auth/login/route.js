import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const admins = await sql`
      SELECT id, email, password_hash, name
      FROM admins
      WHERE lower(email) = lower(${email.trim()})
      LIMIT 1
    `;

    if (!admins.length) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const admin = admins[0];
    const isMatch = comparePassword(password, admin.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = await signToken({
      id: admin.id,
      email: admin.email,
      name: admin.name,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: admin.id, email: admin.email, name: admin.name },
    });

    response.cookies.set('heniten_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Server authentication error' }, { status: 500 });
  }
}
