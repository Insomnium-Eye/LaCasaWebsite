import { NextResponse } from 'next/server';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return NextResponse.json({ error: 'DATABASE_URL is not set' }, { status: 500 });

  try {
    const { getSql } = await import('@/lib/db');
    const sql = getSql();
    const rows = await sql`SELECT 1 AS ok`;
    return NextResponse.json({ connected: true, result: rows[0] });
  } catch (err) {
    return NextResponse.json({
      connected: false,
      error: err instanceof Error ? err.message : String(err),
      cause: String((err as any)?.cause ?? ''),
    }, { status: 500 });
  }
}
