import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "./Logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-canvas/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-soft md:flex">
          <a href="#fonctionnement" className="transition hover:text-ink">
            Fonctionnement
          </a>
          <a href="#couverture" className="transition hover:text-ink">
            Ce qui est calculé
          </a>
          <a href="#frais-reels" className="transition hover:text-ink">
            Frais réels
          </a>
          <a href="#faq" className="transition hover:text-ink">
            FAQ
          </a>
        </nav>
        <Link
          href="/simulateur"
          className="group inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand"
        >
          Simuler
          <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-md text-sm leading-relaxed text-ink-soft">
            Quotient fournit une estimation indicative de l&apos;impôt sur le revenu. Elle ne remplace ni le simulateur officiel
            de l&apos;administration fiscale, ni l&apos;avis d&apos;un professionnel. Aucune donnée n&apos;est transmise : tous
            les calculs ont lieu dans votre navigateur.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div className="space-y-2">
            <p className="font-semibold text-ink">Produit</p>
            <Link href="/simulateur" className="block text-ink-soft hover:text-ink">
              Simulateur
            </Link>
            <Link href="/#couverture" className="block text-ink-soft hover:text-ink">
              Ce qui est calculé
            </Link>
            <Link href="/#faq" className="block text-ink-soft hover:text-ink">
              Questions fréquentes
            </Link>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-ink">Sources</p>
            <a href="https://www.impots.gouv.fr/simulateurs" target="_blank" rel="noreferrer" className="block text-ink-soft hover:text-ink">
              Simulateur officiel
            </a>
            <a href="https://bofip.impots.gouv.fr/" target="_blank" rel="noreferrer" className="block text-ink-soft hover:text-ink">
              BOFiP
            </a>
            <a href="https://www.service-public.gouv.fr/particuliers/vosdroits/F1419" target="_blank" rel="noreferrer" className="block text-ink-soft hover:text-ink">
              Service-Public
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-ink-muted">© {new Date().getFullYear()} Quotient — estimation non contractuelle</div>
    </footer>
  );
}
