import { ANNEE_DEFAUT } from "./params";
import type { Adulte, Enfant, FraisReels, Foyer, Vehicule } from "./types";

let compteur = 0;
export const nouvelId = () => `${Date.now().toString(36)}-${(compteur++).toString(36)}`;

export function nouveauVehicule(): Vehicule {
  return {
    id: nouvelId(),
    type: "voiture",
    puissanceVoiture: "5",
    puissanceMoto: "3-5",
    distanceAller: 0,
    joursParAn: 218,
    allerRetoursParJour: 1,
    depasse40Justifie: false,
    kmSupplementaires: 0,
    peagesParking: 0,
  };
}

export function fraisVides(): FraisReels {
  return {
    vehicules: [],
    transportsCommun: 0,
    repas: { jours: 0, prixMoyen: 0, participationEmployeur: 0 },
    teletravail: { mode: "forfait", jours: 0, montantReel: 0 },
    remboursementsEmployeur: 0,
    doubleResidence: 0,
    formation: 0,
    materiel: { prix: 0, usagePro: 100 },
    cotisationsSyndicales: 0,
    vetements: 0,
    documentation: 0,
    autres: 0,
  };
}

export function nouvelAdulte(prenom: string): Adulte {
  return {
    prenom,
    plus65ans: false,
    invalide: false,
    salaires: 0,
    chomage: 0,
    pensions: 0,
    modeFrais: "auto",
    frais: fraisVides(),
    micro: { type: "aucun", chiffreAffaires: 0 },
    per: { versements: 0, plafondDisponible: null },
  };
}

export function nouvelEnfant(prenom = ""): Enfant {
  return {
    id: nouvelId(),
    prenom,
    age: 4,
    gardeAlternee: false,
    handicap: false,
    scolarite: "aucun",
    fraisGarde: 0,
  };
}

/** Foyer par défaut : couple marié/pacsé avec un enfant. */
export function foyerParDefaut(): Foyer {
  return {
    annee: ANNEE_DEFAUT,
    situation: "couple",
    parentIsole: false,
    caseL: false,
    adultes: [nouvelAdulte("Déclarant 1"), nouvelAdulte("Déclarant 2")],
    enfants: [nouvelEnfant("Enfant 1")],
    foncier: { regime: "micro", recettes: 0, charges: 0 },
    capitaux: { dividendes: 0, interets: 0, option: "pfu" },
    deductions: { pensionEnfantsMajeurs: [], pensionExConjoint: 0 },
    reductions: {
      dons75: 0,
      dons66: 0,
      emploiDomicile: { depenses: 0, premiereAnnee: false },
      ehpad: [],
      pinelReductionAnnuelle: 0,
      denormandie: { prix: 0, duree: 0 },
    },
  };
}
