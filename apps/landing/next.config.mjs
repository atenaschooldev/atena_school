import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: {
    fetches: {
      fullUrl: false,
    },
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
  turbopack: {
    root: path.resolve(__dirname, '../..'),
    resolveAlias: {
      // next-intl: map virtual config module to the request config file
      // (createNextIntlPlugin sets this via deprecated experimental.turbo which our turbopack: block shadows)
      'next-intl/config': './src/i18n/request.ts',
      react: './node_modules/react',
      'react-dom': './node_modules/react-dom',
      fs: { browser: './src/lib/mocks/empty.ts' },
      net: { browser: './src/lib/mocks/empty.ts' },
      tls: { browser: './src/lib/mocks/empty.ts' },
      child_process: { browser: './src/lib/mocks/empty.ts' },
      canvas: { browser: './src/lib/mocks/empty.ts' },
      jsdom: { browser: './src/lib/mocks/empty.ts' },
      'css-tree': { browser: './src/lib/mocks/empty.ts' },
    },
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        react: path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      };
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        canvas: false,
        jsdom: false,
        'css-tree': false,
      };
    }
    // Next.js (webpack) can warn about large strings being serialized into the
    // filesystem cache. It's a performance hint, but it's noisy in CI/dev logs.
    config.infrastructureLogging = {
      ...(config.infrastructureLogging ?? {}),
      level: 'error',
    };
    return config;
  },
  async redirects() {
    return [
      {
        source: '/checkout/course/:id',
        destination: '/checkout/:id',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
        ],
      },
    ];
  },
};

const config = withNextIntl(nextConfig);
if (config.experimental?.turbo) {
  delete config.experimental.turbo;
}

export default config;
