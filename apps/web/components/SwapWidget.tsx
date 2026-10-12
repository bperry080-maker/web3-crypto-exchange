'use client';

import { useEffect, useMemo, useState } from 'react';
import { type Address, erc20Abi, maxUint256, parseUnits } from 'viem';
import { useAccount, useChainId, useReadContract, useSendTransaction, useWriteContract } from 'wagmi';
import { TOKEN_METADATA, fetchSwapQuote, type QuoteResponse, type TokenKey } from '../lib/swap';

const TOKEN_KEYS: TokenKey[] = ['ETH', 'USDC', 'BTC', 'LINK', 'SOL', 'MATIC'];

export function SwapWidget() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();

  const [fromToken, setFromToken] = useState<TokenKey>('ETH');
  const [toToken, setToToken] = useState<TokenKey>('USDC');
  const [fromAmount, setFromAmount] = useState('1');
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Fetch quote every 10 seconds for live updates
  useEffect(() => {
    if (!isConnected || !fromAmount || Number(fromAmount) <= 0 || fromToken === toToken) {
      setQuote(null);
      return;
    }

    const fetchQuote = async () => {
      try {
        setLoadingQuote(true);
        setQuoteError(null);
        const decimals = TOKEN_METADATA[fromToken].decimals;
        const sellAmount = parseUnits(fromAmount, decimals).toString();
        const nextQuote = await fetchSwapQuote({
          chainId,
          sellToken: fromToken,
          buyToken: toToken,
          sellAmount
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

    fetchQuote();
    const interval = setInterval(fetchQuote, 10000); // Refresh quote every 10 seconds
    return () => clearInterval(interval);
  }, [address, chainId, fromAmount, fromToken, isConnected, toToken]);

  const sellTokenAddress = TOKEN_METADATA[fromToken].address[
    chainId as keyof typeof TOKEN_METADATA[typeof fromToken]['address']
  ] as Address;
  const allowanceTarget = quote?.allowanceTarget as Address | undefined;

  const allowanceQuery = useReadContract({
    address: sellTokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address as Address, allowanceTarget as Address],
    query: {
      enabled: Boolean(address && allowanceTarget && sellTokenAddress && fromToken !== 'ETH')
    }
  });

  const allowance = allowanceQuery.data ? BigInt(String(allowanceQuery.data)) : 0n;
  const needsApproval = Boolean(
    quote &&
      fromToken !== 'ETH' &&
      address &&
      allowanceTarget &&
      sellTokenAddress &&
      BigInt(quote.sellAmount) > allowance
  );

  const computedToAmount = useMemo(() => {
    if (!quote) return 0;
    return Number(quote.buyAmount) / 10 ** TOKEN_METADATA[toToken].decimals;
  }, [quote, toToken]);

  const handleApprove = async () => {
    if (!sellTokenAddress || !allowanceTarget) return;

    try {
      setSubmitting(true);
      await writeContractAsync({
        address: sellTokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [allowanceTarget, maxUint256]
      });
      // Refetch allowance after approval
      allowanceQuery.refetch();
    } catch (error) {
      console.error('Approval failed:', error);
      alert(error instanceof Error ? error.message : 'Approval failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSwap = async () => {
    if (!isConnected || !address || !quote) {
      alert('Please connect your wallet and wait for a valid quote.');
      return;
    }

    try {
      setSubmitting(true);
      setTxHash(null);

      const tx = await sendTransactionAsync({
        to: quote.to,
        data: quote.data,
        value: quote.value ? BigInt(quote.value) : 0n
      });

      setTxHash(tx);
      alert(`✅ Swap submitted! Transaction: ${tx}\n\nReceived approximately ${computedToAmount.toFixed(4)} ${toToken}.`);
      setFromAmount('1');
    } catch (error) {
      console.error('Swap execution failed:', error);
      alert(error instanceof Error ? error.message : 'Swap failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const rate = useMemo(() => {
    if (!quote) return '0';
    const rateBN = (Number(quote.buyAmount) / Number(quote.sellAmount)) * 10 ** TOKEN_METADATA[fromToken].decimals / 10 ** TOKEN_METADATA[toToken].decimals;
    return rateBN.toFixed(6);
  }, [quote, fromToken, toToken]);

  return (
    <aside className="panel swap-panel">
      <div className="panel-header">
        <span>Swap</span>
        <span className="muted">Live • {isConnected ? 'Connected' : 'Disconnected'}</span>
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
          <strong>{loadingQuote ? 'Updating...' : `1 ${fromToken} = ${rate} ${toToken}`}</strong>
        </div>
        <div>
          <span>Network</span>
          <strong>{chainId === 1 ? 'Ethereum' : chainId === 137 ? 'Polygon' : chainId === 56 ? 'BSC' : 'Unknown'}</strong>
        </div>
        {quote && (
          <div>
            <span>Slippage</span>
            <strong>~0.5%</strong>
          </div>
        )}
      </div>

      {quoteError && <div className="error-banner">⚠️ {quoteError}</div>}

      {txHash && <div className="success-banner">✅ Transaction: {txHash.slice(0, 8)}...</div>}

      <div className="button-group">
        {needsApproval && (
          <button className="primary-button" onClick={handleApprove} disabled={submitting}>
            {submitting ? 'Approving...' : 'Approve token'}
          </button>
        )}
        <button className="primary-button" onClick={handleSwap} disabled={!isConnected || !quote || loadingQuote || submitting || !fromAmount || needsApproval} style={{ width: needsApproval ? 'auto' : '100%' }}>
          {submitting ? 'Submitting...' : loadingQuote ? 'Getting quote...' : 'Swap now'}
        </button>
      </div>
    </aside>
  );
}
