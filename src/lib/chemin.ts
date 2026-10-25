/**
 * Préfixe un chemin absolu avec le basePath du site (vide en local, "/quotient" sur GitHub Pages).
 * Nécessaire pour les chemins que Next.js ne réécrit pas lui-même : src de next/image
 * et liens HTML classiques. Les <Link> de Next.js n'en ont pas besoin.
 */
export const chemin = (p: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${p}`;
