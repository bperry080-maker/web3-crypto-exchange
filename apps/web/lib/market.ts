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
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 61240.27,
    change24h: 2.51,
    volume: 31240000000,
    marketCap: 1215000000000,
    sparkline: [61850, 61910, 62020, 62145, 62080, 62230, 62310, 62480, 62540, 62620]
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3428.9,
    change24h: 1.8,
    volume: 18090000000,
    marketCap: 411000000000,
    sparkline: [3340, 3370, 3400, 3420, 3445, 3460, 3440, 3470, 3490, 3505]
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    price: 168.42,
    change24h: -0.7,
    volume: 9700000000,
    marketCap: 74100000000,
    sparkline: [172, 171, 170, 171, 175, 173, 169, 167, 168, 170]
  },
  {
    id: 'chainlink',
    symbol: 'LINK',
    name: 'Chainlink',
    price: 17.82,
    change24h: 2.11,
    volume: 6410000000,
    marketCap: 10100000000,
    sparkline: [17.1, 17.5, 17.8, 18.2, 18.0, 17.9, 18.1, 17.95, 18.2, 17.82]
  },
  {
    id: 'usd-coin',
    symbol: 'USDC',
    name: 'USD Coin',
    price: 1.0,
    change24h: 0.02,
    volume: 45000000000,
    marketCap: 36000000000,
    sparkline: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
  },
  {
    id: 'matic-network',
    symbol: 'MATIC',
    name: 'Polygon',
    price: 0.85,
    change24h: 1.25,
    volume: 3200000000,
    marketCap: 8500000000,
    sparkline: [0.82, 0.83, 0.84, 0.86, 0.87, 0.85, 0.84, 0.85, 0.86, 0.85]
  }
];

export async function fetchMarketData(): Promise<MarketItem[]> {
  const ids = 'bitcoin,ethereum,solana,chainlink,usd-coin,matic-network';
  const coingeckoUrl = process.env.NEXT_PUBLIC_COINGECKO_API || 'https://api.coingecko.com/api/v3';

  try {
    const response = await fetch(
      `${coingeckoUrl}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=8&page=1&sparkline=true&price_change_percentage=24h`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as Array<{
      id: string;
      symbol: string;
      name: string;
      current_price: number;
      price_change_percentage_24h: number | null;
      total_volume: number | null;
      market_cap: number | null;
      sparkline_in_7d?: { price?: number[] };
    }>;

    if (!Array.isArray(payload) || payload.length === 0) {
      console.warn('CoinGecko returned empty data, using fallback');
      return fallbackData;
    }

    return payload.map((coin) => ({
      id: coin.id,
      symbol: (coin.symbol || '').toUpperCase(),
      name: coin.name,
      price: Number(coin.current_price ?? 0),
      change24h: Number(coin.price_change_percentage_24h ?? 0),
      volume: Number(coin.total_volume ?? 0),
      marketCap: Number(coin.market_cap ?? 0),
      sparkline: Array.isArray(coin.sparkline_in_7d?.price)
        ? coin.sparkline_in_7d.price.slice(-12).map((point) => Number(point))
        : [1, 2, 3, 4, 5]
    }));
  } catch (error) {
    console.error('Market data fetch failed:', error);
    return fallbackData;
  }
}
