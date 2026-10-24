import type { FormuleKm, ParamsFiscaux } from "./params";
import type { FraisReels, Vehicule } from "./types";

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

export function fraisTeletravail(t: FraisReels["teletravail"], p: ParamsFiscaux): number {
  if (t.mode === "reel") return Math.max(0, t.montantReel);
  return Math.min(Math.max(0, t.jours) * p.fraisReels.teletravail.parJour, p.fraisReels.teletravail.plafondAnnuel);
}

/** Matériel : déductible immédiatement sous le seuil, sinon amorti sur 3 ans (annuité de l'année). */
export function fraisMateriel(m: FraisReels["materiel"], p: ParamsFiscaux): number {
  const prixPro = Math.max(0, m.prix) * Math.min(1, Math.max(0, m.usagePro) / 100);
  if (m.prix <= p.fraisReels.seuilAmortissementMateriel) return prixPro;
  return prixPro / p.fraisReels.dureeAmortissementMateriel;
}

export interface DetailFraisReels {
  vehicules: { id: string; km: number; montant: number }[];
  transportsCommun: number;
  repas: number;
  teletravail: number;
  doubleResidence: number;
  formation: number;
  materiel: number;
  cotisationsSyndicales: number;
  vetements: number;
  documentation: number;
  autres: number;
  total: number;
}

export function calculerFraisReels(f: FraisReels, salairesBruts: number, p: ParamsFiscaux): DetailFraisReels {
  const vehicules = f.vehicules.map((v) => ({ id: v.id, ...fraisVehicule(v, p) }));
  const pos = (n: number) => Math.max(0, n || 0);
  const detail = {
    vehicules,
    transportsCommun: pos(f.transportsCommun),
    repas: fraisRepas(f.repas, p),
    teletravail: fraisTeletravail(f.teletravail, p),
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
