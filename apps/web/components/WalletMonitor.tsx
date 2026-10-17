'use client';

import { useState } from 'react';

type NetworkResult = {
  network: string;
  chainId: number;
  symbol: string;
  status: 'verified' | 'not_configured' | 'wrong_network' | 'error';
  balance: string | null;
  message: string;
};
type Report = {
  address: string;
  generatedAt: string;
  scope: string;
  results: NetworkResult[];
  valuation: string;
};

const ADDRESS = /^0x[a-fA-F0-9]{40}$/;

export default function WalletMonitor() {
  const [address, setAddress] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function runReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setReport(null);
    if (!ADDRESS.test(address.trim())) {
      setError('Enter a valid public EVM address: 0x followed by 40 hexadecimal characters.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/wallet-report?address=' + encodeURIComponent(address.trim()), { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not create report.');
      setReport(data as Report);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create report.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="panel">
        <h2>Create a public wallet report</h2>
        <p className="muted">Enter a public address. No wallet connection, signature, private key, or recovery phrase is needed.</p>
        <form onSubmit={runReport}>
          <label htmlFor="wallet-address">EVM public address</label>
          <div className="address-form">
            <input id="wallet-address" className="address-input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="0x..." autoComplete="off" spellCheck={false} />
            <button className="primary-button" disabled={loading} type="submit">{loading ? 'Checking…' : 'Generate report'}</button>
          </div>
        </form>
        {error ? <div className="notice error" role="alert">{error}</div> : null}
        <p className="hint">This first version reports native coin balances only. Token balances and USD valuations will be added after the core RPC checks are verified.</p>
      </section>
      {report ? (
        <section className="panel" aria-live="polite">
          <div className="report-heading">
            <div><h2>Wallet balance report</h2><p className="muted">Generated {new Date(report.generatedAt).toLocaleString()}</p></div>
            <button type="button" className="secondary-button" onClick={() => window.print()}>Print / Save PDF</button>
          </div>
          <p className="address-value"><strong>Address:</strong> {report.address}</p>
          <div className="network-grid">
            {report.results.map((item) => (
              <article className="network-card" key={item.chainId}>
                <h3>{item.network}</h3>
                {item.balance !== null ? <div className="balance">{item.balance} {item.symbol}</div> : <div className="balance">Unavailable</div>}
                <div className={item.status === 'verified' ? 'status' : 'status bad'}>{item.status.replace('_', ' ')}</div>
                <p className="hint">{item.message}</p>
                <p className="hint">Chain ID: {item.chainId}</p>
              </article>
            ))}
          </div>
          <div className="notice">{report.valuation} This report shows quantities, not ownership identity or investment advice.</div>
          <div className="actions">
            <button type="button" className="secondary-button" onClick={() => { setReport(null); setError(''); }}>New report</button>
          </div>
        </section>
      ) : null}
    </>
  );
}