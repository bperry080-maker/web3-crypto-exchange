import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const ALLOWED_NETWORKS = new Set([
  'eth', 'base', 'bsc', 'polygon_pos', 'arbitrum', 'optimism', 'avax', 'linea',
]);

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address')?.trim() ?? '';
  if (!ADDRESS.test(address)) {
    return NextResponse.json(
      { error: 'Provide a valid public EVM address (0x followed by 40 hexadecimal characters).' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const apiKey = process.env.COINGECKO_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'CoinGecko lookup is not configured. Add COINGECKO_API_KEY to server environment variables.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const requested = request.nextUrl.searchParams.get('networks') ?? 'eth,base,bsc';
  const networks = [...new Set(requested.split(',').map((item) => item.trim()).filter(Boolean))];
  if (!networks.length || networks.length > ALLOWED_NETWORKS.size || networks.some((network) => !ALLOWED_NETWORKS.has(network))) {
    return NextResponse.json(
      { error: 'Unsupported network. Allowed network IDs: ' + [...ALLOWED_NETWORKS].join(', ') },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const pageText = request.nextUrl.searchParams.get('page') ?? '1';
  const perPageText = request.nextUrl.searchParams.get('per_page') ?? '50';
  const page = Number(pageText);
  const perPage = Number(perPageText);
  if (!/^\d+$/.test(pageText) || !Number.isSafeInteger(page) || page < 1 ||
      !/^\d+$/.test(perPageText) || !Number.isSafeInteger(perPage) || perPage < 1 || perPage > 100) {
    return NextResponse.json(
      { error: 'page must be a positive integer; per_page must be between 1 and 100.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const url = new URL(`https://pro-api.coingecko.com/api/v3/onchain/wallets/${encodeURIComponent(address)}/balances`);
  url.searchParams.set('networks', networks.join(','));
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', String(perPage));

  try {
    const upstream = await fetch(url, {
      method: 'GET',
      headers: { 'x-cg-pro-api-key': apiKey, accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });

    if (!upstream.ok) {
      const status = upstream.status === 429 ? 429 : upstream.status === 401 || upstream.status === 403 ? 502 : 502;
      const message = upstream.status === 429
        ? 'CoinGecko rate limit reached. Please try again later.'
        : upstream.status === 401 || upstream.status === 403
          ? 'CoinGecko rejected the server API key or the current API plan does not allow this endpoint.'
          : `CoinGecko wallet lookup failed (HTTP ${upstream.status}).`;
      return NextResponse.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } });
    }

    const payload = await upstream.json();
    if (!payload?.data?.attributes || !Array.isArray(payload.data.attributes.balances)) {
      return NextResponse.json(
        { error: 'CoinGecko returned an unexpected wallet-balance response.' },
        { status: 502, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    return NextResponse.json({
      source: 'CoinGecko Onchain Wallet Balances',
      readOnly: true,
      requestedNetworks: networks,
      data: payload.data,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
    return NextResponse.json(
      { error: timedOut ? 'CoinGecko request timed out. Please try again.' : 'Unable to reach CoinGecko right now.' },
      { status: timedOut ? 504 : 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
