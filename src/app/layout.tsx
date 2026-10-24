import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

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
  title: "Quotient — Simulateur d'impôt sur le revenu",
  description:
    "Estimez votre impôt sur le revenu en quelques minutes : quotient familial, frais réels (kilomètres, repas, télétravail), réductions et crédits d'impôt, taux de prélèvement à la source.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${jakarta.variable} ${display.variable} antialiased`}>{children}</body>
    </html>
  );
}
