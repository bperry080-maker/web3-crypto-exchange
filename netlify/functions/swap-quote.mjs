const ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const UINT = /^[1-9][0-9]*$/;

export default async (request) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers: { Allow: "POST" } });
  }

  const apiKey = process.env.UNISWAP_API_KEY;
  const allowedOrigin = process.env.APP_ORIGIN;
  const origin = request.headers.get("origin");

  if (allowedOrigin && origin && origin !== allowedOrigin) {
    return Response.json({ error: "Origin not allowed" }, { status: 403 });
  }
  if (!apiKey) {
    return Response.json({ error: "Swap quotes are not configured yet." }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { tokenIn, tokenOut, amount, swapper, slippageTolerance = 0.5 } = body ?? {};
  if (
    !ADDRESS.test(tokenIn ?? "") ||
    !ADDRESS.test(tokenOut ?? "") ||
    !ADDRESS.test(swapper ?? "") ||
    !UINT.test(amount ?? "") ||
    tokenIn.toLowerCase() === tokenOut.toLowerCase() ||
    !Number.isFinite(slippageTolerance) ||
    slippageTolerance < 0.1 ||
    slippageTolerance > 0.5
  ) {
    return Response.json({ error: "Invalid swap parameters. Slippage must be between 0.1% and 0.5%." }, { status: 400 });
  }

  const allowlist = (process.env.MAINNET_TOKEN_ALLOWLIST ?? "")
    .split(",")
    .map((address) => address.trim().toLowerCase())
    .filter(Boolean);

  if (allowlist.length === 0 ||
      !allowlist.includes(tokenIn.toLowerCase()) ||
      !allowlist.includes(tokenOut.toLowerCase())) {
    return Response.json({ error: "Input and output tokens must be configured in the verified Mainnet token allowlist." }, { status: 400 });
  }

  try {
    const upstream = await fetch("https://trade-api.gateway.uniswap.org/v1/quote", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        tokenIn,
        tokenOut,
        amount,
        swapper,
        type: "EXACT_INPUT",
        tokenInChainId: 1,
        tokenOutChainId: 1,
        slippageTolerance
      }),
      signal: AbortSignal.timeout(12000)
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return Response.json(
        { error: "Quote provider did not return a usable quote.", providerStatus: upstream.status },
        { status: upstream.status >= 500 ? 502 : 400 }
      );
    }

    // This endpoint returns a quote only; it never signs or broadcasts transactions.
    return Response.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Quote service temporarily unavailable." }, { status: 502 });
  }
};
