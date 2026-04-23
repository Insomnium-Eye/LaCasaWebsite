# Guest Portal Setup Instructions

## Critical Changes Required

This Guest Portal implementation requires significant infrastructure changes from the current static GitHub Pages setup.

### 1. Hosting Migration (REQUIRED)

**Current:** GitHub Pages (static site)
**Required:** Vercel, Netlify, or AWS Lambda (serverless with backend support)

**Recommendation: Migrate to Vercel**
- Sign up at https://vercel.com
- Connect your GitHub repository
- Vercel automatically detects Next.js and deploys both frontend and API routes
- Free tier includes serverless functions
- Deploy: `git push` triggers automatic deployment

### 2. Database Setup (REQUIRED)

**Option A: Supabase (Recommended)**
1. Sign up at https://supabase.com
2. Create new project
3. Go to Settings > API to find:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Run SQL migration: Copy contents of `db/schema.sql` into Supabase SQL editor
5. Add credentials to `.env.local`

**Option B: PostgreSQL Self-Hosted**
- Install PostgreSQL locally
- Run `db/schema.sql` against your database
- Configure connection string in `.env.local`

### 3. Environment Configuration

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

**Required Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_JWT_SECRET` (change from default!)
- `ADMIN_USERNAME` / `ADMIN_PASSWORD`

**Optional But Recommended:**
- `CLOUDINARY_*` (for image uploads in reviews)
- `SENDGRID_API_KEY` (for email notifications)
- `TWILIO_*` (for SMS notifications)

### 4. Add Sample Reservations (For Testing)

Run this in Supabase SQL editor to add test data:

```sql
INSERT INTO reservations (
  guest_first_name, guest_last_name, email, phone, digital_key,
  unit_id, unit_name, check_in, check_out, nightly_rate, status
) VALUES
  ('John', 'Doe', 'john@example.com', '+525551234567', 'KEY123ABC', 
   'unit-1', 'Bungalow A', '2024-04-25', '2024-04-30', 150.00, 'confirmed'),
  ('Jane', 'Smith', 'jane@example.com', '+525559876543', 'KEY456DEF',
   'unit-2', 'Bungalow B', '2024-04-26', '2024-05-03', 120.00, 'confirmed');
```

Test logins:
- Email: `john@example.com`
- Phone: `+525551234567`
- Digital Key: `KEY123ABC`

### 5. Integration: Add Portal to Home Page

In `app/page.tsx`, add the Guest Portal component:

```tsx
import GuestPortal from '@/components/GuestPortal';

export default function Home() {
  return (
    <div>
      {/* ... existing content ... */}
      <GuestPortal />
    </div>
  );
}
```

Or create a dedicated route:
- Create `app/portal/page.tsx`
- Add to navigation menu

### 6. Install Dependencies & Deploy

```bash
# Install new packages
npm install

# Test locally
npm run dev
# Visit http://localhost:3000

# Push to GitHub (auto-deploys to Vercel)
git push
```

### 7. Future Enhancements (Post-Launch)

These features need external service integration:

- **Email Notifications**: Connect SendGrid or Mailgun
  - Routes that need emails: `/api/requests/*`, `/api/reviews`
  - Uncomment `// TODO: Send notification` comments

- **Image Upload**: Connect Cloudinary or AWS S3
  - Update `uploadReviewImage()` in `app/api/reviews/route.ts`

- **SMS Notifications**: Connect Twilio
  - Optional for property manager alerts

## Testing Checklist

- [ ] Login with email, phone, and digital key
- [ ] All five portal features load and submit without errors
- [ ] Success/error messages display correctly
- [ ] Forms validate inputs properly
- [ ] Date pickers restrict to stay dates
- [ ] Transport pricing updates dynamically
- [ ] Images upload without errors
- [ ] Admin review approval endpoint works

## Troubleshooting

**"Missing Supabase credentials" error**
- Check `.env.local` has all Supabase variables
- Ensure `NEXT_PUBLIC_` prefix for client-side variables
- Run `npm run dev` again after adding variables

**"Invalid token" when trying to make requests**
- JWT secret might be mismatched between .env files
- Check `NEXT_PUBLIC_JWT_SECRET` is consistent

**Reservations not found**
- Verify test data was inserted correctly
- Check email/phone format matches DB

**Vercel deployment fails**
- Ensure all files in `app/api/` exist
- Check for TypeScript errors: `npm run build`
- View logs in Vercel dashboard

## Security Notes

⚠️ **BEFORE GOING LIVE:**
1. Change `NEXT_PUBLIC_JWT_SECRET` to a strong random string
2. Change `ADMIN_PASSWORD` to secure credentials
3. Enable HTTPS (automatic on Vercel)
4. Rate limiting is implemented but verify it's working
5. Validate all inputs server-side (already done, but double-check)
6. Never expose service role key to client
7. Add CORS restrictions if needed
