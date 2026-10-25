import { describe, expect, it } from "vitest";
import { simuler } from "./engine";
import { foyerExemple } from "./exemple";
import { nouveauVehicule } from "./defaults";
import { resumeFraisReels } from "./resumeFraisReels";

describe("résumé des frais réels", () => {
  it("foyer d'exemple : formules détaillées et total", () => {
    const f = foyerExemple();
    const r = simuler(f);
    const texte = resumeFraisReels(f.adultes[0], r.adultes[0], r.params, 0);
    expect(texte).toContain("case 1AK : 6 668 €");
    expect(texte).toContain("32 x 2 x 1 x 170 jours = 10 880 km");
    expect(texte).toContain("10 880 x 0,357 + 1 395 = 5 279 €");
    expect(texte).toContain("170 repas x (13,00 € - 5,55 €");
    expect(texte).toContain("45 jours x 2,70 €");
    expect(texte).toContain("Total des frais réels : 6 668 €.");
  });

  it("la somme des postes justifiés est égale au total", () => {
    const f = foyerExemple();
    f.adultes[0].frais.teletravail = {
      ...f.adultes[0].frais.teletravail,
      mode: "reel",
      jours: 146,
      surfaceBureau: 10,
      surfaceLogement: 70,
      depenses: { ...f.adultes[0].frais.teletravail.depenses, loyer: 9600, electricite: 900, chauffage: 700 },
      internet: { montant: 480, usagePro: 50 },
    };
    const r = simuler(f);
    const texte = resumeFraisReels(f.adultes[0], r.adultes[0], r.params, 0);
    // Montant final de chaque sous-poste : nombre en euros placé après un « = ».
    const postes = [...texte.matchAll(/= ([\d ]+) €/g)].map((m) => Number(m[1].replace(/ /g, "")));
    const fr = r.adultes[0].fraisReels;
    const attendu = fr.vehicules.reduce((s, v) => s + v.montant, 0) + fr.repas + fr.teletravail;
    expect(fr.total).toBe(attendu);
    expect(postes.reduce((s, v) => s + v, 0)).toBe(fr.total);
  });

  it("texte brut : pas d'espace insécable ni de signe de multiplication typographique", () => {
    const f = foyerExemple();
    const r = simuler(f);
    const texte = resumeFraisReels(f.adultes[0], r.adultes[0], r.params, 0);
    expect(texte).not.toMatch(/[  ×—–]/);
  });

  it("distance plafonnée et véhicule électrique expliqués", () => {
    const f = foyerExemple();
    f.adultes[0].frais.vehicules = [{ ...nouveauVehicule(), distanceAller: 55, type: "voiture_electrique" }];
    const r = simuler(f);
    const texte = resumeFraisReels(f.adultes[0], r.adultes[0], r.params, 0);
    expect(texte).toContain("retenue pour 40 km");
    expect(texte).toContain("majoration de 20 %");
  });
});
