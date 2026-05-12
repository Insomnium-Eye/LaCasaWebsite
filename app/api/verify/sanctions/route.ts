import { NextRequest, NextResponse } from 'next/server';
import { checkNameAgainstOFAC } from '@/lib/ofac-sanctions';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { name } = await req.json();

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  const result = await checkNameAgainstOFAC(name.trim());

  if (process.env.RESEND_API_KEY) {
    const levelColor =
      result.alertLevel === 'alert' ? '#dc2626' :
      result.alertLevel === 'warning' ? '#d97706' : '#16a34a';
    const levelLabel =
      result.alertLevel === 'alert' ? '🚨 ALERT' :
      result.alertLevel === 'warning' ? '⚠️ WARNING' : '✅ CLEAR';

    const matchRows = result.matches.length > 0
      ? result.matches
          .map(
            (m) =>
              `<tr>
                <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${m.listedName}</td>
                <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${(m.similarity * 100).toFixed(1)}%</td>
              </tr>`,
          )
          .join('')
      : `<tr><td colspan="2" style="padding:8px;color:#6b7280;">No matches found</td></tr>`;

    await resend.emails.send({
      from: 'La Casa Oaxaca <onboarding@resend.dev>',
      to: ['ebm22david@gmail.com'],
      subject: `ID Verification – OFAC ${levelLabel}: ${name.trim()}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#8d4a3f;">OFAC Sanctions Check Result</h2>
          <p><strong>Guest:</strong> ${name.trim()}</p>
          <p><strong>Result:</strong> <span style="color:${levelColor};font-weight:bold;font-size:1.1em;">${levelLabel}</span></p>
          <p><strong>Entries checked:</strong> ${result.totalEntriesChecked.toLocaleString()}</p>
          <p><strong>Checked at:</strong> ${new Date(result.checkedAt).toLocaleString()}</p>
          <h3 style="margin-top:24px;">Matches</h3>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <thead>
              <tr style="background:#f3f4f6;">
                <th style="padding:6px 8px;text-align:left;">Name on list</th>
                <th style="padding:6px 8px;text-align:left;">Similarity</th>
              </tr>
            </thead>
            <tbody>${matchRows}</tbody>
          </table>
          ${result.alertLevel !== 'clear' ? `
          <div style="margin-top:24px;padding:16px;background:#fef3c7;border-left:4px solid ${levelColor};border-radius:4px;">
            <strong>Action required:</strong> Review this guest manually before allowing check-in.
          </div>` : ''}
          <p style="color:#9ca3af;font-size:12px;margin-top:32px;">
            Sent automatically when the guest completed ID verification on oaxaca-rental.com.
          </p>
        </div>
      `,
    }).catch((err) => console.error('[Sanctions email error]', err));
  }

  return NextResponse.json(result);
}
