# Web3 Crypto Exchange Starter

A full-stack starter for a crypto market dashboard and Web3 trading experience. It includes:

- Next.js frontend dashboard for crypto prices and charts
- Express + WebSocket backend for live market data streaming
- Wallet panel and exchange UI shell
- Real-time market snapshots and token cards

## Stack

- Frontend: Next.js, React, TypeScript, Tailwind-inspired CSS
- Backend: Node.js, Express, WebSocket
- Data: simulated live market feed for local development

## Repositories included

- `apps/web` – dashboard frontend
- `apps/server` – real-time market data API + socket stream

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Start the backend and frontend in development mode:

```bash
npm run dev
```

This runs:

- frontend at http://localhost:3000
- backend API at http://localhost:4000
- WebSocket stream at ws://localhost:4000

## API endpoints

- `GET /api/health`
- `GET /api/market`

## Notes

This starter uses simulated live market data so you can build and test the experience locally without external API keys. You can replace the mock stream with Coinbase, Binance, CoinGecko, or Chainlink data as your product grows.
