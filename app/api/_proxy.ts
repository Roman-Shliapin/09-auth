import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE_URL = 'https://notehub-api.goit.study';

function isHttpRequest(req: NextRequest) {
  const proto = req.headers.get('x-forwarded-proto') ?? req.nextUrl.protocol.replace(':', '');
  return proto === 'http';
}

function rewriteSetCookieForProxy(req: NextRequest, setCookie: string) {
  // Remove Domain attribute so cookies are scoped to the current host (our Next.js app),
  // not to notehub-api.goit.study.
  let rewritten = setCookie.replace(/;\s*Domain=[^;]+/gi, '');

  // Local dev is usually http://localhost:3000; Secure cookies won't be set over HTTP.
  // If backend uses SameSite=None; Secure, rewrite to Lax for HTTP.
  if (isHttpRequest(req)) {
    rewritten = rewritten.replace(/;\s*Secure/gi, '');
    rewritten = rewritten.replace(/;\s*SameSite=None/gi, '; SameSite=Lax');
  }

  return rewritten;
}

export function appendUpstreamSetCookies(req: NextRequest, nextRes: NextResponse, upstream: Response) {
  const getSetCookie = (upstream.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie;
  const cookies = typeof getSetCookie === 'function' ? getSetCookie.call(upstream.headers) : [];

  if (cookies.length > 0) {
    for (const cookie of cookies) {
      nextRes.headers.append('set-cookie', rewriteSetCookieForProxy(req, cookie));
    }
    return;
  }

  const single = upstream.headers.get('set-cookie');
  if (single) {
    nextRes.headers.append('set-cookie', rewriteSetCookieForProxy(req, single));
  }
}

export async function proxyToBackend(req: NextRequest, backendPathWithQuery: string) {
  const url = `${BACKEND_BASE_URL}${backendPathWithQuery}`;

  const cookie = req.headers.get('cookie') ?? '';
  const contentType = req.headers.get('content-type') ?? 'application/json';

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': contentType,
  };

  if (cookie) {
    headers.cookie = cookie;
  }

  const method = req.method.toUpperCase();
  const body = method === 'GET' || method === 'HEAD' ? undefined : await req.text();

  const upstream = await fetch(url, {
    method,
    headers,
    body,
    redirect: 'manual',
  });

  const upstreamContentType = upstream.headers.get('content-type') ?? '';
  const isJson = upstreamContentType.includes('application/json');

  if (upstream.status === 204) {
    const res = new NextResponse(null, { status: upstream.status });
    appendUpstreamSetCookies(req, res, upstream);
    return res;
  }

  const payload = await upstream.text();
  const res = new NextResponse(payload || null, {
    status: upstream.status,
    headers: {
      'content-type': isJson ? 'application/json' : upstreamContentType || 'text/plain',
    },
  });

  appendUpstreamSetCookies(req, res, upstream);
  return res;
}

export function extractCookieValue(setCookieHeader: string, cookieName: string) {
  // Matches: "accessToken=...; Path=/; HttpOnly"
  const match = setCookieHeader.match(new RegExp(`(?:^|,\\s*)${cookieName}=([^;]+)`));
  return match?.[1];
}


