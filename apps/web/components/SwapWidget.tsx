'use client';

import { useEffect, useMemo, useState } from 'react';
import { type Address, maxUint256, parseUnits } from 'viem';
import { useAccount, useChainId, useReadContract, useSendTransaction, useWriteContract } from 'wagmi';
import { TOKEN_METADATA, fetchSwapQuote, type TokenKey } from '../lib/swap';

const erc20Abi = [
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
    outputs: [{ type: 'uint256' }]
  },
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ type: 'bool' }]
  }
] as const;

const TOKEN_KEYS: TokenKey[] = ['ETH', 'BTC', 'SOL', 'USDC', 'LINK', 'MATIC'];

export function SwapWidget() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();

  const [fromToken, setFromToken] = useState<TokenKey>('ETH');
  const [toToken, setToToken] = useState<TokenKey>('USDC');
  const [fromAmount, setFromAmount] = useState('1.5');
  const [quote, setQuote] = useState<Awaited<ReturnType<typeof fetchSwapQuote>> | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!isConnected || !address || !fromAmount || Number(fromAmount) <= 0) {
        setQuote(null);
        return;
      }

      try {
        setLoadingQuote(true);
        setQuoteError(null);
        const nextQuote = await fetchSwapQuote({
          chainId,
          sellToken: fromToken,
          buyToken: toToken,
          sellAmount: parseUnits(fromAmount, TOKEN_METADATA[fromToken].decimals).toString()
        });
        setQuote(nextQuote);
      } catch (error) {
        console.error('Quote fetch failed', error);
        setQuoteError(error instanceof Error ? error.message : 'Unable to fetch quote');
        setQuote(null);
      } finally {
        setLoadingQuote(false);
      }
    };

    run();
  }, [address, chainId, fromAmount, fromToken, isConnected, toToken]);

  const sellTokenAddress = TOKEN_METADATA[fromToken].address[chainId as keyof typeof TOKEN_METADATA[typeof fromToken]['address']];
  const allowanceTarget = quote?.allowanceTarget;

  const allowanceQuery = useReadContract({
    address: sellTokenAddress as Address,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address as Address, allowanceTarget as Address],
    query: {
      enabled: Boolean(address && allowanceTarget && sellTokenAddress)
    }
  });

  const allowance = allowanceQuery.data ? BigInt(String(allowanceQuery.data)) : 0n;
  const needsApproval = Boolean(
    quote &&
      address &&
      allowanceTarget &&
      sellTokenAddress &&
      BigInt(quote.sellAmount) > allowance
  );

  const computedToAmount = useMemo(() => {
    if (!quote) return 0;
    return Number(quote.buyAmount) / 10 ** TOKEN_METADATA[toToken].decimals;
  }, [quote, toToken]);

  const handleSwap = async () => {
    if (!isConnected || !address || !quote) {
      alert('Please connect your wallet and wait for a valid quote.');
      return;
    }

    try {
      setSubmitting(true);

      if (needsApproval && quote.allowanceTarget && sellTokenAddress) {
        await writeContractAsync({
          address: sellTokenAddress,
          abi: erc20Abi,
          functionName: 'approve',
          args: [quote.allowanceTarget, maxUint256]
        });
      }

      await sendTransactionAsync({
        to: quote.to,
        data: quote.data,
        value: quote.value ? BigInt(quote.value) : undefined
      });

      alert(`Swap submitted successfully. Received approximately ${computedToAmount.toFixed(4)} ${toToken}.`);
    } catch (error) {
      console.error('Swap execution failed:', error);
      alert(error instanceof Error ? error.message : 'Swap failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside className="panel swap-panel">
      <div className="panel-header">
        <span>Swap</span>
        <span className="muted">{isConnected ? 'On-chain ready' : 'Connect wallet'}</span>
      </div>

      <div className="swap-box">
        <label>From</label>
        <div className="swap-line">
          <div>
            <select value={fromToken} onChange={(event) => setFromToken(event.target.value as TokenKey)} disabled={!isConnected}>
              {TOKEN_KEYS.map((token) => (
                <option key={token} value={token}>
                  {token}
                </option>
              ))}
            </select>
            <div className="token-sub">{TOKEN_METADATA[fromToken].name}</div>
          </div>
          <input type="number" value={fromAmount} onChange={(event) => setFromAmount(event.target.value)} placeholder="0.0" disabled={!isConnected} step="0.01" min="0" />
        </div>
      </div>

      <div className="swap-divider">⇅</div>

      <div className="swap-box">
        <label>To</label>
        <div className="swap-line">
          <div>
            <select value={toToken} onChange={(event) => setToToken(event.target.value as TokenKey)} disabled={!isConnected}>
              {TOKEN_KEYS.map((token) => (
                <option key={token} value={token}>
                  {token}
                </option>
              ))}
            </select>
            <div className="token-sub">{TOKEN_METADATA[toToken].name}</div>
          </div>
          <input value={quote ? (computedToAmount || 0).toFixed(toToken === 'USDC' ? 2 : 4) : '0.00'} readOnly placeholder="0.0" />
        </div>
      </div>

      <div className="swap-stats">
        <div>
          <span>Rate</span>
          <strong>
            {quote ? `1 ${fromToken} = ${(Number(quote.buyAmount) / Number(quote.sellAmount || 1)) * 10 ** TOKEN_METADATA[fromToken].decimals / 10 ** TOKEN_METADATA[toToken].decimals}`.slice(0, 12)} ${toToken}` : 'Waiting...'}
          </strong>
        </div>
        <div>
          <span>Network fee</span>
          <strong>~$6.20</strong>
        </div>
        {quote && (
          <div>
            <span>Allowance</span>
            <strong>{needsApproval ? 'Approval required' : 'Sufficient'}</strong>
          </div>
        )}
      </div>

      {quoteError && <div className="error-banner">{quoteError}</div>}

      <button className="primary-button" onClick={handleSwap} disabled={!isConnected || !quote || loadingQuote || submitting || !fromAmount}>
        {submitting ? 'Submitting...' : loadingQuote ? 'Loading quote...' : needsApproval ? 'Approve & swap' : 'Review swap'}
      </button>
    </aside>
  );
}
