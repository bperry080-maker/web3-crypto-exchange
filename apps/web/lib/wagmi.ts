import { http, createConfig } from 'wagmi';
import { mainnet, polygon, bsc, optimism, arbitrum, base } from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-walletconnect-project-id';

const getRpcUrl = (chain: string): string => {
  switch (chain) {
    case 'mainnet':
      return process.env.NEXT_PUBLIC_MAINNET_RPC_URL || 'https://eth.llamarpc.com';
    case 'polygon':
      return process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://polygon-rpc.com';
    case 'bsc':
      return process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-dataseed.binance.org';
    case 'optimism':
      return process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL || 'https://mainnet.optimism.io';
    case 'arbitrum':
      return process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc';
    case 'base':
      return process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org';
    default:
      return 'https://eth.llamarpc.com';
  }
};

export const config = createConfig({
  chains: [mainnet, polygon, bsc, optimism, arbitrum, base],
  transports: {
    [mainnet.id]: http(getRpcUrl('mainnet')),
    [polygon.id]: http(getRpcUrl('polygon')),
    [bsc.id]: http(getRpcUrl('bsc')),
    [optimism.id]: http(getRpcUrl('optimism')),
    [arbitrum.id]: http(getRpcUrl('arbitrum')),
    [base.id]: http(getRpcUrl('base'))
  },
  ssr: true,
  batch: { multicall: true }
});

export const walletConnectProjectId = projectId;
