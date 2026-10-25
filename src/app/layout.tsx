import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { SCRIPT_THEME } from "@/lib/theme";

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
  title: "Quotient | Simulateur d'impôt sur le revenu",
  description:
    "Estimez votre impôt sur le revenu en quelques minutes : quotient familial, frais réels (kilomètres, repas, télétravail), réductions et crédits d'impôt, taux de prélèvement à la source.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // L'attribut data-theme est posé par le script avant l'hydratation : on tolère l'écart côté React.
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_THEME }} />
      </head>
      <body className={`${jakarta.variable} ${display.variable} antialiased`}>{children}</body>
    </html>
  );
}
