import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { SCRIPT_THEME } from "@/lib/theme";
import { IMAGE_PARTAGE, SITE, SITE_URL } from "@/lib/site";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const display = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  // Les URL relatives (canonical, image de partage) sont résolues par rapport à l'adresse publique du site.
  metadataBase: new URL(`${SITE_URL}/`),
  title: SITE.accueil.titre,
  description: SITE.accueil.description,
  applicationName: SITE.nom,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: SITE.nom,
    title: SITE.accueil.titre,
    description: SITE.accueil.description,
    url: "/",
    images: [IMAGE_PARTAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.accueil.titre,
    description: SITE.accueil.description,
    images: [IMAGE_PARTAGE.url],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // L'attribut data-theme est posé par le script avant l'hydratation : on tolère l'écart côté React.
    // Les variables de police sont posées sur <html> : le thème Tailwind (--font-sans, --font-display)
    // les lit sur :root, où elles doivent donc être définies.
    <html lang="fr" className={`${jakarta.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_THEME }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
