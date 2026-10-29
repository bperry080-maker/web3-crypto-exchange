import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const IDENTIFIER = /^[a-z0-9_-]{1,80}$/i;
const ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const COINGECKO_PRO = 'https://pro-api.coingecko.com/api/v3';
const COINGECKO_PUBLIC = 'https://api.coingecko.com/api/v3';
const GECKOTERMINAL = 'https://api.geckoterminal.com/api/v2';

async function getJson(url: string, headers: HeadersInit = {}) {
  const response = await fetch(url, {
    method: 'GET',
    headers,
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Upstream returned HTTP ${response.status}`);
  return response.json();
}

export async function GET(request: NextRequest) {
  const assetPlatformId = request.nextUrl.searchParams.get('asset_platform_id') ?? '';
  const networkId = request.nextUrl.searchParams.get('network_id') ?? '';
  const address = request.nextUrl.searchParams.get('contract_address') ?? '';

  if (!IDENTIFIER.test(assetPlatformId) || !IDENTIFIER.test(networkId) || !ADDRESS.test(address)) {
    return NextResponse.json(
      { error: 'Provide valid asset platform ID, GeckoTerminal network ID, and EVM contract address.' },
      { status: 400 },
    );
  }

  const proKey = process.env.COINGECKO_PRO_API_KEY;
  const demoKey = process.env.COINGECKO_DEMO_API_KEY;
  const coinGeckoBase = proKey ? COINGECKO_PRO : COINGECKO_PUBLIC;
  const apiKey = proKey ?? demoKey;
  const cgHeaders: HeadersInit = proKey
    ? { 'x-cg-pro-api-key': proKey, accept: 'application/json' }
    : demoKey
      ? { 'x-cg-demo-api-key': demoKey, accept: 'application/json' }
      : { accept: 'application/json' };
  let listed: any = null;
  let coinGeckoStatus = 'not_checked';
  let price: unknown = null;
  let historyPoints: number | null = null;
  let onchainInfo: unknown = null;
  let pools: Array<{ name: string; liquidityUsd: number | null }> = [];
  const warnings: string[] = [];

  if (apiKey || !proKey) {
    try {
      listed = await getJson(`${coinGeckoBase}/coins/${encodeURIComponent(assetPlatformId)}/contract/${encodeURIComponent(address)}`, cgHeaders);
      coinGeckoStatus = 'listed';
      try {
        price = await getJson(
          `${coinGeckoBase}/simple/token_price/${encodeURIComponent(assetPlatformId)}?contract_addresses=${encodeURIComponent(address)}&vs_currencies=usd&include_market_cap=true`,
          cgHeaders,
        );
      } catch {
        warnings.push('CoinGecko price lookup failed; price is unavailable.');
      }
      try {
        const history = await getJson(
          `${coinGeckoBase}/coins/${encodeURIComponent(assetPlatformId)}/contract/${encodeURIComponent(address)}/market_chart?vs_currency=usd&days=7`,
          cgHeaders,
        );
        historyPoints = Array.isArray(history?.prices) ? history.prices.length : 0;
      } catch {
        warnings.push('Seven-day CoinGecko price history is unavailable.');
      }
    } catch {
      coinGeckoStatus = 'not_listed_or_unavailable';
      warnings.push('CoinGecko could not confirm a curated listing. This can also mean an API, network, or rate-limit error.');
    }
  } else {
    coinGeckoStatus = 'api_key_missing';
    warnings.push('Set COINGECKO_PRO_API_KEY or COINGECKO_DEMO_API_KEY in server-side environment variables for authenticated CoinGecko lookups.');
  }

  try {
    onchainInfo = await getJson(
      `${GECKOTERMINAL}/networks/${encodeURIComponent(networkId)}/tokens/${encodeURIComponent(address)}/info`,
      { accept: 'application/json' },
    );
  } catch {
    warnings.push('GeckoTerminal token info could not be retrieved for this network and contract.');
  }

  try {
    const poolData = await getJson(
      `${GECKOTERMINAL}/networks/${encodeURIComponent(networkId)}/tokens/${encodeURIComponent(address)}/pools?page=1`,
      { accept: 'application/json' },
    );
    pools = (Array.isArray(poolData?.data) ? poolData.data : []).slice(0, 3).map((pool: any) => ({
      name: String(pool?.attributes?.name ?? 'Unnamed pool'),
      liquidityUsd: pool?.attributes?.reserve_in_usd == null ? null : Number(pool.attributes.reserve_in_usd),
    }));
  } catch {
    warnings.push('GeckoTerminal pool/liquidity data could not be retrieved.');
  }

  const attributes = (onchainInfo as any)?.data?.attributes ?? null;
  return NextResponse.json({
    contractAddress: address,
    assetPlatformId,
    networkId,
    generatedAt: new Date().toISOString(),
    coinGecko: {
      status: coinGeckoStatus,
      id: listed?.id ?? null,
      name: listed?.name ?? null,
      symbol: listed?.symbol ?? null,
      imageUrl: listed?.image?.small ?? listed?.image?.thumb ?? null,
      description: typeof listed?.description?.en === 'string' ? listed.description.en.replace(/<[^>]*>/g, '').slice(0, 1200) : null,
      websites: Array.isArray(listed?.links?.homepage) ? listed.links.homepage.filter((value: unknown) => typeof value === 'string' && value.startsWith('https://')).slice(0, 5) : [],
      twitterHandle: typeof listed?.links?.twitter_screen_name === 'string' ? listed.links.twitter_screen_name : null,
      categories: Array.isArray(listed?.categories) ? listed.categories.slice(0, 8) : [],
      priceUsdResponse: price,
      sevenDayPricePoints: historyPoints,
    },
    geckoTerminal: attributes ? {
      name: attributes.name ?? null,
      symbol: attributes.symbol ?? null,
      gtScore: attributes.gt_score ?? null,
      isHoneypot: attributes.is_honeypot ?? null,
    } : null,
    pools,
    warnings,
    safetyNote: 'Read-only market-data lookup. Scores and honeypot flags are signals, not safety guarantees. Missing data is not proof that a token is safe or listed.',
  }, { headers: { 'Cache-Control': 'no-store' } });
}
