/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "kaiphan.site", "www.kaiphan.site"],
    }
  }
};

module.exports = nextConfig;
