'use client';

import { useState } from 'react';

type LookupResult = {
  contractAddress: string;
  assetPlatformId: string;
  networkId: string;
  generatedAt: string;
  coinGecko: {
    status: string; id: string | null; name: string | null; symbol: string | null;
    priceUsdResponse: unknown; sevenDayPricePoints: number | null;
  };
  geckoTerminal: { name: string | null; symbol: string | null; gtScore: number | null; isHoneypot: boolean | null } | null;
  pools: { name: string; liquidityUsd: number | null }[];
  warnings: string[];
  safetyNote: string;
};

export default function TokenLookup() {
  const [platform, setPlatform] = useState('ethereum');
  const [network, setNetwork] = useState('eth');
  const [address, setAddress] = useState('');
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function lookup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const params = new URLSearchParams({
        asset_platform_id: platform.trim(),
        network_id: network.trim(),
        contract_address: address.trim(),
      });
      const response = await fetch('/api/token-lookup?' + params.toString(), { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Token lookup failed.');
      setResult(data as LookupResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Token lookup failed.');
    } finally {
      setLoading(false);
    }
  }

  return <section className="panel">
    <h2>Token contract research</h2>
    <p className="muted">Look up public market and on-chain token metadata. This does not connect a wallet or submit transactions.</p>
    <form onSubmit={lookup}>
      <div className="address-form">
        <div style={{ flex: 1, minWidth: 150 }}>
          <label htmlFor="cg-platform">CoinGecko asset platform ID</label>
          <input id="cg-platform" className="address-input" value={platform} onChange={e => setPlatform(e.target.value)} required maxLength={80} />
        </div>
        <div style={{ flex: 1, minWidth: 150 }}>
          <label htmlFor="gt-network">GeckoTerminal network ID</label>
          <input id="gt-network" className="address-input" value={network} onChange={e => setNetwork(e.target.value)} required maxLength={80} />
        </div>
      </div>
      <label htmlFor="token-contract">Token contract address</label>
      <div className="address-form">
        <input id="token-contract" className="address-input" value={address} onChange={e => setAddress(e.target.value)} placeholder="0x..." autoComplete="off" spellCheck={false} required />
        <button className="primary-button" type="submit" disabled={loading}>{loading ? 'Looking up…' : 'Look up token'}</button>
      </div>
    </form>
    {error ? <div className="notice error" role="alert">{error}</div> : null}
    {result ? <div aria-live="polite">
      <p className="hint">Checked {new Date(result.generatedAt).toLocaleString()} · {result.contractAddress}</p>
      <div className="network-grid">
        <article className="network-card">
          <h3>CoinGecko</h3>
          <p><strong>Status:</strong> {result.coinGecko.status.replaceAll('_', ' ')}</p>
          <p><strong>Token:</strong> {result.coinGecko.name ?? 'Not confirmed'} {result.coinGecko.symbol ? '(' + result.coinGecko.symbol + ')' : ''}</p>
          <p><strong>Coin ID:</strong> {result.coinGecko.id ?? 'Unavailable'}</p>
          <p><strong>7-day price points:</strong> {result.coinGecko.sevenDayPricePoints ?? 'Unavailable'}</p>
          <details><summary>Raw price response</summary><pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{JSON.stringify(result.coinGecko.priceUsdResponse, null, 2) ?? 'Unavailable'}</pre></details>
        </article>
        <article className="network-card">
          <h3>GeckoTerminal</h3>
          <p><strong>Token:</strong> {result.geckoTerminal?.name ?? 'Unavailable'} {result.geckoTerminal?.symbol ? '(' + result.geckoTerminal.symbol + ')' : ''}</p>
          <p><strong>GT score:</strong> {result.geckoTerminal?.gtScore ?? 'Unavailable'}</p>
          <p><strong>Honeypot flag:</strong> {result.geckoTerminal?.isHoneypot == null ? 'Unavailable' : result.geckoTerminal.isHoneypot ? 'Flagged' : 'Not flagged'}</p>
        </article>
      </div>
      <h3>Top pools returned</h3>
      {result.pools.length ? <div className="table-wrap"><table><thead><tr><th>Pool</th><th>Reported reserve (USD)</th></tr></thead><tbody>
        {result.pools.map((pool, index) => <tr key={pool.name + index}><td>{pool.name}</td><td>{pool.liquidityUsd == null || !Number.isFinite(pool.liquidityUsd) ? 'Unavailable' : pool.liquidityUsd.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</td></tr>)}
      </tbody></table></div> : <p className="hint">No pool data returned.</p>}
      {result.warnings.map((warning, index) => <div className="notice" key={index}>{warning}</div>)}
      <p className="hint">{result.safetyNote}</p>
    </div> : null}
  </section>;
}
