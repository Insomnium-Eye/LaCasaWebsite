import { NextRequest, NextResponse } from 'next/server';
import { checkIsIdentityDocument } from '@/lib/google-vision';
import { checkNameAgainstOFAC, SanctionsResult } from '@/lib/ofac-sanctions';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

function buildEmail(
  nameFromId: string | null,
  formName: string | null,
  documentType: string | null,
  sanctions: SanctionsResult | null,
): string {
  const nameChecked = nameFromId ?? formName;
  const levelColor =
    sanctions?.alertLevel === 'alert' ? '#dc2626' :
    sanctions?.alertLevel === 'warning' ? '#d97706' : '#16a34a';
  const levelLabel =
    sanctions?.alertLevel === 'alert' ? '🚨 ALERT' :
    sanctions?.alertLevel === 'warning' ? '⚠️ WARNING' :
    sanctions ? '✅ CLEAR' : '⏱ Unavailable (timed out)';

  const matchRows = sanctions && sanctions.matches.length > 0
    ? sanctions.matches
        .map(
          (m) =>
            `<tr>
              <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${m.listedName}</td>
              <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${(m.similarity * 100).toFixed(1)}%</td>
            </tr>`,
        )
        .join('')
    : `<tr><td colspan="2" style="padding:8px;color:#6b7280;">${sanctions ? 'No matches found' : 'OFAC check did not complete in time — run manually if needed'}</td></tr>`;

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#8d4a3f;">ID Verification Complete</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
        <tr><td style="padding:6px 8px;color:#555;width:40%;">Name (extracted from ID)</td>
            <td style="padding:6px 8px;font-weight:bold;">${nameFromId ?? '<em style="color:#9ca3af;">Could not extract</em>'}</td></tr>
        ${formName ? `<tr style="background:#f9f9f9;"><td style="padding:6px 8px;color:#555;">Name (from booking form)</td>
            <td style="padding:6px 8px;">${formName}</td></tr>` : ''}
        <tr><td style="padding:6px 8px;color:#555;">Document type</td>
            <td style="padding:6px 8px;">${documentType ?? 'Unknown'}</td></tr>
      </table>

      <h3 style="margin-top:24px;">OFAC Sanctions Check — <span style="color:${levelColor};">${levelLabel}</span></h3>
      ${sanctions ? `<p style="font-size:13px;color:#6b7280;">Checked against ${sanctions.totalEntriesChecked.toLocaleString()} entries · Name checked: <strong>${nameChecked ?? '—'}</strong></p>` : ''}
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="padding:6px 8px;text-align:left;">Name on list</th>
            <th style="padding:6px 8px;text-align:left;">Similarity</th>
          </tr>
        </thead>
        <tbody>${matchRows}</tbody>
      </table>

      ${sanctions?.alertLevel === 'alert' || sanctions?.alertLevel === 'warning' ? `
      <div style="margin-top:24px;padding:16px;background:#fef3c7;border-left:4px solid ${levelColor};border-radius:4px;">
        <strong>Action required:</strong> Review this guest manually before allowing check-in.
      </div>` : ''}

      <p style="color:#9ca3af;font-size:12px;margin-top:32px;">
        Sent automatically after ID verification on oaxaca-rental.com.
      </p>
    </div>
  `;
}

export async function POST(req: NextRequest) {
  const { imageBase64, mimeType, guestName: formName } = await req.json();

  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return NextResponse.json({ error: 'imageBase64 is required' }, { status: 400 });
  }

  const base64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
  const result = await checkIsIdentityDocument(base64, mimeType ?? 'image/jpeg');

  if (result.isIdentityDocument && process.env.RESEND_API_KEY) {
    const nameToCheck = result.extractedName ?? formName ?? null;

    let sanctions = null;
    if (nameToCheck) {
      try {
        sanctions = await withTimeout(checkNameAgainstOFAC(nameToCheck), 5000);
      } catch (err) {
        console.error('[OFAC check error]', err instanceof Error ? err.message : err);
      }
    }

    const subject = sanctions?.alertLevel === 'alert'
      ? `🚨 ALERT – ID Verified: ${nameToCheck ?? 'Unknown'}`
      : sanctions?.alertLevel === 'warning'
      ? `⚠️ WARNING – ID Verified: ${nameToCheck ?? 'Unknown'}`
      : `✅ ID Verified: ${nameToCheck ?? result.documentType ?? 'Guest'}`;

    try {
      await resend.emails.send({
        from: 'La Casa Oaxaca <onboarding@resend.dev>',
        to: ['ebm22david@gmail.com'],
        subject,
        html: buildEmail(result.extractedName, formName ?? null, result.documentType, sanctions),
      });
      console.log('[ID verify email] sent:', subject);
    } catch (err) {
      console.error('[ID verify email error]', err instanceof Error ? err.message : err);
    }
  }

  // Return only what the client needs — don't expose extracted PII
  return NextResponse.json({
    isIdentityDocument: result.isIdentityDocument,
    documentType: result.documentType,
    error: result.error,
  });
}
