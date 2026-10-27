// Read-only CoinGecko wallet balances proxy.
// API key stays on the server; this endpoint never signs or submits transactions.
const ALLOWED_NETWORKS = new Set([
  "eth",
  "base",
  "bsc",
  "polygon_pos",
  "arbitrum",
  "optimism",
  "avax",
  "linea",
]);

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  },
  body: JSON.stringify(body),
});

export const handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return json(405, { error: "Method not allowed. Use GET." });
  }

  const address = event.queryStringParameters?.address?.trim() ?? "";
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return json(400, {
      error: "Provide a valid public EVM address in the address query parameter.",
    });
  }

  const apiKey = process.env.COINGECKO_API_KEY;
  if (!apiKey) {
    return json(503, {
      error: "Wallet balance lookup is not configured on the server.",
    });
  }

  const rawNetworks = event.queryStringParameters?.networks ?? "eth,base,bsc";
  const networks = [...new Set(rawNetworks.split(",").map((n) => n.trim()).filter(Boolean))];
  if (
    networks.length === 0 ||
    networks.length > ALLOWED_NETWORKS.size ||
    networks.some((network) => !ALLOWED_NETWORKS.has(network))
  ) {
    return json(400, {
      error: "Unsupported network. Supported EVM network IDs: " + [...ALLOWED_NETWORKS].join(", "),
    });
  }

  const pageRaw = event.queryStringParameters?.page ?? "1";
  const perPageRaw = event.queryStringParameters?.per_page ?? "50";
  const page = Number(pageRaw);
  const perPage = Number(perPageRaw);
  if (!/^\d+$/.test(pageRaw) || !Number.isSafeInteger(page) || page < 1 ||
      !/^\d+$/.test(perPageRaw) || !Number.isSafeInteger(perPage) || perPage < 1 || perPage > 100) {
    return json(400, { error: "page must be a positive integer; per_page must be between 1 and 100." });
  }

  const url = new URL(
    `https://pro-api.coingecko.com/api/v3/onchain/wallets/${encodeURIComponent(address)}/balances`
  );
  url.searchParams.set("networks", networks.join(","));
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));

  try {
    const upstream = await fetch(url, {
      method: "GET",
      headers: { "x-cg-pro-api-key": apiKey, accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });

    if (!upstream.ok) {
      if (upstream.status === 401 || upstream.status === 403) {
        return json(502, { error: "CoinGecko rejected the server API key or plan access." });
      }
      if (upstream.status === 429) {
        return json(429, { error: "CoinGecko rate limit reached. Please try again later." });
      }
      return json(502, { error: `CoinGecko balance lookup failed (HTTP ${upstream.status}).` });
    }

    const data = await upstream.json();
    if (!data?.data?.attributes || !Array.isArray(data.data.attributes.balances)) {
      return json(502, { error: "CoinGecko returned an unexpected balance response." });
    }

    return json(200, {
      source: "CoinGecko Onchain Wallet Balances",
      read_only: true,
      requested_networks: networks,
      data: data.data,
    });
  } catch (error) {
    const timedOut = error?.name === "TimeoutError" || error?.name === "AbortError";
    return json(timedOut ? 504 : 502, {
      error: timedOut
        ? "CoinGecko request timed out. Please try again."
        : "Unable to reach CoinGecko right now.",
    });
  }
};
