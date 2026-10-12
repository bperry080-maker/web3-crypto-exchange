import type { MarketItem } from '../lib/market';

export function MarketTicker({ data, loading }: { data: MarketItem[]; loading: boolean }) {
  return (
    <div className="ticker-grid">
      {loading && !data.length ? <div>Loading market data...</div> : null}

      {data.slice(0, 4).map((item) => (
        <article key={item.id} className="ticker-card panel">
          <div className="price-row">
            <div>
              <div className="currency">{item.symbol}</div>
              <div className="symbol">{item.name}</div>
            </div>
            <div className={`change ${item.change24h >= 0 ? 'up' : 'down'}`}>
              {item.change24h >= 0 ? '+' : ''}
              {item.change24h.toFixed(2)}%
            </div>
          </div>

          <div className="market-row" style={{ marginTop: 18 }}>
            <div className="price-value">${item.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          </div>

          <svg className="sparkline" viewBox="0 0 100 40" preserveAspectRatio="none" aria-label={`${item.symbol} sparkline`}>
            <path
              d={buildSparklinePath(item.sparkline)}
              fill="none"
              stroke={item.change24h >= 0 ? '#34d399' : '#f87171'}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </article>
      ))}
    </div>
  );
}

function buildSparklinePath(values: number[]) {
  const max = Math.max(...values);
  const min = Math.min(...values);

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 40 - ((value - min) / Math.max(max - min, 0.001)) * 30 - 5;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}
