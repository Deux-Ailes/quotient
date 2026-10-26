import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CalendarBlank, Clock } from "@phosphor-icons/react/dist/ssr";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { formatDate, GUIDES, type Guide } from "@/lib/guides";
import { SITE, SITE_URL } from "@/lib/site";

export interface Source {
  libelle: string;
  url: string;
}

const CTA = "Lancer ma simulation";

/** Encadré d'appel vers le simulateur, à placer dans le corps d'un guide. */
export function EncartSimulateur({ titre, texte, lien = "/simulateur/" }: { titre: string; texte: string; lien?: string }) {
  return (
    <aside className="not-prose my-10 flex flex-col gap-5 rounded-3xl bg-night p-7 text-white sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-display text-xl font-bold">{titre}</p>
        <p className="mt-1 max-w-md text-sm text-white/70">{texte}</p>
      </div>
      <Link
        href={lien}
        className="bg-brand-gradient group inline-flex shrink-0 items-center gap-2 self-start rounded-full px-6 py-3 font-semibold whitespace-nowrap text-white shadow-lift transition hover:-translate-y-0.5 active:scale-[0.98] sm:self-auto"
      >
        {CTA}
        <ArrowRight className="size-4 transition group-hover:translate-x-1" weight="bold" />
      </Link>
    </aside>
  );
}

/** Données structurées d'un guide : article et fil d'Ariane. */
function donneesStructurees(g: Guide) {
  const url = `${SITE_URL}/guides/${g.slug}/`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: g.titre,
        description: g.description,
        url,
        mainEntityOfPage: url,
        datePublished: g.publie,
        dateModified: g.misAJour,
        inLanguage: "fr-FR",
        image: `${SITE_URL}/og.png`,
        author: { "@type": "Organization", name: SITE.nom, url: `${SITE_URL}/` },
        publisher: { "@type": "Organization", name: SITE.nom, url: `${SITE_URL}/` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides/` },
          { "@type": "ListItem", position: 3, name: g.titre, item: url },
        ],
      },
    ],
  };
}

export function GuideLayout({ guide: g, intro, sources, children }: { guide: Guide; intro: ReactNode; sources: Source[]; children: ReactNode }) {
  const autres = GUIDES.filter((x) => x.slug !== g.slug);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(donneesStructurees(g)) }} />
      <SiteHeader cta={CTA} />
      <main>
        <header className="bg-mesh border-b border-line">
          <div className="mx-auto max-w-3xl px-4 pt-10 pb-12 sm:px-6 sm:pt-14">
            <nav aria-label="Fil d'Ariane" className="text-sm text-ink-muted">
              <ol className="flex flex-wrap items-center gap-1.5">
                <li>
                  <Link href="/" className="hover:text-brand">
                    Accueil
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li>
                  <Link href="/guides/" className="hover:text-brand">
                    Guides
                  </Link>
                </li>
              </ol>
            </nav>
            <h1 className="mt-5 font-display text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl">{g.titre}</h1>
            <div className="mt-5 text-lg leading-relaxed text-ink-soft">{intro}</div>
            <p className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-muted">
              <span className="inline-flex items-center gap-1.5">
                <CalendarBlank className="size-4" /> Mis à jour le <time dateTime={g.misAJour}>{formatDate(g.misAJour)}</time>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" /> {g.lecture} min de lecture
              </span>
            </p>
          </div>
        </header>

        <article className="prose-guide mx-auto max-w-3xl px-4 py-12 sm:px-6">{children}</article>

        <section className="mx-auto max-w-3xl px-4 pb-12 sm:px-6">
          <h2 className="text-sm font-semibold text-ink">Sources</h2>
          <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
            {sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noreferrer" className="underline decoration-line underline-offset-4 hover:text-brand hover:decoration-brand">
                  {s.libelle}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs leading-relaxed text-ink-muted">
            Ce guide présente les règles générales et ne remplace pas l&apos;avis d&apos;un professionnel ni la documentation officielle. Les montants
            évoluent chaque année : vérifiez-les pour votre année de revenus.
          </p>
        </section>

        <section className="border-t border-line bg-surface py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="font-display text-2xl font-bold tracking-tight">À lire aussi</h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {autres.map((x) => (
                <li key={x.slug}>
                  <Link href={`/guides/${x.slug}/`} className="group block h-full rounded-3xl border border-line p-6 transition hover:border-brand-100 hover:shadow-lift">
                    <p className="font-semibold group-hover:text-brand">{x.titre}</p>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{x.resume}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
