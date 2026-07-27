import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { verifyGuestJWT } from '@/lib/guest-auth';

const resend = new Resend(process.env.RESEND_API_KEY);

const ICONS: Record<string, string> = {
  cleaning:    '🧹',
  extend:      '📅',
  cancel:      '❌',
  maintenance: '🔧',
};

const TITLES: Record<string, string> = {
  cleaning:    'Cleaning Request',
  extend:      'Extend Stay Request',
  cancel:      'Cancellation Request',
  maintenance: 'Maintenance Request',
};

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const session = verifyGuestJWT(authHeader.substring(7));
  if (!session) {
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
  }

  const body = await request.json();
  const { type, fields } = body as { type: string; fields: Record<string, string> };

  if (!type || !fields) {
    return NextResponse.json({ success: false, error: 'Missing type or fields' }, { status: 400 });
  }

  const icon  = ICONS[type]  ?? '📋';
  const title = TITLES[type] ?? 'Guest Request';

  const rows = Object.entries(fields)
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:6px 12px;color:#555;width:160px;">${k}</td><td style="padding:6px 12px;font-weight:600;">${v}</td></tr>`)
    .join('');

  if (process.env.RESEND_API_KEY) {
    await resend.emails.send({
      from: 'La Casa Oaxaca <onboarding@resend.dev>',
      to: ['ebm22david@gmail.com'],
      subject: `${icon} ${title}: ${session.guestName} (${session.unitName || 'Portal'})`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#8d4a3f;">${icon} ${title}</h2>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr style="background:#f9f9f9;">
              <td style="padding:6px 12px;color:#555;width:160px;">Guest</td>
              <td style="padding:6px 12px;font-weight:600;">${session.guestName}</td>
            </tr>
            ${session.unitName ? `<tr><td style="padding:6px 12px;color:#555;">Unit</td><td style="padding:6px 12px;">${session.unitName}</td></tr>` : ''}
            ${session.checkIn ? `<tr style="background:#f9f9f9;"><td style="padding:6px 12px;color:#555;">Stay</td><td style="padding:6px 12px;">${session.checkIn.slice(0,10)} → ${session.checkOut.slice(0,10)}</td></tr>` : ''}
            ${rows}
          </table>
          <p style="color:#aaa;font-size:12px;">Sent from La Casa Oaxaca guest portal.</p>
        </div>
      `,
    }).catch((err: unknown) => console.error('[notify email]', err));
  }

  return NextResponse.json({ success: true });
}
