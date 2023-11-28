/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => [
    {
      source: "/static/:slug*",
      destination: "http://localhost:8000/static/:slug*",
    },

    {
      source: "/api/:slug*",
      // trailing slash in destination is required
      destination: "http://localhost:8000/api/:slug*/",
    },
  ],
};

module.exports = nextConfig;
