/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // output: 'export',     // ← Remove or comment out this line for dynamic deployment
  // trailingSlash: true,  // Optional – remove unless you specifically need trailing slashes on all URLs
  images: {
    unoptimized: true,    // Keep this only if you plan to use next/image on a static host later.
                          // For Vercel (recommended), you can safely remove or set to false.
  },
};

module.exports = nextConfig;