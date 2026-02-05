import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

function isPrivateRoute(pathname: string) {
  return pathname.startsWith('/profile') || pathname.startsWith('/notes');
}

function isAuthRoute(pathname: string) {
  return pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');
}

function isProbablyAuthenticated(req: NextRequest) {
  return Boolean(req.cookies.get('accessToken')?.value);
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

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


