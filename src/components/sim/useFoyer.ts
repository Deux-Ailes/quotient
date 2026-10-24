"use client";

import { useCallback, useEffect, useState } from "react";
import { foyerParDefaut, teletravailVide } from "@/lib/fiscal/defaults";
import type { Foyer } from "@/lib/fiscal/types";

const CLE = "quotient:brouillon:v1";

/** Met à jour le foyer en modifiant une copie (style « brouillon »). */
export type Maj = (recette: (brouillon: Foyer) => void) => void;

function lire(): Foyer | null {
  try {
    const brut = localStorage.getItem(CLE);
    if (!brut) return null;
    const f = JSON.parse(brut) as Foyer;
    // Fusion superficielle avec les valeurs par défaut pour absorber les évolutions du modèle.
    const d = foyerParDefaut();
    const adultes = f.adultes.map((a, i) => {
      const base = d.adultes[i];
      const tt = { ...teletravailVide(), ...a.frais?.teletravail };
      tt.depenses = { ...teletravailVide().depenses, ...tt.depenses };
      return { ...base, ...a, frais: { ...base.frais, ...a.frais, teletravail: tt } };
    }) as Foyer["adultes"];
    return {
      ...d,
      ...f,
      adultes,
      foncier: { ...d.foncier, ...f.foncier },
      capitaux: { ...d.capitaux, ...f.capitaux },
      deductions: { ...d.deductions, ...f.deductions },
      reductions: { ...d.reductions, ...f.reductions },
    };
  } catch {
    return null;
  }
}

/** État du foyer avec brouillon conservé dans le navigateur. */
export function useFoyer() {
  const [foyer, setFoyer] = useState<Foyer>(foyerParDefaut);
  const [charge, setCharge] = useState(false);

  useEffect(() => {
    const f = lire();
    if (f) setFoyer(f);
    setCharge(true);
  }, []);

  useEffect(() => {
    if (!charge) return;
    try {
      localStorage.setItem(CLE, JSON.stringify(foyer));
    } catch {
      /* stockage indisponible : on continue sans brouillon */
    }
  }, [foyer, charge]);

  const maj: Maj = useCallback((recette) => {
    setFoyer((f) => {
      const copie = structuredClone(f);
      recette(copie);
      return copie;
    });
  }, []);

  const reinitialiser = useCallback(() => {
    try {
      localStorage.removeItem(CLE);
    } catch {
      /* ignoré */
    }
    setFoyer(foyerParDefaut());
  }, []);

  return { foyer, maj, reinitialiser, charge };
}
