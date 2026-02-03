import { NextRequest, NextResponse } from 'next/server';
import { appendUpstreamSetCookies, extractCookieValue } from '../../_proxy';

const BACKEND_BASE_URL = 'https://notehub-api.goit.study';

export async function GET(req: NextRequest) {
  // Homework contract expects:
  // - 200 + user object if authorized (or can be refreshed)
  // - 200 with empty body if not authorized
  //
  // Backend contract:
  // - GET /auth/session uses refreshToken cookie and sets a new accessToken cookie
  // - GET /users/me requires accessToken cookie

  const cookieHeader = req.headers.get('cookie') ?? '';

  // 1) Try refresh session
  const sessionRes = await fetch(`${BACKEND_BASE_URL}/auth/session`, {
    method: 'GET',
    headers: {
      cookie: cookieHeader,
      Accept: 'application/json',
    },
    redirect: 'manual',
  });

  if (!sessionRes.ok) {
    // Not authorized (no refresh token / invalid token)
    return new NextResponse(null, { status: 200 });
  }

  // 2) Build cookie header for /users/me with the refreshed accessToken (if provided)
  const getSetCookie = (sessionRes.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie;
  const setCookies = typeof getSetCookie === 'function' ? getSetCookie.call(sessionRes.headers) : [];
  const rawSetCookie = setCookies.join(', ');
  const nextAccessToken = extractCookieValue(rawSetCookie, 'accessToken');

  const cookieForMe =
    nextAccessToken && cookieHeader.includes('accessToken=')
      ? cookieHeader.replace(/accessToken=[^;]*/i, `accessToken=${nextAccessToken}`)
      : nextAccessToken
        ? `${cookieHeader}${cookieHeader ? '; ' : ''}accessToken=${nextAccessToken}`
        : cookieHeader;

  // 3) Fetch user
  const meRes = await fetch(`${BACKEND_BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      cookie: cookieForMe,
      Accept: 'application/json',
    },
    redirect: 'manual',
  });

  if (!meRes.ok) {
    return new NextResponse(null, { status: 200 });
  }

  // 4) Return user JSON and forward refreshed Set-Cookie from the refresh step
  const userJson = await meRes.text();
  const res = new NextResponse(userJson || null, {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });

  appendUpstreamSetCookies(req, res, sessionRes);
  return res;
}


