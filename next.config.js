/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  webpack: (config, { isServer }) => {
    // Add support for PDF files
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;

    // Fix for pdfjs-dist in client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
      };
    }

    return config;
  },
}

module.exports = nextConfig 