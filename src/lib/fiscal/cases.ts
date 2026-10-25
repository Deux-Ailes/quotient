/**
 * Numéros de cases de la déclaration des revenus (formulaires 2042, 2042-C, 2042-C-PRO, 2042-RICI),
 * numérotation de la déclaration 2026 (revenus 2025).
 *
 * Non vérifiés sur la brochure officielle (impots.gouv.fr indisponible au moment de la rédaction) :
 * les cases marquées `aVerifier` sont les moins sûres. La numérotation peut changer d'une année sur
 * l'autre : à revoir chaque printemps sur la notice 2042.
 */

export interface CaseDecl {
  code: string;
  aVerifier?: boolean;
}

const c = (code: string, aVerifier = false): CaseDecl => ({ code, aVerifier });

/** Index 0 = déclarant 1, index 1 = déclarant 2. */
type ParDeclarant = [CaseDecl, CaseDecl];

export const CASES = {
  situationCouple: c("M ou O"),
  situationSeul: c("C, D ou V"),
  parentIsole: c("T"),
  caseL: c("L"),
  invalidite: [c("P"), c("F")] as ParDeclarant,
  enfantsMineurs: c("F"),
  enfantsMineursInvalides: c("G"),
  enfantsAlternes: c("H"),
  enfantsAlternesInvalides: c("I"),
  enfantsMajeurs: c("J"),

  salaires: [c("1AJ"), c("1BJ")] as ParDeclarant,
  fraisReels: [c("1AK"), c("1BK")] as ParDeclarant,
  chomage: [c("1AP"), c("1BP")] as ParDeclarant,
  pensions: [c("1AS"), c("1BS")] as ParDeclarant,

  microVente: [c("5KO"), c("5LO")] as ParDeclarant,
  microServices: [c("5KP"), c("5LP")] as ParDeclarant,
  microBnc: [c("5HQ"), c("5IQ")] as ParDeclarant,
  meubleLongueDuree: [c("5NJ", true), c("5OJ", true)] as ParDeclarant,
  meubleTourismeClasse: [c("5NG", true), c("5OG", true)] as ParDeclarant,
  meubleTourismeNonClasse: [c("5ND", true), c("5OD", true)] as ParDeclarant,

  foncierMicro: c("4BE"),
  foncierBenefice: c("4BA"),
  foncierDeficitGlobal: c("4BC"),

  dividendes: c("2DC"),
  interets: c("2TR"),
  optionBareme: c("2OP"),

  per: [c("6NS"), c("6NT")] as ParDeclarant,
  pensionEnfantsMajeursNombre: c("6EL"),
  pensionEnfantsMajeursMontant: c("6EM"),
  pensionAutres: c("6GU", true),

  dons75: c("7UD"),
  dons66: c("7UF"),
  scolarite: {
    college: [c("7EA"), c("7EB")] as [CaseDecl, CaseDecl],
    lycee: [c("7EC"), c("7ED")] as [CaseDecl, CaseDecl],
    superieur: [c("7EF"), c("7EG")] as [CaseDecl, CaseDecl],
  },
  ehpad: [c("7CD"), c("7CE")] as ParDeclarant,
  pinel: c("2042-RICI", true),
  denormandie: c("2042-RICI", true),
  gardeEnfant: [c("7GA"), c("7GB"), c("7GC")],
  gardeEnfantAlterne: [c("7GE"), c("7GF"), c("7GG")],
  emploiDomicile: c("7DB"),
  emploiDomicilePremiereAnnee: c("7DQ"),
  cotisationsSyndicales: [c("7AC"), c("7AE")] as ParDeclarant,
} as const;
