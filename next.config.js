/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // /@SpatiumLapis → /u/SpatiumLapis (handled by pages/u/[username].tsx)
      {
        source: '/@:username',
        destination: '/u/:username',
      },
    ];
  },
};

module.exports = nextConfig;
