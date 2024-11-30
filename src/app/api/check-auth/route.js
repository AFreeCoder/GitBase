import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export const runtime = 'edge'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.isLoggedIn === true;
  } catch {
    return false;
  }
}

export async function GET(request) {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;
  const isLoggedIn = token ? await verifyToken(token) : false;

  return NextResponse.json({ isLoggedIn });
}