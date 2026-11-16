import { Address, TonClient } from '@ton/ton';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const addressParam = request.nextUrl.searchParams.get('address');

  if (!addressParam) {
    return NextResponse.json({ error: 'Missing Jetton wallet address.' }, { status: 400 });
  }

  let jettonWallet: Address;
  try {
    jettonWallet = Address.parse(addressParam);
  } catch {
    return NextResponse.json({ error: 'Invalid TON address.' }, { status: 400 });
  }

  try {
    const client = new TonClient({
      endpoint: process.env.TONCENTER_ENDPOINT ?? 'https://toncenter.com/api/v2/jsonRPC',
      ...(process.env.TONCENTER_API_KEY ? { apiKey: process.env.TONCENTER_API_KEY } : {}),
    });

    const result = await client.runMethod(jettonWallet, 'get_wallet_data');
    const stack = result.stack;
    const balance = stack.readBigNumber().toString();
    const owner = stack.readAddress().toString({ bounceable: false });
    const master = stack.readAddress().toString({ bounceable: false });
    const walletCodeBocHex = stack.readCell().toBoc().toString('hex');

    return NextResponse.json(
      { balance, owner, master, walletCodeBocHex, fetchedAt: new Date().toISOString() },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'TON provider request failed.';
    return NextResponse.json(
      { error: `Could not read Jetton wallet data: ${message}` },
      { status: 502 },
    );
  }
}
