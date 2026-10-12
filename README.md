# Web3 Crypto Exchange

A complete Web3 cryptocurrency exchange dashboard with wallet connection, live market data, and real on-chain swap functionality.

## Features

- 🔗 **Real Wallet Connection**: RainbowKit + wagmi + viem integration
- 📊 **Live Market Data**: Real-time crypto prices from CoinGecko (updates every 15s)
- 💱 **On-Chain Swaps**: Real Ethereum mainnet swaps via 0x API
- 🪙 **Token Support**: USDC, BTC, ETH, LINK, SOL, MATIC
- ⛓️ **Multi-Chain**: Ethereum, Polygon, BNB, Optimism, Arbitrum, Base
- 💰 **Portfolio Tracking**: Connected wallet balance and asset monitoring
- 📈 **Trading Charts**: Price sparklines and market overview
- ✅ **Smart Approvals**: Auto-detect when token approval is needed

## Quick Start

### 1. Get Environment Keys

**WalletConnect Project ID** (required for wallet connection):
- Go to https://cloud.walletconnect.com
- Create a new project
- Copy your Project ID

### 2. Setup Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your keys:

```env
# Required
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Optional (defaults to public RPC endpoints)
NEXT_PUBLIC_MAINNET_RPC_URL=https://eth.llamarpc.com
NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-rpc.com
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed.binance.org
NEXT_PUBLIC_OPTIMISM_RPC_URL=https://mainnet.optimism.io
NEXT_PUBLIC_ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
```

### 3. Install & Run

```bash
# Install dependencies
npm install

# Start both backend and frontend
npm run dev
```

### 4. Open the App

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api/health

## How to Use

### Connect Your Wallet

1. Click **Connect Wallet** in the top-right corner
2. Choose your wallet (MetaMask, WalletConnect, Coinbase, etc.)
3. Approve the connection in your wallet
4. Your balance and chain are now displayed

### Execute a Swap

1. Wallet must be connected to Ethereum Mainnet
2. Select "From" token (e.g., ETH)
3. Select "To" token (e.g., USDC)
4. Enter amount
5. Wait for live quote (updates every 10 seconds)
6. If needed, click "Approve token" first
7. Click "Swap now" to execute
8. Sign transaction in your wallet
9. Done! Transaction hash displayed on success

### View Markets

- See top 6 cryptocurrencies by market cap
- Live price updates every 15 seconds
- 24-hour price change indicators
- Market volume and market cap
- Sparkline charts showing price history

## Supported Tokens

| Token | Chain | Address |
|-------|-------|----------|
| ETH | Mainnet | 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 |
| USDC | Mainnet | 0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 |
| BTC | Mainnet | 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599 |
| LINK | Mainnet | 0x514910771AF9Ca656af840dff83E8264EcF986CA |
| SOL | Mainnet | 0xD31a59c85AE9D8edEFeC411D448f90841571b89c |
| MATIC | Mainnet | 0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0 |

## Tech Stack

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Wallet**: RainbowKit + wagmi + viem
- **Swaps**: 0x API for real on-chain quotes and execution
- **Market Data**: CoinGecko API for live prices
- **Styling**: Custom CSS with dark theme
- **Backend**: Node.js + Express (for real-time updates)

## API Integrations

### CoinGecko (Market Data)
- Free tier, no API key required
- Updates every 15 seconds
- Real-time prices, volume, market cap

### 0x API (Swap Quotes)
- Free tier, no API key required
- Real swap quotes via 0x protocol
- Multi-chain support: Ethereum, Polygon, BSC, Optimism, Arbitrum, Base
- Automatic routing through best price aggregators

## Transaction Flow

1. **Quote Fetch**: User selects tokens and amount
   - App fetches quote from 0x API
   - Quote updates live every 10 seconds

2. **Allowance Check**: For ERC-20 tokens
   - App checks current allowance
   - If insufficient, "Approve" button appears

3. **Token Approval** (if needed)
   - User clicks "Approve"
   - Signs approval transaction
   - Waits for confirmation

4. **Swap Execution**
   - User clicks "Swap now"
   - Wallet prompts to sign swap transaction
   - Transaction submitted to 0x router
   - User receives confirmation and tx hash

## Important Notes

### Mainnet Only (For Now)
- This app currently swaps on **Ethereum Mainnet**
- Real ETH/USDC/tokens will be sent
- Always test with small amounts first
- Gas fees apply to all transactions

### Gas Fees
- Approval transaction: ~50,000 gas
- Swap transaction: ~200,000 gas
- Gas price depends on network congestion
- Current rates shown before signing

### Testing
- For safe testing, use a testnet instead
- Request testnet tokens from faucets
- Deploy on Sepolia (testnet) first

## Troubleshooting

### "Failed to connect wallet"
- Ensure WalletConnect Project ID is set in `.env.local`
- Check that your wallet extension is installed
- Try refreshing the page

### "Quote not loading"
- Check network connection
- Ensure you're on Ethereum Mainnet
- 0x API might be rate-limited; wait a few seconds
- Check browser console for errors

### "Approval failed"
- Insufficient gas for approval
- Token already approved (unusual)
- Network error or wallet rejected

### "Swap failed"
- Insufficient balance or allowance
- Slippage too high
- Network congestion
- Wallet rejected transaction

## Next Steps

- [ ] Add testnet support (Sepolia)
- [ ] Implement token search
- [ ] Add transaction history
- [ ] Deploy to production
- [ ] Add more chains (Polygon, BSC, etc.)
- [ ] Portfolio analytics and charts
- [ ] Price alerts
- [ ] Mobile app version

## License

MIT

## Support

For issues or questions:
1. Check browser console for errors
2. Verify environment variables are set
3. Ensure wallet is on Ethereum Mainnet
4. Test with small amounts first
