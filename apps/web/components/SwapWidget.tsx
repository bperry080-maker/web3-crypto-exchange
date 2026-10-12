import { useAccount, useBalance } from 'wagmi';

export function PortfolioCard() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address, query: { enabled: Boolean(address) } });

  return (
    <aside className="panel portfolio-panel">
      <div className="panel-header">
        <span>Portfolio</span>
        <span className="muted">Live</span>
      </div>

      <div className="portfolio-amount">
        ${isConnected && balance ? Number(balance.formatted).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0.00'}
      </div>

      <div className="portfolio-meta">
        <span>Net worth</span>
        <strong>{isConnected ? 'Wallet connected' : 'Awaiting connection'}</strong>
      </div>

      <div className="portfolio-stat-grid">
        <div>
          <small>Assets</small>
          <strong>{isConnected ? '3' : '0'}</strong>
        </div>
        <div>
          <small>24h P/L</small>
          <strong className="positive">+2.4%</strong>
        </div>
      </div>
    </aside>
  );
}
