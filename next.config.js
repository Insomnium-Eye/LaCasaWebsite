/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    // The rides page used to live at /tours; keep old links and search results working.
    return [{ source: '/tours', destination: '/rides', permanent: true }];
  },
};

module.exports = nextConfig;
