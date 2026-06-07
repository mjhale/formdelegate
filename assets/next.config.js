/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/f/:formId*',
        destination: `${process.env.NEXT_PUBLIC_API_HOST}/v1/submissions/:formId*`,
        permanent: false,
      },
    ];
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  images: {
    qualities: [60, 75],
  },
  output: 'standalone',
};

module.exports = nextConfig;
