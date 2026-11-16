import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  // Les routes serveur lisent le CSV par chemin de fichier au demarrage.
  // L'inclusion explicite garantit sa presence dans les fonctions Vercel.
  outputFileTracingIncludes: {
    '/api/**': ['./data/idees_hexavia.csv'],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
