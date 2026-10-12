import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web3 Crypto Exchange',
  description: 'Live crypto market dashboard and Web3 exchange starter'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
