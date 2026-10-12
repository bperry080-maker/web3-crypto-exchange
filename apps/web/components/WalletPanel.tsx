import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';

export function WalletPanel() {
  const { address, isConnected, chain } = useAccount();
  const { data: balance, isPending } = useBalance({
    address: isConnected ? address : undefined,
    query: { enabled: isConnected && Boolean(address) }
  });

  return (
    <div className="wallet-panel">
      <div className="wallet-meta">
        {isConnected && address ? (
          <>
            <div className="wallet-address" title={address}>
              {address.slice(0, 6)}...{address.slice(-4)}
            </div>
            <div className="wallet-balance">
              {chain?.name || 'Connected'} {isPending ? '...' : balance ? ` • ${Number(balance.formatted).toFixed(3)} ${balance.symbol}` : ''}
            </div>
          </>
        ) : (
          <>
            <div className="wallet-address">Wallet disconnected</div>
            <div className="wallet-balance">Connect to start trading</div>
          </>
        )}
      </div>
      <ConnectButton showBalance={false} />
    </div>
  );
}
