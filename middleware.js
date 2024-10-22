import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;

  console.log('Middleware running on path:', path);

  if (path === '/dashboard') {
    const sessionToken = request.cookies.get('session_token')?.value;
    console.log('Session token:', sessionToken);

    if (!sessionToken) {
      console.log('No session token found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
    console.log('Session token found, allowing access to dashboard');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard'],
};