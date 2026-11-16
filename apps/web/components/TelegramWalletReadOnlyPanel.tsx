'use client';

import { useCallback, useEffect, useState } from 'react';

const DEFAULT_WALLET_TG = 'Ef8zMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM0vF';

type WalletTgData = {
  addressRaw: string;
  addressFriendly: string;
  revision: number;
  seqno: number;
  subwalletId: number;
  publicKeyHex: string;
  fetchedAt: string;
};

export default function TelegramWalletReadOnlyPanel() {
  const [address, setAddress] = useState(DEFAULT_WALLET_TG);
  const [data, setData] = useState<WalletTgData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!address.trim()) {
      setError('Enter the Telegram Wallet contract address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `/api/ton/telegram-wallet?address=${encodeURIComponent(address.trim())}`,
        { cache: 'no-store' },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Unable to read Telegram Wallet.');
      setData(result as WalletTgData);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : 'Unable to read Telegram Wallet.');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 30_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  return (
    <section className="panel ton-panel">
      <div className="section-heading">
        <div>
          <h2>Telegram Wallet (WalletTg)</h2>
          <p className="muted">
            Read-only contract inspection. This panel calls public getters only and never signs,
            sends messages, rotates keys, or requests recovery credentials.
          </p>
        </div>
        <span className="chip">Read only</span>
      </div>

      <label htmlFor="telegram-wallet-address">WalletTg contract address</label>
      <input
        id="telegram-wallet-address"
        className="address-input"
        value={address}
        onChange={(event) => setAddress(event.target.value)}
        autoComplete="off"
        spellCheck={false}
      />
      <div className="actions">
        <button className="primary-button" type="button" onClick={() => void refresh()} disabled={loading}>
          {loading ? 'Reading contract…' : 'Refresh WalletTg data'}
        </button>
      </div>

      {error && <div className="notice error" role="alert">{error}</div>}
      {data && (
        <div className="ton-data-grid">
          <div className="network-card">
            <span className="hint">Contract address (raw)</span>
            <div className="address-value">{data.addressRaw}</div>
          </div>
          <div className="network-card">
            <span className="hint">Revision</span>
            <div className="balance">{data.revision}</div>
          </div>
          <div className="network-card">
            <span className="hint">Sequence number</span>
            <div className="balance">{data.seqno}</div>
          </div>
          <div className="network-card">
            <span className="hint">Subwallet ID</span>
            <div className="balance">{data.subwalletId}</div>
          </div>
          <div className="network-card">
            <span className="hint">Public signing key</span>
            <div className="address-value">{data.publicKeyHex}</div>
          </div>
          <div className="network-card">
            <span className="hint">Last read</span>
            <div>{new Date(data.fetchedAt).toLocaleString()}</div>
          </div>
        </div>
      )}
      <p className="hint">
        Refreshes every 30 seconds. A successful getter response confirms the contract is active
        and exposes the expected WalletTg read interface; it does not prove control of its private key.
      </p>
    </section>
  );
}
