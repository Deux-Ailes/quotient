import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

// Next.js ajoute lui-même noindex sur cette page.
export const metadata: Metadata = {
  title: "Page introuvable | Quotient",
};

export default function PageIntrouvable() {
  return (
    <>
      <SiteHeader cta="Lancer ma simulation" />
      <main className="bg-mesh">
        <div className="mx-auto max-w-3xl px-4 py-28 sm:px-6">
          <p className="font-display text-7xl font-bold text-brand">404</p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">Cette page n&apos;existe pas.</h1>
          <p className="mt-4 max-w-lg text-lg text-ink-soft">Le lien est peut-être ancien ou mal recopié. Le simulateur, lui, est toujours là.</p>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link
              href="/simulateur/"
              className="bg-brand-gradient group inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-white shadow-lift transition hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Lancer ma simulation
              <ArrowRight className="size-5 transition group-hover:translate-x-1" weight="bold" />
            </Link>
            <Link href="/" className="font-semibold text-ink-soft transition hover:text-brand">
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
