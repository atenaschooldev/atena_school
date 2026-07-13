import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'www.cambridgeenglish.org',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'hcxpfzsmzusolvhtuhhm.supabase.co',
      },
    ],
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        canvas: false,
      };
      config.externals = [...(config.externals || []), 'jsdom', 'css-tree', 'canvas'];
    }
    // Next.js (webpack) can warn about large strings being serialized into the
    // filesystem cache. It's a performance hint, but it's noisy in CI/dev logs.
    config.infrastructureLogging = {
      ...(config.infrastructureLogging ?? {}),
      level: 'error',
    };
    return config;
  },
};

export default withNextIntl(nextConfig);
