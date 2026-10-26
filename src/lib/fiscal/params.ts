/**
 * Paramètres fiscaux par millésime (année des revenus).
 *
 * - 2025 : revenus 2025, déclarés en 2026 — loi de finances 2026 (loi n° 2026-103 du 19/02/2026),
 *   BOFiP BOI-IR-LIQ-20-10, service-public.gouv.fr F1419 / F34328 / F1989 / F2329 / F1991.
 * - 2026 : revenus 2026, déclarés en 2027 — PROVISOIRE. Barème issu du PLF 2027 (indexation +2,1 %),
 *   non encore voté. Les seuils non chiffrés par le PLF sont indexés de 2,1 % par nos soins.
 *
 * Toute valeur marquée `provisoire` doit être revue après promulgation de la loi de finances.
 */

export type Annee = 2025 | 2026;

export interface Tranche {
  /** Borne haute de la tranche (revenu par part), Infinity pour la dernière. */
  jusqua: number;
  taux: number;
}

/** Barème kilométrique : formule par tranche de distance annuelle. */
export interface FormuleKm {
  /** Borne haute de distance (km/an) de la tranche, Infinity pour la dernière. */
  jusqua: number;
  coef: number;
  fixe: number;
}

export interface ParamsFiscaux {
  annee: Annee;
  libelle: string;
  provisoire: boolean;
  notes: string[];

  bareme: Tranche[];
  decote: { seuilCelibataire: number; seuilCouple: number; coef: number };
  quotientFamilial: {
    /** Avantage maximal par demi-part supplémentaire. */
    demiPart: number;
    /** Avantage maximal pour la part entière du 1er enfant d'un parent isolé (case T). */
    parentIsole: number;
    /** Demi-part des personnes seules ayant élevé un enfant (case L). */
    caseL: number;
    /** Demi-part invalidité / ancien combattant (plafond général + réduction complémentaire). */
    invalide: number;
  };
  seuilRecouvrement: number;

  abattementSalaires: { taux: number; min: number; max: number };
  abattementPensions: { taux: number; min: number; maxFoyer: number };
  abattementAge: { seuil1: number; montant1: number; seuil2: number; montant2: number };
  pensionAlimentaireEnfantMajeur: number;

  fraisReels: {
    plafondDistanceKm: number;
    majorationElectrique: number;
    /**
     * Valeur du repas pris au foyer (brochure pratique) et prix retenu au plus : limite d'exonération
     * des indemnités de repas des salariés en déplacement, appliquée en pratique par l'administration.
     */
    repas: { valeurForfaitaire: number; plafond: number };
    /**
     * Forfait télétravail (limite d'exonération des allocations employeur, admise en frais réels).
     * Frais réels de local : BOI-RSA-BASE-30-50-30-30 §10 à §100 (prorata de surface, pièce entière
     * ou moitié d'un studio au plus).
     */
    teletravail: { parJour: number; plafondMensuel: number; plafondAnnuel: number; plafondSurfaceStudio: number };
    /** Matériel et mobilier : BOI-RSA-BASE-30-50-30-40 §70-80 (seuil en HT, amortissement linéaire). */
    seuilAmortissementMateriel: number;
    tauxTVA: number;
    dureeAmortissementMateriel: number;
    dureeAmortissementMobilier: number;
    cotisationsSyndicalesPlafond: number;
  };

  bareme_km: {
    voiture: Record<"3" | "4" | "5" | "6" | "7", FormuleKm[]>;
    cyclomoteur: FormuleKm[];
    moto: Record<"1-2" | "3-5" | "6", FormuleKm[]>;
  };

  capitaux: {
    pfuIR: number;
    psCapitaux: number;
    psFoncier: number;
    abattementDividendes: number;
  };

  micro: {
    abattementMin: number;
    vente: { taux: number; seuil: number };
    services: { taux: number; seuil: number };
    bnc: { taux: number; seuil: number };
    meubleLongueDuree: { taux: number; seuil: number };
    meubleTourismeClasse: { taux: number; seuil: number };
    meubleTourismeNonClasse: { taux: number; seuil: number };
  };
  foncier: { seuilMicro: number; abattementMicro: number; deficitImputableMax: number };

  credits: {
    gardeEnfant: { taux: number; plafondParEnfant: number; ageMax: number };
    emploiDomicile: {
      taux: number;
      plafond: number;
      majoration: number;
      plafondMax: number;
      plafondPremiereAnnee: number;
      plafondMaxPremiereAnnee: number;
    };
    cotisationsSyndicales: { taux: number };
  };

  reductions: {
    dons: {
      taux75: number;
      plafond75: number;
      taux66: number;
      plafondRevenu: number;
      /**
       * Année de transition : plafond plus bas pour les dons versés avant une date de bascule
       * (revenus 2025 : 1 000 € avant le 14/10/2025, 2 000 € au total ensuite).
       */
      avantBascule?: { date: string; plafond: number };
    };
    scolarite: { college: number; lycee: number; superieur: number };
    ehpad: { taux: number; plafondParPersonne: number };
    denormandie: { prixMax: number; taux: Record<6 | 9 | 12, number> };
  };

  plafondNiches: number;
  per: { pass: number };

  cehr: {
    celibataire: { seuil: number; taux: number }[];
    couple: { seuil: number; taux: number }[];
  };
}

const KM_VOITURE: ParamsFiscaux["bareme_km"]["voiture"] = {
  "3": [
    { jusqua: 5000, coef: 0.529, fixe: 0 },
    { jusqua: 20000, coef: 0.316, fixe: 1065 },
    { jusqua: Infinity, coef: 0.37, fixe: 0 },
  ],
  "4": [
    { jusqua: 5000, coef: 0.606, fixe: 0 },
    { jusqua: 20000, coef: 0.34, fixe: 1330 },
    { jusqua: Infinity, coef: 0.407, fixe: 0 },
  ],
  "5": [
    { jusqua: 5000, coef: 0.636, fixe: 0 },
    { jusqua: 20000, coef: 0.357, fixe: 1395 },
    { jusqua: Infinity, coef: 0.427, fixe: 0 },
  ],
  "6": [
    { jusqua: 5000, coef: 0.665, fixe: 0 },
    { jusqua: 20000, coef: 0.374, fixe: 1457 },
    { jusqua: Infinity, coef: 0.447, fixe: 0 },
  ],
  "7": [
    { jusqua: 5000, coef: 0.697, fixe: 0 },
    { jusqua: 20000, coef: 0.394, fixe: 1515 },
    { jusqua: Infinity, coef: 0.47, fixe: 0 },
  ],
};

const KM_CYCLO: FormuleKm[] = [
  { jusqua: 3000, coef: 0.315, fixe: 0 },
  { jusqua: 6000, coef: 0.079, fixe: 711 },
  { jusqua: Infinity, coef: 0.198, fixe: 0 },
];

const KM_MOTO: ParamsFiscaux["bareme_km"]["moto"] = {
  "1-2": [
    { jusqua: 3000, coef: 0.395, fixe: 0 },
    { jusqua: 6000, coef: 0.099, fixe: 891 },
    { jusqua: Infinity, coef: 0.248, fixe: 0 },
  ],
  "3-5": [
    { jusqua: 3000, coef: 0.468, fixe: 0 },
    { jusqua: 6000, coef: 0.082, fixe: 1158 },
    { jusqua: Infinity, coef: 0.275, fixe: 0 },
  ],
  "6": [
    { jusqua: 3000, coef: 0.606, fixe: 0 },
    { jusqua: 6000, coef: 0.079, fixe: 1583 },
    { jusqua: Infinity, coef: 0.343, fixe: 0 },
  ],
};

const CEHR = {
  celibataire: [
    { seuil: 250000, taux: 0.03 },
    { seuil: 500000, taux: 0.04 },
  ],
  couple: [
    { seuil: 500000, taux: 0.03 },
    { seuil: 1000000, taux: 0.04 },
  ],
};

export const PARAMS_2025: ParamsFiscaux = {
  annee: 2025,
  libelle: "Revenus 2025 (déclaration 2026)",
  provisoire: false,
  notes: [
    "Barème, décote et plafonds du quotient familial : loi de finances 2026 (revalorisation de 0,9 %).",
    "Barème kilométrique gelé depuis les revenus 2022.",
    "Forfait télétravail : 2,70 €/jour (59,40 €/mois, 626,40 €/an), confirmé par la brochure pratique 2026.",
  ],
  bareme: [
    { jusqua: 11600, taux: 0 },
    { jusqua: 29579, taux: 0.11 },
    { jusqua: 84577, taux: 0.3 },
    { jusqua: 181917, taux: 0.41 },
    { jusqua: Infinity, taux: 0.45 },
  ],
  decote: { seuilCelibataire: 897, seuilCouple: 1483, coef: 0.4525 },
  quotientFamilial: { demiPart: 1807, parentIsole: 4262, caseL: 1079, invalide: 3608 },
  seuilRecouvrement: 61,
  abattementSalaires: { taux: 0.1, min: 509, max: 14555 },
  abattementPensions: { taux: 0.1, min: 454, maxFoyer: 4439 },
  abattementAge: { seuil1: 17670, montant1: 2822, seuil2: 28430, montant2: 1411 },
  pensionAlimentaireEnfantMajeur: 6855,
  fraisReels: {
    plafondDistanceKm: 40,
    majorationElectrique: 0.2,
    repas: { valeurForfaitaire: 5.45, plafond: 21.1 },
    teletravail: { parJour: 2.7, plafondMensuel: 59.4, plafondAnnuel: 626.4, plafondSurfaceStudio: 0.5 },
    seuilAmortissementMateriel: 500,
    tauxTVA: 0.2,
    dureeAmortissementMateriel: 3,
    dureeAmortissementMobilier: 10,
    cotisationsSyndicalesPlafond: 0.01,
  },
  bareme_km: { voiture: KM_VOITURE, cyclomoteur: KM_CYCLO, moto: KM_MOTO },
  capitaux: { pfuIR: 0.128, psCapitaux: 0.172, psFoncier: 0.172, abattementDividendes: 0.4 },
  micro: {
    abattementMin: 305,
    vente: { taux: 0.71, seuil: 188700 },
    services: { taux: 0.5, seuil: 77700 },
    bnc: { taux: 0.34, seuil: 77700 },
    meubleLongueDuree: { taux: 0.5, seuil: 77700 },
    meubleTourismeClasse: { taux: 0.5, seuil: 77700 },
    meubleTourismeNonClasse: { taux: 0.3, seuil: 15000 },
  },
  foncier: { seuilMicro: 15000, abattementMicro: 0.3, deficitImputableMax: 10700 },
  credits: {
    gardeEnfant: { taux: 0.5, plafondParEnfant: 3500, ageMax: 6 },
    emploiDomicile: {
      taux: 0.5,
      plafond: 12000,
      majoration: 1500,
      plafondMax: 15000,
      plafondPremiereAnnee: 15000,
      plafondMaxPremiereAnnee: 18000,
    },
    cotisationsSyndicales: { taux: 0.66 },
  },
  reductions: {
    dons: {
      taux75: 0.75,
      plafond75: 2000,
      taux66: 0.66,
      plafondRevenu: 0.2,
      avantBascule: { date: "14 octobre 2025", plafond: 1000 },
    },
    scolarite: { college: 61, lycee: 153, superieur: 183 },
    ehpad: { taux: 0.25, plafondParPersonne: 10000 },
    denormandie: { prixMax: 300000, taux: { 6: 0.12, 9: 0.18, 12: 0.21 } },
  },
  plafondNiches: 10000,
  per: { pass: 46368 },
  cehr: CEHR,
};

/** Indexation appliquée aux seuils 2026 non publiés par le PLF 2027. */
const INDEX_2026 = 1.021;
const idx = (v: number) => Math.round(v * INDEX_2026);

export const PARAMS_2026: ParamsFiscaux = {
  ...PARAMS_2025,
  annee: 2026,
  libelle: "Revenus 2026 (déclaration 2027)",
  provisoire: true,
  notes: [
    "Provisoire : barème du projet de loi de finances 2027 (+2,1 %), non encore voté.",
    "Décote et plafonds du quotient familial : montants annoncés avec le PLF 2027.",
    "Autres seuils (abattements, pension alimentaire…) indexés de 2,1 % par Quotient en attendant les textes.",
    "Le PLF prévoit de ramener le plafond de l'abattement de 10 % sur les pensions à 3 000 € par foyer ; mesure contestée, non retenue ici.",
    "Prélèvements sociaux sur dividendes et intérêts portés à 18,6 % (LFSS 2026) ; revenus fonciers maintenus à 17,2 %.",
    "Barème kilométrique supposé gelé (une revalorisation de 10 % est débattue).",
    "Forfait télétravail maintenu à 2,70 €/jour, faute de nouveau montant publié.",
  ],
  bareme: [
    { jusqua: 11844, taux: 0 },
    { jusqua: 30200, taux: 0.11 },
    { jusqua: 86353, taux: 0.3 },
    { jusqua: 185737, taux: 0.41 },
    { jusqua: Infinity, taux: 0.45 },
  ],
  decote: { seuilCelibataire: 915, seuilCouple: 1513, coef: 0.4525 },
  quotientFamilial: {
    demiPart: 1845,
    parentIsole: 4352,
    caseL: idx(PARAMS_2025.quotientFamilial.caseL),
    invalide: idx(PARAMS_2025.quotientFamilial.invalide),
  },
  abattementSalaires: { taux: 0.1, min: idx(509), max: idx(14555) },
  abattementPensions: { taux: 0.1, min: idx(454), maxFoyer: idx(4439) },
  abattementAge: {
    seuil1: idx(17670),
    montant1: idx(2822),
    seuil2: idx(28430),
    montant2: idx(1411),
  },
  pensionAlimentaireEnfantMajeur: idx(6855),
  fraisReels: {
    ...PARAMS_2025.fraisReels,
    repas: { valeurForfaitaire: 5.55, plafond: 21.5 },
  },
  capitaux: { pfuIR: 0.128, psCapitaux: 0.186, psFoncier: 0.172, abattementDividendes: 0.4 },
  micro: {
    abattementMin: 305,
    vente: { taux: 0.71, seuil: 203100 },
    services: { taux: 0.5, seuil: 83600 },
    bnc: { taux: 0.34, seuil: 83600 },
    meubleLongueDuree: { taux: 0.5, seuil: 83600 },
    meubleTourismeClasse: { taux: 0.5, seuil: 83600 },
    meubleTourismeNonClasse: { taux: 0.3, seuil: 15000 },
  },
  per: { pass: 47100 },
  reductions: {
    ...PARAMS_2025.reductions,
    dons: { taux75: 0.75, plafond75: 2000, taux66: 0.66, plafondRevenu: 0.2 },
  },
};

export const PARAMS: Record<Annee, ParamsFiscaux> = { 2025: PARAMS_2025, 2026: PARAMS_2026 };
export const ANNEE_DEFAUT: Annee = 2026;
