import type { NextConfig } from "next";

/**
 * Préfixe d'URL du site publié. Vide en local ; "/quotient" sur GitHub Pages
 * (défini par le workflow .github/workflows/deploy.yml), le site étant servi sous deux-ailes.github.io/quotient/.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Site entièrement statique (dossier out/) : le calcul se fait dans le navigateur, aucun serveur n'est nécessaire.
  output: "export",
  basePath,
  // Chaque page devient dossier/index.html, servi tel quel par GitHub Pages.
  trailingSlash: true,
  // L'optimisation d'images de Next.js a besoin d'un serveur : les images sont servies telles quelles.
  images: { unoptimized: true },
  // Pas de badge de développement : il apparaîtrait dans les captures du simulateur.
  devIndicators: false,
};

export default nextConfig;
