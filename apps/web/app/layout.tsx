import './globals.css';
import type { Metadata } from 'next';
import Web3Providers from '../components/Web3Providers';

export const metadata: Metadata = {
  title: 'Wallet Monitor | Web3 Crypto Exchange',
  description: 'Wallet connection and read-only EVM wallet balance reports for Ethereum, Base, BNB Chain and Sepolia.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Web3Providers>{children}</Web3Providers>
      </body>
    </html>
  );
}
