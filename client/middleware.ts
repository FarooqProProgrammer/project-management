import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token');

  if (!token) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }

  // Optionally, you can add token verification here

  console.log('Token:', token);
  return NextResponse.next();
}
