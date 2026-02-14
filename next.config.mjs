/** @type {import('next').NextConfig} */
const isGHPages = process.env.DEPLOY_TARGET === 'gh-pages';
const basePath = isGHPages ? '/patentworld' : '';
const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: isGHPages ? '/patentworld/' : '',
  images: { unoptimized: true },
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
