/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: "/_next/static/chunks/maplibre-gl-worker.mjs",
        destination: "/maplibre-gl-worker.mjs",
      },
      {
        source: "/_next/static/chunks/maplibre-gl-worker.js",
        destination: "/maplibre-gl-worker.js",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/maplibre-gl-worker.mjs",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=UTF-8",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
      {
        source: "/maplibre-gl-worker.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=UTF-8",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
