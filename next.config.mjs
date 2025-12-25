/** @type {import('next').NextConfig} */
const nextConfig = {
  // Increase static generation timeout for heavy pages
  staticPageGenerationTimeout: 180,

  // Output standalone for production deployment
  output: 'standalone',
};

export default nextConfig;
