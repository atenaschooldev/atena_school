import createNextIntlPlugin from 'next-intl/plugin';
import withBundleAnalyzer from '@next/bundle-analyzer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@atena/core',
    '@atena/api-types',
    '@atena/api-client',
    '@atena/utils',
    '@atena/validators',
    '@repo/api',
    '@repo/design',
  ],
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  turbopack: {
    root: path.resolve(__dirname, '../..'),
    resolveAlias: {
      'next-intl/config': './src/i18n/request.ts',
      react: './node_modules/react',
      'react-dom': './node_modules/react-dom',
    },
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        react: path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      };
    }
    config.infrastructureLogging = {
      ...(config.infrastructureLogging ?? {}),
      level: 'error',
    };
    return config;
  },
};

const config = withAnalyzer(withNextIntl(nextConfig));
if (config.experimental?.turbo) {
  delete config.experimental.turbo;
}

export default config;
