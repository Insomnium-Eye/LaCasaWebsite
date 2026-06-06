import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { verifyGuestJWT } from '@/lib/guest-auth';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const session = verifyGuestJWT(authHeader.slice(7));
    if (!session) {
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
    }

    const { category, description, imageBase64, imageName, imageMime } = await request.json();

    if (!category || !description?.trim()) {
      return NextResponse.json({ success: false, error: 'Category and description are required' }, { status: 400 });
    }

    const attachments = imageBase64 ? [{
      filename: imageName ?? 'photo.jpg',
      content: imageBase64,
      contentType: imageMime ?? 'image/jpeg',
    }] : [];

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'La Casa Oaxaca <onboarding@resend.dev>',
        to: ['ebm22david@gmail.com'],
        replyTo: session.email || 'ebm22david@gmail.com',
        subject: `🔧 Maintenance Request — ${category} — ${session.unitName}`,
        attachments,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#8d4a3f;">Maintenance Request</h2>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;">
              <tr><td style="padding:8px;color:#555;width:120px;">Guest</td><td style="padding:8px;font-weight:bold;">${session.guestName}</td></tr>
              <tr style="background:#f9f9f9;"><td style="padding:8px;color:#555;">Unit</td><td style="padding:8px;">${session.unitName}</td></tr>
              <tr><td style="padding:8px;color:#555;">Category</td><td style="padding:8px;font-weight:bold;">${category}</td></tr>
            </table>
            <div style="background:#fdf3f0;border-left:4px solid #8d4a3f;padding:16px;border-radius:4px;margin:16px 0;">
              <p style="margin:0;white-space:pre-wrap;">${description}</p>
            </div>
            ${imageBase64 ? '<p style="color:#555;font-size:13px;">📎 Photo attached.</p>' : ''}
            <p style="color:#aaa;font-size:12px;margin-top:24px;">Submitted via Guest Portal</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Maintenance request]', error);
    return NextResponse.json({ success: false, error: 'Failed to submit request' }, { status: 500 });
  }
}
