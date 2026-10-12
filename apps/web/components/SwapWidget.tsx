import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';

export function WalletPanel() {
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({
    address,
    query: { enabled: Boolean(address) }
  });

  return (
    <div className="wallet-panel">
      <div className="wallet-meta">
        {isConnected ? (
          <>
            <div className="wallet-address">{address?.slice(0, 6)}...{address?.slice(-4)}</div>
            <div className="wallet-balance">
              {chain?.name ?? 'Connected'} · {balance ? `${Number(balance.formatted).toFixed(3)} ${balance.symbol}` : 'Balance loading'}
            </div>
          </>
        ) : (
          <>
            <div className="wallet-address">Wallet disconnected</div>
            <div className="wallet-balance">Connect to trade on-chain</div>
          </>
        )}
      </div>
      <ConnectButton showBalance={false} />
    </div>
  );
}
