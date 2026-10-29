# Web3 Wallet Monitor MVP

A read-only EVM native-balance report for Ethereum Mainnet, Base Mainnet and BNB Smart Chain, plus optional protected Kraken exchange balance monitoring. This MVP does not connect to wallets, sign transactions, place orders, or move funds.

## Setup on Chromebook Linux

1. Install Node.js 20 or later and Git.
2. Clone the repository and switch to the Kraken integration branch:
   ```bash
   git clone https://github.com/bperry080-maker/web3-crypto-exchange.git
   cd web3-crypto-exchange
   git switch feature/kraken-readonly-monitor
   npm install
   ```
3. Create a local environment file for the Next.js app:
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```
4. Edit `apps/web/.env.local` and add your own HTTPS QuickNode RPC endpoint URLs and Kraken server-side credentials. Never paste credentials into chat or commit `.env.local`.
5. For Kraken, create a dedicated API key with **Query Funds** permission only. Do not enable trading or withdrawals. Set `KRAKEN_API_KEY`, `KRAKEN_API_SECRET`, and a separate random `KRAKEN_BALANCE_ACCESS_TOKEN` generated locally, for example with `openssl rand -hex 32`.
6. Run the frontend:
   ```bash
   npm run dev:web
   ```
7. Open `http://localhost:3000`, enter a public EVM address to generate the chain report, or enter your separately configured dashboard access token in the Kraken panel to request exchange balances.

## Server-side environment variables

Configure these in `apps/web/.env.local` for local testing and in Netlify site environment variables for deployment:

- `ETHEREUM_RPC_URL`: HTTPS Ethereum Mainnet JSON-RPC endpoint.
- `BASE_RPC_URL`: HTTPS Base Mainnet JSON-RPC endpoint.
- `BNB_RPC_URL`: HTTPS BNB Smart Chain JSON-RPC endpoint.
- `ETHEREUM_TOKENS`, `BASE_TOKENS`, `BNB_TOKENS`: optional comma-separated, server-approved token entries in `contractAddress:SYMBOL:DECIMALS` format.
- `KRAKEN_API_KEY`, `KRAKEN_API_SECRET`: dedicated Kraken API credentials for the private Balance endpoint. Keep them server-side and grant Query Funds only.
- `KRAKEN_BALANCE_ACCESS_TOKEN`: separate long random token that gates the dashboard's Kraken balance route. This is not your Kraken API secret; enter it only in the dashboard's password field.

Example token format only (not a recommended contract): `0x0000000000000000000000000000000000000000:EXAMPLE:18`. Do not use the zero address as a real token. Independently verify each contract on the correct chain before allowlisting it. The endpoint accepts at most 20 configured token entries per network.

Never prefix RPC variables or Kraken credentials with `NEXT_PUBLIC_`. Never commit `.env.local` or API keys. Revoke and replace any credential shared or committed accidentally.

## What the reports verify

- The EVM report checks each configured RPC's chain ID before querying balances.
- Native coin quantities come from `eth_getBalance`; optional ERC-20 quantities come from `eth_call` to `balanceOf(address)` for only server-configured contracts.
- The Kraken panel requests the authenticated Kraken private Balance endpoint using server-side HMAC signing and returns asset codes and quantities only.
- The Kraken route requires a separate dashboard access token. It never accepts Kraken API credentials from the browser.
- Unconfigured or failed network queries are labeled instead of silently treated as zero.
- USD valuations, automatic token discovery, customer account management, and full production rate limiting are not included.

## Before deploying publicly

The dashboard access token is a simple shared-secret gate, not full user authentication. Do not expose a public production deployment with this design unless you add proper user authentication, rate limiting, audit logging that excludes secrets, and a robust shared nonce strategy for Kraken API calls across server instances. Test the production build, verify each RPC against the official chain ID, compare results with an independent explorer, set provider usage alerts, and publish privacy and service terms. This MVP is a technical demonstration, not an audited financial service.
