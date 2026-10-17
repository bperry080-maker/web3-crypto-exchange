import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wallet Monitor | Web3 Crypto Exchange',
  description: 'Read-only EVM wallet balance reports for Ethereum, Base and BNB Chain.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}