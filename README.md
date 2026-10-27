# Web3 Wallet Monitor MVP

A read-only EVM wallet monitor for Ethereum Mainnet, Base Mainnet and BNB Smart Chain. It provides a direct RPC report for native coins and server-allowlisted ERC-20 tokens, plus an optional CoinGecko multi-network token-balance report with estimated USD values. It does not connect to wallets, sign transactions, or move funds.

## Setup on Chromebook Linux

1. Install Node.js 20 or later and Git.
2. Clone the repository and switch to the integration branch:
   ```bash
   git clone https://github.com/bperry080-maker/web3-crypto-exchange.git
   cd web3-crypto-exchange
   git switch feature/coingecko-wallet-balances
   npm install
   ```
3. Create a local environment file:
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```
4. Edit `apps/web/.env.local` and add your server-side HTTPS RPC endpoint URLs. To enable the CoinGecko report, add your CoinGecko Pro API key as `COINGECKO_API_KEY`. Do not put the key in browser code or a `NEXT_PUBLIC_*` variable.
5. Run the frontend:
   ```bash
   npm run dev:web
   ```
6. Open `http://localhost:3000`, enter a public EVM address, and choose either report button.

## Server-side environment variables

Configure these in `apps/web/.env.local` for local testing and in Netlify site environment variables for deployment:

- `ETHEREUM_RPC_URL`: HTTPS Ethereum Mainnet JSON-RPC endpoint.
- `BASE_RPC_URL`: HTTPS Base Mainnet JSON-RPC endpoint.
- `BNB_RPC_URL`: HTTPS BNB Smart Chain JSON-RPC endpoint.
- `COINGECKO_API_KEY`: CoinGecko Pro API key used only by the server-side wallet-balance route. Confirm your plan includes this endpoint.
- `ETHEREUM_TOKENS`, `BASE_TOKENS`, `BNB_TOKENS`: optional comma-separated, server-approved token entries in `contractAddress:SYMBOL:DECIMALS` format.

Example token format only (not a recommended contract): `0x0000000000000000000000000000000000000000:EXAMPLE:18`. Do not use the zero address as a real token. Independently verify each contract on the correct chain before allowlisting it. The RPC endpoint accepts at most 20 configured token entries per network.

Never prefix secrets with `NEXT_PUBLIC_`. Never commit `.env.local` or API keys. Rotate any key accidentally committed to Git history.

## Reports

### Direct RPC report

- Checks each configured RPC's chain ID before querying balances.
- Native coin quantities come from `eth_getBalance`.
- Optional ERC-20 quantities come from `eth_call` to `balanceOf(address)` for only server-configured token contracts.
- Labels unconfigured or failed network queries instead of silently treating them as zero.
- Does not calculate USD valuations.

### CoinGecko wallet balances

- The UI calls the server-side route `/api/wallet-balances`; the API key never goes to the browser.
- Queries CoinGecko's `/onchain/wallets/{address}/balances` endpoint for Ethereum (`eth`), Base (`base`) and BNB Chain (`bsc`) by default.
- Displays reported quantities, USD price/value estimates, token type, network and raw balance.
- The current UI requests page 1 with up to 100 holdings. Use pagination for larger portfolios.
- CoinGecko's coverage and pricing depend on its supported networks, token resolution and API plan. Values are estimates, not guaranteed sale proceeds or withdrawal balances. This endpoint does not prove ownership.
- The extra `netlify/functions/wallet-balances.mjs` function is also available for Netlify Functions-style invocation; the Next.js UI uses the `/api/wallet-balances` route.

## Before public launch

Run a production build and test each configured RPC against its official chain ID. Test CoinGecko using a valid server key and compare sample results with an independent explorer. Add request throttling and usage monitoring, set provider billing alerts, and publish privacy and service terms. This MVP is a technical demonstration, not an audited financial service.
