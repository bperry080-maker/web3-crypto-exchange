import WalletMonitor from '../components/WalletMonitor';
import TokenLookup from '../components/TokenLookup';

export default function HomePage() {
  return (
    <main className="page-shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">Read-only Web3 tools</div>
          <h1>Wallet Monitor</h1>
          <p className="muted">A public-chain balance report for Ethereum, Base and BNB Chain.</p>
        </div>
        <span className="chip">Read only</span>
      </header>
      <WalletMonitor />
      <TokenLookup />
      <footer className="footer-note">
        Public blockchain data only. These tools do not connect a wallet, sign transactions, or move funds.
        Token coverage and market data depend on configured providers and upstream availability.
      </footer>
    </main>
  );
}