'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function WalletConnectButton() {
  return <ConnectButton chainStatus="icon" showBalance={false} accountStatus="address" />;
}
