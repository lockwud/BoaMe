/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@boame/shared-types", "@boame/ui"],
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  }
};

export default nextConfig;
