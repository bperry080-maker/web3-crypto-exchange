import { NextResponse } from 'next/server';
import { bnbSmartChain } from '@/lib/bnb-chain';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const rpcUrl = process.env.BNB_RPC_URL;

  if (!rpcUrl) {
    return NextResponse.json(
      {
        configured: false,
        verified: false,
        network: bnbSmartChain.name,
        expectedChainId: bnbSmartChain.id,
        message: 'Set BNB_RPC_URL as a server-side environment variable to verify BNB Smart Chain access.',
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_chainId',
        params: [],
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { configured: true, verified: false, message: 'The configured RPC endpoint returned an HTTP error.' },
        { status: 502, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    const payload: unknown = await response.json();
    const result =
      payload && typeof payload === 'object' && 'result' in payload
        ? (payload as { result?: unknown }).result
        : undefined;

    const verified = typeof result === 'string' && result.toLowerCase() === bnbSmartChain.idHex;

    return NextResponse.json(
      {
        configured: true,
        verified,
        network: verified ? bnbSmartChain.name : 'Unknown or mismatched network',
        expectedChainId: bnbSmartChain.id,
        observedChainId: typeof result === 'string' ? result : null,
        explorer: bnbSmartChain.blockExplorerUrl,
        message: verified
          ? 'Read-only RPC check passed. No wallet was connected and no transaction was submitted.'
          : 'RPC endpoint did not report BNB Smart Chain Mainnet (chain ID 56).',
      },
      { status: verified ? 200 : 502, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return NextResponse.json(
      { configured: true, verified: false, message: 'Unable to reach the configured RPC endpoint.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
