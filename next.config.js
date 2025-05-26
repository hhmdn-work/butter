/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'image.tmdb.org',
            pathname: '/t/p/**',
          },
        ],
  },
webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ignored: ['**.json'],
      };
    }
    return config;
  },
}

module.exports = nextConfig
