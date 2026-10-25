import type { Metadata } from "next";
import { Simulateur } from "@/components/sim/Simulateur";
import { IMAGE_PARTAGE, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: SITE.simulateur.titre,
  description: SITE.simulateur.description,
  // Les variantes ?exemple et ?etape= pointent vers l'adresse principale du simulateur.
  alternates: { canonical: "/simulateur/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: SITE.nom,
    title: SITE.simulateur.titre,
    description: SITE.simulateur.description,
    url: "/simulateur/",
    images: [IMAGE_PARTAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.simulateur.titre,
    description: SITE.simulateur.description,
    images: [IMAGE_PARTAGE.url],
  },
};

export default function PageSimulateur() {
  return <Simulateur />;
}
