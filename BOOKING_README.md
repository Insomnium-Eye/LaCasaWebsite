# La Casa Booking System - Complete Implementation

## 🌟 Features

✅ **Currency Conversion**
- Live USD to MXN conversion using ExchangeRate-API
- Fallback to Frankfurter API if primary fails
- Daily caching with localStorage
- Rounds down to nearest 10 MXN
- Fallback rate: 20.5 MXN per USD

✅ **Transportation Add-ons**
- 6 pre-configured tour options
- Private jeep/SUV for up to 5 passengers
- Price range: $45–$150 USD
- Late-night surcharge: +$15 USD
- 10% discount for whole-house guests
- Real-time pricing with MXN display

✅ **ID Verification**
- Government ID upload
- Selfie verification
- File validation (type, size)
- Success/failure states
- Privacy-compliant process
- Ready for Veriff/Persona/Signzy integration

✅ **Booking Flow**
- Interactive calendar with date range selection
- Support for 1–3 units
- Guest count selector
- Whole-house package (10% discount)
- Extended-stay discounts:
  - 5% off for 7+ nights
  - 10% off for 14+ nights
  - 15% off for 30+ nights
- Real-time pricing breakdown

✅ **Design**
- Luxurious Oaxaca-inspired color palette
- Warm terracotta, amber, and green tones
- Fully responsive (mobile, tablet, desktop)
- Clean, modern UI with shadows and gradients
- Accessibility-friendly

---

## 📦 Quick Start

### 1. Extract Files

The following files have been created:

```
hooks/
  └── useUsdToMxn.ts

components/
  ├── TransportationAddons.tsx
  ├── IdVerification.tsx

app/
  └── booking/
      └── page.tsx

lib/
  └── transportationConfig.ts

types/
  └── booking.ts
```

### 2. Install Dependencies

No new npm packages required! Everything uses React hooks and native APIs.

```bash
npm install
# or
yarn install
```

### 3. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual API keys (optional).

### 4. Add Route to Navigation

Edit [components/Navigation.tsx](components/Navigation.tsx):

```tsx
<Link href="/booking" className="nav-link">
  🏠 Book Now
</Link>
```

### 5. Test Locally

```bash
npm run dev
```

Visit: `http://localhost:3000/booking`

---

## 🎯 Component Guide

### [hooks/useUsdToMxn.ts](hooks/useUsdToMxn.ts)

Custom hook for USD → MXN conversion

**Functions:**
- `convertToMxn(usdAmount)` → number (rounded down to 10 MXN)
- `formatCurrency(usdAmount)` → string (e.g., "$75 USD ≈ 1,540 MXN")
- `refetchRate()` → Promise

**State:**
- `rate` – Current exchange rate
- `loading` – Fetching status
- `error` – Any errors

**Example:**
```tsx
const { convertToMxn, formatCurrency, rate } = useUsdToMxn();
const mxn = convertToMxn(75);      // 1540
const display = formatCurrency(45);  // "$45 USD ≈ 920 MXN"
```

---

### [components/TransportationAddons.tsx](components/TransportationAddons.tsx)

Transportation selection with real-time pricing

**Props:**
```tsx
{
  isWholeHouse?: boolean;  // Apply 10% discount
  onAddonsChange?: (selectedAddons, totalUsd) => void;
}
```

**Services:**
- Oaxaca City Center: $45
- Airport (one-way): $55
- Monte Albán: $75
- Mitla + Hierve el Agua: $150
- Teotitlán + Mitla: $130
- Late-night surcharge: +$15

**Example:**
```tsx
<TransportationAddons
  isWholeHouse={true}
  onAddonsChange={(addons, total) => {
    console.log(`Selected ${addons.length} services, total: $${total}`);
  }}
/>
```

---

### [components/IdVerification.tsx](components/IdVerification.tsx)

ID verification flow with file upload

**Props:**
```tsx
{
  onVerificationComplete?: (verified: boolean) => void;
  onStatusChange?: (status) => void;
}
```

**Status Values:**
- `pending` – Awaiting user action
- `in-progress` – Verification in process
- `verified` – Success
- `failed` – Failed, user can retry

**Example:**
```tsx
<IdVerification
  onVerificationComplete={(verified) => {
    if (verified) console.log("✅ Verified!");
  }}
/>
```

---

### [app/booking/page.tsx](app/booking/page.tsx)

Main booking page - integrates all components

**Features:**
- 4-step process: Units → Dates → Verify → Summary
- Calendar date picker
- Real-time pricing
- All calculations built-in
- Total in USD & MXN

**Units:**
- Bungalow 1: $120/night, 4 guests
- Bungalow 2: $120/night, 4 guests
- One Bedroom: $80/night, 2 guests

**Navigation:**
- Step indicators at top
- Back/Forward buttons
- Review before confirming

---

## 🎨 Tailwind Colors Used

Add these to your `tailwind.config.js` if not already present:

```javascript
colors: {
  amber: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    // ... (existing Tailwind colors)
    900: '#78350F',
  },
  orange: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    // ... (existing colors)
  },
  green: {
    50: '#F0FDF4',
    600: '#16A34A',
    700: '#15803D',
    // ... (existing colors)
  },
}
```

---

## 🔧 Configuration

### Transportation Services

Edit [lib/transportationConfig.ts](lib/transportationConfig.ts):

```tsx
export const TRANSPORTATION_SERVICES = {
  local_tours: {
    your_service_id: {
      name: 'Service Name',
      description: 'Description',
      priceUsd: 100,
      // ...
    },
  },
};
```

### Extended-Stay Discounts

Edit `BookingPage.tsx` → `getDiscountRate()`:

```tsx
const nights = calculateNights();
if (nights >= 30) return 0.15; // 15% discount
if (nights >= 14) return 0.10; // 10% discount
if (nights >= 7) return 0.05;  // 5% discount
return 0;
```

### Units

Edit `BookingPage.tsx` → `UNITS` constant:

```tsx
const UNITS: Unit[] = [
  { id: 'bungalow1', name: 'Bungalow 1', basePrice: 120, maxGuests: 4 },
  // ... add/edit units
];
```

---

## 🚀 Advanced Integration

### Channel Manager (Lodgify/Hostaway)

Replace mock availability with real data:

```tsx
// In BookingPage.tsx
useEffect(() => {
  const fetchAvailability = async () => {
    const response = await fetch('/api/availability?property=bungalow1');
    const data = await response.json();
    setAvailability(data);
  };
  fetchAvailability();
}, []);
```

See [BOOKING_INTEGRATION_GUIDE.md](BOOKING_INTEGRATION_GUIDE.md) for details.

### ID Verification Service

To use real verification (Veriff/Persona/Signzy):

1. Sign up at service website
2. Get API key
3. Add to `.env.local`
4. Replace mock implementation in `IdVerification.tsx`

See [BOOKING_INTEGRATION_GUIDE.md](BOOKING_INTEGRATION_GUIDE.md#-id-verification-component) for code.

### Server-Side Exchange Rate

For better caching, create `app/api/exchange-rate/route.ts`

See [API_EXAMPLES.md](API_EXAMPLES.md) for code sample.

---

## 📊 Pricing Calculation

### Formula

```
nights = (checkOut - checkIn).days
nightlyRate = sum(unit.basePrice) / units.count
discountRate = getDiscountRate(nights)
subtotal = nightlyRate * nights
discount = subtotal * discountRate
accommodation = subtotal - discount
total = accommodation + transportation
```

### Discounts (Stacking)

1. **Whole-House Discount** (10%) → Applied to nightly rate
2. **Extended-Stay Discount** → Applied to accommodation subtotal
3. **Whole-House Guests** → Get additional 10% off transportation

Example:
```
3 Bungalows, 14 nights:
- Nightly: $120 × 3 = $360
- Whole-house: $360 × 0.9 = $324/night
- Subtotal: $324 × 14 = $4,536
- Extended-stay (10%): $4,536 × 0.1 = $453.60
- Accommodation: $4,536 - $453.60 = $4,082.40
- Transportation: $150 × 0.9 = $135 (with 10% discount)
- TOTAL: $4,217.40
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Currency conversion updates on load
- [ ] Calendar date selection works
- [ ] Extended-stay discounts calculate correctly
- [ ] Transportation add-ons total updates
- [ ] Whole-house discount (10%) applies
- [ ] ID verification flow completes
- [ ] Pricing breakdown shows all components
- [ ] MXN amounts are correct (USD × rate, rounded down)
- [ ] Mobile layout responsive
- [ ] All buttons navigate correctly

### Browser Console

Check for errors:
```javascript
// Check cached exchange rate
localStorage.getItem('usd_mxn_rate_2026-04-15')

// Manually test conversion
const rate = JSON.parse(localStorage.getItem('usd_mxn_rate_2026-04-15'))
Math.floor((75 * rate) / 10) * 10 // Should be ~1540
```

---

## 🌐 Deployment

### Vercel (Recommended)

```bash
# Deploy
vercel deploy

# Preview
vercel
```

### Build Check

```bash
npm run build
```

### Environment Variables

Set in Vercel dashboard:
- Project Settings → Environment Variables
- Add all variables from `.env.example`

---

## 📱 Responsive Design Breakpoints

- **Mobile**: < 640px (auto)
- **Tablet (sm)**: 640px+
- **Desktop (md)**: 768px+
- **Large (lg)**: 1024px+ (sidebar appears)

---

## 💾 Browser Storage

Uses `localStorage` for 24-hour caching:

```javascript
// Exchange rate
usd_mxn_rate_YYYY-MM-DD → "20.5"

// Guest preferences (optional future feature)
booking_preferences → JSON string
```

---

## 🔒 Security Notes

- ID verification files: Validate size (max 10MB) and type
- Never store sensitive data in localStorage
- Use HTTPS in production
- Sanitize all user inputs
- Implement rate limiting on APIs

---

## 📞 Support & Troubleshooting

See [BOOKING_INTEGRATION_GUIDE.md](BOOKING_INTEGRATION_GUIDE.md#-troubleshooting)

**Common Issues:**
- Exchange rate stuck on fallback → Check network
- Dates not updating → Check React DevTools
- Mobile layout breaks → Test in DevTools
- API errors → Check browser console

---

## 📝 File Reference

| File | Purpose |
|------|---------|
| `hooks/useUsdToMxn.ts` | Currency conversion hook |
| `components/TransportationAddons.tsx` | Transportation selection |
| `components/IdVerification.tsx` | ID verification flow |
| `app/booking/page.tsx` | Main booking page |
| `lib/transportationConfig.ts` | Configuration & data |
| `types/booking.ts` | TypeScript interfaces |
| `.env.example` | Environment template |
| `BOOKING_INTEGRATION_GUIDE.md` | Detailed integration guide |
| `API_EXAMPLES.md` | Server API examples |

---

## 🎓 Next Steps

1. ✅ Copy components to your project
2. ✅ Set up `.env.local`
3. ✅ Add `/booking` route to navigation
4. ✅ Test locally
5. ⏭️ [Optional] Integrate channel manager
6. ⏭️ [Optional] Set up ID verification service
7. ⏭️ [Optional] Add payment processing
8. ⏭️ Deploy to production

---

## 📄 License & Attribution

This booking system was built with:
- React 18+
- Next.js App Router (TypeScript)
- Tailwind CSS
- ExchangeRate-API (free tier)

---

**Version**: 1.0.0  
**Last Updated**: April 2026  
**Maintained By**: Your Team

For questions, see the documentation files or check the inline code comments.
