# Mainnet quote preview configuration

This project is configured for Netlify deployment as a Next.js workspace. The new endpoint at `POST /api/swap/quote` requests an Ethereum Mainnet quote from the official Uniswap Trading API.

## Netlify build settings

The repository-root `netlify.toml` uses:

- Build command: `npm run build:web`
- Publish directory: `apps/web/.next`
- Next.js adapter: `@netlify/plugin-nextjs`

Connect the GitHub repository `bperry080-maker/web3-crypto-exchange` in Netlify and deploy branch `mainnet-netlify-foundation` for review before merging.

## Required server-side environment variables

Set these in Netlify site settings under Environment variables. Do not add real values to Git or browser code.

- `UNISWAP_API_KEY`: API key issued by Uniswap for its Trading API.
- `SWAP_ALLOWED_TOKENS`: comma-separated list of token contract addresses that have been independently verified for Ethereum Mainnet (chain ID 1). Only addresses listed here are accepted by the quote endpoint.

Do not use token symbols as a substitute for contract-address verification. Start with the smallest allowlist possible. Never put a secret in a `NEXT_PUBLIC_*` variable.

## Current safety boundary

The quote endpoint is preview-only. It validates address syntax, limits tokens to the server-side allowlist, hard-codes both chain IDs to Ethereum Mainnet (1), uses exact-input quotes and a fixed 0.5% slippage setting, and does not return transaction calldata. It does not submit transactions, approve tokens, or move funds.

Before enabling execution, implement and independently review the full quote → approval check → quote/order/swap flow described in the official Uniswap integration guide. The browser must check the wallet's chain ID is 1 and show the recipient, token addresses, input amount, minimum output, slippage, route and gas estimate before asking the wallet to sign. Never trust a quote alone as a guarantee of execution.

## Important project status

The existing market backend contains simulated prices and simulated updates. Do not present that feed as live market data in production. Replace it with a real market-data provider and clearly identify source and update time before launch.

## Official references

- Uniswap Trading API integration guide: https://developers.uniswap.org/docs/trading/swapping-api/start-building/integration-guide
- Uniswap supported chains and router versions: https://developers.uniswap.org/docs/trading/swapping-api/supported-chains
- Netlify Next.js guide: https://docs.netlify.com/frameworks/next-js/overview/
