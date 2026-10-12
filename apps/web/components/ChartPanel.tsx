export function SwapWidget() {
  return (
    <aside className="panel swap-panel">
      <div className="panel-header">
        <span>Swap</span>
        <span className="muted">Instant</span>
      </div>

      <div className="swap-box">
        <label>From</label>
        <div className="swap-line">
          <div>
            <div className="token-name">ETH</div>
            <div className="token-sub">Ethereum</div>
          </div>
          <input defaultValue="1.25" aria-label="From amount" />
        </div>
      </div>

      <div className="swap-divider">⇅</div>

      <div className="swap-box">
        <label>To</label>
        <div className="swap-line">
          <div>
            <div className="token-name">USDC</div>
            <div className="token-sub">USD Coin</div>
          </div>
          <input defaultValue="4068.00" aria-label="To amount" />
        </div>
      </div>

      <div className="swap-stats">
        <div><span>Rate</span><strong>1 ETH = 3,268 USDC</strong></div>
        <div><span>Network fee</span><strong>~$6.20</strong></div>
      </div>

      <button className="primary-button">Connect wallet to swap</button>
    </aside>
  );
}
