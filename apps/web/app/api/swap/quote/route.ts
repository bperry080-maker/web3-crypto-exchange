import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const AMOUNT = /^[1-9][0-9]*$/;

export async function POST(request: NextRequest) {
  const key = process.env.UNISWAP_API_KEY;
  const allowed = (process.env.SWAP_ALLOWED_TOKENS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter((value) => ADDRESS.test(value));

  if (!key) return NextResponse.json({ error: 'Quote service is not configured.' }, { status: 503 });
  if (allowed.length < 2) return NextResponse.json({ error: 'Server token allowlist is not configured.' }, { status: 503 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  const input = body as Record<string, unknown>;

  const tokenIn = typeof input.tokenIn === 'string' ? input.tokenIn.toLowerCase() : '';
  const tokenOut = typeof input.tokenOut === 'string' ? input.tokenOut.toLowerCase() : '';
  const amount = typeof input.amount === 'string' ? input.amount : '';
  const wallet = typeof input.swapper === 'string' ? input.swapper : '';

  if (!ADDRESS.test(tokenIn) || !ADDRESS.test(tokenOut) || tokenIn === tokenOut) {
    return NextResponse.json({ error: 'Choose two different valid token addresses.' }, { status: 400 });
  }
  if (!allowed.includes(tokenIn) || !allowed.includes(tokenOut)) {
    return NextResponse.json({ error: 'Token is not approved by this deployment.' }, { status: 400 });
  }
  if (!AMOUNT.test(amount) || amount.length > 78 || !ADDRESS.test(wallet)) {
    return NextResponse.json({ error: 'Invalid amount or wallet address.' }, { status: 400 });
  }

  try {
    const response = await fetch('https://trade-api.gateway.uniswap.org/v1/quote', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        'x-api-key': key,
        'x-universal-router-version': '2.1.2',
      },
      body: JSON.stringify({
        type: 'EXACT_INPUT',
        amount,
        tokenInChainId: 1,
        tokenOutChainId: 1,
        tokenIn,
        tokenOut,
        swapper: wallet,
        slippageTolerance: 0.5,
        protocols: ['V2', 'V3', 'V4'],
      }),
      cache: 'no-store',
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json(
        { error: response.status === 429 ? 'Quote service is busy; retry shortly.' : 'No quote available for these inputs.' },
        { status: response.status === 429 ? 429 : 422 },
      );
    }

    return NextResponse.json({
      chainId: 1,
      requestId: result?.requestId ?? null,
      routing: result?.routing ?? null,
      quote: {
        input: result?.quote?.input ?? null,
        output: result?.quote?.output ?? null,
        gasEstimateUsd: result?.quote?.classicGasUseEstimateUSD ?? null,
        slippageTolerance: result?.quote?.slippageTolerance ?? 0.5,
      },
      executionEnabled: false,
      message: 'Preview only. No transaction has been submitted.',
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Quote provider is unreachable.' }, { status: 502 });
  }
}
