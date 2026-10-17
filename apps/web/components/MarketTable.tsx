import type { MarketItem } from '../lib/market';

export function MarketTable({ data }: { data: MarketItem[] }) {
  return <div className="table-wrap"><table><thead><tr><th>Asset</th><th>Price</th><th>24h</th></tr></thead><tbody>{data.map((item) => <tr key={item.id}><td>{item.name} ({item.symbol})</td><td>${item.price.toLocaleString()}</td><td>{item.change24h.toFixed(2)}%</td></tr>)}</tbody></table></div>;
}