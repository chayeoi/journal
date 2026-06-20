import type { NextConfig } from 'next';
import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin';

const withVanillaExtract = createVanillaExtractPlugin({
  unstable_turbopack: { mode: 'auto' },
});

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    loader: 'custom',
    loaderFile: './src/lib/supabaseImageLoader.ts',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default withVanillaExtract(nextConfig);
