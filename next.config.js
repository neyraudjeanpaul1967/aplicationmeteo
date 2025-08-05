/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Désactivation complète des optimisations qui causent les préchargements
  swcMinify: false,
  // Configuration des images sans préchargement
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "openweathermap.org",
        pathname: "/img/wn/**",
      },
    ],
    // Désactiver le lazy loading qui peut causer des préchargements
    unoptimized: false,
  },
  // Variables d'environnement
  env: {
    NEXT_PUBLIC_OPENWEATHER_API_KEY:
      process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
  },
  // Configuration Webpack ultra-simple pour éviter les préchargements
  webpack: (config, { dev, isServer }) => {
    // Désactiver tous les préchargements automatiques
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: false, // Désactive le splitting qui cause les préchargements
      };

      // Désactiver les préchargements de ressources
      config.output = {
        ...config.output,
        crossOriginLoading: false,
      };
    }

    return config;
  },
  // Headers pour bloquer complètement les préchargements
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "off",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
