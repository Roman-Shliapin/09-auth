import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkSession } from './lib/api/serverApi';

function isPrivateRoute(pathname: string) {
  return pathname.startsWith('/profile') || pathname.startsWith('/notes');
}

function isAuthRoute(pathname: string) {
  return pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');
}

function appendSetCookies(res: NextResponse, setCookie: string[]) {
  for (const value of setCookie) {
    res.headers.append('set-cookie', value);
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  let authed = Boolean(accessToken);
  let refreshedSetCookie: string[] = [];

  if (!authed && refreshToken) {
    const sessionRes = await checkSession();
    authed = Boolean(sessionRes.data?.success);

    const raw = sessionRes.headers?.['set-cookie'];
    refreshedSetCookie = Array.isArray(raw) ? raw : raw ? [String(raw)] : [];
  }

  if (!authed && isPrivateRoute(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = '/sign-in';
    url.search = '';
    const res = NextResponse.redirect(url);
    appendSetCookies(res, refreshedSetCookie);
    return res;
  }

  if (authed && isAuthRoute(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    const res = NextResponse.redirect(url);
    appendSetCookies(res, refreshedSetCookie);
    return res;
  }

  const res = NextResponse.next();
  appendSetCookies(res, refreshedSetCookie);
  return res;
}


