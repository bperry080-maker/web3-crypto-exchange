import WalletMonitor from '../components/WalletMonitor';
import WalletIntelligence from '../components/WalletIntelligence';
import MarketDashboard from '../components/MarketDashboard';
import TokenLookup from '../components/TokenLookup';
import WalletConnectButton from '../components/WalletConnectButton';

export default function HomePage() {
  return (
    <main className="page-shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">Read-only Web3 tools</div>
          <h1>Chainlink Wallet Monitor</h1>
          <p className="muted">Public-chain balances, wallet intelligence, token research, market prices and trending DEX pools.</p>
        </div>
        <div className="topbar-actions">
          <WalletConnectButton />
          <span className="chip">Read-only tools</span>
        </div>
      </header>
      <WalletMonitor />
      <WalletIntelligence />
      <MarketDashboard />
      <TokenLookup />
      <footer className="footer-note">
        Wallet connection is optional. Connecting does not sign transactions or move funds. Public blockchain and market data are used for the read-only tools.
        Prices, pool metrics, PnL and token metadata may be delayed, unavailable, or incomplete.
      </footer>
    </main>
  );
}
