'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

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
const BNB_CHAIN_NUMBER = 56;
const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

function toWeiHex(amount: string): string {
  // Accept ordinary decimal BNB values only; avoid floating-point conversion.
  if (!/^\d+(\.\d{1,18})?$/.test(amount)) {
    throw new Error('Enter a valid BNB amount with up to 18 decimal places.');
  }
  const [whole, fraction = ''] = amount.split('.');
  const wei = BigInt(whole) * 10n ** 18n + BigInt((fraction + '0'.repeat(18)).slice(0, 18));
  if (wei <= 0n) throw new Error('Amount must be greater than zero.');
  return `0x${wei.toString(16)}`;
}

export default function WalletConnectPage() {
  const [address, setAddress] = useState('');
  const [chainId, setChainId] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('Connect a wallet to view its public address and use BNB send/receive tools.');
  const [hasProvider, setHasProvider] = useState(false);
  const [tab, setTab] = useState<'receive' | 'send'>('receive');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);

  const isBnb = chainId.toLowerCase() === BNB_CHAIN_ID;
  const receiveUri = useMemo(() => address ? `ethereum:${address}@${BNB_CHAIN_NUMBER}` : '', [address]);
  // The QR image provider receives only the public payment URI, never a private key.
  const qrImageUrl = useMemo(
    () => receiveUri ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=12&data=${encodeURIComponent(receiveUri)}` : '',
    [receiveUri],
  );

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
      setMessage('No browser wallet provider detected. Open this page in a browser with an EVM wallet installed.');
      return;
    }
    setBusy(true);
    try {
      const accounts = (await window.ethereum.request({ method: 'eth_requestAccounts' })) as string[];
      const currentChain = (await window.ethereum.request({ method: 'eth_chainId' })) as string;
      setAddress(accounts?.[0] ?? '');
      setChainId(currentChain ?? '');
      setMessage(accounts?.[0] ? 'Wallet connected. Sending is only requested after you review the details and approve it in your wallet.' : 'No account was shared.');
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
      await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: BNB_CHAIN_ID }] });
      const currentChain = (await window.ethereum.request({ method: 'eth_chainId' })) as string;
      setChainId(currentChain);
      setMessage(currentChain.toLowerCase() === BNB_CHAIN_ID ? 'BNB Smart Chain Mainnet selected (chain ID 56).' : 'Wallet did not switch to the expected network.');
    } catch (error) {
      const code = error && typeof error === 'object' && 'code' in error ? (error as { code?: number }).code : undefined;
      setMessage(code === 4001 ? 'Network switch rejected in your wallet.' : 'Could not switch network. Select BNB Smart Chain Mainnet manually (chain ID 56).');
    } finally {
      setBusy(false);
    }
  }

  async function sendBnb() {
    if (!window.ethereum) {
      setMessage('No browser wallet provider detected. Connect a wallet first.');
      return;
    }
    if (!address) {
      setMessage('Connect your wallet first.');
      return;
    }
    if (!isBnb) {
      setMessage('Switch to BNB Smart Chain Mainnet (chain ID 56) before sending.');
      return;
    }
    if (!ADDRESS_RE.test(recipient)) {
      setMessage('Enter a valid 0x recipient address (40 hexadecimal characters after 0x).');
      return;
    }

    let value: string;
    try {
      value = toWeiHex(amount.trim());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Enter a valid BNB amount.');
      return;
    }

    const confirmed = window.confirm(
      `Review BNB transfer\n\nNetwork: BNB Smart Chain Mainnet (chain ID 56)\nFrom: ${address}\nTo: ${recipient}\nAmount: ${amount} BNB\n\nNetwork fees are extra. Your wallet will show a final approval screen. Continue to wallet review?`,
    );
    if (!confirmed) {
      setMessage('Transfer cancelled before opening the wallet confirmation.');
      return;
    }

    setBusy(true);
    try {
      // Re-check the active network and account immediately before requesting a transfer.
      // The wallet may have changed networks/accounts while the confirmation dialog was open.
      const currentChain = String(await window.ethereum.request({ method: 'eth_chainId' }));
      const currentAccounts = (await window.ethereum.request({ method: 'eth_accounts' })) as string[];
      const currentAddress = currentAccounts?.[0] ?? '';
      if (currentChain.toLowerCase() !== BNB_CHAIN_ID) {
        setChainId(currentChain);
        setMessage('Transfer stopped: your wallet is no longer on BNB Smart Chain Mainnet (chain ID 56). Switch networks and review again.');
        return;
      }
      if (!currentAddress || currentAddress.toLowerCase() !== address.toLowerCase()) {
        setAddress(currentAddress);
        setMessage('Transfer stopped: the active wallet account changed. Review the address and start again.');
        return;
      }
      setChainId(currentChain);
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{ from: currentAddress, to: recipient, value }],
      });
      setMessage(typeof txHash === 'string'
        ? `Wallet submitted the transaction. Transaction hash: ${txHash}`
        : 'Wallet returned a transaction response. Check your wallet or BscScan for its status.');
      setAmount('');
    } catch (error) {
      const code = error && typeof error === 'object' && 'code' in error ? (error as { code?: number }).code : undefined;
      setMessage(code === 4001 ? 'Transfer rejected in your wallet. No transaction was authorized.' : 'Transfer request failed or was rejected. Check your wallet and transaction history before retrying.');
    } finally {
      setBusy(false);
    }
  }

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setMessage('Public wallet address copied.');
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setMessage('Copy was unavailable in this browser. Select and copy the address manually.');
    }
  }

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px', color: 'var(--foreground, #f5f5f5)' }}>
      <a href="/" style={{ color: 'inherit', opacity: 0.8 }}>← Back to exchange</a>
      <section style={{ marginTop: 24, padding: 24, border: '1px solid #374151', borderRadius: 20, background: 'rgba(17, 24, 39, 0.7)' }}>
        <p style={{ margin: 0, opacity: 0.7, fontSize: 13, letterSpacing: 1.5 }}>CHAINLINK WALLET EXCHANGE</p>
        <h1 style={{ fontSize: 30, margin: '10px 0' }}>BNB Chain wallet</h1>
        <p style={{ lineHeight: 1.6, opacity: 0.85 }}>
          Receive BNB with a QR code or prepare a native BNB transfer on BNB Smart Chain Mainnet. The app never asks for your recovery phrase or private key.
        </p>

        <div style={{ display: 'grid', gap: 12, marginTop: 24 }}>
          <div style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Connected public address</div>
            <div style={{ marginTop: 6, overflowWrap: 'anywhere', fontWeight: 600 }}>{address || 'Not connected'}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
              <button type="button" onClick={connectWallet} disabled={busy} style={{ padding: '10px 14px', borderRadius: 10, border: 0, cursor: busy ? 'wait' : 'pointer', fontWeight: 700 }}>
                {busy ? 'Please wait…' : address ? 'Reconnect wallet' : 'Connect wallet'}
              </button>
              <button type="button" onClick={copyAddress} disabled={!address} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #6b7280', background: 'transparent', color: 'inherit' }}>
                {copied ? 'Copied' : 'Copy address'}
              </button>
              <button type="button" onClick={switchToBnbChain} disabled={busy || !address || isBnb} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #6b7280', background: 'transparent', color: 'inherit' }}>
                {isBnb ? 'BNB Mainnet selected' : 'Switch to BNB Chain'}
              </button>
            </div>
            <div style={{ fontSize: 12, opacity: 0.65, marginTop: 10 }}>Network: {chainId ? (isBnb ? 'BNB Smart Chain Mainnet · chain ID 56' : `Chain ID ${parseInt(chainId, 16)} — switch to BNB Chain to send`) : 'Not detected'}</div>
          </div>
        </div>

        <div role="tablist" aria-label="BNB wallet actions" style={{ display: 'flex', gap: 8, marginTop: 22 }}>
          <button role="tab" aria-selected={tab === 'receive'} type="button" onClick={() => setTab('receive')} style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #6b7280', background: tab === 'receive' ? '#f5b301' : 'transparent', color: tab === 'receive' ? '#111827' : 'inherit', fontWeight: 700 }}>Receive</button>
          <button role="tab" aria-selected={tab === 'send'} type="button" onClick={() => setTab('send')} style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #6b7280', background: tab === 'send' ? '#f5b301' : 'transparent', color: tab === 'send' ? '#111827' : 'inherit', fontWeight: 700 }}>Send BNB</button>
        </div>

        {tab === 'receive' ? (
          <div style={{ marginTop: 18, padding: 18, borderRadius: 14, background: 'rgba(255,255,255,0.04)' }}>
            <h2 style={{ fontSize: 21, marginTop: 0 }}>Receive BNB</h2>
            {!address ? <p>Connect your wallet to display your receiving address and QR code.</p> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(180px, 240px)', gap: 18, alignItems: 'center' }}>
                <div>
                  <p style={{ overflowWrap: 'anywhere', lineHeight: 1.6 }}>{address}</p>
                  <p style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.6 }}>Ask the sender to select BNB Smart Chain Mainnet (BEP-20) and verify the address before sending.</p>
                  <button type="button" onClick={copyAddress} style={{ padding: '10px 14px', borderRadius: 10, border: 0, fontWeight: 700 }}>{copied ? 'Copied' : 'Copy receiving address'}</button>
                </div>
                <div style={{ padding: 12, borderRadius: 12, background: '#fff', textAlign: 'center' }}>
                  <img src={qrImageUrl} alt="QR code for this public address on BNB Smart Chain" width="216" height="216" style={{ width: '100%', height: 'auto', imageRendering: 'pixelated' }} />
                  <div style={{ color: '#111827', fontSize: 11, lineHeight: 1.4 }}>BNB Smart Chain · chain ID 56</div>
                </div>
              </div>
            )}
            <p style={{ fontSize: 12, opacity: 0.65, lineHeight: 1.6, marginBottom: 0 }}>QR privacy note: the QR image is generated by QRServer. It receives the public payment URI shown in the code; it does not receive your private key or recovery phrase.</p>
          </div>
        ) : (
          <div style={{ marginTop: 18, padding: 18, borderRadius: 14, background: 'rgba(255,255,255,0.04)' }}>
            <h2 style={{ fontSize: 21, marginTop: 0 }}>Send native BNB</h2>
            <p style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.6 }}>This sends BNB only—not BEP-20 tokens. A transfer is a real, generally irreversible blockchain transaction. Check the recipient, amount, and network carefully.</p>
            <label htmlFor="bnb-recipient" style={{ display: 'block', margin: '14px 0 6px', fontWeight: 600 }}>Recipient BNB Chain address</label>
            <input id="bnb-recipient" autoComplete="off" spellCheck={false} value={recipient} onChange={e => setRecipient(e.target.value.trim())} placeholder="0x…" style={{ width: '100%', boxSizing: 'border-box', padding: 12, borderRadius: 10, border: '1px solid #6b7280', background: '#111827', color: 'inherit' }} />
            <label htmlFor="bnb-amount" style={{ display: 'block', margin: '14px 0 6px', fontWeight: 600 }}>Amount (BNB)</label>
            <input id="bnb-amount" inputMode="decimal" autoComplete="off" value={amount} onChange={e => setAmount(e.target.value.trim())} placeholder="0.01" style={{ width: '100%', boxSizing: 'border-box', padding: 12, borderRadius: 10, border: '1px solid #6b7280', background: '#111827', color: 'inherit' }} />
            <button type="button" onClick={sendBnb} disabled={busy || !address || !recipient || !amount} style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, border: 0, fontWeight: 800, cursor: busy ? 'wait' : 'pointer' }}>
              {busy ? 'Waiting for wallet…' : 'Review and send BNB'}
            </button>
            {!isBnb && <p style={{ color: '#fbbf24', fontSize: 13, lineHeight: 1.6 }}>Sending is disabled by the app until your connected wallet is on BNB Smart Chain Mainnet (chain ID 56).</p>}
            <p style={{ fontSize: 12, opacity: 0.65, lineHeight: 1.6 }}>The app opens a confirmation prompt first, then your wallet must independently approve the transaction. Reject it in the wallet to cancel. Never share your seed phrase or private key.</p>
          </div>
        )}

        {!hasProvider && <p style={{ marginTop: 16, color: '#fbbf24' }}>No injected wallet detected in this browser. Open this route in a browser with an EVM wallet installed.</p>}
        <p role="status" aria-live="polite" style={{ marginTop: 18, fontSize: 14, lineHeight: 1.6, overflowWrap: 'anywhere', opacity: 0.9 }}>{message}</p>
        <p style={{ fontSize: 12, lineHeight: 1.6, opacity: 0.6, marginTop: 20 }}>Safety: no private keys are handled by this page. Sending requests a wallet transaction only after you click the send button and review the details. Verify the network and recipient in your wallet before approving.</p>
      </section>
    </main>
  );
}
