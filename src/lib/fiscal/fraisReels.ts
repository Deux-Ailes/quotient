import type { FormuleKm, ParamsFiscaux } from "./params";
import type { FraisReels, Teletravail, Vehicule } from "./types";

export function appliquerFormuleKm(formules: FormuleKm[], km: number): number {
  if (km <= 0) return 0;
  const f = formules.find((t) => km <= t.jusqua) ?? formules[formules.length - 1];
  return km * f.coef + f.fixe;
}

/** Kilomètres annuels retenus pour un véhicule (plafond de 40 km aller sauf justification). */
export function kmAnnuels(v: Vehicule, p: ParamsFiscaux): number {
  const distance = v.depasse40Justifie
    ? v.distanceAller
    : Math.min(v.distanceAller, p.fraisReels.plafondDistanceKm);
  return Math.max(0, distance) * 2 * v.allerRetoursParJour * Math.max(0, v.joursParAn) + Math.max(0, v.kmSupplementaires);
}

export function fraisVehicule(v: Vehicule, p: ParamsFiscaux): { km: number; montant: number } {
  const km = kmAnnuels(v, p);
  let montant: number;
  switch (v.type) {
    case "voiture":
    case "voiture_electrique":
      montant = appliquerFormuleKm(p.bareme_km.voiture[v.puissanceVoiture], km);
      break;
    case "moto":
    case "moto_electrique":
      montant = appliquerFormuleKm(p.bareme_km.moto[v.puissanceMoto], km);
      break;
    case "cyclomoteur":
      montant = appliquerFormuleKm(p.bareme_km.cyclomoteur, km);
      break;
  }
  if (v.type === "voiture_electrique" || v.type === "moto_electrique") {
    montant *= 1 + p.fraisReels.majorationElectrique;
  }
  return { km, montant: montant + Math.max(0, v.peagesParking) };
}

export function fraisRepas(r: FraisReels["repas"], p: ParamsFiscaux): number {
  const { valeurForfaitaire, plafond } = p.fraisReels.repas;
  const parRepas = Math.min(r.prixMoyen, plafond) - valeurForfaitaire - r.participationEmployeur;
  return Math.max(0, parRepas) * Math.max(0, r.jours);
}

const pos = (n: number) => Math.max(0, n || 0);
const pct = (n: number) => Math.min(1, pos(n) / 100);

/**
 * Bien professionnel (BOI-RSA-BASE-30-50-30-40 §70-80) : déduit l'année d'achat si sa valeur unitaire
 * n'excède pas 500 € HT, sinon annuité d'amortissement linéaire ; dans tous les cas au prorata de l'usage pro.
 */
export function deductionBien(prixTTC: number, usagePro: number, duree: number, p: ParamsFiscaux): number {
  const prixPro = pos(prixTTC) * pct(usagePro);
  const prixHT = pos(prixTTC) / (1 + p.fraisReels.tauxTVA);
  return prixHT <= p.fraisReels.seuilAmortissementMateriel ? prixPro : prixPro / duree;
}

export function fraisMateriel(m: FraisReels["materiel"], p: ParamsFiscaux): number {
  return deductionBien(m.prix, m.usagePro, p.fraisReels.dureeAmortissementMateriel, p);
}

export interface DetailTeletravail {
  mode: Teletravail["mode"];
  forfait: number;
  /** Rapport surface du bureau / surface du logement, après limite studio. */
  ratioSurface: number;
  /** Part d'utilisation professionnelle de la pièce si elle n'est pas dédiée. */
  ratioUsage: number;
  /** Jours télétravaillés / 365 : part de l'année où l'énergie est consommée pour le travail. */
  ratioTemps: number;
  /** Quote-part appliquée aux charges fixes (loyer, charges, assurance…). */
  quotePartFixes: number;
  /** Quote-part appliquée aux énergies (électricité, chauffage, eau). */
  quotePartEnergies: number;
  depensesCommunes: number;
  depensesFixes: number;
  depensesEnergies: number;
  localFixes: number;
  localEnergies: number;
  local: number;
  internet: number;
  equipements: { id: string; montant: number; amorti: boolean }[];
  totalEquipements: number;
  total: number;
}

/** Énergies : consommées pour le travail seulement les jours télétravaillés. */
export const CLES_ENERGIES = ["electricite", "chauffage", "eau"] as const;

export function depensesEnergies(t: Teletravail): number {
  return CLES_ENERGIES.reduce((s, k) => s + pos(t.depenses[k]), 0);
}

/** Charges fixes retenues selon le statut : chacun ne déduit que ce qui lui incombe (§50). */
export function depensesFixes(t: Teletravail): number {
  const d = t.depenses;
  const communes = pos(d.assurance) + pos(d.entretien);
  return t.statut === "locataire"
    ? communes + pos(d.loyer) + pos(d.chargesLocatives)
    : communes + pos(d.taxeFonciere) + pos(d.chargesCopropriete);
}

export function depensesCommunes(t: Teletravail): number {
  return depensesFixes(t) + depensesEnergies(t);
}

export function fraisTeletravail(t: Teletravail, p: ParamsFiscaux): DetailTeletravail {
  const tt = p.fraisReels.teletravail;
  const equipements = t.equipements.map((e) => {
    const duree = e.categorie === "informatique" ? p.fraisReels.dureeAmortissementMateriel : p.fraisReels.dureeAmortissementMobilier;
    const montant = deductionBien(e.prix, e.usagePro, duree, p);
    return { id: e.id, montant, amorti: pos(e.prix) / (1 + p.fraisReels.tauxTVA) > p.fraisReels.seuilAmortissementMateriel };
  });
  const totalEquipements = equipements.reduce((s, e) => s + e.montant, 0);

  const forfait = Math.min(pos(t.jours) * tt.parJour, tt.plafondAnnuel);

  // Prorata de surface (§90), limité à la moitié d'un studio (§40).
  const brut = t.surfaceLogement > 0 ? pos(t.surfaceBureau) / t.surfaceLogement : 0;
  const ratioSurface = Math.min(brut, t.studio ? tt.plafondSurfaceStudio : 1);
  const ratioTemps = Math.min(1, pos(t.jours) / 365);
  // Pièce non exclusivement professionnelle (§100) : seule la part d'usage pro est retenue,
  // estimée par les jours télétravaillés sur l'année.
  const ratioUsage = t.pieceDediee ? 1 : ratioTemps;

  // Charges fixes : une pièce dédiée l'est toute l'année (§30), prorata de surface seul.
  // Énergies : consommées pour le travail les seuls jours télétravaillés, prorata de surface et de temps.
  const quotePartFixes = ratioSurface * ratioUsage;
  const quotePartEnergies = ratioSurface * ratioTemps;

  const fixes = depensesFixes(t);
  const energies = depensesEnergies(t);
  const localFixes = fixes * quotePartFixes;
  const localEnergies = energies * quotePartEnergies;
  const local = localFixes + localEnergies + pos(t.depensesBureau) * ratioUsage;
  const internet = pos(t.internet.montant) * pct(t.internet.usagePro);

  const total = t.mode === "forfait" ? forfait + totalEquipements : local + internet + totalEquipements;
  return {
    mode: t.mode,
    forfait,
    ratioSurface,
    ratioUsage,
    ratioTemps,
    quotePartFixes,
    quotePartEnergies,
    depensesCommunes: fixes + energies,
    depensesFixes: fixes,
    depensesEnergies: energies,
    localFixes,
    localEnergies,
    local,
    internet,
    equipements,
    totalEquipements,
    total,
  };
}

export interface DetailFraisReels {
  vehicules: { id: string; km: number; montant: number }[];
  transportsCommun: number;
  repas: number;
  teletravail: number;
  doubleResidence: number;
  formation: number;
  teletravailDetail: DetailTeletravail;
  materiel: number;
  cotisationsSyndicales: number;
  vetements: number;
  documentation: number;
  autres: number;
  total: number;
}

export function calculerFraisReels(f: FraisReels, salairesBruts: number, p: ParamsFiscaux): DetailFraisReels {
  const vehicules = f.vehicules.map((v) => ({ id: v.id, ...fraisVehicule(v, p) }));
  const teletravailDetail = fraisTeletravail(f.teletravail, p);
  const detail = {
    vehicules,
    transportsCommun: pos(f.transportsCommun),
    repas: fraisRepas(f.repas, p),
    teletravail: teletravailDetail.total,
    teletravailDetail,
    doubleResidence: pos(f.doubleResidence),
    formation: pos(f.formation),
    materiel: fraisMateriel(f.materiel, p),
    cotisationsSyndicales: Math.min(pos(f.cotisationsSyndicales), salairesBruts * p.fraisReels.cotisationsSyndicalesPlafond),
    vetements: pos(f.vetements),
    documentation: pos(f.documentation),
    autres: pos(f.autres),
  };
  const total =
    vehicules.reduce((s, v) => s + v.montant, 0) +
    detail.transportsCommun +
    detail.repas +
    detail.teletravail +
    detail.doubleResidence +
    detail.formation +
    detail.materiel +
    detail.cotisationsSyndicales +
    detail.vetements +
    detail.documentation +
    detail.autres;
  return { ...detail, total: Math.round(total) };
}
