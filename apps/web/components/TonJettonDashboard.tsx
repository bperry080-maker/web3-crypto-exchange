'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';

const DEFAULT_JETTON_WALLET = 'EQDmVdCZ2SALvyfCDVlPLr0hoPhUxgjNFtTAxemz9V_C5wbN';

type JettonData = {
  balance: string;
  owner: string;
  master: string;
  walletCodeBocHex: string;
  fetchedAt: string;
};

function formatUnits(raw: string, decimals: number): string {
  const value = BigInt(raw);
  const base = 10n ** BigInt(decimals);
  const whole = value / base;
  const fraction = (value % base).toString().padStart(decimals, '0').replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : whole.toString();
}

export default function TonJettonDashboard() {
  const connectedAddress = useTonAddress(false);
  const [jettonWalletAddress, setJettonWalletAddress] = useState(DEFAULT_JETTON_WALLET);
  const [decimalsInput, setDecimalsInput] = useState('');
  const [data, setData] = useState<JettonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadBalance = useCallback(async () => {
    if (!jettonWalletAddress.trim()) {
      setError('Enter a Jetton wallet address.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `/api/ton/jetton-wallet?address=${encodeURIComponent(jettonWalletAddress.trim())}`,
        { cache: 'no-store' },
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error ?? 'Unable to read this Jetton wallet.');
      }
      setData(result as JettonData);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : 'Unable to read this Jetton wallet.');
    } finally {
      setLoading(false);
    }
  }, [jettonWalletAddress]);

  useEffect(() => {
    void loadBalance();
    const timer = window.setInterval(() => void loadBalance(), 30_000);
    return () => window.clearInterval(timer);
  }, [loadBalance]);

  const formattedBalance = useMemo(() => {
    if (!data || decimalsInput === '') return null;
    const decimals = Number(decimalsInput);
    if (!Number.isInteger(decimals) || decimals < 0 || decimals > 30) return null;
    try {
      return formatUnits(data.balance, decimals);
    } catch {
      return null;
    }
  }, [data, decimalsInput]);

  const ownerMatches = Boolean(
    connectedAddress && data &&
    connectedAddress.toLowerCase() === data.owner.toLowerCase(),
  );

  return (
    <section className="panel ton-panel">
      <div className="section-heading">
        <div>
          <h2>TON Jetton balance</h2>
          <p className="muted">
            Separate TON Connect session. Reads Jetton wallet data only; it does not request
            signatures or send transactions.
          </p>
        </div>
        <TonConnectButton />
      </div>

      <div className="ton-connection">
        <span className="hint">TON Connect account</span>
        <strong className="address-value">{connectedAddress || 'Not connected'}</strong>
      </div>

      <label htmlFor="ton-jetton-address">Jetton wallet contract address</label>
      <input
        id="ton-jetton-address"
        className="address-input"
        value={jettonWalletAddress}
        onChange={(event) => setJettonWalletAddress(event.target.value)}
        autoComplete="off"
        spellCheck={false}
      />
      <div className="actions">
        <button className="primary-button" type="button" onClick={() => void loadBalance()} disabled={loading}>
          {loading ? 'Reading TON…' : 'Refresh Jetton balance'}
        </button>
      </div>

      {error && <div className="notice error" role="alert">{error}</div>}

      {data && (
        <div className="ton-data-grid">
          <div className="network-card">
            <span className="hint">Raw Jetton balance</span>
            <div className="balance">{data.balance}</div>
            <span className="hint">Smallest token units</span>
          </div>
          <div className="network-card">
            <label htmlFor="ton-jetton-decimals">Token decimals (optional)</label>
            <input
              id="ton-jetton-decimals"
              className="address-input"
              type="number"
              min="0"
              max="30"
              step="1"
              inputMode="numeric"
              placeholder="Enter verified decimals"
              value={decimalsInput}
              onChange={(event) => setDecimalsInput(event.target.value)}
            />
            {formattedBalance !== null && (
              <div className="balance">{formattedBalance}</div>
            )}
            <span className="hint">Enter the token's verified decimals to display human units.</span>
          </div>
          <div className="network-card">
            <span className="hint">Jetton wallet owner</span>
            <div className="address-value">{data.owner}</div>
            {connectedAddress && (
              <span className={ownerMatches ? 'status' : 'status bad'}>
                {ownerMatches ? 'Matches connected TON wallet' : 'Does not match connected TON wallet'}
              </span>
            )}
          </div>
          <div className="network-card">
            <span className="hint">Jetton master</span>
            <div className="address-value">{data.master}</div>
          </div>
          <div className="network-card">
            <span className="hint">Last read</span>
            <div>{new Date(data.fetchedAt).toLocaleString()}</div>
          </div>
          <details className="ton-code">
            <summary>View Jetton wallet code (BOC hex)</summary>
            <code>{data.walletCodeBocHex}</code>
          </details>
        </div>
      )}
      <p className="hint">Balance refreshes every 30 seconds while this panel is open. TON and EVM wallet connections remain independent.</p>
    </section>
  );
}
