import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { EncartSimulateur, GuideLayout } from "@/components/guides/GuideLayout";
import { CASES, type CaseDecl } from "@/lib/fiscal/cases";
import { guide } from "@/lib/guides";
import { IMAGE_PARTAGE } from "@/lib/site";

const g = guide("cases-declaration-2042");

export const metadata: Metadata = {
  title: g.titreSEO,
  description: g.description,
  alternates: { canonical: `/guides/${g.slug}/` },
  openGraph: { type: "article", locale: "fr_FR", title: g.titreSEO, description: g.description, url: `/guides/${g.slug}/`, images: [IMAGE_PARTAGE] },
  twitter: { card: "summary_large_image", title: g.titreSEO, description: g.description, images: [IMAGE_PARTAGE.url] },
};

type Ligne = { cases: readonly CaseDecl[]; quoi: ReactNode };

const paire = (c: readonly CaseDecl[]) => c;

const SECTIONS: { titre: string; intro?: ReactNode; lignes: Ligne[] }[] = [
  {
    titre: "Situation et personnes à charge",
    intro: "Ces cases déterminent le nombre de parts du quotient familial. Elles sont souvent pré-remplies : vérifiez-les.",
    lignes: [
      { cases: [CASES.situationCouple], quoi: "Marié (M) ou pacsé (O) : imposition commune, 2 parts de base." },
      { cases: [CASES.situationSeul], quoi: "Célibataire (C), divorcé ou séparé (D), veuf (V) : 1 part de base." },
      { cases: [CASES.enfantsMineurs, CASES.enfantsMineursInvalides], quoi: "Nombre d'enfants mineurs à charge (F), dont titulaires d'une carte d'invalidité (G)." },
      { cases: [CASES.enfantsAlternes, CASES.enfantsAlternesInvalides], quoi: "Enfants en résidence alternée (H), dont invalides (I) : les parts sont partagées entre les parents." },
      { cases: [CASES.enfantsMajeurs], quoi: "Enfants majeurs célibataires rattachés au foyer (moins de 21 ans, ou 25 ans s'ils étudient)." },
      { cases: [CASES.parentIsole], quoi: "Parent vivant seul avec ses enfants : demi-part supplémentaire." },
      { cases: [CASES.caseL], quoi: "Personne vivant seule ayant élevé seule un enfant pendant au moins 5 ans." },
      { cases: paire(CASES.invalidite), quoi: "Titulaire d'une carte d'invalidité : déclarant (P), conjoint (F)." },
    ],
  },
  {
    titre: "Salaires, chômage et pensions",
    intro: (
      <>
        Première case pour le déclarant 1, deuxième pour le déclarant 2. Les montants sont pré-remplis à partir des informations de vos employeurs et
        caisses de retraite.
      </>
    ),
    lignes: [
      { cases: paire(CASES.salaires), quoi: "Salaires nets imposables (le « net imposable » de vos bulletins), heures supplémentaires exonérées à part." },
      {
        cases: paire(CASES.fraisReels),
        quoi: (
          <>
            Frais réels, si vous renoncez à l&apos;abattement de 10 %. Voir <Link href="/guides/frais-reels-ou-abattement-10/">frais réels ou 10 %</Link>.
          </>
        ),
      },
      { cases: paire(CASES.chomage), quoi: "Allocations chômage et indemnités de préretraite, soumises au même abattement que les salaires." },
      { cases: paire(CASES.pensions), quoi: "Pensions de retraite et rentes, avec un abattement de 10 % plafonné par foyer." },
    ],
  },
  {
    titre: "Revenus fonciers",
    lignes: [
      { cases: [CASES.foncierMicro], quoi: "Loyers bruts encaissés au micro-foncier (jusqu'à 15 000 €), avant l'abattement de 30 % appliqué automatiquement." },
      { cases: [CASES.foncierBenefice], quoi: "Bénéfice foncier au régime réel, calculé sur l'annexe 2044." },
      { cases: [CASES.foncierDeficitGlobal], quoi: "Déficit foncier imputable sur le revenu global (dans la limite de 10 700 € par an), issu de l'annexe 2044." },
    ],
  },
  {
    titre: "Placements",
    intro: "Ces montants figurent sur l'imprimé fiscal unique (IFU) envoyé par votre banque, et sont généralement pré-remplis.",
    lignes: [
      { cases: [CASES.dividendes], quoi: "Dividendes éligibles à l'abattement de 40 % (utilisé seulement si vous optez pour le barème)." },
      { cases: [CASES.interets], quoi: "Intérêts et autres produits de placement à revenu fixe." },
      { cases: [CASES.optionBareme], quoi: "Case à cocher pour imposer tous vos revenus de placement au barème progressif plutôt qu'à la flat tax de 12,8 %." },
    ],
  },
  {
    titre: "Micro-entreprise et locations meublées",
    intro: "Ces cases figurent sur la déclaration complémentaire 2042-C-PRO. On déclare le chiffre d'affaires brut ; l'abattement est automatique.",
    lignes: [
      { cases: paire(CASES.microVente), quoi: "Micro-BIC : vente de marchandises, abattement de 71 %." },
      { cases: paire(CASES.microServices), quoi: "Micro-BIC : prestations de services, abattement de 50 %." },
      { cases: paire(CASES.microBnc), quoi: "Micro-BNC : professions libérales, abattement de 34 %." },
      { cases: paire(CASES.meubleLongueDuree), quoi: "Location meublée de longue durée au micro-BIC (hors locations soumises aux cotisations sociales, cases 5NJ à 5NL)." },
      { cases: paire(CASES.meubleTourismeClasse), quoi: "Meublé de tourisme classé ou chambre d'hôtes au micro-BIC." },
      { cases: paire(CASES.meubleTourismeNonClasse), quoi: "Meublé de tourisme non classé au micro-BIC." },
    ],
  },
  {
    titre: "Charges déductibles du revenu",
    lignes: [
      { cases: paire(CASES.per), quoi: "Versements sur un plan d'épargne retraite (PER), déductibles dans la limite du plafond indiqué sur l'avis d'impôt." },
      {
        cases: [CASES.pensionEnfantsMajeursNombre, CASES.pensionEnfantsMajeursMontant],
        quoi: "Pension alimentaire versée à un enfant majeur non rattaché : nombre d'enfants (6EL) et montant (6EM), plafonné par enfant.",
      },
      { cases: [CASES.pensionAutres], quoi: "Autres pensions alimentaires fixées par un jugement (ex-conjoint, enfant mineur non à charge)." },
    ],
  },
  {
    titre: "Réductions et crédits d'impôt",
    intro: "Les réductions diminuent l'impôt jusqu'à zéro ; les crédits sont remboursés même si vous ne payez pas d'impôt.",
    lignes: [
      { cases: [CASES.dons75], quoi: "Dons aux organismes d'aide aux personnes en difficulté : réduction de 75 % dans la limite du plafond, puis 66 %. Pour 2025, cette case ne reçoit que les dons versés jusqu'au 13 octobre (1 000 € au plus à 75 %)." },
      { cases: [CASES.dons75ApresBascule], quoi: "Revenus 2025 : mêmes dons versés du 14 octobre au 31 décembre. Le plafond à 75 % passe à 2 000 €, dons d'avant le 14 octobre compris." },
      { cases: [CASES.dons66], quoi: "Autres dons aux associations d'intérêt général : réduction de 66 %, dans la limite de 20 % du revenu imposable." },
      { cases: CASES.gardeEnfant, quoi: "Frais de garde hors du domicile des enfants de moins de 6 ans, un enfant par case : crédit de 50 %." },
      { cases: CASES.gardeEnfantAlterne, quoi: "Même chose pour les enfants en résidence alternée (plafond divisé par deux)." },
      { cases: [CASES.emploiDomicile, CASES.emploiDomicilePremiereAnnee], quoi: "Emploi d'un salarié à domicile (7DB) : crédit de 50 % ; 7DQ si c'est la première année d'emploi direct." },
      {
        cases: [...CASES.scolarite.college, ...CASES.scolarite.lycee, ...CASES.scolarite.superieur],
        quoi: "Nombre d'enfants au collège (7EA, alternée 7EB), au lycée (7EC, 7ED) et dans le supérieur (7EF, 7EG) : réduction forfaitaire par enfant.",
      },
      { cases: paire(CASES.ehpad), quoi: "Frais de dépendance et d'hébergement en EHPAD, par personne hébergée : réduction de 25 %." },
      { cases: paire(CASES.cotisationsSyndicales), quoi: "Cotisations syndicales, si vous ne les déduisez pas déjà en frais réels : crédit de 66 %." },
      { cases: [CASES.pinel], quoi: "Investissement locatif Pinel ou Denormandie : cases de l'annexe 2042-RICI, selon l'année et le type d'investissement." },
    ],
  },
];

function Cases({ cases }: { cases: readonly CaseDecl[] }) {
  const uniques = cases.filter((c, i) => cases.findIndex((x) => x.code === c.code) === i);
  return (
    <span className="flex flex-wrap gap-1.5">
      {uniques.map((c) => (
        <span
          key={c.code}
          title={c.aVerifier ? "Numéro à vérifier sur votre déclaration" : undefined}
          className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-xs font-semibold whitespace-nowrap ${
            c.aVerifier ? "bg-amber-50 text-amber ring-1 ring-amber/30" : "bg-brand-50 text-brand"
          }`}
        >
          {c.code}
          {c.aVerifier && " ?"}
        </span>
      ))}
    </span>
  );
}

export default function GuideCases() {
  return (
    <GuideLayout
      guide={g}
      intro={
        <p>
          La déclaration de revenus compte des centaines de cases, mais un foyer n&apos;en utilise généralement qu&apos;une dizaine. Voici les plus
          courantes, regroupées par thème, avec ce qu&apos;on y déclare et les pièges à éviter.
        </p>
      }
      sources={[
        { libelle: "impots.gouv.fr : formulaire et notice 2042", url: "https://www.impots.gouv.fr/formulaire/2042/declaration-des-revenus" },
        { libelle: "impots.gouv.fr : brochure pratique 2026, déclaration des revenus 2025", url: "https://www.impots.gouv.fr/www2/fichiers/documentation/brochure/ir_2026/accueil.htm" },
        { libelle: "Service-Public : déclaration de revenus (F358)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F358" },
        { libelle: "Service-Public : frais réels des salariés (F1989)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F1989" },
      ]}
    >
      <p className="encadre">
        Numérotation de la déclaration 2026 (revenus 2025). Les numéros peuvent évoluer d&apos;une année sur l&apos;autre : vérifiez-les sur votre
        déclaration. Chaque numéro a été contrôlé sur la brochure pratique 2026 d&apos;impots.gouv.fr.
      </p>

      {SECTIONS.map((s) => (
        <SectionCases key={s.titre} titre={s.titre} intro={s.intro} lignes={s.lignes} />
      ))}

      <EncartSimulateur
        titre="Obtenez vos cases avec vos montants"
        texte="À la fin de la simulation, le détail du calcul indique chaque montant saisi et la case où le reporter."
        lien="/simulateur/?exemple&etape=5"
      />

      <h2>Les erreurs les plus fréquentes</h2>
      <ul>
        <li>
          <strong>Laisser le salaire pré-rempli</strong> alors que des allocations de l&apos;employeur doivent y être ajoutées en cas de frais réels.
        </li>
        <li>
          <strong>Déclarer les loyers nets</strong> au micro-foncier : on indique le montant brut, l&apos;abattement de 30 % est automatique.
        </li>
        <li>
          <strong>Oublier de cocher 2OP</strong> alors que le barème serait plus favorable (tranche à 0 % ou 11 %), ou la cocher sans vérifier : le choix
          s&apos;applique à tous les revenus de placement de l&apos;année.
        </li>
        <li>
          <strong>Compter un enfant en garde alternée en case F</strong> au lieu de H.
        </li>
        <li>
          <strong>Déclarer des frais réels sans pouvoir les justifier</strong> : voir <Link href="/guides/justificatif-frais-reels/">justifier ses frais
          réels</Link>.
        </li>
      </ul>
    </GuideLayout>
  );
}

function SectionCases({ titre, intro, lignes }: { titre: string; intro?: ReactNode; lignes: Ligne[] }) {
  return (
    <>
      <h2>{titre}</h2>
      {intro && <p>{intro}</p>}
      <div className="tableau">
        <table>
          <thead>
            <tr>
              <th>Case</th>
              <th>Ce qu&apos;on y déclare</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((l, k) => (
              <tr key={k}>
                <td className="align-top">
                  <Cases cases={l.cases} />
                </td>
                <td>{l.quoi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
