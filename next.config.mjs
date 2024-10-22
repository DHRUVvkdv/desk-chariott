/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
      NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
    },
    images: {
      domains: ['chariott-assets.s3.amazonaws.com'],
    },
  }
export default nextConfig;
