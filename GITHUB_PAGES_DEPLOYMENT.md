# La Casa Oaxaca - GitHub Pages Deployment Guide

## 🚀 Deploying to GitHub Pages

### Prerequisites
1. GitHub repository created for `oaxaca-rental.com`
2. Domain configured in GitHub repository settings
3. GitHub Pages enabled for the repository

### Setup Steps

#### 1. Enable GitHub Pages
1. Go to your repository settings
2. Scroll to "Pages" section
3. Select "GitHub Actions" as the source
4. The workflow will automatically deploy on pushes to main branch

#### 2. Configure Custom Domain
1. In repository settings → Pages
2. Add `oaxaca-rental.com` as custom domain
3. GitHub will provide DNS records to configure with your domain registrar

#### 3. Environment Variables
Create `.env.local` with your configuration:
```bash
# Add to .env.local (not committed to repo)
NEXT_PUBLIC_SITE_URL=https://oaxaca-rental.com
```

## 📧 Form Handling (Backend Functionality)

Since GitHub Pages serves static content only, we need external services for form submissions:

### Option 1: Netlify Forms (Recommended)
1. **Deploy to Netlify** instead of GitHub Pages for full functionality
2. **Or use Netlify's form detection** on static sites

Update contact form to use Netlify Forms:
```html
<form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field">
  <input type="hidden" name="form-name" value="contact" />
  <!-- form fields -->
</form>
```

### Option 2: Formspree
Replace placeholder forms with Formspree integration:

```javascript
// In contact form component
const handleSubmit = async (e) => {
  e.preventDefault();
  const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  // handle response
};
```

### Option 3: EmailJS or similar service
For direct email sending from static sites.

## 💳 Payment Processing

For booking functionality, integrate with:

### Stripe Checkout
```javascript
// Create checkout session
const { data } = await fetch('/api/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ bookingData })
});
window.location = data.url;
```

### PayPal
Use PayPal's JavaScript SDK for payment buttons.

## 🏨 Booking Management

### Option 1: External Booking Platform
- **Lodgify** or **Hostaway** for property management
- Embed their booking widgets
- Handle payments through their platform

### Option 2: Custom Backend
- Deploy API to Vercel, Netlify Functions, or Railway
- Connect to database (Supabase, PlanetScale)
- Handle bookings, availability, payments

## 📋 Deployment Checklist

- [ ] GitHub repository created
- [ ] GitHub Pages enabled with Actions
- [ ] Custom domain configured
- [ ] DNS records updated
- [ ] Forms connected to external service
- [ ] Booking system integrated
- [ ] SSL certificate (automatic with GitHub Pages)
- [ ] Test all functionality

## 🔧 Local Development

```bash
npm install
npm run dev          # Development server
npm run build        # Production build
npm run export       # Static export for GitHub Pages
```

## 🌐 Domain Configuration

After deployment, configure DNS:
```
Type: A
Name: @
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153

Type: CNAME
Name: www
Value: oaxaca-rental.com
```

## 📞 Support

For issues with:
- **GitHub Pages**: Check repository settings and workflow logs
- **Forms**: Verify external service configuration
- **Domain**: Check DNS propagation (may take 24-48 hours)