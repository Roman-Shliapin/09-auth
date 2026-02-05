import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '../../_proxy';

export async function POST(req: NextRequest) {
  let upstream: NextResponse | null = null;
  try {
    upstream = await proxyToBackend(req, '/auth/logout');
  } catch {
  }

  const res = upstream ?? new NextResponse(null, { status: 200 });

  res.headers.append('set-cookie', 'accessToken=; Path=/; Max-Age=0');
  res.headers.append('set-cookie', 'refreshToken=; Path=/; Max-Age=0');

  return res;
}


