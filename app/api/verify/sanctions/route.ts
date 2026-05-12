import { NextRequest, NextResponse } from 'next/server';
import { checkNameAgainstOFAC } from '@/lib/ofac-sanctions';
import { verifyGuestJWT } from '@/lib/guest-auth';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const token = auth?.replace('Bearer ', '') ?? '';
  const session = verifyGuestJWT(token);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await req.json();

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  const result = await checkNameAgainstOFAC(name.trim());
  return NextResponse.json(result);
}
