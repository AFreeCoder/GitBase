import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

export const runtime = 'edge'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

async function createToken() {
  const token = await new SignJWT({ 
    isLoggedIn: true 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);
  
  return token;
}

export async function POST(request) {
  const { password } = await request.json();
  
  if (password === process.env.ACCESS_PASSWORD) {
    const token = await createToken();
    
    const response = NextResponse.json({ message: 'Login successful' }, { status: 200 });

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600, // 1 hour
      path: '/',
    });

    return response;
  } else {
    return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
  }
}