# Web3 Crypto Exchange

A full-stack Web3 cryptocurrency exchange dashboard with wallet connection, live market data, and swap functionality.

## Features

- 🪙 **Live Market Data**: Real-time crypto prices from CoinGecko
- 💼 **Wallet Connection**: RainbowKit + wagmi + viem integration
- 📊 **Trading Dashboard**: Market overview, charts, and price tickers
- 🔄 **Swap Interface**: Token exchange with real-time quote calculation
- 💰 **Portfolio Tracking**: Connected wallet balance and asset monitoring
- 🌐 **Multi-chain**: Ethereum, Polygon, BNB Chain, Optimism, Arbitrum, Base

## Tech Stack

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Wallet**: RainbowKit + wagmi + viem
- **Data**: CoinGecko API for live market feeds
- **Styling**: Custom CSS with dark theme
- **Backend**: Node.js + Express (for real-time updates)

## Quick Start

### 1. Get a WalletConnect Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Sign up or log in
3. Create a new project
4. Copy your Project ID

### 2. Setup Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and add:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_from_step_1
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

1. Click the "Connect Wallet" button in the top-right
2. Select your wallet provider (MetaMask, Wallet Connect, etc.)
3. Approve the connection in your wallet
4. Your balance and address will display

### View Markets

- See top 8 cryptocurrencies by market cap
- Live price updates every 15 seconds
- 24-hour price change indicators
- Candlestick-style charts

### Execute a Swap

1. Connect your wallet first
2. Select "From" token (e.g., ETH)
3. Select "To" token (e.g., USDC)
4. Enter amount
5. Review the quote and network fee
6. Click "Review swap" to proceed

## API Endpoints

- `GET /api/health` - Server health check
- `GET /api/market` - Current market data
- `WS ws://localhost:4000` - Live market updates via WebSocket

## Environment Variables

```env
# Required: WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Optional: Alchemy API key for enhanced RPC
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
```

## Supported Chains

- Ethereum (Mainnet)
- Polygon
- BNB Chain
- Optimism
- Arbitrum
- Base

## Next Steps

- [ ] Integrate real swap quotes (Uniswap API or 0x)
- [ ] Add transaction history
- [ ] Implement token search/filter
- [ ] Add price alerts
- [ ] Deploy to production
- [ ] Add mobile support
- [ ] Implement portfolio analytics

## Project Structure

```
apps/
├── web/                 # Next.js frontend
│   ├── app/            # Pages and layout
│   ├── components/     # React components
│   ├── lib/           # Utilities and hooks
│   └── public/        # Static assets
└── server/            # Node.js backend
    └── src/           # Server code
```

## Troubleshooting

### "Failed to connect wallet"

- Ensure WalletConnect Project ID is set in `.env.local`
- Check that your wallet extension is installed
- Try refreshing the page

### "Market data not loading"

- Backend server might be down: check http://localhost:4000/api/health
- CoinGecko API might be rate-limited; wait a few seconds
- Check browser console for errors

### "Swap button disabled"

- Wallet must be connected first
- Ensure you have the required token balance
- Switch to a supported chain

## License

MIT
