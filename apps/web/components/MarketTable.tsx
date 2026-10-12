import type { MarketItem } from '../lib/market';

export function PriceCard({ item }: { item: MarketItem }) {
  return (
    <div className="ticker-card">
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

      <div className="price-value" style={{ marginTop: 18 }}>
        ${item.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </div>
    </div>
  );
}
