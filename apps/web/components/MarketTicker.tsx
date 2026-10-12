export type MarketItem = {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
  sparkline: number[];
};

const fallbackData: MarketItem[] = [
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 61240.27,
    change24h: 2.5,
    volume: 3124000000,
    marketCap: 1215000000000,
    sparkline: [61200, 61430, 61350, 61510, 61740, 61820, 61990, 62140, 62090, 62280]
  },
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3428.9,
    change24h: 1.8,
    volume: 1809000000,
    marketCap: 411000000000,
    sparkline: [3390, 3412, 3401, 3440, 3475, 3490, 3515, 3498, 3540, 3562]
  },
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    price: 168.42,
    change24h: -0.7,
    volume: 970000000,
    marketCap: 74100000000,
    sparkline: [174, 172, 171, 170, 171, 175, 173, 169, 167, 168]
  },
  {
    id: 'avax',
    symbol: 'AVAX',
    name: 'Avalanche',
    price: 38.91,
    change24h: 0.9,
    volume: 496000000,
    marketCap: 14200000000,
    sparkline: [37.1, 37.5, 38.1, 38.4, 39.0, 38.8, 39.4, 39.7, 38.9, 38.91]
  }
];

export async function fetchMarketData(): Promise<MarketItem[]> {
  const apiUrl = 'http://localhost:4000/api/market';

  try {
    const response = await fetch(apiUrl, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as { data?: MarketItem[] };
    return payload.data && payload.data.length > 0 ? payload.data : fallbackData;
  } catch {
    return fallbackData;
  }
}
