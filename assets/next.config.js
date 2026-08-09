/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  cacheComponents: true,
  distDir: process.env.NEXT_DIST_DIR || '.next',
  partialPrefetching: true,
  async redirects() {
    return [
      {
        source: '/f/:formId*',
        destination: `${process.env.NEXT_PUBLIC_API_HOST}/v1/submissions/:formId*`,
        permanent: false,
      },
    ];
  },
  images: {
    qualities: [60, 75],
  },
  output: 'standalone',
};

module.exports = nextConfig;
