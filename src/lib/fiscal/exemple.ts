import { foyerParDefaut, nouveauVehicule } from "./defaults";
import type { Foyer } from "./types";

/** Foyer de démonstration : affiché sur la landing et chargé par /simulateur?exemple. */
export function foyerExemple(): Foyer {
  const f = foyerParDefaut();
  f.adultes[0].prenom = "Camille";
  f.adultes[0].salaires = 42000;
  f.adultes[0].frais.vehicules = [{ ...nouveauVehicule(), distanceAller: 32, joursParAn: 170 }];
  f.adultes[0].frais.teletravail.jours = 45;
  f.adultes[0].frais.repas = { jours: 170, prixMoyen: 13, participationEmployeur: 0 };
  f.adultes[1].prenom = "Alex";
  f.adultes[1].salaires = 31000;
  f.enfants[0].prenom = "Lou";
  f.enfants[0].age = 3;
  f.enfants[0].fraisGarde = 4200;
  return f;
}
