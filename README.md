# Web3 Wallet Monitor MVP

A read-only EVM wallet and market-data dashboard for Ethereum Mainnet, Base Mainnet and BNB Smart Chain. It includes public wallet balances, CoinGecko Wallet Intelligence (holdings, trades, transfers and PnL), CoinGecko market prices, GeckoTerminal trending pools, and BNB Chain on-chain DEX analytics. This MVP does not connect to wallets, sign transactions, or move funds.

## Setup on Chromebook Linux

1. Install Node.js 20 or later and Git.
2. Clone the repository and switch to the feature branch:
   ```bash
   git clone https://github.com/bperry080-maker/web3-crypto-exchange.git
   cd web3-crypto-exchange
   git switch feature/coingecko-wallet-intelligence
   npm install
   ```
3. Create a local environment file for the Next.js app:
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```
4. Edit `apps/web/.env.local` and add your own HTTPS RPC endpoint URLs and CoinGecko keys. Wallet Intelligence requires a CoinGecko Pro API key on the Analyst plan or higher. Keep all keys server-side.
5. Run the frontend:
   ```bash
   npm run dev:web
   ```
6. Open `http://localhost:3000`, enter a public EVM address and generate the report.

## Server-side environment variables

Configure these in `apps/web/.env.local` for local testing and in Netlify site environment variables for deployment:

- `ETHEREUM_RPC_URL`: HTTPS Ethereum Mainnet JSON-RPC endpoint.
- `BASE_RPC_URL`: HTTPS Base Mainnet JSON-RPC endpoint.
- `BNB_RPC_URL`: HTTPS BNB Smart Chain JSON-RPC endpoint.
- `ETHEREUM_TOKENS`, `BASE_TOKENS`, `BNB_TOKENS`: optional comma-separated, server-approved token entries in `contractAddress:SYMBOL:DECIMALS` format.
- `COINGECKO_DEMO_API_KEY`: optional key for supported market-data features.
- `COINGECKO_PRO_API_KEY`: server-side Pro key used for market data and Wallet Intelligence. Wallet endpoints require the Analyst plan or higher. A Demo key alone does not enable wallet balances, trades, transfers or PnL.

Never prefix RPC variables or API keys with `NEXT_PUBLIC_`. Never commit `.env.local` or API keys. Rotate any key accidentally committed to Git history.

## What the dashboard provides

- Checks the configured RPC chain ID before querying public wallet balances.
- Reads native coin quantities with `eth_getBalance`.
- Reads optional ERC-20 quantities only for server-configured token contracts.
- Wallet Intelligence: multi-network token holdings and USD values from CoinGecko.
- Wallet Intelligence: realized and unrealized PnL by network and token.
- Wallet Intelligence: recent swaps and inbound/outbound transfers for Ethereum (`eth`), Base (`base`) and BNB Smart Chain (`bsc`).
- Shows CoinGecko spot market prices for BTC, ETH, LINK and USDT when available.
- Shows global GeckoTerminal trending pools and BNB Smart Chain trending pools from CoinGecko's on-chain DEX API.

Wallet Intelligence is read-only and accepts a public EVM address only. The server makes up to eight activity requests plus balances and PnL per lookup. It fetches the first page only (up to 50 trades and 50 transfers per network); it does not currently provide cursor pagination, durable history, or account authentication. Add server-side rate limiting, access controls and usage monitoring before exposing the endpoint publicly. Third-party PnL and USD values are estimates and may be incomplete.

Market and pool metrics are third-party data and may be delayed, incomplete, unavailable on some API plans, or subject to upstream rate limits. A displayed pool reserve is not a guarantee that liquidity can be withdrawn at the displayed value.

## Current limitations and launch checklist

This MVP does not execute payments, sign transactions, or provide an audited valuation or tax report. Before public launch, run a production build, test each RPC against the official chain ID, compare balances with an independent explorer, confirm CoinGecko plan access, add request throttling and usage monitoring, set provider billing alerts, and publish privacy and service terms. This MVP is a technical demonstration, not an audited financial service.
