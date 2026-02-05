import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_BASE_URL } from '../../api';
import { appendUpstreamSetCookies, extractCookieValue } from '../../_proxy';

export async function GET(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') ?? '';

  const meRes = await fetch(`${BACKEND_BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      cookie: cookieHeader,
      Accept: 'application/json',
    },
    redirect: 'manual',
  });

  if (meRes.ok) {
    const userJson = await meRes.text();
    return new NextResponse(userJson || null, {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  const sessionRes = await fetch(`${BACKEND_BASE_URL}/auth/session`, {
    method: 'GET',
    headers: {
      cookie: cookieHeader,
      Accept: 'application/json',
    },
    redirect: 'manual',
  });

  if (!sessionRes.ok) {
    return new NextResponse(null, { status: 200 });
  }

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

  const refreshedMeRes = await fetch(`${BACKEND_BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      cookie: cookieForMe,
      Accept: 'application/json',
    },
    redirect: 'manual',
  });

  if (!refreshedMeRes.ok) {
    return new NextResponse(null, { status: 200 });
  }

  const userJson = await refreshedMeRes.text();
  const res = new NextResponse(userJson || null, {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });

  appendUpstreamSetCookies(req, res, sessionRes);
  return res;
}


