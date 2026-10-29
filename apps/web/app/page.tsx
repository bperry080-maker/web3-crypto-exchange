import WalletMonitor from '../components/WalletMonitor';
import TokenLookup from '../components/TokenLookup';
import MarketDashboard from '../components/MarketDashboard';

export default function HomePage() {
  return (
    <main className="page-shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">Read-only Web3 tools</div>
          <h1>Chainlink Wallet Monitor</h1>
          <p className="muted">Public-chain balances, token research, market prices and trending DEX pools.</p>
        </div>
        <span className="chip">Read only</span>
      </header>
      <WalletMonitor />
      <MarketDashboard />
      <TokenLookup />
      <footer className="footer-note">
        Public blockchain and market data only. These tools do not connect a wallet, sign transactions, or move funds.
        Prices, pool metrics and token metadata may be delayed, unavailable, or incomplete.
      </footer>
    </main>
  );
}
