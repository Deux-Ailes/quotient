import { describe, expect, it } from "vitest";
import { detailDeclaration } from "./declaration";
import { simuler } from "./engine";
import { foyerExemple } from "./exemple";
import { foyerParDefaut, nouvelEnfant } from "./defaults";

const cases = (sections: ReturnType<typeof detailDeclaration>) =>
  sections.flatMap((s) => s.lignes.filter((l) => l.case).map((l) => [l.case!.code, l.valeur.replace(/[  ]/g, " ")] as const));

describe("détail de la déclaration", () => {
  it("foyer d'exemple : salaires, frais réels, enfant et garde", () => {
    const f = foyerExemple();
    const c = Object.fromEntries(cases(detailDeclaration(f, simuler(f))));
    expect(c["1AJ"]).toBe("42 000 €");
    expect(c["1BJ"]).toBe("31 000 €");
    expect(c["1AK"]).toBe("6 667 €");
    expect(c["1BK"]).toBeUndefined();
    expect(c["F"]).toBe("1");
    expect(c["7GA"]).toBe("4 200 €");
  });

  it("la somme des tranches redonne l'impôt au barème", () => {
    const f = foyerExemple();
    const r = simuler(f);
    const calcul = detailDeclaration(f, r).find((s) => s.titre === "Calcul de l'impôt")!;
    const somme = calcul.lignes
      .filter((l) => l.libelle.startsWith("Tranche"))
      .reduce((s, l) => s + Number(l.valeur.replace(/[^\d]/g, "")), 0);
    expect(Math.abs(somme - Math.round(r.qf.impotBrut))).toBeLessThanOrEqual(2);
  });

  it("garde alternée et scolarité : cases dédiées", () => {
    const f = foyerParDefaut();
    f.adultes[0].salaires = 40000;
    f.enfants = [
      { ...nouvelEnfant("Lina"), age: 4, gardeAlternee: true, fraisGarde: 1500 },
      { ...nouvelEnfant("Noé"), age: 12, scolarite: "college" },
    ];
    const c = Object.fromEntries(cases(detailDeclaration(f, simuler(f))));
    expect(c["7GE"]).toBe("1 500 €");
    expect(c["7EA"]).toBe("1");
    expect(c["H"]).toBe("1");
  });

  it("abattement de 10 % : aucune case de frais réels", () => {
    const f = foyerParDefaut();
    f.adultes[0].salaires = 30000;
    const codes = cases(detailDeclaration(f, simuler(f))).map(([code]) => code);
    expect(codes).toContain("1AJ");
    expect(codes).not.toContain("1AK");
  });
});
