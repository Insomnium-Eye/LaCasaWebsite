/**
 * Future Enhancement Examples
 * 
 * This file shows how to extend the booking system with:
 * - Payment Processing
 * - Email Confirmations
 * - WhatsApp Notifications
 * - Guest Management
 * - Analytics
 */

// ============================================================================
// 1. PAYMENT PROCESSING WITH STRIPE
// ============================================================================

/**
 * File: app/api/payment/create-intent/route.ts
 */
export const exampleStripePayment = `
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request: Request) {
  try {
    const { amount, currency, guestEmail, bookingId } = await request.json();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(), // 'usd' or 'mxn'
      receipt_email: guestEmail,
      metadata: {
        bookingId,
        timestamp: new Date().toISOString(),
      },
    });

    return Response.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
`;

/**
 * Component: components/PaymentForm.tsx
 */
export const examplePaymentForm = `
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export function PaymentForm({ bookingId, totalUsd }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    // 1. Create payment intent on server
    const response = await fetch('/api/payment/create-intent', {
      method: 'POST',
      body: JSON.stringify({
        amount: totalUsd,
        currency: 'USD',
        guestEmail: guestEmail,
        bookingId,
      }),
    });

    const { clientSecret } = await response.json();

    // 2. Confirm payment with Stripe
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: { email: guestEmail },
      },
    });

    if (result.paymentIntent.status === 'succeeded') {
      // Payment successful!
      await confirmBooking(bookingId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement />
      <button type="submit">
        Pay \${totalUsd.toFixed(2)} USD
      </button>
    </form>
  );
}
`;

// ============================================================================
// 2. EMAIL NOTIFICATIONS
// ============================================================================

/**
 * File: app/api/email/send-confirmation/route.ts
 * Uses SendGrid
 */
export const exampleEmailConfirmation = `
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function POST(request: Request) {
  try {
    const booking = await request.json();

    const emailContent = generateBookingEmail(booking);

    await sgMail.send({
      to: booking.guestEmail,
      from: 'bookings@lacasa.mx',
      subject: 'Your La Casa Booking Confirmation',
      html: emailContent,
    });

    // Also send to property manager
    await sgMail.send({
      to: 'manager@lacasa.mx',
      from: 'bookings@lacasa.mx',
      subject: \`New Booking - \${booking.guestName}\`,
      html: generateManagerEmail(booking),
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function generateBookingEmail(booking) {
  const { guestName, units, checkIn, checkOut, totalUsd, totalMxn } = booking;
  
  return \`
    <h1>¡Booking Confirmation!</h1>
    <p>Dear \${guestName},</p>
    <p>Your reservation at La Casa is confirmed!</p>
    
    <h2>Booking Details</h2>
    <ul>
      <li>Check-in: \${new Date(checkIn).toLocaleDateString()}</li>
      <li>Check-out: \${new Date(checkOut).toLocaleDateString()}</li>
      <li>Units: \${units.join(', ')}</li>
    </ul>
    
    <h2>Total Price</h2>
    <p><strong>\$\${totalUsd} USD ≈ \${totalMxn} MXN</strong></p>
    
    <p>We look forward to hosting you!</p>
  \`;
}
`;

// ============================================================================
// 3. WHATSAPP NOTIFICATIONS (TWILIO)
// ============================================================================

/**
 * File: app/api/notifications/whatsapp/route.ts
 */
export const exampleWhatsAppNotification = `
import twilio from 'twilio';

const client = twilio(
  process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: Request) {
  try {
    const { guestPhone, guestName, checkIn } = await request.json();

    await client.messages.create({
      from: \`whatsapp:\${process.env.TWILIO_WHATSAPP_NUMBER}\`,
      to: \`whatsapp:\${guestPhone}\`,
      body: \`¡Hola \${guestName}! Your booking at La Casa is confirmed. Check-in: \${checkIn}. We're excited to host you! 🏡\`,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
`;

// ============================================================================
// 4. GUEST PROFILE & HISTORY
// ============================================================================

/**
 * Component: components/GuestProfile.tsx
 * Store and track guest information
 */
export const exampleGuestProfile = `
import { GuestProfile } from '@/types/booking';

interface GuestProfileFormProps {
  onSave: (profile: GuestProfile) => void;
}

export function GuestProfileForm({ onSave }: GuestProfileFormProps) {
  const [profile, setProfile] = useState<Partial<GuestProfile>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate profile
    if (!profile.firstName || !profile.lastName || !profile.email) {
      alert('Please fill in all fields');
      return;
    }

    // Save to database
    const response = await fetch('/api/guests/profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    });

    const data = await response.json();
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="firstName"
        placeholder="First Name"
        required
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        required
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      <button type="submit" className="bg-blue-600 text-white p-2 rounded">
        Save Profile
      </button>
    </form>
  );
}
`;

// ============================================================================
// 5. BOOKING HISTORY
// ============================================================================

/**
 * Component: components/BookingHistory.tsx
 */
export const exampleBookingHistory = `
import { useEffect, useState } from 'react';
import { Booking } from '@/types/booking';

export function BookingHistory({ guestId }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      const response = await fetch(\`/api/guests/\${guestId}/bookings\`);
      const data = await response.json();
      setBookings(data);
      setLoading(false);
    };
    fetchBookings();
  }, [guestId]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Bookings</h2>
      {bookings.map(booking => (
        <div key={booking.id} className="border p-4 rounded">
          <p><strong>Check-in:</strong> {new Date(booking.dateRange.start).toLocaleDateString()}</p>
          <p><strong>Total:</strong> \${booking.total}</p>
          <p><strong>Status:</strong> {booking.status}</p>
        </div>
      ))}
    </div>
  );
}
`;

// ============================================================================
// 6. PROMO CODE SYSTEM
// ============================================================================

/**
 * Hook: hooks/usePromoCode.ts
 */
export const examplePromoCodeHook = `
import { PromoCode } from '@/types/booking';

export function usePromoCode() {
  const validatePromoCode = async (code: string): Promise<PromoCode | null> => {
    const response = await fetch(\`/api/promo-codes/validate?code=\${code}\`);
    const data = await response.json();
    
    if (data.success) {
      return data.promoCode;
    }
    return null;
  };

  const applyDiscount = (basePrice: number, promoCode: PromoCode): number => {
    if (promoCode.discountPercentage) {
      return basePrice * (1 - promoCode.discountPercentage / 100);
    }
    if (promoCode.discountAmount) {
      return Math.max(0, basePrice - promoCode.discountAmount);
    }
    return basePrice;
  };

  return { validatePromoCode, applyDiscount };
}

// Usage in BookingPage:
// const { validatePromoCode } = usePromoCode();
// const promoCode = await validatePromoCode('SUMMER20');
// if (promoCode) {
//   const discountedPrice = applyDiscount(totalPrice, promoCode);
// }
`;

// ============================================================================
// 7. ANALYTICS & TRACKING
// ============================================================================

/**
 * Hook: hooks/useBookingAnalytics.ts
 */
export const exampleAnalyticsHook = `
import { useEffect } from 'react';

export function useBookingAnalytics() {
  useEffect(() => {
    // Track booking step completion
    const trackStep = (step: string) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'booking_step', {
          step_name: step,
          timestamp: new Date().toISOString(),
        });
      }
    };

    // Track price view
    const trackPriceView = (totalUsd: number, totalMxn: number) => {
      window.gtag?.('event', 'view_item', {
        value: totalUsd,
        currency: 'USD',
        items: [{
          id: 'booking_package',
          name: 'La Casa Booking',
          price: totalUsd,
        }],
      });
    };

    // Track booking completion
    const trackBookingComplete = (bookingId: string, totalUsd: number) => {
      window.gtag?.('event', 'purchase', {
        value: totalUsd,
        currency: 'USD',
        transaction_id: bookingId,
        items: [{
          id: bookingId,
          name: 'La Casa Accommodation',
          price: totalUsd,
        }],
      });
    };

    return { trackStep, trackPriceView, trackBookingComplete };
  }, []);
}

// Usage in BookingPage.tsx:
// const { trackStep, trackPriceView } = useBookingAnalytics();
// trackStep('unit_selection');
// trackPriceView(totalUsd, totalMxn);
`;

// ============================================================================
// 8. CHANNEL MANAGER SYNC
// ============================================================================

/**
 * Hook: hooks/useChannelManager.ts
 */
export const exampleChannelManagerSync = `
import { useEffect, useState } from 'react';
import { ChannelManagerReservation } from '@/types/booking';

export function useChannelManager() {
  const [reservations, setReservations] = useState<ChannelManagerReservation[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const syncReservations = async () => {
      setSyncing(true);
      try {
        const response = await fetch('/api/channel-manager/sync', {
          method: 'POST',
          body: JSON.stringify({
            provider: process.env.NEXT_PUBLIC_CHANNEL_PROVIDER,
          }),
        });
        const data = await response.json();
        setReservations(data.reservations);
      } catch (error) {
        console.error('Sync error:', error);
      } finally {
        setSyncing(false);
      }
    };

    // Sync on mount
    syncReservations();

    // Sync every hour
    const interval = setInterval(syncReservations, 3600000);
    return () => clearInterval(interval);
  }, []);

  return { reservations, syncing };
}
`;

// ============================================================================
// 9. DATABASE SCHEMA (EXAMPLE - Using Prisma)
// ============================================================================

export const examplePrismaSchema = `
// prisma/schema.prisma

model Booking {
  id                String    @id @default(cuid())
  guestId          String
  guest            Guest     @relation(fields: [guestId], references: [id])
  units            String[]  // Array of unit IDs
  checkIn          DateTime
  checkOut         DateTime
  numberOfGuests   Int
  accommodationUsd Float
  transportationUsd Float
  totalUsd         Float
  totalMxn         Float
  status           String    @default("pending") // pending, confirmed, cancelled
  verified         Boolean   @default(false)
  verificationId   String?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  @@index([guestId])
  @@index([checkIn])
  @@index([status])
}

model Guest {
  id              String    @id @default(cuid())
  firstName       String
  lastName        String
  email           String    @unique
  phone           String?
  country         String?
  bookings        Booking[]
  verified        Boolean   @default(false)
  verificationId  String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model TransportationSelection {
  id        String   @id @default(cuid())
  bookingId String
  serviceId String
  priceUsd  Float
  createdAt DateTime @default(now())
}

model PromoCode {
  id                 String   @id @default(cuid())
  code               String   @unique
  discountPercentage Float?
  discountAmount     Float?
  maxUses            Int      @default(1)
  usesCount          Int      @default(0)
  validFrom          DateTime
  validTo            DateTime
  createdAt          DateTime @default(now())
}
`;

// ============================================================================
// 10. DEPLOYMENT CHECKLIST
// ============================================================================

export const deploymentChecklist = `
# Production Deployment Checklist

## Before Deployment
- [ ] All environment variables set in production
- [ ] Database migrations run (if using database)
- [ ] API keys rotated for production
- [ ] CORS configured correctly
- [ ] SSL certificate valid
- [ ] Payment processing in production mode
- [ ] Email service configured
- [ ] Analytics IDs updated

## Testing
- [ ] Booking flow works end-to-end
- [ ] Payment processing works
- [ ] Emails send correctly
- [ ] Exchange rates update
- [ ] ID verification works
- [ ] Responsive design on mobile
- [ ] Error handling tested
- [ ] Rate limiting verified

## Optimization
- [ ] Images optimized
- [ ] Code minified
- [ ] Caching headers set
- [ ] CDN configured
- [ ] Database indexes created
- [ ] Slow queries optimized

## Monitoring
- [ ] Error tracking enabled (Sentry)
- [ ] Analytics configured
- [ ] Uptime monitoring enabled
- [ ] Alerts set up
- [ ] Logs configured

## Post-Deployment
- [ ] Monitor error logs
- [ ] Check analytics
- [ ] Verify email delivery
- [ ] Test booking process
- [ ] Monitor performance
- [ ] User communication
`;

// ============================================================================
// Export all examples
// ============================================================================

export const allExamples = {
  stripePayment: exampleStripePayment,
  paymentForm: examplePaymentForm,
  emailConfirmation: exampleEmailConfirmation,
  whatsAppNotification: exampleWhatsAppNotification,
  guestProfile: exampleGuestProfile,
  bookingHistory: exampleBookingHistory,
  promoCodeHook: examplePromoCodeHook,
  analyticsHook: exampleAnalyticsHook,
  channelManagerSync: exampleChannelManagerSync,
  prismaSchema: examplePrismaSchema,
  deploymentChecklist,
};
