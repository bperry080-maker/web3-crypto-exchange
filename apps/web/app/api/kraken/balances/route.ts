import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const API_PATH = '/0/private/Balance';
let lastNonce = 0;

function nextNonce() {
  // Keep nonces increasing within a warm Node process, including same-millisecond requests.
  lastNonce = Math.max(Date.now(), lastNonce + 1);
  return String(lastNonce);
}

function isAuthorized(request: NextRequest) {
  const expected = process.env.KRAKEN_BALANCE_ACCESS_TOKEN;
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!expected || !supplied) return false;
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized. Enter the dashboard access token configured by the site owner.' }, { status: 401 });
  }

  const apiKey = process.env.KRAKEN_API_KEY;
  const apiSecret = process.env.KRAKEN_API_SECRET;
  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Kraken server credentials are not configured.' }, { status: 503 });
  }

  try {
    const nonce = nextNonce();
    const body = new URLSearchParams({ nonce }).toString();
    const sha256 = createHash('sha256').update(nonce + body).digest();
    const signature = createHmac('sha512', Buffer.from(apiSecret, 'base64'))
      .update(Buffer.concat([Buffer.from(API_PATH), sha256]))
      .digest('base64');

    const response = await fetch('https://api.kraken.com' + API_PATH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'API-Key': apiKey,
        'API-Sign': signature,
      },
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Kraken API returned an HTTP error. Check service status and API key settings.' }, { status: 502 });
    }

    const payload = await response.json() as {
      error?: string[];
      result?: Record<string, string>;
    };

    if (payload.error?.length) {
      // Do not echo provider details that could expose account or credential configuration.
      return NextResponse.json({ error: 'Kraken rejected the balance request. Verify the key has Query Funds permission and is active.' }, { status: 502 });
    }

    if (!payload.result || typeof payload.result !== 'object') {
      return NextResponse.json({ error: 'Kraken returned an unexpected balance response.' }, { status: 502 });
    }

    return NextResponse.json({
      source: 'Kraken private Balance endpoint',
      retrievedAt: new Date().toISOString(),
      balances: payload.result,
      note: 'Read-only exchange balances. Amounts are reported by Kraken and may include held or reserved funds; this endpoint does not place orders or move funds.',
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Could not reach Kraken. Try again later.' }, { status: 502 });
  }
}
