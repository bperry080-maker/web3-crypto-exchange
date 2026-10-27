'use client';

import { useState } from 'react';

type TokenResult = { address: string; symbol: string; balance: string | null; status: 'verified' | 'error' };
type NetworkResult = {
  network: string; chainId: number; symbol: string;
  status: 'verified' | 'not_configured' | 'wrong_network' | 'error';
  balance: string | null; message: string; tokens: TokenResult[];
};
type Report = { address: string; generatedAt: string; scope: string; results: NetworkResult[]; valuation: string };
type CoinGeckoBalance = {
  network: string; address: string; token_type: string; name: string; symbol: string;
  decimals: number; coingecko_coin_id: string | null; balance_raw: string;
  balance: string | null; price_usd: string | null; value_usd: string | null;
  h24_price_change_percentage: string | null; total_reserve_in_usd: string | null;
};
type CoinGeckoNetwork = { network: string; value_usd: string; holdings: number; last_updated_at: string };
type CoinGeckoReport = {
  source: string; readOnly: boolean; requestedNetworks: string[];
  data: { id: string; attributes: {
    wallet_address: string; total_value_usd: string; total_holdings: number;
    networks: CoinGeckoNetwork[]; balances: CoinGeckoBalance[];
  }};
};
const ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const usd = (value: string | null | undefined) => {
  if (value == null || !Number.isFinite(Number(value))) return 'Unavailable';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(value));
};

export default function WalletMonitor() {
  const [address, setAddress] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [coinGeckoReport, setCoinGeckoReport] = useState<CoinGeckoReport | null>(null);
  const [error, setError] = useState('');
  const [coinGeckoError, setCoinGeckoError] = useState('');
  const [loading, setLoading] = useState(false);
  const [coinGeckoLoading, setCoinGeckoLoading] = useState(false);

  async function runReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setReport(null);
    if (!ADDRESS.test(address.trim())) { setError('Enter a valid public EVM address: 0x followed by 40 hexadecimal characters.'); return; }
    setLoading(true);
    try {
      const response = await fetch('/api/wallet-report?address=' + encodeURIComponent(address.trim()), { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not create report.');
      setReport(data as Report);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not create report.'); }
    finally { setLoading(false); }
  }

  async function runCoinGecko() {
    setCoinGeckoError(''); setCoinGeckoReport(null);
    if (!ADDRESS.test(address.trim())) { setCoinGeckoError('Enter a valid public EVM address first.'); return; }
    setCoinGeckoLoading(true);
    try {
      const params = new URLSearchParams({ address: address.trim(), networks: 'eth,base,bsc', per_page: '100', page: '1' });
      const response = await fetch('/api/wallet-balances?' + params.toString(), { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not retrieve CoinGecko balances.');
      setCoinGeckoReport(data as CoinGeckoReport);
    } catch (e) { setCoinGeckoError(e instanceof Error ? e.message : 'Could not retrieve CoinGecko balances.'); }
    finally { setCoinGeckoLoading(false); }
  }

  async function refreshAllFunds() {
    const wallet = address.trim();
    setError('');
    setCoinGeckoError('');
    setReport(null);
    setCoinGeckoReport(null);
    if (!ADDRESS.test(wallet)) {
      setError('Enter a valid public EVM address first.');
      setCoinGeckoError('Enter a valid public EVM address first.');
      return;
    }

    setLoading(true);
    setCoinGeckoLoading(true);
    const rpcTask = (async () => {
      try {
        const response = await fetch('/api/wallet-report?address=' + encodeURIComponent(wallet), { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not retrieve RPC balances.');
        setReport(data as Report);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not retrieve RPC balances.');
      } finally {
        setLoading(false);
      }
    })();
    const tokenTask = (async () => {
      try {
        const params = new URLSearchParams({ address: wallet, networks: 'eth,base,bsc', per_page: '100', page: '1' });
        const response = await fetch('/api/wallet-balances?' + params.toString(), { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not retrieve token balances.');
        setCoinGeckoReport(data as CoinGeckoReport);
      } catch (e) {
        setCoinGeckoError(e instanceof Error ? e.message : 'Could not retrieve token balances.');
      } finally {
        setCoinGeckoLoading(false);
      }
    })();
    await Promise.all([rpcTask, tokenTask]);
  }

  return <>
    <section className="panel">
      <h2>Create a public wallet report</h2>
      <p className="muted">Enter a public address. No wallet connection, signature, private key, or recovery phrase is needed.</p>
      <form onSubmit={runReport}>
        <label htmlFor="wallet-address">EVM public address</label>
        <div className="address-form">
          <input id="wallet-address" className="address-input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="0x..." autoComplete="off" spellCheck={false} />
          <button className="primary-button" disabled={loading} type="submit">{loading ? 'Checking…' : 'Generate RPC report'}</button>
        </div>
      </form>
      {error ? <div className="notice error" role="alert">{error}</div> : null}
      <p className="hint">Refresh both sources together for the latest available public-chain quantities and token-value estimates. No wallet connection or transaction is required.</p>
      <button className="primary-button" type="button" disabled={loading || coinGeckoLoading} onClick={refreshAllFunds}>
        {loading || coinGeckoLoading ? 'Refreshing live funds…' : 'Refresh all live funds'}
      </button>
      <div className="actions">
      <button className="secondary-button" type="button" disabled={coinGeckoLoading} onClick={runCoinGecko}>
        {coinGeckoLoading ? 'Fetching CoinGecko balances…' : 'Fetch CoinGecko token balances'}
      </button>
      <p className="hint">CoinGecko coverage and pricing depend on supported networks, API plan, and token data availability. The first page requests up to 100 holdings.</p>
      </div>
      {coinGeckoError ? <div className="notice error" role="alert">{coinGeckoError}</div> : null}
    </section>
    {coinGeckoReport ? <section className="panel" aria-live="polite">
      <div className="report-heading">
        <div><h2>CoinGecko token balances</h2><p className="muted">Source: {coinGeckoReport.source} · Read-only</p></div>
        <button type="button" className="secondary-button" onClick={() => window.print()}>Print / Save PDF</button>
      </div>
      <p className="address-value"><strong>Address:</strong> {coinGeckoReport.data.attributes.wallet_address}</p>
      <div className="network-grid">
        <article className="network-card">
          <h3>Estimated value</h3>
          <div className="balance">{usd(coinGeckoReport.data.attributes.total_value_usd)}</div>
          <p className="hint">CoinGecko estimate across requested networks and current page filters; not a guaranteed sale or withdrawal value.</p>
          <p><strong>Holdings returned:</strong> {coinGeckoReport.data.attributes.total_holdings}</p>
          <p><strong>Networks requested:</strong> {coinGeckoReport.requestedNetworks.join(', ')}</p>
        </article>
        {coinGeckoReport.data.attributes.networks.map((network) => <article className="network-card" key={network.network}>
          <h3>{network.network}</h3>
          <div className="balance">{usd(network.value_usd)}</div>
          <p className="hint">{network.holdings} holdings · Updated {new Date(network.last_updated_at).toLocaleString()}</p>
        </article>)}
      </div>
      <h3>Token holdings</h3>
      <div className="table-wrap"><table><thead><tr><th>Asset</th><th>Network</th><th>Quantity</th><th>Price</th><th>Estimated value</th></tr></thead>
        <tbody>{coinGeckoReport.data.attributes.balances.map((token, index) => <tr key={token.network + ':' + token.address + ':' + index}>
          <td>{token.name} ({token.symbol})<div className="hint">{token.token_type} · {token.address}</div></td>
          <td>{token.network}</td><td>{token.balance ?? 'Unresolved'}<div className="hint">Raw: {token.balance_raw}</div></td>
          <td>{usd(token.price_usd)}</td><td>{usd(token.value_usd)}</td>
        </tr>)}</tbody>
      </table></div>
      <div className="notice">Token quantities and prices are reported by CoinGecko, not independently verified by this endpoint. A missing price is not zero. The address does not establish wallet ownership.</div>
      <div className="actions"><button type="button" className="secondary-button" onClick={() => setCoinGeckoReport(null)}>Hide CoinGecko report</button></div>
    </section> : null}
    {report ? <section className="panel" aria-live="polite">
      <div className="report-heading">
        <div><h2>RPC wallet balance report</h2><p className="muted">Generated {new Date(report.generatedAt).toLocaleString()}</p></div>
        <button type="button" className="secondary-button" onClick={() => window.print()}>Print / Save PDF</button>
      </div>
      <p className="address-value"><strong>Address:</strong> {report.address}</p>
      <div className="network-grid">
        {report.results.map((item) => <article className="network-card" key={item.chainId}>
          <h3>{item.network}</h3>
          {item.balance !== null ? <div className="balance">{item.balance} {item.symbol}</div> : <div className="balance">Unavailable</div>}
          <div className={item.status === 'verified' ? 'status' : 'status bad'}>{item.status.replace('_', ' ')}</div>
          <p className="hint">{item.message}</p><p className="hint">Chain ID: {item.chainId}</p>
          {item.tokens.length ? <><h4>Configured tokens</h4><div className="table-wrap"><table><thead><tr><th>Token</th><th>Balance</th><th>Status</th></tr></thead><tbody>
            {item.tokens.map((token) => <tr key={token.address}><td>{token.symbol}<div className="hint">{token.address}</div></td><td>{token.balance ?? 'Unavailable'}</td><td>{token.status}</td></tr>)}
          </tbody></table></div></> : <p className="hint">No token contracts configured for this network.</p>}
        </article>)}
      </div>
      <div className="notice">{report.valuation} Balances are public-chain quantities, not proof of identity or investment advice.</div>
      <div className="actions"><button type="button" className="secondary-button" onClick={() => { setReport(null); setError(''); }}>Hide RPC report</button></div>
    </section> : null}
  </>;
}
