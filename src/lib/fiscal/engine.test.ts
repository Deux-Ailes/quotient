import { describe, expect, it } from "vitest";
import { calculerDecote, impotBareme, simuler } from "./engine";
import { foyerParDefaut, nouveauVehicule, nouvelEnfant, teletravailVide } from "./defaults";
import { fraisRepas, fraisTeletravail, fraisVehicule } from "./fraisReels";
import { PARAMS_2025, PARAMS_2026 } from "./params";
import type { Foyer, Teletravail } from "./types";

function celibataire(salaire: number, annee: Foyer["annee"] = 2026): Foyer {
  const f = foyerParDefaut();
  f.annee = annee;
  f.situation = "celibataire";
  f.enfants = [];
  f.adultes[0].salaires = salaire;
  return f;
}

describe("barème", () => {
  it("revenus 2025 : 40 000 € pour 1 part", () => {
    expect(Math.round(impotBareme(40000, 1, PARAMS_2025.bareme))).toBe(5104);
  });
  it("revenus 2026 (PLF 2027) : 40 000 € pour 1 part", () => {
    expect(Math.round(impotBareme(40000, 1, PARAMS_2026.bareme))).toBe(4959);
  });
  it("aucun impôt sous le seuil de la première tranche", () => {
    expect(impotBareme(11844, 1, PARAMS_2026.bareme)).toBe(0);
  });
});

describe("décote (exemples service-public 2025)", () => {
  it("célibataire, impôt 1 400 €", () => {
    expect(calculerDecote(1400, false, PARAMS_2025)).toBeCloseTo(263.5, 2);
  });
  it("couple, impôt 2 800 €", () => {
    expect(calculerDecote(2800, true, PARAMS_2025)).toBeCloseTo(216, 2);
  });
  it("jamais supérieure à l'impôt", () => {
    expect(calculerDecote(300, false, PARAMS_2025)).toBe(300);
  });
});

describe("foyer type : couple + 1 enfant, revenus 2026", () => {
  const f = foyerParDefaut();
  f.adultes[0].salaires = 35000;
  f.adultes[1].salaires = 30000;
  const r = simuler(f);

  it("2,5 parts", () => expect(r.parts.total).toBe(2.5));
  it("abattement de 10 % retenu", () => {
    expect(r.adultes.map((a) => a.modeRetenu)).toEqual(["forfait", "forfait"]);
    expect(r.revenuNetImposable).toBe(58500);
  });
  it("impôt brut sans plafonnement du QF", () => {
    expect(r.qf.plafonne).toBe(false);
    expect(Math.round(r.qf.impotBrut)).toBe(3178);
  });
  it("décote puis impôt net", () => {
    expect(r.decote).toBe(75);
    expect(r.impotNet).toBe(3103);
  });
  it("taux de prélèvement à la source cohérent", () => {
    expect(r.pas.tauxFoyer).toBeCloseTo(3103 / 65000, 2);
  });
});

describe("plafonnement du quotient familial", () => {
  it("parent isolé, 1 enfant, 100 000 € de salaires", () => {
    const f = celibataire(100000);
    f.parentIsole = true;
    f.enfants = [nouvelEnfant()];
    f.enfants[0].age = 10;
    const r = simuler(f);
    expect(r.parts.total).toBe(2);
    expect(r.qf.plafonne).toBe(true);
    expect(Math.round(r.qf.impotBrut)).toBe(16008);
  });
  it("3e enfant : une part entière", () => {
    const f = foyerParDefaut();
    f.enfants = [nouvelEnfant(), nouvelEnfant(), nouvelEnfant()];
    expect(simuler(f).parts.total).toBe(4);
  });
  it("garde alternée : quart de part", () => {
    const f = foyerParDefaut();
    f.enfants[0].gardeAlternee = true;
    expect(simuler(f).parts.total).toBe(2.25);
  });
});

describe("frais réels", () => {
  it("barème kilométrique 5 CV, 30 km, 218 jours", () => {
    const v = { ...nouveauVehicule(), distanceAller: 30 };
    const { km, montant } = fraisVehicule(v, PARAMS_2026);
    expect(km).toBe(13080);
    expect(montant).toBeCloseTo(6064.56, 2);
  });
  it("majoration de 20 % pour un véhicule électrique", () => {
    const v = { ...nouveauVehicule(), distanceAller: 30, type: "voiture_electrique" as const };
    expect(fraisVehicule(v, PARAMS_2026).montant).toBeCloseTo(7277.47, 2);
  });
  it("distance plafonnée à 40 km sans justification", () => {
    const v = { ...nouveauVehicule(), distanceAller: 50 };
    expect(fraisVehicule(v, PARAMS_2026).km).toBe(17440);
    expect(fraisVehicule({ ...v, depasse40Justifie: true }, PARAMS_2026).km).toBe(21800);
  });
  it("repas : prix moins valeur forfaitaire", () => {
    expect(fraisRepas({ jours: 200, prixMoyen: 15, participationEmployeur: 0 }, PARAMS_2026)).toBeCloseTo(1890, 2);
  });
  it("télétravail au forfait plafonné", () => {
    expect(fraisTeletravail({ ...teletravailVide(), jours: 300 }, PARAMS_2026).total).toBeCloseTo(626.4, 2);
  });
  it("le mode auto retient les frais réels quand ils dépassent 10 %", () => {
    const f = celibataire(30000);
    f.adultes[0].frais.vehicules = [{ ...nouveauVehicule(), distanceAller: 30 }];
    const r = simuler(f);
    expect(r.adultes[0].modeRetenu).toBe("reels");
    expect(r.adultes[0].salairesNets).toBe(30000 - 6065);
  });
});

describe("télétravail aux frais réels", () => {
  const logement = (): Teletravail => ({
    ...teletravailVide(),
    mode: "reel",
    jours: 146,
    surfaceBureau: 10,
    surfaceLogement: 70,
    depenses: {
      loyer: 9600,
      chargesLocatives: 600,
      electricite: 900,
      chauffage: 700,
      eau: 300,
      assurance: 200,
      taxeFonciere: 800,
      chargesCopropriete: 1200,
      entretien: 0,
    },
    internet: { montant: 480, usagePro: 50 },
  });

  it("locataire, pièce dédiée : loyer et énergies au prorata de la surface", () => {
    const d = fraisTeletravail(logement(), PARAMS_2026);
    expect(d.depensesCommunes).toBe(12300);
    expect(d.ratioSurface).toBeCloseTo(1 / 7, 6);
    expect(d.local).toBeCloseTo(12300 / 7, 2);
    expect(d.internet).toBe(240);
    expect(d.total).toBeCloseTo(12300 / 7 + 240, 2);
  });
  it("propriétaire : taxe foncière et copropriété au lieu du loyer", () => {
    const d = fraisTeletravail({ ...logement(), statut: "proprietaire" }, PARAMS_2026);
    expect(d.depensesCommunes).toBe(900 + 700 + 300 + 200 + 800 + 1200);
  });
  it("studio : au plus la moitié de la surface", () => {
    const d = fraisTeletravail({ ...logement(), studio: true, surfaceBureau: 20, surfaceLogement: 30 }, PARAMS_2026);
    expect(d.ratioSurface).toBe(0.5);
  });
  it("pièce partagée : prorata d'usage selon les jours télétravaillés", () => {
    const d = fraisTeletravail({ ...logement(), pieceDediee: false }, PARAMS_2026);
    expect(d.ratioUsage).toBeCloseTo(0.4, 6);
    expect(d.local).toBeCloseTo((12300 / 7) * 0.4, 2);
  });
  it("équipements : déduction immédiate sous 500 € HT, sinon amortissement", () => {
    const t: Teletravail = {
      ...logement(),
      equipements: [
        { id: "pc", libelle: "Portable", prix: 1200, usagePro: 100, categorie: "informatique" },
        { id: "chaise", libelle: "Chaise", prix: 480, usagePro: 100, categorie: "mobilier" },
        { id: "bureau", libelle: "Bureau", prix: 900, usagePro: 100, categorie: "mobilier" },
      ],
    };
    const d = fraisTeletravail(t, PARAMS_2026);
    expect(d.equipements.map((e) => Math.round(e.montant))).toEqual([400, 480, 90]);
  });
  it("forfait cumulable avec les équipements", () => {
    const t: Teletravail = {
      ...teletravailVide(),
      jours: 100,
      equipements: [{ id: "c", libelle: "Chaise", prix: 480, usagePro: 100, categorie: "mobilier" }],
    };
    expect(fraisTeletravail(t, PARAMS_2026).total).toBeCloseTo(270 + 480, 2);
  });
});

describe("réductions et crédits", () => {
  it("crédit garde d'enfant de moins de 6 ans : 50 % plafonné", () => {
    const f = foyerParDefaut();
    f.adultes[0].salaires = 40000;
    f.enfants[0].fraisGarde = 5000;
    expect(simuler(f).credits.gardeEnfant).toBe(1750);
  });
  it("crédit restitué même sans impôt", () => {
    const f = foyerParDefaut();
    f.adultes[0].salaires = 15000;
    f.enfants[0].fraisGarde = 2000;
    expect(simuler(f).impotNet).toBe(-1000);
  });
  it("dons : 75 % jusqu'au plafond puis 66 %", () => {
    const f = celibataire(50000);
    f.reductions.dons75 = 1500;
    expect(simuler(f).reductions.dons).toBe(Math.round(1000 * 0.75 + 500 * 0.66));
  });
  it("seuil de recouvrement de 61 €", () => {
    const f = celibataire(16000);
    const r = simuler(f);
    expect(r.impotNet).toBe(0);
  });
});

describe("capitaux", () => {
  it("PFU 2026 : 12,8 % d'IR et 18,6 % de prélèvements sociaux", () => {
    const f = celibataire(0);
    f.capitaux.dividendes = 1000;
    const r = simuler(f);
    expect(r.pfu).toBe(128);
    expect(r.prelevementsSociaux).toBe(186);
  });
});
