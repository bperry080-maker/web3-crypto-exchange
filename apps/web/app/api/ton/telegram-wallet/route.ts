import { Address, TonClient } from '@ton/ton';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const addressParam = request.nextUrl.searchParams.get('address');
  if (!addressParam) {
    return NextResponse.json({ error: 'Missing Telegram Wallet contract address.' }, { status: 400 });
  }

  let walletAddress: Address;
  try {
    walletAddress = Address.parse(addressParam);
  } catch {
    return NextResponse.json({ error: 'Invalid TON address or checksum.' }, { status: 400 });
  }

  try {
    const client = new TonClient({
      endpoint: process.env.TONCENTER_ENDPOINT ?? 'https://toncenter.com/api/v2/jsonRPC',
      ...(process.env.TONCENTER_API_KEY ? { apiKey: process.env.TONCENTER_API_KEY } : {}),
    });

    // WalletTg read-only getters documented in contracts/WalletTg/WalletTg.tolk.
    const [revisionResult, seqnoResult, subwalletResult, publicKeyResult] = await Promise.all([
      client.runMethod(walletAddress, 'revision'),
      client.runMethod(walletAddress, 'seqno'),
      client.runMethod(walletAddress, 'get_subwallet_id'),
      client.runMethod(walletAddress, 'get_public_key'),
    ]);

    const revision = revisionResult.stack.readNumber();
    const seqno = seqnoResult.stack.readNumber();
    const subwalletId = subwalletResult.stack.readNumber();
    const publicKey = publicKeyResult.stack.readBigNumber();

    return NextResponse.json(
      {
        addressRaw: walletAddress.toRawString(),
        addressFriendly: walletAddress.toString({ bounceable: true, urlSafe: true }),
        revision,
        seqno,
        subwalletId,
        publicKeyHex: publicKey.toString(16).padStart(64, '0'),
        fetchedAt: new Date().toISOString(),
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'TON provider request failed.';
    return NextResponse.json(
      { error: `Could not read WalletTg getters. The address may be uninitialized, unavailable, or not a compatible WalletTg contract: ${message}` },
      { status: 502 },
    );
  }
}
