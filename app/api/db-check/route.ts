import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) return NextResponse.json({ error: 'NEXT_PUBLIC_SUPABASE_URL is not set' }, { status: 500 });
  if (!key) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not set' }, { status: 500 });

  try {
    const res = await fetch(`${url}/rest/v1/reservations?limit=1`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });
    const text = await res.text();
    return NextResponse.json({
      url,
      keyPrefix: key.slice(0, 12) + '...',
      status: res.status,
      body: text.slice(0, 300),
    });
  } catch (err) {
    const cause = (err as any)?.cause;
    return NextResponse.json({
      url,
      keyPrefix: key.slice(0, 12) + '...',
      error: err instanceof Error ? err.message : String(err),
      cause: cause ? String(cause) : undefined,
      causeCode: cause?.code ?? undefined,
    }, { status: 500 });
  }
}
