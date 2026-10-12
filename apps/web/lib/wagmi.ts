import { http, createConfig } from 'wagmi';
import { mainnet, polygon, bsc, optimism, arbitrum, base } from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-walletconnect-project-id';

export const config = createConfig({
  chains: [mainnet, polygon, bsc, optimism, arbitrum, base],
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_MAINNET_RPC_URL || 'https://eth.llamarpc.com'),
    [polygon.id]: http(process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://polygon-rpc.com'),
    [bsc.id]: http(process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-dataseed.binance.org'),
    [optimism.id]: http(process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL || 'https://mainnet.optimism.io'),
    [arbitrum.id]: http(process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc'),
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org')
  },
  ssr: true,
  batch: { multicall: true }
});

export const walletConnectProjectId = projectId;
