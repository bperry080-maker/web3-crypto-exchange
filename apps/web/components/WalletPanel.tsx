'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChartPanel } from '../components/ChartPanel';
import { MarketTable } from '../components/MarketTable';
import { MarketTicker } from '../components/MarketTicker';
import { SwapWidget } from '../components/SwapWidget';
import { WalletPanel } from '../components/WalletPanel';
import { fetchMarketData, type MarketItem } from '../lib/market';

const defaultMarket: MarketItem[] = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 61240.27,
    change24h: 2.51,
    volume: 3124000000,
    marketCap: 1215000000000,
    sparkline: [61850, 61910, 62020, 62145, 62080, 62230, 62310, 62480, 62540, 62620]
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3428.9,
    change24h: 1.8,
    volume: 1809000000,
    marketCap: 411000000000,
    sparkline: [3340, 3370, 3400, 3420, 3445, 3460, 3440, 3470, 3490, 3505]
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    price: 168.42,
    change24h: -0.7,
    volume: 970000000,
    marketCap: 74100000000,
    sparkline: [172, 171, 170, 171, 175, 173, 169, 167, 168, 170]
  }
];

export default function HomePage() {
  const [market, setMarket] = useState<MarketItem[]>(defaultMarket);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMarketData();
        setMarket(data);
      } catch (error) {
        console.error('Market fetch failed, falling back to local data', error);
        setMarket(defaultMarket);
      } finally {
        setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const topCoin = useMemo(() => market[0] ?? defaultMarket[0], [market]);

  return (
    <main className="page-shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">Web3 Exchange</div>
          <h1>Market Pulse</h1>
        </div>
        <WalletPanel />
      </header>

      <section className="overview-grid">
        <div className="hero-card panel">
          <div className="hero-header">
            <span className="chip">Live</span>
            <span className="muted">Updated every 15s</span>
          </div>

          <div className="hero-row">
            <div>
              <div className="label">Top market</div>
              <div className="hero-price">${topCoin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            </div>
            <div className={`trend ${topCoin.change24h >= 0 ? 'up' : 'down'}`}>
              {topCoin.change24h >= 0 ? '+' : ''}
              {topCoin.change24h.toFixed(2)}%
            </div>
          </div>

          <div className="stats-row">
            <div>
              <div className="label">Volume</div>
              <div className="value">${(topCoin.volume / 1_000_000).toFixed(1)}M</div>
            </div>
            <div>
              <div className="label">Market cap</div>
              <div className="value">${(topCoin.marketCap / 1_000_000_000).toFixed(1)}B</div>
            </div>
          </div>
        </div>

        <div className="panel chart-card">
          <div className="panel-header">
            <span>Chart</span>
            <span className="muted">1D</span>
          </div>
          <ChartPanel data={topCoin.sparkline ?? [1, 2, 3, 4, 5]} />
        </div>
      </section>

      <section className="market-grid">
        <MarketTicker data={market} loading={loading} />
      </section>

      <section className="dashboard-grid">
        <div className="panel table-section">
          <div className="panel-header">
            <span>Markets</span>
            <button className="ghost-button">View all</button>
          </div>
          <MarketTable data={market} />
        </div>

        <SwapWidget />
      </section>
    </main>
  );
}
