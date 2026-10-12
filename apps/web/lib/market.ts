import type { MarketItem } from '../lib/market';

export function MarketTable({ data }: { data: MarketItem[] }) {
  return (
    <table className="market-table">
      <thead>
        <tr>
          <th>Asset</th>
          <th>Price</th>
          <th>24h</th>
          <th>Volume</th>
          <th>Market cap</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            <td>
              <div className="currency">{item.symbol}</div>
              <div className="symbol">{item.name}</div>
            </td>
            <td>${item.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
            <td className={item.change24h >= 0 ? 'trend up' : 'trend down'} style={{ padding: 0, fontWeight: 700 }}>
              {item.change24h >= 0 ? '+' : ''}
              {item.change24h.toFixed(2)}%
            </td>
            <td>${(item.volume / 1_000_000).toFixed(1)}M</td>
            <td>${(item.marketCap / 1_000_000_000).toFixed(1)}B</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
