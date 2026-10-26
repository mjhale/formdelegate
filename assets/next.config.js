/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  cacheComponents: true,
  distDir: process.env.NEXT_DIST_DIR || '.next',
  partialPrefetching: true,
  // Proxy submissions so cross-origin redirects do not turn Origin into null.
  async rewrites() {
    return [
      {
        source: '/f/:formId*',
        destination: `${process.env.NEXT_PUBLIC_API_HOST}/v1/submissions/:formId*`,
      },
    ];
  },
  images: {
    qualities: [60, 75],
  },
  output: 'standalone',
};

module.exports = nextConfig;
