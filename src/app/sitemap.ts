import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";

// Généré une fois au build (export statique) : /sitemap.xml.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const maj = new Date();
  const derniereMajGuides = GUIDES.map((g) => g.misAJour).sort().at(-1);
  return [
    { url: `${SITE_URL}/`, lastModified: maj, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/simulateur/`, lastModified: maj, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/guides/`, lastModified: derniereMajGuides, changeFrequency: "monthly", priority: 0.7 },
    ...GUIDES.map((g) => ({
      url: `${SITE_URL}/guides/${g.slug}/`,
      lastModified: g.misAJour,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
