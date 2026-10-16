import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'heniten-super-secure-jwt-key-2026-production'
);

export async function signToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch {
    return null;
  }
}

export function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compareSync(plainPassword, hashedPassword);
}

export function hashPassword(plainPassword) {
  return bcrypt.hashSync(plainPassword, 10);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('heniten_admin_token')?.value;
  if (!token) return null;
  return await verifyToken(token);
}
