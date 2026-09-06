/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Permite que warnings não quebrem o build de produção
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
