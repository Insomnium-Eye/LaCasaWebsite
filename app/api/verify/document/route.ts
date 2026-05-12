import { NextRequest, NextResponse } from 'next/server';
import { checkIsIdentityDocument } from '@/lib/google-vision';
import { verifyGuestJWT } from '@/lib/guest-auth';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const token = auth?.replace('Bearer ', '') ?? '';
  const session = verifyGuestJWT(token);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { imageBase64, mimeType } = await req.json();

  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return NextResponse.json({ error: 'imageBase64 is required' }, { status: 400 });
  }

  // Strip the data-URL prefix if the client sent one (e.g. "data:image/jpeg;base64,...")
  const base64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

  const result = await checkIsIdentityDocument(base64, mimeType ?? 'image/jpeg');
  return NextResponse.json(result);
}
