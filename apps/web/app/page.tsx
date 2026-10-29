import WalletMonitor from '../components/WalletMonitor';
import KrakenBalancePanel from '../components/KrakenBalancePanel';

export default function HomePage() {
  return (
    <main className="page-shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">Read-only Web3 tools</div>
          <h1>Wallet Monitor</h1>
          <p className="muted">Public-chain balances plus protected Kraken exchange balance monitoring.</p>
        </div>
        <span className="chip">Read only</span>
      </header>
      <WalletMonitor />
      <KrakenBalancePanel />
      <footer className="footer-note">
        Public blockchain and read-only exchange data only. This report does not connect a wallet, sign transactions, place orders, or move funds.
        Token coverage depends on RPC provider support. USD valuations are not included in this first version.
      </footer>
    </main>
  );
}