import { verifyAdminToken } from '@/lib/adminToken';
import { runBookingAction } from '@/lib/bookingAction';

export default async function RejectPage({
  params,
}: {
  params: Promise<{ id: string; token: string }>;
}) {
  const { id, token } = await params;

  if (!verifyAdminToken(id, token)) {
    return <ResultPage heading="🔒 Unauthorized" body="This link is invalid or has expired." color="#e07050" />;
  }

  const result = await runBookingAction(id, 'deny');

  if (!result.ok) {
    return <ResultPage heading="⚠️ Error" body={result.error ?? 'Something went wrong.'} color="#e07050" />;
  }

  if (result.alreadyActioned) {
    return (
      <ResultPage
        heading="❌ Already Denied"
        body={`This booking was already ${result.status}.\n${result.guestName} — ${result.checkIn} → ${result.checkOut}`}
        color="#c0392b"
      />
    );
  }

  return (
    <ResultPage
      heading="❌ Booking Denied"
      color="#c0392b"
      body={`You denied ${result.guestName}'s request for ${result.unitName}.\n${result.checkIn} → ${result.checkOut}\nGuest notified by ${result.notified}. Escrow released.`}
    />
  );
}

function ResultPage({ heading, body, color }: { heading: string; body: string; color: string }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{heading}</title>
      </head>
      <body style={{ margin: 0, fontFamily: 'sans-serif', background: '#0d0906', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ background: '#1a120e', border: '1px solid #3a2a20', borderRadius: 16, padding: 40, maxWidth: 480, textAlign: 'center' }}>
          <h1 style={{ color, fontSize: '1.6rem', margin: '0 0 12px' }}>{heading}</h1>
          {body.split('\n').map((line, i) => (
            <p key={i} style={{ color: '#ccc', lineHeight: 1.6, margin: '0 0 8px' }}>{line}</p>
          ))}
        </div>
      </body>
    </html>
  );
}
