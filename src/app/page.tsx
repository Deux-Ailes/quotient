import Link from "next/link";
import {
  ArrowRight,
  Baby,
  Car,
  Check,
  ChevronDown,
  HandHeart,
  Home,
  Laptop,
  Lock,
  PiggyBank,
  Receipt,
  Scale,
  Sparkles,
  UtensilsCrossed,
  Users,
  Wallet,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { foyerParDefaut, nouveauVehicule } from "@/lib/fiscal/defaults";
import { simuler } from "@/lib/fiscal/engine";
import { PARAMS, ANNEE_DEFAUT } from "@/lib/fiscal/params";
import { formatEur, formatPct } from "@/lib/format";

/** Foyer d'exemple affiché dans le hero : calculé avec le vrai moteur. */
function exemple() {
  const f = foyerParDefaut();
  f.adultes[0].prenom = "Camille";
  f.adultes[0].salaires = 42000;
  f.adultes[0].frais.vehicules = [{ ...nouveauVehicule(), distanceAller: 32, joursParAn: 170 }];
  f.adultes[0].frais.teletravail = { mode: "forfait", jours: 45, montantReel: 0 };
  f.adultes[0].frais.repas = { jours: 170, prixMoyen: 13, participationEmployeur: 0 };
  f.adultes[1].prenom = "Alex";
  f.adultes[1].salaires = 31000;
  f.enfants[0].age = 3;
  f.enfants[0].fraisGarde = 4200;
  const avecReels = simuler(f);
  const sansReels = simuler({ ...f, adultes: [{ ...f.adultes[0], modeFrais: "forfait" }, f.adultes[1]] });
  return { r: avecReels, economie: sansReels.impotNet - avecReels.impotNet };
}

const ETAPES = [
  { titre: "Votre foyer", texte: "Situation, enfants, garde alternée : le nombre de parts est calculé pour vous." },
  { titre: "Vos revenus et frais", texte: "Salaires, pensions, loyers, placements. Kilomètres, repas et télétravail en quelques champs." },
  { titre: "Votre estimation", texte: "Impôt net, détail du calcul, taux de prélèvement à la source et option la plus avantageuse." },
];

const COUVERTURE = [
  { icon: Users, titre: "Quotient familial", texte: "Parts, garde alternée, parent isolé, invalidité et plafonnement." },
  { icon: Car, titre: "Frais kilométriques", texte: "Barème officiel voitures, motos, cyclomoteurs, +20 % électrique, plafond 40 km." },
  { icon: Laptop, titre: "Télétravail", texte: "Forfait par jour plafonné ou frais réels : quote-part de loyer, énergie, internet." },
  { icon: UtensilsCrossed, titre: "Repas", texte: "Coût du repas moins la valeur forfaitaire et la part des titres-restaurant." },
  { icon: Home, titre: "Revenus fonciers", texte: "Micro-foncier avec abattement de 30 % ou régime réel avec déficit imputable." },
  { icon: Wallet, titre: "Placements et micro", texte: "Flat tax ou barème, dividendes, micro-BIC, micro-BNC, meublés." },
  { icon: Baby, titre: "Garde et scolarité", texte: "Crédit de 50 % pour les moins de 6 ans, réductions collège, lycée, études." },
  { icon: HandHeart, titre: "Dons et emploi à domicile", texte: "Dons à 66 % et 75 %, services à la personne, plafonds majorés." },
  { icon: PiggyBank, titre: "PER et pensions", texte: "Versements PER déductibles, pensions alimentaires, EHPAD, Pinel, Denormandie." },
];

const FAQ = [
  {
    q: "Le résultat est-il fiable ?",
    r: "Quotient applique le barème, la décote, le plafonnement du quotient familial et les principaux dispositifs. Pour les situations courantes, l'écart avec le simulateur officiel est faible. Certaines situations rares (revenus exceptionnels, quotient, contribution différentielle sur les hauts revenus) ne sont pas modélisées.",
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
    r: "Non. Aucun compte, aucun serveur : la simulation tourne entièrement dans votre navigateur. Un brouillon est conservé localement sur votre appareil pour reprendre plus tard, et vous pouvez l'effacer à tout moment.",
  },
  {
    q: "Comment est calculé le taux de prélèvement à la source ?",
    r: "Le taux du foyer rapporte l'impôt afférent aux revenus soumis au prélèvement (salaires, pensions, loyers, micro) à ces mêmes revenus. Pour les couples, Quotient propose aussi un taux individualisé lorsque les revenus sont déséquilibrés.",
  },
];

export default function LandingPage() {
  const { r, economie } = exemple();
  const params = PARAMS[ANNEE_DEFAUT];

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="bg-mesh relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pt-16 pb-24 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-24">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/70 px-3 py-1 text-xs font-semibold text-brand">
                <Sparkles className="size-3.5" />
                {params.libelle}
                {params.provisoire && <span className="text-ink-muted">· barème PLF 2027</span>}
              </span>
              <h1 className="mt-6 font-display text-5xl leading-[1.02] font-bold tracking-tight text-ink sm:text-6xl">
                Votre impôt, <span className="text-gradient">enfin lisible.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
                Estimez votre impôt sur le revenu en cinq minutes. Frais kilométriques, télétravail, repas, garde
                d&apos;enfants : Quotient recense les déductions auxquelles vous avez droit et retient l&apos;option la plus
                avantageuse.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="/simulateur"
                  className="bg-brand-gradient group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold text-white shadow-lift transition hover:-translate-y-0.5"
                >
                  Lancer ma simulation
                  <ArrowRight className="size-5 transition group-hover:translate-x-1" />
                </Link>
                <span className="inline-flex items-center gap-2 text-sm text-ink-soft">
                  <Lock className="size-4 text-mint" />
                  Gratuit, sans compte, 100 % local
                </span>
              </div>
              <ul className="mt-10 grid max-w-lg grid-cols-2 gap-3 text-sm text-ink-soft">
                {["Quotient familial plafonné", "Barème kilométrique officiel", "Comparatif 10 % / frais réels", "Taux de prélèvement à la source"].map(
                  (t) => (
                    <li key={t} className="flex items-center gap-2">
                      <span className="grid size-5 place-items-center rounded-full bg-mint-50 text-mint">
                        <Check className="size-3.5" strokeWidth={3} />
                      </span>
                      {t}
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Carte d'exemple */}
            <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end">
              <div className="bg-brand-gradient absolute -inset-6 -z-10 rounded-[2.5rem] opacity-20 blur-3xl" />
              <div className="animate-float rounded-3xl border border-white/70 bg-white/90 p-6 shadow-lift backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">Exemple</p>
                    <p className="font-semibold">Couple marié, 1 enfant</p>
                  </div>
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand">{r.parts.total} parts</span>
                </div>
                <div className="mt-6 rounded-2xl bg-ink p-5 text-white">
                  <p className="text-sm text-white/60">Impôt estimé</p>
                  <p className="tabular mt-1 font-display text-4xl font-bold">{formatEur(r.impotNet)}</p>
                  <div className="mt-4 flex gap-6 text-sm">
                    <div>
                      <p className="text-white/50">Taux moyen</p>
                      <p className="tabular font-semibold">{formatPct(r.tauxMoyen)}</p>
                    </div>
                    <div>
                      <p className="text-white/50">TMI</p>
                      <p className="tabular font-semibold">{formatPct(r.tmi)}</p>
                    </div>
                    <div>
                      <p className="text-white/50">Taux PAS</p>
                      <p className="tabular font-semibold">{formatPct(r.pas.tauxFoyer)}</p>
                    </div>
                  </div>
                </div>
                <ul className="mt-5 space-y-3 text-sm">
                  <li className="flex justify-between">
                    <span className="text-ink-soft">Salaires déclarés</span>
                    <span className="tabular font-medium">{formatEur(73000)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-ink-soft">Frais réels de Camille</span>
                    <span className="tabular font-medium">− {formatEur(r.adultes[0].deductionRetenue)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-ink-soft">Crédit garde d&apos;enfant</span>
                    <span className="tabular font-medium">− {formatEur(r.credits.gardeEnfant)}</span>
                  </li>
                </ul>
                <div className="mt-5 flex items-center gap-3 rounded-2xl bg-mint-50 px-4 py-3 text-sm">
                  <Sparkles className="size-5 shrink-0 text-mint" />
                  <span>
                    Les frais réels font économiser <strong className="tabular text-mint">{formatEur(economie)}</strong> par
                    rapport à l&apos;abattement de 10 %.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Fonctionnement */}
        <section id="fonctionnement" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-brand">Fonctionnement</p>
            <h2 className="mt-2 font-display text-4xl font-bold tracking-tight">Trois étapes, aucune notice à lire.</h2>
            <p className="mt-4 text-lg text-ink-soft">
              Le simulateur ne vous montre que les champs utiles à votre situation, et l&apos;estimation se met à jour à chaque
              saisie.
            </p>
          </div>
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {ETAPES.map((e, i) => (
              <li key={e.titre} className="relative rounded-3xl border border-line bg-white p-7 shadow-card">
                <span className="bg-brand-gradient grid size-10 place-items-center rounded-2xl font-display text-lg font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-lg font-semibold">{e.titre}</h3>
                <p className="mt-2 text-ink-soft">{e.texte}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Couverture */}
        <section id="couverture" className="scroll-mt-20 bg-white py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold text-brand">Ce qui est calculé</p>
                <h2 className="mt-2 font-display text-4xl font-bold tracking-tight">Les dispositifs qui changent vraiment la note.</h2>
              </div>
              <Link href="/simulateur" className="inline-flex items-center gap-1.5 font-semibold text-brand hover:gap-2.5 transition-all">
                Essayer maintenant <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {COUVERTURE.map(({ icon: Icon, titre, texte }) => (
                <div
                  key={titre}
                  className="group rounded-3xl border border-line bg-canvas/50 p-6 transition hover:-translate-y-1 hover:border-brand-100 hover:bg-white hover:shadow-lift"
                >
                  <span className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand transition group-hover:bg-brand group-hover:text-white">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-semibold">{titre}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{texte}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Frais réels */}
        <section id="frais-reels" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6">
          <div className="grid items-center gap-12 overflow-hidden rounded-[2rem] bg-ink p-8 text-white sm:p-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-violet">Frais réels</p>
              <h2 className="mt-2 font-display text-4xl font-bold tracking-tight">
                L&apos;abattement de 10 % n&apos;est pas toujours votre meilleur ami.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-white/70">
                Au-delà de 30 km de trajet quotidien, les frais réels deviennent souvent plus intéressants. Quotient calcule
                vos frais kilométriques avec le barème officiel, ajoute repas, télétravail, matériel et formation, puis compare
                automatiquement.
              </p>
              <Link
                href="/simulateur"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-ink transition hover:bg-brand-50"
              >
                Calculer mes frais réels <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {[
                { icon: Car, label: "Trajets domicile-travail", detail: "32 km × 2 × 170 jours, 5 CV", v: r.adultes[0].fraisReels.vehicules[0]?.montant ?? 0 },
                { icon: UtensilsCrossed, label: "Repas", detail: "170 repas à 13 €", v: r.adultes[0].fraisReels.repas },
                { icon: Laptop, label: "Télétravail", detail: "45 jours au forfait", v: r.adultes[0].fraisReels.teletravail },
              ].map(({ icon: Icon, label, detail, v }) => (
                <div key={label} className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <span className="grid size-10 place-items-center rounded-xl bg-white/10">
                    <Icon className="size-5" />
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-white/50">{detail}</p>
                  </div>
                  <p className="tabular font-semibold">{formatEur(v)}</p>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-2xl bg-white p-4 text-ink">
                <div className="flex items-center gap-3">
                  <Scale className="size-5 text-brand" />
                  <span className="font-medium">Frais réels vs 10 %</span>
                </div>
                <p className="tabular font-semibold">
                  {formatEur(r.adultes[0].fraisReels.total)} <span className="text-ink-muted">vs</span>{" "}
                  {formatEur(r.adultes[0].abattementForfaitaire)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Confidentialité */}
        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Lock, t: "Rien ne quitte votre appareil", d: "Pas de compte, pas de serveur, pas de traceur publicitaire." },
              { icon: Receipt, t: "Calcul détaillé", d: "Chaque étape est affichée : revenu imposable, parts, décote, réductions." },
              { icon: Scale, t: "Sources officielles", d: "Barèmes issus de la loi de finances, du BOFiP et de Service-Public." },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="flex gap-4 rounded-3xl border border-line bg-white p-6 shadow-card">
                <Icon className="size-6 shrink-0 text-brand" />
                <div>
                  <p className="font-semibold">{t}</p>
                  <p className="mt-1 text-sm text-ink-soft">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 bg-white py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <p className="text-sm font-semibold text-brand">FAQ</p>
            <h2 className="mt-2 font-display text-4xl font-bold tracking-tight">Questions fréquentes</h2>
            <div className="mt-10 divide-y divide-line rounded-3xl border border-line">
              {FAQ.map(({ q, r }) => (
                <details key={q} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                    {q}
                    <ChevronDown className="size-5 shrink-0 text-ink-muted transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 leading-relaxed text-ink-soft">{r}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="bg-brand-gradient relative overflow-hidden rounded-[2rem] px-8 py-16 text-center text-white sm:px-16">
            <div className="absolute -top-24 -right-24 size-72 rounded-full bg-white/10 blur-2xl" />
            <h2 className="relative font-display text-4xl font-bold tracking-tight sm:text-5xl">Prêt à connaître votre chiffre ?</h2>
            <p className="relative mx-auto mt-4 max-w-xl text-lg text-white/80">Cinq minutes, aucune inscription. Votre brouillon reste sur votre appareil.</p>
            <Link
              href="/simulateur"
              className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-ink transition hover:-translate-y-0.5"
            >
              Lancer ma simulation <ArrowRight className="size-5" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
