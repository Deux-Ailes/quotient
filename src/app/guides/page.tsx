import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { formatDate, GUIDES } from "@/lib/guides";
import { IMAGE_PARTAGE } from "@/lib/site";

const titre = "Guides impôt et frais réels | Quotient";
const description =
  "Guides pour votre déclaration : frais réels de télétravail, frais réels ou abattement de 10 %, justificatif des frais réels. Règles et exemples chiffrés.";

export const metadata: Metadata = {
  title: titre,
  description,
  alternates: { canonical: "/guides/" },
  openGraph: { type: "website", locale: "fr_FR", title: titre, description, url: "/guides/", images: [IMAGE_PARTAGE] },
  twitter: { card: "summary_large_image", title: titre, description, images: [IMAGE_PARTAGE.url] },
};

export default function PageGuides() {
  return (
    <>
      <SiteHeader cta="Lancer ma simulation" />
      <main>
        <header className="bg-mesh border-b border-line">
          <div className="mx-auto max-w-4xl px-4 pt-14 pb-12 sm:px-6">
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Guides pratiques</h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
              Les règles officielles expliquées simplement, avec des exemples calculés par le simulateur, pour déclarer vos frais au bon montant.
            </p>
          </div>
        </header>
        <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
          <ul className="space-y-5">
            {GUIDES.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/guides/${g.slug}/`}
                  className="group flex flex-col gap-3 rounded-3xl border border-line bg-surface p-7 transition hover:border-brand-100 hover:shadow-lift sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h2 className="font-display text-2xl font-bold tracking-tight group-hover:text-brand">{g.titre}</h2>
                    <p className="mt-2 max-w-xl leading-relaxed text-ink-soft">{g.resume}</p>
                    <p className="mt-3 text-sm text-ink-muted">
                      Mis à jour le {formatDate(g.misAJour)} · {g.lecture} min de lecture
                    </p>
                  </div>
                  <ArrowRight className="size-6 shrink-0 text-brand transition group-hover:translate-x-1" weight="bold" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
