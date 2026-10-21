import type { MarketItem } from '../lib/market';

export function PriceCard({ item }: { item: MarketItem }) {
  return <article className="network-card"><h3>{item.name} ({item.symbol})</h3><div className="balance">${item.price.toLocaleString()}</div><p className="hint">{item.change24h.toFixed(2)}%</p></article>;
}