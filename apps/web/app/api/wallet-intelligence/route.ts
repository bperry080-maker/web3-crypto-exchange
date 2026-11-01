import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const NETWORKS = ['eth', 'base', 'bsc'] as const;
type Network = typeof NETWORKS[number];

async function cgGet(path: string, apiKey: string) {
  const response = await fetch(`https://pro-api.coingecko.com/api/v3${path}`, {
    method: 'GET',
    headers: { accept: 'application/json', 'x-cg-pro-api-key': apiKey },
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof body?.error === 'string' ? body.error : `CoinGecko returned HTTP ${response.status}`;
    throw new Error(detail);
  }
  return body;
}

function dataRows(payload: any) {
  return Array.isArray(payload?.data) ? payload.data : [];
}

async function optionalCall<T>(label: string, work: () => Promise<T>, warnings: string[]) {
  try { return await work(); }
  catch (error) {
    warnings.push(`${label}: ${error instanceof Error ? error.message : 'request failed'}`);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const address = (request.nextUrl.searchParams.get('address') ?? '').trim();
  if (!ADDRESS.test(address)) {
    return NextResponse.json({ error: 'Enter a valid public EVM address (0x followed by 40 hexadecimal characters).' }, { status: 400 });
  }

  const apiKey = process.env.COINGECKO_PRO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      error: 'Wallet Intelligence requires a server-side CoinGecko Pro API key on the Analyst plan or higher. No wallet credentials are needed.',
      code: 'COINGECKO_WALLET_PLAN_REQUIRED',
    }, { status: 503 });
  }

  const warnings: string[] = [];
  const networks = NETWORKS.join(',');
  const balances = await optionalCall('Balances', () =>
    cgGet(`/onchain/wallets/${address}/balances?networks=${networks}`, apiKey), warnings);
  const pnl = await optionalCall('Profit and loss', () =>
    cgGet(`/onchain/wallets/${address}/pnl?networks=${networks}`, apiKey), warnings);

  const activity = await Promise.all(NETWORKS.map(async (network: Network) => {
    const [trades, transfers] = await Promise.all([
      optionalCall(`${network.toUpperCase()} trades`, () =>
        cgGet(`/onchain/networks/${network}/wallets/${address}/trades?per_page=50`, apiKey), warnings),
      optionalCall(`${network.toUpperCase()} transfers`, () =>
        cgGet(`/onchain/networks/${network}/wallets/${address}/transfers?per_page=50`, apiKey), warnings),
    ]);
    return { network, trades: dataRows(trades), transfers: dataRows(transfers) };
  }));

  if (!balances && !pnl && activity.every((item) => !item.trades.length && !item.transfers.length)) {
    return NextResponse.json({
      error: 'CoinGecko could not return wallet data. Check Analyst plan access, API key validity, and the supported network list.',
      warnings,
    }, { status: 502 });
  }

  return NextResponse.json({
    address,
    generatedAt: new Date().toISOString(),
    networks: [...NETWORKS],
    balances: balances?.data?.attributes ?? null,
    pnl: pnl?.data?.attributes ?? null,
    activity,
    warnings,
    limits: { tradesPerNetwork: 50, transfersPerNetwork: 50, activityWindow: 'CoinGecko endpoint default; request first page only' },
    safetyNote: 'Read-only public-address analytics. No wallet connection, signature, private key, transaction, or transfer is used. PnL and USD values are third-party estimates and may be incomplete.',
  }, { headers: { 'Cache-Control': 'no-store' } });
}
