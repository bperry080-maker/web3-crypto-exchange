import WalletMonitor from '../components/WalletMonitor';

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
      <footer className="footer-note">
        Public blockchain data only. This report does not connect a wallet, sign transactions, or move funds.
        Token coverage depends on RPC provider support. USD valuations are not included in this first version.
      </footer>
    </main>
  );
}