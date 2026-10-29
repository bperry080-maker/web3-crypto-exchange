'use client';

import { useState } from 'react';

type BalanceResponse = {
  source: string;
  retrievedAt: string;
  balances: Record<string, string>;
  note: string;
};

export default function KrakenBalancePanel() {
  const [accessToken, setAccessToken] = useState('');
  const [data, setData] = useState<BalanceResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadBalances(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setData(null);
    if (!accessToken.trim()) {
      setError('Enter the dashboard access token configured by the site owner.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/kraken/balances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + accessToken.trim(),
        },
        body: '{}',
        cache: 'no-store',
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Could not retrieve Kraken balances.');
      setData(payload as BalanceResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not retrieve Kraken balances.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel">
      <h2>Kraken exchange balances</h2>
      <p className="muted">Read-only account data. This uses server-side Kraken API credentials and never asks for your Kraken API secret here.</p>
      <form onSubmit={loadBalances}>
        <label htmlFor="kraken-dashboard-token">Dashboard access token</label>
        <div className="address-form">
          <input
            id="kraken-dashboard-token"
            className="address-input"
            type="password"
            value={accessToken}
            onChange={(event) => setAccessToken(event.target.value)}
            placeholder="Enter your site access token"
            autoComplete="off"
            spellCheck={false}
          />
          <button className="primary-button" disabled={loading} type="submit">
            {loading ? 'Checking…' : 'Check Kraken balances'}
          </button>
        </div>
      </form>
      {error ? <div className="notice error" role="alert">{error}</div> : null}
      {data ? (
        <div aria-live="polite">
          <p className="hint">Retrieved {new Date(data.retrievedAt).toLocaleString()}</p>
          {Object.keys(data.balances).length === 0 ? (
            <p className="hint">Kraken returned no asset balances for this account.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Asset code</th><th>Balance</th></tr></thead>
                <tbody>
                  {Object.entries(data.balances).map(([asset, amount]) => (
                    <tr key={asset}><td>{asset}</td><td>{amount}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="hint">{data.note}</p>
        </div>
      ) : null}
      <p className="hint">Security: use a dedicated Kraken API key with Query Funds only. Do not enable trading or withdrawal permissions. The dashboard access token is separate from your Kraken API credentials.</p>
    </section>
  );
}
