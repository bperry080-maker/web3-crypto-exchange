'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { base, bsc, mainnet, sepolia } from 'wagmi/chains';

export const supportedChains = [mainnet, base, bsc, sepolia] as const;

export const wagmiConfig = getDefaultConfig({
  appName: 'Chainlink Wallet Monitor',
  // Replace this placeholder with a WalletConnect project ID for QR/deep-link connections.
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
    'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: supportedChains,
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [bsc.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
});
