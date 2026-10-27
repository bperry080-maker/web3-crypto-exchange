import WalletMonitor from '../components/WalletMonitor';

export default function HomePage() {
  return (
    <main className="page-shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">Read-only Web3 tools</div>
          <h1>Live Funds Monitor</h1>
          <p className="muted">Live read-only balances and token-value estimates for Ethereum, Base and BNB Smart Chain.</p>
        </div>
        <span className="chip">Read only</span>
      </header>
      <WalletMonitor />
      <footer className="footer-note">
        Public blockchain data only. These reports do not connect a wallet, sign transactions, or move funds.
        CoinGecko USD values are estimates and token coverage depends on provider data and API plan.
      </footer>
    </main>
  );
}
