#!/bin/bash

# GitHub Pages Deployment Script for La Casa Oaxaca
# Run this script after pushing changes to your GitHub repository

echo "🚀 Deploying La Casa Oaxaca to GitHub Pages..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Build the static export
echo "📦 Building static export..."
npm run build

# Check if build was successful
if [ ! -d "out" ]; then
    echo "❌ Error: Build failed. 'out' directory not found."
    exit 1
fi

echo "✅ Build successful!"

# Instructions for GitHub setup
echo ""
echo "📋 Next Steps:"
echo "1. Push this code to your GitHub repository:"
echo "   git add ."
echo "   git commit -m 'Add GitHub Pages deployment'"
echo "   git push origin main"
echo ""
echo "2. Enable GitHub Pages in your repository:"
echo "   - Go to Settings → Pages"
echo "   - Select 'GitHub Actions' as source"
echo "   - The workflow will automatically deploy"
echo ""
echo "3. Configure custom domain:"
echo "   - In Pages settings, add 'oaxaca-rental.com'"
echo "   - Update DNS records with your domain registrar"
echo ""
echo "4. For form handling, choose one option:"
echo "   - Netlify Forms: Deploy to Netlify instead"
echo "   - Formspree: Sign up and add form IDs"
echo "   - EmailJS: Configure email service"
echo ""
echo "🌐 Your site will be available at: https://oaxaca-rental.com"
echo ""
echo "📧 For backend functionality (bookings, payments):"
echo "   - Consider Netlify Functions or Vercel"
echo "   - Integrate with Lodgify/Hostaway for bookings"
echo "   - Use Stripe/PayPal for payments"