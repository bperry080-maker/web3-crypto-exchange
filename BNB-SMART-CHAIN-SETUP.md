# BNB Smart Chain Mainnet — safe setup

This change adds initial, read-only BNB Smart Chain configuration to the web app.

## Network values

- Network: BNB Smart Chain Mainnet
- Chain ID: `56` (hex: `0x38`)
- Native gas asset: BNB
- Explorer: https://bscscan.com
- Official public RPC reference: https://bsc-dataseed.bnbchain.org

Official network reference: https://docs.bnbchain.org/bnb-smart-chain/developers/wallet-configuration/

## Server-side RPC configuration

Configure a QuickNode BNB Smart Chain Mainnet endpoint in your hosting provider, then add this environment variable:

- `BNB_RPC_URL` — the private endpoint URL; server-side only.

Do not commit the endpoint URL to Git, expose it through a `NEXT_PUBLIC_*` variable, or paste it into public issues/screenshots.

## Read-only verification

After setting `BNB_RPC_URL`, visit:

`/api/network/bnb`

The route calls `eth_chainId` and reports success only when the endpoint returns `0x38`. It never returns the RPC URL and does not connect a wallet, sign transactions, submit swaps, or move funds.

## Current safety boundary

- This adds network metadata and an RPC verification endpoint only.
- It does not enable BNB swaps or wallet transaction execution.
- The existing `/api/swap/quote` endpoint is hard-coded for Ethereum Mainnet (chain ID 1) and uses Uniswap's Trading API. Do not send BNB Smart Chain token addresses to that endpoint.
- Before adding a BNB swap preview, choose and verify a provider that explicitly supports BNB Smart Chain, validate token contract addresses on chain ID 56, and return quote details only. Keep signing and execution disabled until separately reviewed and explicitly approved.
- BNB is required to pay gas for transactions on BNB Smart Chain.

No wallet or funds were accessed as part of this setup.
