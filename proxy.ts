import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

function isPrivateRoute(pathname: string) {
  return pathname.startsWith('/profile') || pathname.startsWith('/notes');
}

function isAuthRoute(pathname: string) {
  return pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');
}

function isProbablyAuthenticated(req: NextRequest) {
  // Backend uses cookies: accessToken + refreshToken
  return Boolean(req.cookies.get('accessToken')?.value || req.cookies.get('refreshToken')?.value);
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignore Next internals and API routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  const authed = isProbablyAuthenticated(req);

  if (!authed && isPrivateRoute(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = '/sign-in';
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (authed && isAuthRoute(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = '/profile';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}


