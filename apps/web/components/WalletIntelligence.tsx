'use client';

import { useState } from 'react';

type ActivityItem = { id?: string; attributes?: Record<string, any> };
type NetworkActivity = { network: string; trades: ActivityItem[]; transfers: ActivityItem[] };
type Intelligence = {
  address: string; generatedAt: string; networks: string[];
  balances: Record<string, any> | null; pnl: Record<string, any> | null;
  activity: NetworkActivity[]; warnings: string[];
  limits: { tradesPerNetwork: number; transfersPerNetwork: number; activityWindow: string };
  safetyNote: string;
};

const ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const usd = (value: unknown) => {
  const n = Number(value);
  return value == null || !Number.isFinite(n) ? '—' : n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
};
const rows = (value: unknown): any[] => Array.isArray(value) ? value : [];

export default function WalletIntelligence() {
  const [address, setAddress] = useState('');
  const [report, setReport] = useState<Intelligence | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function lookup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setReport(null);
    const value = address.trim();
    if (!ADDRESS.test(value)) { setError('Enter a valid public EVM address.'); return; }
    setLoading(true);
    try {
      const response = await fetch('/api/wallet-intelligence?address=' + encodeURIComponent(value), { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? 'Wallet lookup failed.');
      setReport(payload as Intelligence);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Wallet lookup failed.');
    } finally { setLoading(false); }
  }

  const balanceRows = rows(report?.balances?.balances);
  const pnlRows = rows(report?.pnl?.token_stats);
  const tradeRows = rows(report?.activity.flatMap((item) => item.trades.map((row) => ({ ...row, network: item.network }))));
  const transferRows = rows(report?.activity.flatMap((item) => item.transfers.map((row) => ({ ...row, network: item.network }))));

  return <section className="panel">
    <h2>Wallet Intelligence</h2>
    <p className="muted">Read-only multi-chain holdings, swaps, transfers and profit/loss from CoinGecko. Uses only a public address.</p>
    <form onSubmit={lookup}>
      <label htmlFor="wallet-intelligence-address">Public EVM wallet address</label>
      <div className="address-form">
        <input id="wallet-intelligence-address" className="address-input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="0x..." autoComplete="off" spellCheck={false} />
        <button className="primary-button" type="submit" disabled={loading}>{loading ? 'Looking up…' : 'Analyze wallet'}</button>
      </div>
    </form>
    {error ? <div className="notice error" role="alert">{error}</div> : null}
    {report ? <>
      <p className="hint">Updated {new Date(report.generatedAt).toLocaleString()} · Networks: {report.networks.map((n) => n.toUpperCase()).join(', ')}</p>
      <p className="address-value"><strong>Address:</strong> {report.address}</p>
      <div className="network-grid">
        <article className="network-card"><h3>Total wallet value</h3><div className="balance">{usd(report.balances?.total_value_usd)}</div><p className="hint">{report.balances?.total_holdings ?? '—'} holdings reported</p></article>
        <article className="network-card"><h3>Realized P&amp;L</h3><div className="balance">{usd(report.pnl?.total_realized_pnl_usd)}</div></article>
        <article className="network-card"><h3>Unrealized P&amp;L</h3><div className="balance">{usd(report.pnl?.total_unrealized_pnl_usd)}</div></article>
      </div>
      <h3>Token holdings</h3>
      {balanceRows.length ? <div className="table-wrap"><table><thead><tr><th>Network</th><th>Asset</th><th>Quantity</th><th>Price</th><th>Value</th></tr></thead><tbody>
        {balanceRows.map((item, i) => <tr key={item.address + item.network + i}><td>{String(item.network ?? '').toUpperCase()}</td><td>{item.symbol ?? item.name ?? 'Token'}</td><td>{item.balance ?? '—'}</td><td>{usd(item.price_usd)}</td><td>{usd(item.value_usd)}</td></tr>)}
      </tbody></table></div> : <p className="hint">No holdings returned.</p>}
      <h3>Token P&amp;L</h3>
      {pnlRows.length ? <div className="table-wrap"><table><thead><tr><th>Network</th><th>Token</th><th>Realized</th><th>Unrealized</th></tr></thead><tbody>
        {pnlRows.map((item, i) => <tr key={item.address + item.network + i}><td>{String(item.network ?? '').toUpperCase()}</td><td>{item.symbol ?? item.name ?? 'Token'}</td><td>{usd(item.realized_pnl_usd)}</td><td>{usd(item.unrealized_pnl_usd)}</td></tr>)}
      </tbody></table></div> : <p className="hint">No token-level P&amp;L returned.</p>}
      <h3>Recent swaps ({tradeRows.length})</h3>
      {tradeRows.length ? <div className="table-wrap"><table><thead><tr><th>Network</th><th>Type</th><th>From</th><th>To</th><th>USD volume</th><th>Time</th></tr></thead><tbody>
        {tradeRows.map((item, i) => { const a = item.attributes ?? {}; return <tr key={item.id ?? i}><td>{String(item.network).toUpperCase()}</td><td>{a.kind ?? 'swap'}</td><td>{a.from_token_amount ?? '—'} {a.from_token_symbol ?? ''}</td><td>{a.to_token_amount ?? '—'} {a.to_token_symbol ?? ''}</td><td>{usd(a.volume_in_usd)}</td><td>{a.block_timestamp ? new Date(a.block_timestamp).toLocaleString() : '—'}</td></tr>; })}
      </tbody></table></div> : <p className="hint">No swaps returned in the available activity window.</p>}
      <h3>Recent transfers ({transferRows.length})</h3>
      {transferRows.length ? <div className="table-wrap"><table><thead><tr><th>Network</th><th>Direction</th><th>Asset</th><th>Amount</th><th>Counterparty</th><th>Time</th></tr></thead><tbody>
        {transferRows.map((item, i) => { const a = item.attributes ?? {}; return <tr key={item.id ?? i}><td>{String(item.network).toUpperCase()}</td><td>{a.direction ?? '—'}</td><td>{a.symbol ?? a.name ?? 'Token'}</td><td>{a.amount ?? '—'}</td><td>{a.direction === 'in' ? a.from_address : a.to_address ?? '—'}</td><td>{a.block_timestamp ? new Date(a.block_timestamp).toLocaleString() : '—'}</td></tr>; })}
      </tbody></table></div> : <p className="hint">No transfers returned in the available activity window.</p>}
      <p className="hint">Activity limit: first {report.limits.tradesPerNetwork} trades and {report.limits.transfersPerNetwork} transfers per network. {report.limits.activityWindow}.</p>
      {report.warnings.map((warning, i) => <div className="notice" key={i}>{warning}</div>)}
      <div className="notice">{report.safetyNote}</div>
    </> : null}
  </section>;
}
