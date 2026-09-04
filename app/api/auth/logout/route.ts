import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('qv_2fa_verified', '', { ...cookieOptions, maxAge: 0 });
  response.cookies.set('qv_2fa_pending', '', { ...cookieOptions, maxAge: 0 });
  return response;
}