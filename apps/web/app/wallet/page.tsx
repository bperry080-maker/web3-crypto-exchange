'use client';

import { useCallback, useEffect, useState } from 'react';

type Eip1193Provider = {
  request(args: { method: string; params?: unknown[] | object }): Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

const BNB_CHAIN_ID = '0x38';

function shortenAddress(address: string) {
  return address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address;
}

export default function WalletConnectPage() {
  const [address, setAddress] = useState('');
  const [chainId, setChainId] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('Wallet not connected. Connecting only reads your public address and network.');
  const [hasProvider, setHasProvider] = useState(false);

  const refreshWallet = useCallback(async () => {
    const provider = window.ethereum;
    setHasProvider(Boolean(provider));
    if (!provider) return;
    try {
      const accounts = (await provider.request({ method: 'eth_accounts' })) as string[];
      const currentChain = (await provider.request({ method: 'eth_chainId' })) as string;
      setAddress(accounts?.[0] ?? '');
      setChainId(currentChain ?? '');
    } catch {
      setMessage('Could not read wallet status. Unlock your wallet and try again.');
    }
  }, []);

  useEffect(() => {
    void refreshWallet();
    const provider = window.ethereum;
    if (!provider?.on) return;
    const onAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      setAddress(accounts?.[0] ?? '');
      if (!accounts?.length) setMessage('Wallet disconnected from this site.');
    };
    const onChainChanged = (...args: unknown[]) => setChainId(String(args[0] ?? ''));
    provider.on('accountsChanged', onAccountsChanged);
    provider.on('chainChanged', onChainChanged);
    return () => {
      provider.removeListener?.('accountsChanged', onAccountsChanged);
      provider.removeListener?.('chainChanged', onChainChanged);
    };
  }, [refreshWallet]);

  async function connectWallet() {
    if (!window.ethereum) {
      setMessage('No browser wallet provider detected. Open this page in a browser with MetaMask or another EVM wallet installed.');
      return;
    }
    setBusy(true);
    try {
      const accounts = (await window.ethereum.request({ method: 'eth_requestAccounts' })) as string[];
      const currentChain = (await window.ethereum.request({ method: 'eth_chainId' })) as string;
      setAddress(accounts?.[0] ?? '');
      setChainId(currentChain ?? '');
      setMessage(accounts?.[0] ? 'Wallet connected for address and network checks only. No transaction was requested.' : 'No account was shared.');
    } catch (error) {
      const code = error && typeof error === 'object' && 'code' in error ? (error as { code?: number }).code : undefined;
      setMessage(code === 4001 ? 'Connection request rejected in your wallet.' : 'Wallet connection failed. Check the wallet and try again.');
    } finally {
      setBusy(false);
    }
  }

  async function switchToBnbChain() {
    if (!window.ethereum) return;
    setBusy(true);
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BNB_CHAIN_ID }],
      });
      const currentChain = (await window.ethereum.request({ method: 'eth_chainId' })) as string;
      setChainId(currentChain);
      setMessage(currentChain.toLowerCase() === BNB_CHAIN_ID ? 'BNB Smart Chain Mainnet selected. No transaction was sent.' : 'Wallet did not switch to the expected network.');
    } catch (error) {
      const code = error && typeof error === 'object' && 'code' in error ? (error as { code?: number }).code : undefined;
      setMessage(code === 4001 ? 'Network switch rejected in your wallet.' : 'Could not switch network. Select BNB Smart Chain Mainnet manually in your wallet and check chain ID 56.');
    } finally {
      setBusy(false);
    }
  }

  const isBnb = chainId.toLowerCase() === BNB_CHAIN_ID;

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px', color: 'var(--foreground, #f5f5f5)' }}>
      <a href="/" style={{ color: 'inherit', opacity: 0.8 }}>← Back to exchange</a>
      <section style={{ marginTop: 24, padding: 24, border: '1px solid #374151', borderRadius: 20, background: 'rgba(17, 24, 39, 0.7)' }}>
        <p style={{ margin: 0, opacity: 0.7, fontSize: 13, letterSpacing: 1.5 }}>CHAINLINK WALLET EXCHANGE</p>
        <h1 style={{ fontSize: 30, margin: '10px 0' }}>Connect wallet</h1>
        <p style={{ lineHeight: 1.6, opacity: 0.85 }}>
          Connect an EVM browser wallet to read its public address and selected network. This page does not request signatures, token approvals, swaps, or transfers.
        </p>

        <div style={{ display: 'grid', gap: 12, marginTop: 24 }}>
          <div style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Wallet address</div>
            <div style={{ marginTop: 6, overflowWrap: 'anywhere', fontWeight: 600 }}>{address || 'Not connected'}</div>
            {address && <div style={{ fontSize: 12, opacity: 0.65, marginTop: 4 }}>{shortenAddress(address)}</div>}
          </div>
          <div style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Network</div>
            <div style={{ marginTop: 6, fontWeight: 600 }}>{chainId ? (isBnb ? 'BNB Smart Chain Mainnet' : `Chain ID ${parseInt(chainId, 16)}`) : 'Not detected'}</div>
            <div style={{ fontSize: 12, opacity: 0.65, marginTop: 4 }}>Expected BNB Smart Chain chain ID: 56 (0x38)</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
          <button type="button" onClick={connectWallet} disabled={busy} style={{ padding: '12px 16px', borderRadius: 10, border: 0, cursor: busy ? 'wait' : 'pointer', fontWeight: 700 }}>
            {busy ? 'Please wait…' : address ? 'Reconnect wallet' : 'Connect wallet'}
          </button>
          <button type="button" onClick={switchToBnbChain} disabled={busy || !address || isBnb} style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid #6b7280', background: 'transparent', color: 'inherit', cursor: busy ? 'wait' : 'pointer' }}>
            {isBnb ? 'BNB Smart Chain selected' : 'Switch to BNB Smart Chain'}
          </button>
        </div>

        {!hasProvider && <p style={{ marginTop: 16, color: '#fbbf24' }}>No injected wallet detected in this browser. Open this route in a browser with an EVM wallet extension or supported wallet browser.</p>}
        <p role="status" aria-live="polite" style={{ marginTop: 18, fontSize: 14, lineHeight: 1.6, opacity: 0.85 }}>{message}</p>
        <p style={{ fontSize: 12, lineHeight: 1.6, opacity: 0.6, marginTop: 20 }}>Safety: never enter a recovery phrase or private key on this site. Network switching may display a wallet prompt, but it does not itself move funds.</p>
      </section>
    </main>
  );
}
