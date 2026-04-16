/**
 * Server-side API Example
 * Location: app/api/exchange-rate/route.ts
 *
 * This is an OPTIONAL enhancement for better performance:
 * - Cache exchange rates on server (more reliable than client localStorage)
 * - Reduce API calls from client
 * - Add authentication/rate limiting
 *
 * Usage:
 * fetch('/api/exchange-rate').then(r => r.json()).then(data => console.log(data.rate))
 */

export async function GET(request: Request) {
  try {
    // Check if we already have a cached rate from earlier today
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `exchange_rate_${today}`;

    // In production, use a real cache service (Redis, Memcached, etc.)
    // For now, we'll just fetch from the API each time
    // and rely on client-side caching

    // Try ExchangeRate-API first
    try {
      const response = await fetch(
        'https://api.exchangerate-api.com/v4/latest/USD',
        { next: { revalidate: 3600 } } // Revalidate cached response every hour
      );

      if (response.ok) {
        const data = await response.json();
        const rate = data.rates.MXN;

        return Response.json(
          {
            success: true,
            rate,
            source: 'ExchangeRate-API',
            timestamp: new Date().toISOString(),
          },
          { status: 200 }
        );
      }
    } catch (error) {
      console.error('ExchangeRate-API failed:', error);
    }

    // Fallback to Frankfurter
    try {
      const response = await fetch(
        'https://api.frankfurter.app/latest?from=USD&to=MXN',
        { next: { revalidate: 3600 } }
      );

      if (response.ok) {
        const data = await response.json();
        const rate = data.rates.MXN;

        return Response.json(
          {
            success: true,
            rate,
            source: 'Frankfurter',
            timestamp: new Date().toISOString(),
          },
          { status: 200 }
        );
      }
    } catch (error) {
      console.error('Frankfurter API failed:', error);
    }

    // If both fail, return fallback rate
    return Response.json(
      {
        success: false,
        rate: 20.5,
        source: 'fallback',
        message: 'Using fallback exchange rate',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * Veriff Integration Example
 * Location: app/api/veriff/route.ts
 *
 * Step 1: Create verification session
 * GET /api/veriff/session
 *
 * Step 2: Submit verification
 * POST /api/veriff/submit
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'session') {
    return veriffCreateSession();
  }

  return Response.json(
    { error: 'Unknown action' },
    { status: 400 }
  );
}

async function veriffCreateSession() {
  try {
    const response = await fetch('https://api.veriff.com/v1/verification/start', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.VERIFF_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        verification: {
          timestamp: new Date().toISOString(),
          person: {
            // Can be filled with guest data
          },
          document: {
            type: 'ID_CARD',
          },
        },
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return Response.json({
        success: true,
        sessionUrl: data.verification.url,
        verificationId: data.verification.id,
      });
    }

    throw new Error(data.error || 'Failed to create session');
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Channel Manager Integration Example
 * Location: app/api/availability/route.ts
 *
 * GET /api/availability?propertyId=bungalow1&startDate=2026-05-01&endDate=2026-05-31
 */

export async function getAvailability(
  propertyId: string,
  startDate: Date,
  endDate: Date
) {
  try {
    // Example: Lodgify API integration
    const response = await fetch(
      `${process.env.LODGIFY_API_URL}/reservations?propertyId=${propertyId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.LODGIFY_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Lodgify');
    }

    const reservations = await response.json();

    // Convert reservations to availability boolean array
    const availability = generateAvailabilityArray(
      startDate,
      endDate,
      reservations
    );

    return Response.json({
      success: true,
      propertyId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      availability,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function generateAvailabilityArray(
  startDate: Date,
  endDate: Date,
  reservations: any[]
): boolean[] {
  const availability: boolean[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const isBooked = reservations.some(
      (res) =>
        new Date(res.checkIn) <= currentDate &&
        new Date(res.checkOut) > currentDate
    );
    availability.push(!isBooked);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return availability;
}

/**
 * Email Confirmation Example
 * POST /api/booking/confirm
 *
 * Sends booking confirmation email to guest
 */

export async function sendBookingConfirmation(bookingData: any) {
  try {
    // Example: Using SendGrid or similar service
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const emailContent = generateBookingEmail(bookingData);

    // sgMail.send({
    //   to: bookingData.guestEmail,
    //   from: 'bookings@lacasa.mx',
    //   subject: 'Your La Casa Booking Confirmation',
    //   html: emailContent,
    // });

    return Response.json({
      success: true,
      message: 'Confirmation email sent',
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function generateBookingEmail(booking: any): string {
  return `
    <h1>Booking Confirmation - La Casa</h1>
    <p>Dear Guest,</p>
    <p>Your booking has been confirmed!</p>
    <h2>Booking Details</h2>
    <ul>
      <li>Check-in: ${booking.checkIn}</li>
      <li>Check-out: ${booking.checkOut}</li>
      <li>Units: ${booking.units.join(', ')}</li>
      <li>Total Price: $${booking.totalUsd} USD (${booking.totalMxn} MXN)</li>
    </ul>
    <h2>Transportation</h2>
    ${
      booking.transportation && booking.transportation.length > 0
        ? booking.transportation
            .map((t: any) => `<li>${t.name}: $${t.price}</li>`)
            .join('')
        : '<p>No transportation add-ons selected</p>'
    }
    <p>We look forward to your arrival!</p>
  `;
}
