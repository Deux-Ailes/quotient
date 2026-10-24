import type { Annee } from "./params";

export type TypeVehicule = "voiture" | "voiture_electrique" | "moto" | "moto_electrique" | "cyclomoteur";
export type PuissanceVoiture = "3" | "4" | "5" | "6" | "7";
export type PuissanceMoto = "1-2" | "3-5" | "6";

export interface Vehicule {
  id: string;
  type: TypeVehicule;
  puissanceVoiture: PuissanceVoiture;
  puissanceMoto: PuissanceMoto;
  /** Distance domicile-travail aller simple (km). */
  distanceAller: number;
  joursParAn: number;
  allerRetoursParJour: 1 | 2;
  /** Distance > 40 km justifiée par des circonstances particulières. */
  depasse40Justifie: boolean;
  /** Autres km professionnels non remboursés (rendez-vous, formation…). */
  kmSupplementaires: number;
  /** Péages, parkings liés aux trajets professionnels. */
  peagesParking: number;
}

export interface FraisReels {
  vehicules: Vehicule[];
  /** Part non remboursée d'abonnement de transports en commun. */
  transportsCommun: number;
  repas: { jours: number; prixMoyen: number; participationEmployeur: number };
  teletravail: { mode: "forfait" | "reel"; jours: number; montantReel: number };
  /** Allocations et remboursements de l'employeur à réintégrer dans le salaire. */
  remboursementsEmployeur: number;
  doubleResidence: number;
  formation: number;
  materiel: { prix: number; usagePro: number };
  cotisationsSyndicales: number;
  vetements: number;
  documentation: number;
  autres: number;
}

export type TypeMicro = "aucun" | "vente" | "services" | "bnc" | "meubleLongueDuree" | "meubleTourismeClasse" | "meubleTourismeNonClasse";

export interface Adulte {
  prenom: string;
  plus65ans: boolean;
  invalide: boolean;
  /** Salaires nets imposables annuels (cumul net imposable). */
  salaires: number;
  /** Allocations chômage imposables (même abattement que les salaires). */
  chomage: number;
  pensions: number;
  modeFrais: "auto" | "forfait" | "reels";
  frais: FraisReels;
  micro: { type: TypeMicro; chiffreAffaires: number };
  per: { versements: number; plafondDisponible: number | null };
}

export type NiveauScolaire = "aucun" | "college" | "lycee" | "superieur";

export interface Enfant {
  id: string;
  prenom: string;
  age: number;
  gardeAlternee: boolean;
  handicap: boolean;
  scolarite: NiveauScolaire;
  /** Frais de garde hors domicile (net des aides, ex. CMG), enfants de moins de 6 ans. */
  fraisGarde: number;
}

export interface Foyer {
  annee: Annee;
  situation: "couple" | "celibataire";
  /** Case T : parent vivant seul avec ses enfants. */
  parentIsole: boolean;
  /** Case L : personne seule ayant élevé seule un enfant pendant au moins 5 ans. */
  caseL: boolean;
  adultes: [Adulte, Adulte];
  enfants: Enfant[];

  foncier: { regime: "micro" | "reel"; recettes: number; charges: number };
  capitaux: { dividendes: number; interets: number; option: "pfu" | "bareme" };

  deductions: {
    pensionEnfantsMajeurs: number[];
    pensionExConjoint: number;
  };

  reductions: {
    dons75: number;
    dons66: number;
    emploiDomicile: { depenses: number; premiereAnnee: boolean };
    ehpad: number[];
    pinelReductionAnnuelle: number;
    denormandie: { prix: number; duree: 0 | 6 | 9 | 12 };
  };
}
