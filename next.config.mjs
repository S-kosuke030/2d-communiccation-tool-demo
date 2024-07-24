/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push({
      perf_hooks: 'perf_hooks',
    });
    return config;
  },
};

export default nextConfig;
