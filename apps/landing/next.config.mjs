import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
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
