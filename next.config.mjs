/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['lucide-react', '@clerk/nextjs', 'framer-motion', 'react-icons'],
  },
};

export default nextConfig;
