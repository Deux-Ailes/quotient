import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Généré une fois au build (export statique) : /sitemap.xml.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const maj = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: maj, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/simulateur/`, lastModified: maj, changeFrequency: "monthly", priority: 0.9 },
  ];
}
