/**
 * Informations du site utilisées pour le SEO (URL canonique, sitemap, partage, données structurées).
 * NEXT_PUBLIC_SITE_URL permet de basculer vers un nom de domaine propre sans toucher au code.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://deux-ailes.github.io/quotient").replace(/\/$/, "");

export const SITE = {
  nom: "Quotient",
  accueil: {
    titre: "Simulateur impôt 2026 : frais réels, télétravail | Quotient",
    description:
      "Calculez votre impôt 2026 en 5 minutes : frais réels (kilomètres, repas, télétravail), quotient familial, crédits d'impôt. Gratuit, sans compte.",
  },
  simulateur: {
    titre: "Simulateur d'impôt et de frais réels pas à pas | Quotient",
    description:
      "Simulez votre impôt pas à pas : foyer, revenus, frais réels, réductions. Détail du calcul, cases de la déclaration et justificatif à copier.",
  },
} as const;

/** Image de partage (public/og.png). Next.js remplace openGraph en entier dans une page : à répéter partout. */
export const IMAGE_PARTAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "Quotient, simulateur d'impôt sur le revenu et de frais réels",
};
