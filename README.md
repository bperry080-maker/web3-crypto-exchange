* {
  box-sizing: border-box;
}

:root {
  --bg: #07111f;
  --bg-strong: #0d1729;
  --panel: rgba(15, 23, 42, 0.9);
  --panel-soft: rgba(15, 23, 42, 0.7);
  --border: rgba(148, 163, 184, 0.18);
  --text: #e2e8f0;
  --muted: #94a3b8;
  --accent: #38bdf8;
  --green: #34d399;
  --red: #f87171;
  --yellow: #fbbf24;
  --shadow: rgba(15, 23, 42, 0.5);
}

html {
  color-scheme: dark;
}

body {
  margin: 0;
  min-height: 100vh;
  background:
    radial-gradient(circle at top, rgba(56, 189, 248, 0.18), transparent 30%),
    radial-gradient(circle at bottom right, rgba(52, 211, 153, 0.15), transparent 30%),
    var(--bg);
  color: var(--text);
  font-family: Arial, Helvetica, sans-serif;
}

button,
input,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

.page-shell {
  width: min(1200px, calc(100vw - 32px));
  margin: 0 auto;
  padding: 32px 0 48px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 20px;
}

.eyebrow {
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 11px;
  font-weight: bold;
}

h1 {
  margin: 6px 0 0;
  font-size: clamp(2rem, 4vw, 3rem);
}

.panel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(15, 23, 42, 0.45);
}

.overview-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 20px;
  margin-bottom: 20px;
}

.hero-card,
.chart-card,
.table-section,
.swap-panel,
.portfolio-panel {
  padding: 20px;
}

.hero-header,
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.chip {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: rgba(52, 211, 153, 0.14);
  color: var(--green);
  border: 1px solid rgba(52, 211, 153, 0.35);
  padding: 6px 10px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.muted {
  color: var(--muted);
  font-size: 12px;
}

.hero-row {
  display: flex;
  justify-content: space-between;
  align-items: end;
  margin-top: 24px;
}

.label {
  color: var(--muted);
  font-size: 12px;
  margin-bottom: 8px;
}

.hero-price {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
}

.trend {
  border-radius: 12px;
  padding: 8px 12px;
  font-weight: 700;
}

.trend.up {
  background: rgba(52, 211, 153, 0.12);
  color: var(--green);
}

.trend.down {
  background: rgba(248, 113, 113, 0.1);
  color: var(--red);
}

.stats-row {
  display: flex;
  gap: 24px;
  margin-top: 24px;
}

.value {
  font-size: 1.2rem;
  font-weight: 600;
}

.market-grid {
  margin-bottom: 20px;
}

.ticker-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.ticker-card {
  background: var(--panel-soft);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 16px;
  min-height: 150px;
}

.price-row,
.market-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.currency {
  font-weight: 700;
}

.symbol {
  font-size: 0.85rem;
  color: var(--muted);
}

.price-value {
  font-size: 1.4rem;
  font-weight: 700;
}

.change {
  border-radius: 10px;
  padding: 6px 8px;
  font-size: 12px;
  font-weight: 700;
}

.change.up {
  background: rgba(52, 211, 153, 0.12);
  color: var(--green);
}

.change.down {
  background: rgba(248, 113, 113, 0.1);
  color: var(--red);
}

.sparkline {
  margin-top: 16px;
  width: 100%;
  height: 54px;
  display: block;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.7fr);
  gap: 20px;
  align-items: start;
}

.side-stack {
  display: grid;
  gap: 20px;
}

.table-section {
  margin-top: 0;
}

.market-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
}

.market-table th,
.market-table td {
  text-align: left;
  padding: 14px 8px;
  border-bottom: 1px solid var(--border);
}

.market-table th {
  color: var(--muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.market-table td {
  font-size: 0.95rem;
}

.wallet-panel {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 10px 14px;
}

.wallet-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.wallet-address {
  font-size: 0.82rem;
  font-weight: 700;
}

.wallet-balance {
  font-size: 0.75rem;
  color: var(--muted);
}

.connect-button,
.ghost-button,
.primary-button {
  border: 1px solid rgba(56, 189, 248, 0.45);
  background: rgba(56, 189, 248, 0.12);
  color: var(--text);
  border-radius: 12px;
  min-width: 110px;
  padding: 10px 14px;
  cursor: pointer;
}

.ghost-button {
  min-width: auto;
  background: transparent;
}

.primary-button {
  width: 100%;
  margin-top: 18px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.8), rgba(56, 189, 248, 0.5));
  border: none;
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.portfolio-panel {
  display: grid;
  gap: 18px;
}

.portfolio-amount {
  font-size: 2rem;
  font-weight: 700;
}

.portfolio-meta,
.portfolio-stat-grid {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.portfolio-meta {
  color: var(--muted);
  font-size: 0.82rem;
}

.portfolio-stat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.portfolio-stat-grid div {
  display: grid;
  gap: 4px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
}

.sales-stat-grid small,
.portfolio-stat-grid small {
  color: var(--muted);
}

.positive {
  color: var(--green);
}

.swap-panel {
  display: grid;
  gap: 14px;
}

.swap-box {
  display: grid;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.7);
}

.swap-box label {
  color: var(--muted);
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.swap-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
}

.swap-line select,
.swap-line input {
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 1.05rem;
}

.swap-line select {
  width: 100%;
  appearance: none;
  outline: none;
  padding: 0;
}

.swap-line input {
  width: 120px;
  text-align: right;
  font-weight: 700;
}

.token-name {
  font-weight: 700;
}

.token-sub {
  font-size: 0.72rem;
  color: var(--muted);
}

.swap-divider {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 38px;
  height: 38px;
  margin: 0 auto;
  border-radius: 50%;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.45);
}

.swap-stats {
  display: grid;
  gap: 10px;
  font-size: 0.82rem;
  color: var(--muted);
}

.swap-stats div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.swap-stats strong {
  color: var(--text);
  font-weight: 600;
}

@media (max-width: 860px) {
  .overview-grid,
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .ticker-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .ticker-grid {
    grid-template-columns: 1fr;
  }

  .market-table {
    display: block;
    overflow-x: auto;
  }

  .wallet-panel {
    width: 100%;
    justify-content: space-between;
  }
}
