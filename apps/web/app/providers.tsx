import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, http } from 'wagmi';
import { mainnet, polygon, arbitrum, base, optimism, bsc } from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

if (!projectId && typeof window !== 'undefined') {
  console.warn(
    'WalletConnect Project ID not found. Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in .env.local. ' +
      'Get one at https://cloud.walletconnect.com'
  );
}

const config = getDefaultConfig({
  appName: 'Web3 Crypto Exchange',
  projectId: projectId || 'demo-walletconnect-project-id',
  chains: [mainnet, polygon, bsc, optimism, arbitrum, base],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http()
  },
  ssr: true
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
