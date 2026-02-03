import { NextRequest } from 'next/server';
import { proxyToBackend } from '../../_proxy';

export async function POST(req: NextRequest) {
  return proxyToBackend(req, '/auth/register');
}


