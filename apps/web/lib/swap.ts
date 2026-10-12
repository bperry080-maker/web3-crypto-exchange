export type TokenKey = 'ETH' | 'BTC' | 'SOL' | 'USDC' | 'LINK' | 'MATIC';

export const TOKEN_METADATA: Record<
  TokenKey,
  { name: string; symbol: string; decimals: number; address: Record<number, `0x${string}`> }
> = {
  ETH: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    address: {
      1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // Mainnet WETH
      8453: '0x4200000000000000000000000000000000000006',
      137: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      56: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
      10: '0x4200000000000000000000000000000000000006',
      42161: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
    }
  },
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    address: {
      1: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // Mainnet USDC
      137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      56: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      10: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
    }
  },
  BTC: {
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 8,
    address: {
      1: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // Mainnet WBTC
      137: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
      56: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
      8453: '0x0A2d31EA0cd3ACD82717bD727316Fbe5f86fa8dF',
      10: '0x0c0EcF0f14e3F3dfA82f36025b30Ab9DF3c7CFc0',
      42161: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f'
    }
  },
  LINK: {
    name: 'Chainlink',
    symbol: 'LINK',
    decimals: 18,
    address: {
      1: '0x514910771AF9Ca656af840dff83E8264EcF986CA', // Mainnet LINK
      137: '0x53E0bca35eC356BD0D4bE6B8D8F4B91C5d0b8Bf5',
      56: '0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD',
      8453: '0x88AeD9fD2aE90A88bfdb0c8704F3d0Dae1aB9FC9',
      10: '0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6',
      42161: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4'
    }
  },
  SOL: {
    name: 'Solana',
    symbol: 'SOL',
    decimals: 9,
    address: {
      1: '0xD31a59c85AE9D8edEFeC411D448f90841571b89c', // Mainnet
      137: '0x0fA2a0AdA12eF5dE9Bb4d3D3A3D0F95eD4A60d17',
      56: '0x570A5D26f7765Ecb712C0924E4De545B89fD43dF',
      8453: '0x8A0dB88fF5Fe2AF3D9a6F4a6bC382D7A8c4D9f66',
      10: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
      42161: '0x23ee2343B5f7bB3A5F9bA7dFf8477C53BcfD2d2e'
    }
  },
  MATIC: {
    name: 'Polygon',
    symbol: 'MATIC',
    decimals: 18,
    address: {
      1: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', // Mainnet MATIC
      137: '0x0000000000000000000000000000000000001010',
      56: '0xcc42724c6683b7e57334c4e856f4f2edb1a4e72d',
      8453: '0x7e8B6d2f3B9f2dA7A5BaD9Cdb0AfeFf1dB4a42a7',
      10: '0x4A13a24B90d3Fe781Fd02a9D9D4Ba9A2dA1fBCfE',
      42161: '0x4A13a24B90d3Fe781Fd02a9D9D4Ba9A2dA1fBCfE'
    }
  }
};

export type QuoteResponse = {
  sellAmount: string;
  buyAmount: string;
  allowanceTarget: `0x${string}`;
  data: `0x${string}`;
  to: `0x${string}`;
  value: string;
  sellTokenAddress: `0x${string}`;
  buyTokenAddress: `0x${string}`;
  price: string;
  estimatedGas?: string;
};

export async function fetchSwapQuote({
  chainId,
  sellToken,
  buyToken,
  sellAmount
}: {
  chainId: number;
  sellToken: TokenKey;
  buyToken: TokenKey;
  sellAmount: string;
}): Promise<QuoteResponse | null> {
  if (sellToken === buyToken || !sellAmount || Number(sellAmount) <= 0) {
    return null;
  }

  const sellTokenAddress = TOKEN_METADATA[sellToken].address[
    chainId as keyof typeof TOKEN_METADATA[typeof sellToken]['address']
  ];
  const buyTokenAddress = TOKEN_METADATA[buyToken].address[
    chainId as keyof typeof TOKEN_METADATA[typeof buyToken]['address']
  ];

  if (!sellTokenAddress || !buyTokenAddress) {
    console.warn(`Token not available on chain ${chainId}`);
    return null;
  }

  const baseUrl = process.env.NEXT_PUBLIC_0X_API_URL || 'https://api.0x.org';

  const chainPath =
    chainId === 8453
      ? '/base'
      : chainId === 137
        ? '/polygon'
        : chainId === 56
          ? '/bsc'
          : chainId === 10
            ? '/optimism'
            : chainId === 42161
              ? '/arbitrum'
              : ''; // Mainnet

  const params = new URLSearchParams({
    chainId: String(chainId),
    sellToken: sellTokenAddress,
    buyToken: buyTokenAddress,
    sellAmount,
    slippagePercentage: '0.5'
  });

  try {
    const url = `${baseUrl}${chainPath}/swap/v1/quote?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.text();
      console.error(`0x API error: ${response.status}`, error);
      throw new Error(`Quote request failed: ${response.statusText}`);
    }

    const json = (await response.json()) as unknown;
    const quote = json as Record<string, unknown>;

    if (!quote.to || !quote.data) {
      throw new Error('Invalid quote response from 0x API');
    }

    return {
      sellAmount: String(quote.sellAmount || sellAmount),
      buyAmount: String(quote.buyAmount || '0'),
      allowanceTarget: String(quote.allowanceTarget) as `0x${string}`,
      data: String(quote.data) as `0x${string}`,
      to: String(quote.to) as `0x${string}`,
      value: String(quote.value || '0'),
      sellTokenAddress,
      buyTokenAddress,
      price: String(quote.price || '0'),
      estimatedGas: String(quote.estimatedGas || '')
    };
  } catch (error) {
    console.error('Failed to fetch swap quote:', error);
    throw error;
  }
}
