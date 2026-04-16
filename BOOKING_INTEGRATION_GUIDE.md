# La Casa Booking System - Integration Guide

## 📋 Overview

This booking system provides:
- 📅 Interactive calendar with availability management
- 🚗 Transportation add-ons with live pricing
- 💳 USD to MXN conversion with daily caching
- 🆔 ID verification flow
- 💰 Dynamic pricing with extended-stay discounts
- 🏡 Support for 3 units + whole-house bookings
- 🎨 Luxurious Oaxaca-inspired design

---

## 🏗️ File Structure

```
hooks/
  └── useUsdToMxn.ts              # Currency conversion hook with caching

components/
  ├── TransportationAddons.tsx     # Transportation selection & pricing
  ├── IdVerification.tsx            # ID verification flow
  └── [existing components]

lib/
  ├── transportationConfig.ts       # Configuration & channel manager setup
  ├── currency.ts                   # [existing]
  └── translations.ts               # [existing]

app/
  └── booking/
      └── page.tsx                  # Main booking page

data/
  └── units.ts                      # [existing] Unit definitions
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn add
```

No new dependencies required! Uses only React hooks and native APIs.

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Exchange Rate API
NEXT_PUBLIC_EXCHANGE_RATE_API=exchangerate-api
# Leave empty to use fallback (Frankfurter API)

# Channel Manager Integration (Optional)
NEXT_PUBLIC_CHANNEL_API_URL=https://api.lodgify.com
NEXT_PUBLIC_CHANNEL_API_KEY=your_lodgify_api_key

# ID Verification Service (Optional)
NEXT_PUBLIC_VERIFICATION_API_URL=https://api.veriff.com
NEXT_PUBLIC_VERIFICATION_API_KEY=your_veriff_api_key
```

### 3. Add Route to Navigation

Update `components/Navigation.tsx` to include a link to the booking page:

```tsx
<Link href="/booking" className="...">Booking</Link>
```

### 4. Test the Implementation

Navigate to `http://localhost:3000/booking` to see the booking flow.

---

## 💱 Currency Conversion Hook (`useUsdToMxn`)

### Features
- **Live Rate Fetching**: Uses ExchangeRate-API with Frankfurter fallback
- **Daily Caching**: Stores rate in localStorage for 24 hours
- **Fallback Rate**: 20.5 MXN per USD if APIs fail
- **Rounding**: Automatically rounds DOWN to nearest 10 MXN

### Usage

```tsx
import useUsdToMxn from '@/hooks/useUsdToMxn';

function MyComponent() {
  const { rate, loading, error, convertToMxn, formatCurrency } = useUsdToMxn();

  // Convert single amount
  const mxnAmount = convertToMxn(75);  // Returns: 1540 (rounded down)

  // Format for display
  const display = formatCurrency(45);   // Returns: "$45 USD ≈ 920 MXN"

  if (loading) return <div>Fetching rates...</div>;
  if (error) return <div>⚠️ {error}</div>;

  return <p>Current rate: {rate} MXN per USD</p>;
}
```

### API Structure
- **ExchangeRate-API**: `https://api.exchangerate-api.com/v4/latest/USD`
- **Frankfurter**: `https://api.frankfurter.app/latest?from=USD&to=MXN`
- Both are free tier with no authentication

---

## 🚗 Transportation Add-ons Component

### Features
- Checkbox selection for multiple destinations
- Dynamic price calculation with discounts
- 10% whole-house guest discount
- Real-time USD to MXN conversion
- Responsive grid layout

### Usage

```tsx
import TransportationAddons from '@/components/TransportationAddons';

function BookingPage() {
  const handleAddonsChange = (selectedAddons, totalUsd) => {
    console.log('Selected addons:', selectedAddons);
    console.log('Total USD:', totalUsd);
  };

  return (
    <TransportationAddons
      isWholeHouse={true}
      onAddonsChange={handleAddonsChange}
    />
  );
}
```

### Available Services
- Oaxaca City Center: $45 USD
- Oaxaca Airport (one-way): $55 USD
- Monte Albán: $75 USD
- Mitla + Hierve el Agua: $150 USD
- Teotitlán del Valle + Mitla: $130 USD
- Airport late-night surcharge: +$15 USD

### Customization

Edit `components/TransportationAddons.tsx`:

```tsx
const TRANSPORTATION_OPTIONS: TransportationOption[] = [
  {
    id: 'your_id',
    name: 'Service Name',
    description: 'Description',
    priceUsd: 100,
    type: 'roundtrip' | 'oneway' | 'fullday',
  },
  // Add more...
];
```

---

## 🆔 ID Verification Component

### Features
- Step-by-step verification flow
- File upload with validation
- Progress indicators
- Success/error states with retry
- Privacy information displayed

### Usage

```tsx
import IdVerification from '@/components/IdVerification';

function MyPage() {
  return (
    <IdVerification
      onVerificationComplete={(verified) => {
        if (verified) {
          console.log('✅ ID verified!');
        } else {
          console.log('❌ Verification failed');
        }
      }}
      onStatusChange={(status) => {
        console.log('Status:', status); // 'pending' | 'in-progress' | 'verified' | 'failed'
      }}
    />
  );
}
```

### Integration with Real Services

#### Option 1: Veriff (Recommended)

1. Sign up at https://www.veriff.com/
2. Get your API key from dashboard
3. Install SDK: `npm install @veriff/js-sdk`
4. Replace mock API in `components/IdVerification.tsx`:

```tsx
import Veriff from '@veriff/js-sdk';

const handleSubmitVerification = async () => {
  const veriff = new Veriff({
    onSession: async (token) => {
      const response = await fetch('/api/veriff/submit', {
        method: 'POST',
        body: JSON.stringify({ token, idFile, selfieFile }),
      });
      // Handle response...
    },
  });
  veriff.launch();
};
```

#### Option 2: Persona

1. Sign up at https://withpersona.com/
2. Install SDK: `npm install @persona-web/inquiry`
3. Replace mock implementation with Persona SDK:

```tsx
import { PersonaInquiry } from '@persona-web/inquiry';

const inquiry = new PersonaInquiry({
  apiKey: process.env.NEXT_PUBLIC_PERSONA_API_KEY,
  templatedFlow: true,
});
```

---

## 📅 Booking Page (`app/booking/page.tsx`)

### Main Features

#### 1. Unit Selection
- Choose 1-3 units (Bungalow 1, Bungalow 2, One Bedroom)
- Automatic 10% discount when booking all 3 units
- Base prices: $120/night (bungalows), $80/night (bedroom)

#### 2. Calendar Integration
- Interactive date picker
- Visual range selection
- Check-in/check-out date display
- Month navigation

#### 3. Extended-Stay Discounts
- 5% off for 7+ nights
- 10% off for 14+ nights
- 15% off for 30+ nights

#### 4. Pricing Breakdown
- Nightly rate calculation
- Discount application
- Transportation add-ons
- Total in both USD and MXN

#### 5. ID Verification
- Built-in verification flow
- Completion check before booking

---

## 🔗 Channel Manager Integration

### Integration with Lodgify

```typescript
// In hooks/useChannelManager.ts (create this file)
import { CHANNEL_MANAGER_CONFIG } from '@/lib/transportationConfig';

async function fetchAvailability(propertyId: string, startDate: Date, endDate: Date) {
  const response = await fetch(
    `${CHANNEL_MANAGER_CONFIG.apiUrl}/reservations`,
    {
      headers: {
        'Authorization': `Bearer ${CHANNEL_MANAGER_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        propertyId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }),
    }
  );
  return response.json();
}
```

### Prevent Double-Bookings

Replace mock availability in `BookingPage.tsx`:

```tsx
// Instead of:
// const MOCK_AVAILABILITY = { ... }

// Use real data:
const [availability, setAvailability] = useState({});

useEffect(() => {
  const fetchAvailability = async () => {
    const avail = await useChannelManager();
    setAvailability(avail);
  };
  fetchAvailability();
}, [currentMonth]);
```

---

## 🎨 Design & Styling

### Color Palette (Oaxaca-Inspired)

- **Terracotta/Amber**: `#B45309`, `#92400E` (primary)
- **Green**: `#15803D`, `#166534` (accents, CTAs)
- **Warm Beige**: `#FEF3C7` (backgrounds)
- **Cream**: `#FFFBEB` (cards)

### Responsive Design

- Mobile: 1 column layout
- Tablet (md): 2 columns for options
- Desktop (lg): 3 columns with sticky sidebar
- Full Width Forms: adapted for all screen sizes

### Key Components Styling

```tsx
// Primary Button
className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg"

// Card
className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-600"

// Section Header
className="text-3xl font-bold text-amber-900 mb-6"

// Selected State
className="border-green-500 bg-green-50 shadow-md"
```

---

## ✅ Checklist for Deployment

- [ ] Set up environment variables (`.env.local`)
- [ ] Configure exchange rate API (or use fallback)
- [ ] (Optional) Integrate with channel manager (Lodgify/Hostaway)
- [ ] (Optional) Set up ID verification service (Veriff/Persona)
- [ ] Test booking flow end-to-end
- [ ] Test currency conversion with real rates
- [ ] Test ID verification flow
- [ ] Test transportation add-ons calculation
- [ ] Mobile responsiveness check
- [ ] A/B test booking completion rates
- [ ] Set up analytics/tracking (GA4)
- [ ] Deploy to production

---

## 🐛 Troubleshooting

### Exchange Rate Not Loading

**Problem**: Exchange rate shows default fallback
**Solution**:
1. Check browser console for CORS errors
2. Verify ExchangeRate-API is accessible
3. Check localStorage cache: `localStorage.getItem('usd_mxn_rate_2026-04-15')`
4. Try manual refetch: `refetchRate()`

### Verification Service Not Working

**Problem**: ID verification stuck on upload
**Solution**:
1. Check file size (max 10MB)
2. Verify file is image format
3. Check browser permissions for file upload
4. Check network tab for failed requests

### Calendar Dates Not Updating

**Problem**: Selected dates not showing in summary
**Solution**:
1. Verify calendar click handlers are firing
2. Check date state in React DevTools
3. Ensure `calculateNights()` returns correct value
4. Review date range logic

---

## 📞 API References

### ExchangeRate-API
- Docs: https://www.exchangerate-api.com/docs
- Free tier: 1,500 requests/month
- Rate limits: No

### Frankfurter
- Docs: https://frankfurter.app/
- Free tier: Unlimited
- Rate limits: None

### Veriff
- Docs: https://veriff.com/developers
- Pricing: Per verification

---

## 🔮 Future Enhancements

- [ ] Integration with payment processor (Stripe)
- [ ] Email confirmation with booking details
- [ ] Admin dashboard for availability management
- [ ] Guest reviews and ratings
- [ ] Multi-language support (currently Spanish/English ready)
- [ ] WhatsApp confirmation integration
- [ ] Calendar sync with Google Calendar
- [ ] Dynamic pricing based on demand
- [ ] Promotional code system

---

## 📝 Notes

- All prices are in USD, converted to MXN for display
- Whole-house booking = all 3 units with 10% discount
- Extended-stay discounts apply to accommodation only
- Transportation discounts are separate (10% for whole-house guests)
- ID verification is required before final confirmation
- All dates are in local Oaxaca time (CST/CDT)

---

## 💬 Support

For questions or issues:
1. Check this guide's troubleshooting section
2. Review component comments in source code
3. Test in development environment first
4. Check browser console for errors

---

**Last Updated**: April 2026
**Version**: 1.0.0
