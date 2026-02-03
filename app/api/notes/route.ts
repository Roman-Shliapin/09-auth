import { NextRequest } from 'next/server';
import { proxyToBackend } from '../_proxy';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.search ? req.nextUrl.search : '';
  return proxyToBackend(req, `/notes${query}`);
}

export async function POST(req: NextRequest) {
  return proxyToBackend(req, '/notes');
}


