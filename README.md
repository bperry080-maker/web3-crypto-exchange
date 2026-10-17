# Web3 Wallet Monitor MVP

A read-only EVM native-balance report for Ethereum Mainnet, Base Mainnet and BNB Smart Chain. This MVP does not connect to wallets, sign transactions, or move funds.

## Setup on Chromebook Linux

1. Install Node.js 20 or later and Git.
2. Clone the repository and switch to the MVP branch:
   ```bash
   git clone https://github.com/bperry080-maker/web3-crypto-exchange.git
   cd web3-crypto-exchange
   git switch wallet-monitoring-mvp
   npm install
   ```
3. Create a local environment file for the Next.js app:
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```
4. Edit `apps/web/.env.local` and add your own HTTPS RPC endpoint URLs. Use provider dashboard secrets, not URLs copied into source code.
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

Example token format only (not a recommended contract): `0x0000000000000000000000000000000000000000:EXAMPLE:18`. Do not use the zero address as a real token. Independently verify each contract on the correct chain before allowlisting it. The endpoint accepts at most 20 configured token entries per network.

Never prefix RPC variables with `NEXT_PUBLIC_`. Never commit `.env.local` or API keys. Rotate any key accidentally committed to Git history.

## What the report verifies

- It checks the configured RPC's chain ID before querying balances.
- Native coin quantities come from `eth_getBalance`.
- Optional ERC-20 quantities come from `eth_call` to the standard `balanceOf(address)` method for only the server-configured contracts.
- The response labels unconfigured or failed network queries instead of silently treating them as zero.
- This MVP does not calculate USD valuations, discover every token automatically, authenticate customers, save reports, or provide abuse protection/rate limiting.

## Before selling or launching publicly

Run a production build, test each RPC against the official chain ID, compare results with an independent explorer, add request throttling and usage monitoring, set provider billing alerts, and publish privacy and service terms. This MVP is a technical demonstration, not an audited financial service.
