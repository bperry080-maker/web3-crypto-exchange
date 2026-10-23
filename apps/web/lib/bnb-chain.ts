/**
 * BNB Smart Chain Mainnet metadata.
 * Keep RPC credentials server-side in BNB_RPC_URL; never use NEXT_PUBLIC_BNB_RPC_URL.
 */
export const bnbSmartChain = {
  id: 56,
  idHex: '0x38',
  name: 'BNB Smart Chain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  blockExplorerUrl: 'https://bscscan.com',
} as const;
