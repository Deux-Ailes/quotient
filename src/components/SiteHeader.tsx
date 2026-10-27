import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader({ cta }: { cta: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-canvas/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        {/* Liens absolus : l'en-tête est aussi affiché sur les guides et la page 404. */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-soft md:flex">
          <Link href="/#fonctionnement" className="py-2 transition hover:text-ink">
            Fonctionnement
          </Link>
          <Link href="/#couverture" className="py-2 transition hover:text-ink">
            Ce qui est calculé
          </Link>
          <Link href="/guides/" className="py-2 transition hover:text-ink">
            Guides
          </Link>
          <Link href="/#faq" className="py-2 transition hover:text-ink">
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {/* Sur mobile, le bouton du hero suffit : l'en-tête garde la place pour le logo et le thème. */}
          <Link
            href="/simulateur"
            className="group hidden items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold whitespace-nowrap text-canvas transition hover:bg-brand hover:text-white active:scale-[0.98] sm:inline-flex"
          >
            {cta}
            <ArrowRight aria-hidden className="size-4 transition group-hover:translate-x-0.5" weight="bold" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
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
          <div className="space-y-1">
            <p className="font-semibold text-ink">Produit</p>
            <Link href="/simulateur" className="block py-1 text-ink-soft hover:text-ink">
              Simulateur
            </Link>
            <Link href="/#couverture" className="block py-1 text-ink-soft hover:text-ink">
              Ce qui est calculé
            </Link>
            <Link href="/#faq" className="block py-1 text-ink-soft hover:text-ink">
              Questions fréquentes
            </Link>
            <Link href="/guides/" className="block py-1 text-ink-soft hover:text-ink">
              Guides pratiques
            </Link>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-ink">Sources</p>
            <a href="https://www.impots.gouv.fr/simulateurs" target="_blank" rel="noreferrer" className="block py-1 text-ink-soft hover:text-ink">
              Simulateur officiel
            </a>
            <a href="https://bofip.impots.gouv.fr/" target="_blank" rel="noreferrer" className="block py-1 text-ink-soft hover:text-ink">
              BOFiP
            </a>
            <a href="https://www.service-public.gouv.fr/particuliers/vosdroits/F1419" target="_blank" rel="noreferrer" className="block py-1 text-ink-soft hover:text-ink">
              Service-Public
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-ink-muted">© {new Date().getFullYear()} Quotient, estimation non contractuelle</div>
    </footer>
  );
}
