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
  images: {
    qualities: [60, 75],
  },
  output: 'standalone',
};

module.exports = nextConfig;
