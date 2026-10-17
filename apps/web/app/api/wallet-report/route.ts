import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const NETWORKS = [
  { id: 'ethereum', name: 'Ethereum Mainnet', chainId: 1, env: 'ETHEREUM_RPC_URL', symbol: 'ETH', decimals: 18 },
  { id: 'base', name: 'Base Mainnet', chainId: 8453, env: 'BASE_RPC_URL', symbol: 'ETH', decimals: 18 },
  { id: 'bnb', name: 'BNB Smart Chain', chainId: 56, env: 'BNB_RPC_URL', symbol: 'BNB', decimals: 18 },
] as const;

async function rpc(url: string, method: string, params: unknown[]) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error('RPC provider returned an HTTP error');
  const payload = await response.json();
  if (payload.error || payload.result === undefined) throw new Error('RPC request failed');
  return payload.result as string;
}

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address') ?? '';
  if (!ADDRESS.test(address)) {
    return NextResponse.json({ error: 'Enter a valid EVM public wallet address (0x followed by 40 hex characters).' }, { status: 400 });
  }

  const results = await Promise.all(NETWORKS.map(async (network) => {
    const url = process.env[network.env];
    if (!url) {
      return { network: network.name, chainId: network.chainId, symbol: network.symbol, status: 'not_configured', balance: null, message: 'RPC endpoint is not configured on the server.' };
    }
    try {
      const chainId = Number(BigInt(await rpc(url, 'eth_chainId', [])));
      if (chainId !== network.chainId) {
        return { network: network.name, chainId: network.chainId, symbol: network.symbol, status: 'wrong_network', balance: null, message: 'Configured RPC returned a different chain ID.' };
      }
      const raw = BigInt(await rpc(url, 'eth_getBalance', [address, 'latest']));
      const whole = raw / (10n ** BigInt(network.decimals));
      const fraction = raw % (10n ** BigInt(network.decimals));
      const fractionText = fraction.toString().padStart(network.decimals, '0').slice(0, 8).replace(/0+$/, '');
      const balance = fractionText ? whole.toString() + '.' + fractionText : whole.toString();
      return { network: network.name, chainId: network.chainId, symbol: network.symbol, status: 'verified', balance, message: 'Native coin quantity returned by the configured RPC endpoint.' };
    } catch {
      return { network: network.name, chainId: network.chainId, symbol: network.symbol, status: 'error', balance: null, message: 'Could not retrieve a verified balance. Check endpoint availability and limits.' };
    }
  }));

  return NextResponse.json({
    address,
    generatedAt: new Date().toISOString(),
    scope: 'native coin balances only',
    results,
    valuation: 'USD valuations and ERC-20 token balances are not included in this MVP.',
  }, { headers: { 'Cache-Control': 'no-store' } });
}