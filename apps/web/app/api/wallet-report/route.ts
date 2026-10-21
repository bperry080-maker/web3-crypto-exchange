import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const NETWORKS = [
  { name: 'Ethereum Mainnet', chainId: 1, rpcEnv: 'ETHEREUM_RPC_URL', tokenEnv: 'ETHEREUM_TOKENS', symbol: 'ETH' },
  { name: 'Base Mainnet', chainId: 8453, rpcEnv: 'BASE_RPC_URL', tokenEnv: 'BASE_TOKENS', symbol: 'ETH' },
  { name: 'BNB Smart Chain', chainId: 56, rpcEnv: 'BNB_RPC_URL', tokenEnv: 'BNB_TOKENS', symbol: 'BNB' },
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

function formatUnits(raw: bigint, decimals: number) {
  const base = 10n ** BigInt(decimals);
  const whole = raw / base;
  const fraction = (raw % base).toString().padStart(decimals, '0').slice(0, 8).replace(/0+$/, '');
  return fraction ? whole.toString() + '.' + fraction : whole.toString();
}

function configuredTokens(value: string | undefined) {
  return (value ?? '').split(',').map((item) => {
    const [address, symbol, decimalsText] = item.trim().split(':');
    const decimals = Number(decimalsText);
    if (!ADDRESS.test(address ?? '') || !/^[A-Z0-9]{2,12}$/.test(symbol ?? '') || !Number.isInteger(decimals) || decimals < 0 || decimals > 36) return null;
    return { address, symbol, decimals };
  }).filter((token): token is { address: string; symbol: string; decimals: number } => token !== null).slice(0, 20);
}

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address') ?? '';
  if (!ADDRESS.test(address)) {
    return NextResponse.json({ error: 'Enter a valid EVM public wallet address (0x followed by 40 hex characters).' }, { status: 400 });
  }

  const results = await Promise.all(NETWORKS.map(async (network) => {
    const url = process.env[network.rpcEnv];
    if (!url) return { network: network.name, chainId: network.chainId, symbol: network.symbol, status: 'not_configured', balance: null, message: 'RPC endpoint is not configured on the server.', tokens: [] };
    try {
      const chainId = Number(BigInt(await rpc(url, 'eth_chainId', [])));
      if (chainId !== network.chainId) return { network: network.name, chainId: network.chainId, symbol: network.symbol, status: 'wrong_network', balance: null, message: 'Configured RPC returned a different chain ID.', tokens: [] };

      const raw = BigInt(await rpc(url, 'eth_getBalance', [address, 'latest']));
      const tokenList = configuredTokens(process.env[network.tokenEnv]);
      const tokens = await Promise.all(tokenList.map(async (token) => {
        try {
          const callData = '0x70a08231' + address.slice(2).toLowerCase().padStart(64, '0');
          const result = await rpc(url, 'eth_call', [{ to: token.address, data: callData }, 'latest']);
          return { address: token.address, symbol: token.symbol, balance: formatUnits(BigInt(result), token.decimals), status: 'verified' as const };
        } catch {
          return { address: token.address, symbol: token.symbol, balance: null, status: 'error' as const };
        }
      }));
      return { network: network.name, chainId: network.chainId, symbol: network.symbol, status: 'verified', balance: formatUnits(raw, 18), message: 'Native coin quantity returned by the configured RPC endpoint.', tokens };
    } catch {
      return { network: network.name, chainId: network.chainId, symbol: network.symbol, status: 'error', balance: null, message: 'Could not retrieve a verified balance. Check endpoint availability and limits.', tokens: [] };
    }
  }));

  return NextResponse.json({
    address,
    generatedAt: new Date().toISOString(),
    scope: 'native coin balances and server-allowlisted ERC-20 tokens',
    results,
    valuation: 'USD valuations are not included in this MVP. Token balances are queried only for contract addresses configured on the server.',
  }, { headers: { 'Cache-Control': 'no-store' } });
}