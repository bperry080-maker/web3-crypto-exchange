import type { MarketItem } from '../lib/market';

export function MarketTicker({ data, loading }: { data: MarketItem[]; loading: boolean }) {
  return <div className="network-grid">{loading && !data.length ? <p>Loading market data…</p> : null}{data.map((item) => <article className="network-card" key={item.id}><h3>{item.name} ({item.symbol})</h3><div className="balance">${item.price.toLocaleString()}</div><p className="hint">{item.change24h.toFixed(2)}% (demo data)</p></article>)}</div>;
}