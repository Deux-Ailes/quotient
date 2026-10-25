import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Baby,
  Car,
  CaretDown,
  ChartLine,
  Check,
  ForkKnife,
  HandHeart,
  House,
  Laptop,
  LockSimple,
  PiggyBank,
  Receipt,
  Scales,
  Sparkle,
  Users,
  Wallet,
} from "@phosphor-icons/react/dist/ssr";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { simuler } from "@/lib/fiscal/engine";
import { foyerExemple } from "@/lib/fiscal/exemple";
import { PARAMS, ANNEE_DEFAUT } from "@/lib/fiscal/params";
import { chemin } from "@/lib/chemin";
import { SITE, SITE_URL } from "@/lib/site";
import { formatEur, formatNombre, formatPct } from "@/lib/format";

const CTA = "Lancer ma simulation";

/** Foyer d'exemple affiché sur la page : calculé avec le vrai moteur. */
function exemple() {
  const f = foyerExemple();
  const avecReels = simuler(f);
  const sansReels = simuler({ ...f, adultes: [{ ...f.adultes[0], modeFrais: "forfait" }, f.adultes[1]] });
  return { r: avecReels, economie: sansReels.impotNet - avecReels.impotNet };
}

const POINTS = ["Quotient familial plafonné", "Barème kilométrique officiel", "Comparatif 10 % / frais réels", "Taux de prélèvement à la source"];

const ETAPES = [
  { titre: "Votre foyer", texte: "Situation, enfants, garde alternée : le nombre de parts est calculé pour vous." },
  { titre: "Vos revenus et frais", texte: "Salaires, pensions, loyers, placements. Kilomètres, repas et télétravail en quelques champs." },
  { titre: "Votre estimation", texte: "Impôt net, détail du calcul, taux de prélèvement et option la plus avantageuse." },
];

const AUTRES = [
  { icon: ForkKnife, titre: "Repas", texte: "Prix du repas moins la valeur forfaitaire et la part des titres-restaurant." },
  { icon: House, titre: "Revenus fonciers", texte: "Micro-foncier à 30 % ou régime réel avec déficit imputable." },
  { icon: Wallet, titre: "Placements et micro", texte: "Flat tax ou barème, micro-BIC, micro-BNC, meublés." },
  { icon: Baby, titre: "Garde et scolarité", texte: "Crédit de 50 % avant 6 ans, réductions collège, lycée, études." },
  { icon: HandHeart, titre: "Dons et emploi à domicile", texte: "Dons à 75 % et 66 %, services à la personne." },
  { icon: PiggyBank, titre: "PER, pensions, EHPAD", texte: "Épargne retraite, pensions alimentaires, Pinel, Denormandie." },
];

const FAQ = [
  {
    q: "Le résultat est-il fiable ?",
    r: "Quotient applique le barème, la décote, le plafonnement du quotient familial et les principaux dispositifs. Pour les situations courantes, l'écart avec le simulateur officiel est faible. Certaines situations rares (revenus exceptionnels, contribution différentielle sur les hauts revenus) ne sont pas modélisées.",
  },
  {
    q: "Pourquoi le barème est-il marqué « provisoire » ?",
    r: "Les revenus 2026 seront imposés selon la loi de finances 2027, encore en discussion au Parlement. Quotient utilise le barème du projet de loi (+2,1 %) et sera mis à jour après le vote. Vous pouvez aussi simuler vos revenus 2025, dont les paramètres sont définitifs.",
  },
  {
    q: "Frais réels ou abattement de 10 % : comment choisir ?",
    r: "Laissez le mode automatique : Quotient calcule les deux options pour chaque déclarant et retient la plus avantageuse. Vous pouvez aussi forcer un choix pour comparer.",
  },
  {
    q: "Mes données sont-elles envoyées quelque part ?",
    r: "Non. Aucun compte, aucun serveur : la simulation tourne entièrement dans votre navigateur. Un brouillon est conservé localement sur votre appareil, et vous pouvez l'effacer à tout moment.",
  },
  {
    q: "Comment est calculé le taux de prélèvement à la source ?",
    r: "Le taux du foyer rapporte l'impôt afférent aux revenus soumis au prélèvement (salaires, pensions, loyers, micro) à ces mêmes revenus. Pour les couples, Quotient propose aussi un taux individualisé lorsque les revenus sont déséquilibrés.",
  },
];

function BoutonPrincipal({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/simulateur"
      className={`bg-brand-gradient group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold whitespace-nowrap text-white shadow-lift transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ${className}`}
    >
      {CTA}
      <ArrowRight className="size-5 transition group-hover:translate-x-1" weight="bold" />
    </Link>
  );
}

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** Données structurées schema.org : le site, l'application web gratuite et la FAQ de la page. */
function donneesStructurees() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#site`,
        name: SITE.nom,
        url: `${SITE_URL}/`,
        inLanguage: "fr-FR",
      },
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/#application`,
        name: `${SITE.nom}, simulateur d'impôt sur le revenu`,
        url: `${SITE_URL}/simulateur/`,
        description: SITE.accueil.description,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        inLanguage: "fr-FR",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        isPartOf: { "@id": `${SITE_URL}/#site` },
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map(({ q, r }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: r },
        })),
      },
    ],
  };
}

export default function LandingPage() {
  const { r, economie } = exemple();
  const params = PARAMS[ANNEE_DEFAUT];
  const camille = r.adultes[0];
  const fr = camille.fraisReels;
  const kmMax = Math.max(fr.total, camille.abattementForfaitaire);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(donneesStructurees()) }} />
      <SiteHeader cta={CTA} />
      <main>
        {/* Hero */}
        <section className="bg-mesh relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-surface/70 px-3 py-1 text-xs font-semibold text-brand">
                <Sparkle className="size-3.5" weight="fill" />
                {params.libelle}
                {params.provisoire && <span className="font-medium text-ink-muted">· barème provisoire</span>}
              </span>
              <h1 className="mt-6 font-display font-bold tracking-tight text-ink">
                <span className="block text-lg leading-snug font-semibold text-ink-soft sm:text-xl">Simulateur d&apos;impôt 2026 et de frais réels</span>
                <span className="mt-2 block text-5xl leading-[1.04] sm:text-6xl">
                  Votre impôt, <span className="text-brand">enfin lisible.</span>
                </span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
                Estimez votre impôt en cinq minutes. Kilomètres, télétravail, garde d&apos;enfants : Quotient retient l&apos;option la plus
                avantageuse.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
                <BoutonPrincipal />
                <Link href="/simulateur?exemple" className="inline-flex items-center gap-1.5 font-semibold text-ink-soft transition hover:text-brand">
                  Voir un exemple <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>

            {/* Carte d'exemple */}
            <div className="animate-fade-up relative mx-auto w-full max-w-md [animation-delay:120ms] lg:mx-0 lg:justify-self-end">
              <div className="rounded-3xl border border-line bg-surface p-6 shadow-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-ink-muted">Exemple</p>
                    <p className="font-semibold">Couple marié, 1 enfant</p>
                  </div>
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand">{formatNombre(r.parts.total)} parts</span>
                </div>
                <div className="mt-6 rounded-2xl bg-night p-5 text-white">
                  <p className="text-sm text-white/65">Impôt estimé</p>
                  <p className="tabular mt-1 font-display text-4xl font-bold">{formatEur(r.impotNet)}</p>
                  <div className="mt-4 flex gap-6 text-sm">
                    {[
                      { l: "Taux moyen", v: formatPct(r.tauxMoyen) },
                      { l: "TMI", v: formatPct(r.tmi) },
                      { l: "Taux PAS", v: formatPct(r.pas.tauxFoyer) },
                    ].map((x) => (
                      <div key={x.l}>
                        <p className="text-white/60">{x.l}</p>
                        <p className="tabular font-semibold">{x.v}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <ul className="mt-5 space-y-3 text-sm">
                  <li className="flex justify-between">
                    <span className="text-ink-soft">Salaires déclarés</span>
                    <span className="tabular font-medium">{formatEur(camille.salairesBruts + r.adultes[1].salairesBruts)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-ink-soft">Frais réels de Camille</span>
                    <span className="tabular font-medium">− {formatEur(camille.deductionRetenue)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-ink-soft">Crédit garde d&apos;enfant</span>
                    <span className="tabular font-medium">− {formatEur(r.credits.gardeEnfant)}</span>
                  </li>
                </ul>
                <p className="mt-5 rounded-2xl bg-mint-50 px-4 py-3 text-sm text-ink">
                  Les frais réels font économiser <strong className="tabular text-mint">{formatEur(economie)}</strong> par rapport à
                  l&apos;abattement de 10 %.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Points clés, sortis du hero */}
        <section className="border-y border-line bg-surface">
          <ul className="mx-auto flex max-w-6xl flex-col gap-x-8 gap-y-3 px-4 py-6 text-sm text-ink-soft sm:flex-row sm:flex-wrap sm:px-6">
            {POINTS.map((t) => (
              <li key={t} className="flex items-center gap-2 whitespace-nowrap">
                <Check className="size-4 shrink-0 text-mint" weight="bold" />
                {t}
              </li>
            ))}
            <li className="flex items-center gap-2 whitespace-nowrap xl:ml-auto">
              <LockSimple className="size-4 shrink-0 text-brand" weight="bold" />
              Gratuit, sans compte, 100 % local
            </li>
          </ul>
        </section>

        {/* Fonctionnement : frise */}
        <section id="fonctionnement" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-24 pb-16 sm:px-6">
          <h2 className="max-w-xl font-display text-4xl font-bold tracking-tight">Trois étapes, aucune notice à lire.</h2>
          <ol className="relative mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            <span aria-hidden className="absolute top-5 right-[16%] left-[4%] hidden h-px bg-line md:block" />
            {ETAPES.map((e, i) => (
              <li key={e.titre} className="relative">
                <span className="relative grid size-10 place-items-center rounded-full border border-brand-100 bg-surface font-display text-lg font-bold text-brand">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-lg font-semibold">{e.titre}</h3>
                <p className="mt-2 max-w-xs text-ink-soft">{e.texte}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Capture réelle du simulateur */}
        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <figure className="overflow-hidden rounded-3xl border border-line bg-surface shadow-lift">
            <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
              <span className="size-2.5 rounded-full bg-line" />
              <span className="size-2.5 rounded-full bg-line" />
              <span className="size-2.5 rounded-full bg-line" />
            </div>
            {(["clair", "sombre"] as const).map((theme) => (
              <Image
                key={theme}
                src={chemin(theme === "clair" ? "/apercu-frais-reels.webp" : "/apercu-frais-reels-sombre.webp")}
                alt="Étape Frais réels du simulateur : comparaison entre l'abattement de 10 % et les frais réels de Camille, avec l'impôt estimé en direct."
                width={2000}
                height={1344}
                sizes="(min-width: 1152px) 1104px, 100vw"
                className={`image-theme-${theme} aspect-[16/9] w-full object-cover object-top`}
              />
            ))}
          </figure>
          <figcaption className="mt-4 text-center text-sm text-ink-muted">
            L&apos;étape Frais réels, avec le foyer d&apos;exemple.{" "}
            <Link href="/simulateur?exemple&etape=3" className="font-semibold text-brand hover:underline">
              L&apos;ouvrir
            </Link>
          </figcaption>
        </section>

        {/* Couverture : grille asymétrique */}
        <section id="couverture" className="scroll-mt-20 border-y border-line bg-surface py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="max-w-2xl font-display text-4xl font-bold tracking-tight">Les dispositifs qui changent vraiment la note.</h2>

            <div className="mt-12 grid gap-4 lg:grid-cols-6">
              {/* Frais kilométriques */}
              <article className="rounded-3xl bg-brand-50 p-7 lg:col-span-3 lg:row-span-2">
                <Car className="size-7 text-brand" />
                <h3 className="mt-4 text-xl font-semibold">Frais kilométriques</h3>
                <p className="mt-2 max-w-md text-ink-soft">
                  Barème officiel voitures, motos et cyclomoteurs, +20 % pour l&apos;électrique, plafond de 40 km par trajet.
                </p>
                <div className="mt-8 space-y-4">
                  <p className="text-sm text-ink-soft">Camille, 32 km de trajet, 170 jours, 5 CV :</p>
                  {[
                    { l: "Abattement de 10 %", v: camille.abattementForfaitaire, fort: false },
                    { l: "Frais réels", v: fr.total, fort: true },
                  ].map((b) => (
                    <div key={b.l}>
                      <div className="flex justify-between text-sm">
                        <span className={b.fort ? "font-semibold" : "text-ink-soft"}>{b.l}</span>
                        <span className="tabular font-semibold">{formatEur(b.v)}</span>
                      </div>
                      <div className={`mt-1.5 h-2.5 rounded-full ${b.fort ? "bg-brand" : "bg-brand-100"}`} style={{ width: `${(b.v / kmMax) * 100}%` }} />
                    </div>
                  ))}
                </div>
              </article>

              {/* Télétravail */}
              <article className="rounded-3xl border border-line p-7 lg:col-span-3">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <Laptop className="size-7 text-brand" />
                    <h3 className="mt-4 text-xl font-semibold">Télétravail</h3>
                    <p className="mt-2 max-w-sm text-ink-soft">Forfait journalier, ou loyer et énergies au prorata de la surface du bureau et des jours télétravaillés.</p>
                  </div>
                  <p className="shrink-0 text-right">
                    <span className="tabular block font-display text-4xl font-bold text-brand">{formatPct(10 / 70)}</span>
                    <span className="text-xs text-ink-muted">10 m² sur 70 m²</span>
                  </p>
                </div>
              </article>

              {/* Quotient familial */}
              <article className="rounded-3xl border border-line p-7 lg:col-span-3">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <Users className="size-7 text-brand" />
                    <h3 className="mt-4 text-xl font-semibold">Quotient familial</h3>
                    <p className="mt-2 max-w-sm text-ink-soft">Parts, garde alternée, parent isolé, invalidité, avec le plafonnement de l&apos;avantage.</p>
                  </div>
                  <p className="shrink-0 text-right">
                    <span className="tabular block font-display text-4xl font-bold text-brand">{formatNombre(r.parts.total)}</span>
                    <span className="text-xs text-ink-muted">parts dans l&apos;exemple</span>
                  </p>
                </div>
              </article>
            </div>

            <ul className="mt-10 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              {AUTRES.map(({ icon: Icon, titre, texte }) => (
                <li key={titre} className="flex gap-4">
                  <Icon className="mt-0.5 size-6 shrink-0 text-brand" />
                  <div>
                    <p className="font-semibold">{titre}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">{texte}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Frais réels : le seul bloc sombre de la page */}
        <section id="frais-reels" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6">
          <div className="grid items-center gap-12 overflow-hidden rounded-3xl bg-night p-8 text-white sm:p-12 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-4xl font-bold tracking-tight">L&apos;abattement de 10 % n&apos;est pas toujours votre meilleur ami.</h2>
              <p className="mt-5 text-lg leading-relaxed text-white/75">
                Au-delà de 30 km de trajet quotidien, les frais réels deviennent souvent plus intéressants. Quotient les calcule et compare
                pour chaque déclarant.
              </p>
              <Link
                href="/simulateur"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-night transition hover:bg-brand-100 active:scale-[0.98]"
              >
                {CTA} <ArrowRight className="size-4" weight="bold" />
              </Link>
            </div>
            <div className="space-y-3">
              {[
                { icon: Car, label: "Trajets domicile-travail", detail: "32 km × 2 × 170 jours, 5 CV", v: fr.vehicules[0]?.montant ?? 0 },
                { icon: ForkKnife, label: "Repas", detail: "170 repas à 13 €", v: fr.repas },
                { icon: Laptop, label: "Télétravail", detail: "45 jours au forfait", v: fr.teletravail },
              ].map(({ icon: Icon, label, detail, v }) => (
                <div key={label} className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <span className="grid size-10 place-items-center rounded-xl bg-white/10">
                    <Icon className="size-5" />
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-white/60">{detail}</p>
                  </div>
                  <p className="tabular font-semibold">{formatEur(v)}</p>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-2xl bg-white p-4 text-night">
                <div className="flex items-center gap-3">
                  <Scales className="size-5 text-[#5b47ff]" />
                  <span className="font-medium">Frais réels vs 10 %</span>
                </div>
                <p className="tabular font-semibold">
                  {formatEur(fr.total)} <span className="text-[#63668a]">vs</span> {formatEur(camille.abattementForfaitaire)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Engagements */}
        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <div className="grid gap-x-12 gap-y-8 md:grid-cols-3">
            {[
              { icon: LockSimple, t: "Rien ne quitte votre appareil", d: "Pas de compte, pas de serveur, pas de traceur publicitaire." },
              { icon: Receipt, t: "Calcul détaillé", d: "Chaque étape est affichée : revenu imposable, parts, décote, réductions." },
              { icon: ChartLine, t: "Sources officielles", d: "Barèmes issus de la loi de finances, du BOFiP et de Service-Public." },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="flex gap-4">
                <Icon className="mt-0.5 size-6 shrink-0 text-brand" />
                <div>
                  <p className="font-semibold">{t}</p>
                  <p className="mt-1 text-sm text-ink-soft">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 border-y border-line bg-surface py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="font-display text-4xl font-bold tracking-tight">Questions fréquentes</h2>
            <div className="mt-10 divide-y divide-line rounded-3xl border border-line">
              {FAQ.map(({ q, r }) => (
                <details key={q} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                    {q}
                    <CaretDown className="size-5 shrink-0 text-ink-muted transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 leading-relaxed text-ink-soft">{r}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Appel final, sans bandeau en dégradé */}
        <section className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-20 sm:px-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Prêt à connaître votre chiffre ?</h2>
            <p className="mt-2 text-ink-soft">Cinq minutes, aucune inscription. Votre brouillon reste sur votre appareil.</p>
          </div>
          <BoutonPrincipal />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
