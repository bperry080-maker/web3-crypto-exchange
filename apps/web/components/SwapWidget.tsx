'use client';

import { useMemo, useState } from 'react';
import { useAccount } from 'wagmi';

const TOKEN_PRICES = {
  ETH: 3428.9,
  BTC: 61240.27,
  SOL: 168.42,
  USDC: 1,
  LINK: 17.82,
  MATIC: 0.85
} as const;

const TOKEN_INFO = {
  ETH: { name: 'Ethereum', type: 'Layer 1' },
  BTC: { name: 'Bitcoin', type: 'Digital Asset' },
  SOL: { name: 'Solana', type: 'Layer 1' },
  USDC: { name: 'USD Coin', type: 'Stablecoin' },
  LINK: { name: 'Chainlink', type: 'Oracle' },
  MATIC: { name: 'Polygon', type: 'Layer 2' }
} as const;

type TokenKey = keyof typeof TOKEN_PRICES;

export function SwapWidget() {
  const { isConnected, address } = useAccount();
  const [fromToken, setFromToken] = useState<TokenKey>('ETH');
  const [toToken, setToToken] = useState<TokenKey>('USDC');
  const [fromAmount, setFromAmount] = useState('1.5');
  const [loading, setLoading] = useState(false);

  const computed = useMemo(() => {
    const parsed = Number(fromAmount || 0);
    if (!parsed || fromToken === toToken) {
      return { rate: 0, toAmount: 0, usdValue: 0, fee: 6.2 };
    }
    const numerator = TOKEN_PRICES[fromToken] * parsed;
    const rate = TOKEN_PRICES[fromToken] / TOKEN_PRICES[toToken];
    const toAmount = numerator / TOKEN_PRICES[toToken];
    return {
      rate: Number.isFinite(rate) ? rate : 0,
      toAmount: Number.isFinite(toAmount) ? toAmount : 0,
      usdValue: numerator,
      fee: 6.2
    };
  }, [fromAmount, fromToken, toToken]);

  const handleSwap = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      console.log('Swap initiated:', {
        from: fromToken,
        to: toToken,
        amount: fromAmount,
        wallet: address
      });
      // In production, this would call a real swap function
      alert(`Swap preview: ${fromAmount} ${fromToken} → ${computed.toAmount.toFixed(4)} ${toToken}`);
    } catch (error) {
      console.error('Swap error:', error);
      alert('Swap failed. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="panel swap-panel">
      <div className="panel-header">
        <span>Swap</span>
        <span className="muted">{isConnected ? 'Ready' : 'Connect wallet'}</span>
      </div>

      <div className="swap-box">
        <label>From</label>
        <div className="swap-line">
          <div>
            <select
              value={fromToken}
              onChange={(event) => setFromToken(event.target.value as TokenKey)}
              disabled={!isConnected}
            >
              {Object.entries(TOKEN_PRICES).map(([token]) => (
                <option key={token} value={token}>
                  {token}
                </option>
              ))}
            </select>
            <div className="token-sub">{TOKEN_INFO[fromToken].type}</div>
          </div>
          <input
            type="number"
            value={fromAmount}
            onChange={(event) => setFromAmount(event.target.value)}
            placeholder="0.0"
            disabled={!isConnected}
            step="0.01"
            min="0"
          />
        </div>
      </div>

      <div className="swap-divider">⇅</div>

      <div className="swap-box">
        <label>To</label>
        <div className="swap-line">
          <div>
            <select
              value={toToken}
              onChange={(event) => setToToken(event.target.value as TokenKey)}
              disabled={!isConnected}
            >
              {Object.entries(TOKEN_PRICES).map(([token]) => (
                <option key={token} value={token}>
                  {token}
                </option>
              ))}
            </select>
            <div className="token-sub">{TOKEN_INFO[toToken].type}</div>
          </div>
          <input value={computed.toAmount.toFixed(toToken === 'USDC' ? 2 : 4)} readOnly placeholder="0.0" />
        </div>
      </div>

      <div className="swap-stats">
        <div>
          <span>Rate</span>
          <strong>
            1 {fromToken} = {computed.rate.toFixed(2)} {toToken}
          </strong>
        </div>
        <div>
          <span>Network fee</span>
          <strong>~${computed.fee.toFixed(2)}</strong>
        </div>
        {computed.usdValue > 0 && (
          <div>
            <span>USD value</span>
            <strong>${computed.usdValue.toFixed(2)}</strong>
          </div>
        )}
      </div>

      <button className="primary-button" onClick={handleSwap} disabled={!isConnected || loading || !fromAmount}>
        {loading ? 'Processing...' : isConnected ? 'Review swap' : 'Connect wallet to swap'}
      </button>
    </aside>
  );
}
