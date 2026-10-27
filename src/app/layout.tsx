import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SCRIPT_THEME } from "@/lib/theme";
import { IMAGE_PARTAGE, SITE, SITE_URL } from "@/lib/site";

// Polices hébergées dans le projet (src/fonts, licence SIL OFL, source Fontsource) : le build ne dépend
// plus de Google Fonts. Fichiers variables, sous-ensemble latin (accents français compris).
const jakarta = localFont({
  src: "../fonts/plus-jakarta-sans-latin-wght-normal.woff2",
  variable: "--font-jakarta",
  weight: "200 800",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

const display = localFont({
  src: "../fonts/bricolage-grotesque-latin-wght-normal.woff2",
  variable: "--font-bricolage",
  weight: "200 800",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  // Les URL relatives (canonical, image de partage) sont résolues par rapport à l'adresse publique du site.
  metadataBase: new URL(`${SITE_URL}/`),
  title: SITE.accueil.titre,
  description: SITE.accueil.description,
  applicationName: SITE.nom,
  // Propriété Google Search Console (doublée par public/google053fd03ee15c7aa8.html).
  verification: { google: "ZIoQfyx4LTQc0-D_65plvLI7xBeIs45slzF0BqTLfL8" },
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
      <body className="antialiased">
        <a href="#contenu" className="lien-evitement">
          Aller au contenu
        </a>
        {children}
      </body>
    </html>
  );
}
