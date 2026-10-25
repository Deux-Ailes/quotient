import { CASES } from "./cases";
import type { ResultatAdulte } from "./engine";
import { deductionBien, formuleKm, kmAnnuels } from "./fraisReels";
import type { ParamsFiscaux } from "./params";
import type { Adulte, Vehicule } from "./types";

/*
 * Texte justificatif des frais réels, à coller dans la zone de précisions de la déclaration en ligne.
 * Volontairement en texte brut : espaces ordinaires, "x" pour la multiplication, pas de puces ni de symboles
 * typographiques qui pourraient être refusés par le formulaire.
 */

const nombre = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 3 });
const brut = (s: string) => s.replace(/[  ]/g, " ");
const n = (v: number) => brut(nombre.format(v));
const eur = (v: number) => `${brut(new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(v)))} €`;
const eur2 = (v: number) => `${brut(new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v))} €`;
const pct = (v: number) => `${brut(new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(v * 100))} %`;

const TYPE: Record<Vehicule["type"], string> = {
  voiture: "voiture",
  voiture_electrique: "voiture électrique",
  moto: "moto",
  moto_electrique: "moto électrique",
  cyclomoteur: "cyclomoteur",
};

function ligneVehicule(v: Vehicule, montant: number, k: number, total: number, p: ParamsFiscaux): string {
  const puissance = v.type.startsWith("voiture") ? ` ${v.puissanceVoiture} CV` : v.type.startsWith("moto") ? ` ${v.puissanceMoto === "6" ? "plus de 5" : v.puissanceMoto} CV` : "";
  const plafond = p.fraisReels.plafondDistanceKm;
  const retenue = v.depasse40Justifie ? v.distanceAller : Math.min(v.distanceAller, plafond);
  const km = kmAnnuels(v, p);
  const f = formuleKm(v, p);
  const morceaux: string[] = [];

  morceaux.push(`Trajets domicile-travail${total > 1 ? `, véhicule ${k + 1}` : ""} : ${TYPE[v.type]}${puissance}.`);
  if (v.distanceAller > plafond && !v.depasse40Justifie) {
    morceaux.push(`Distance domicile-travail ${n(v.distanceAller)} km, retenue pour ${n(plafond)} km (plafond de ${n(plafond)} km).`);
  } else if (v.distanceAller > plafond) {
    morceaux.push(`Distance domicile-travail ${n(v.distanceAller)} km retenue en totalité en raison de circonstances particulières (à préciser).`);
  } else {
    morceaux.push(`Distance domicile-travail ${n(v.distanceAller)} km (aller).`);
  }
  const trajet = `${n(retenue)} x 2 x ${v.allerRetoursParJour} x ${v.joursParAn} jours`;
  morceaux.push(
    `${v.allerRetoursParJour === 2 ? "2 allers-retours par jour (retour au domicile le midi justifié)" : "1 aller-retour par jour"}, ${v.joursParAn} jours travaillés sur site : ${trajet}${
      v.kmSupplementaires > 0 ? ` + ${n(v.kmSupplementaires)} km de déplacements professionnels non remboursés` : ""
    } = ${n(km)} km.`,
  );
  const formule = `${n(km)} x ${n(f.coef)}${f.fixe > 0 ? ` + ${n(f.fixe)}` : ""}`;
  const peages = Math.max(0, v.peagesParking);
  morceaux.push(
    `Barème kilométrique fiscal : ${f.majoration > 0 ? `(${formule}) x ${n(1 + f.majoration)} (majoration de ${pct(f.majoration)} véhicule électrique)` : formule} = ${eur(montant - peages)}.`,
  );
  if (peages > 0) morceaux.push(`Péages et frais de stationnement : ${eur(peages)}. Sous-total : ${eur(montant)}.`);
  return morceaux.join(" ");
}

export function resumeFraisReels(a: Adulte, ra: ResultatAdulte, p: ParamsFiscaux, indexDeclarant: number): string {
  const fr = ra.fraisReels;
  const lignes: string[] = [];
  const nom = a.prenom || `Déclarant ${indexDeclarant + 1}`;
  const caseFR = CASES.fraisReels[indexDeclarant].code;

  lignes.push(`Détail des frais réels, revenus ${p.annee}, ${nom}`);
  lignes.push(`Montant total déclaré case ${caseFR} : ${eur(fr.total)}`);
  lignes.push("");

  const postes: string[] = [];

  a.frais.vehicules.forEach((v, k) => {
    const d = fr.vehicules.find((x) => x.id === v.id);
    if (d && d.montant > 0) postes.push(ligneVehicule(v, d.montant, k, a.frais.vehicules.length, p));
  });

  if (fr.transportsCommun > 0) postes.push(`Transports en commun, part non prise en charge par l'employeur : ${eur(fr.transportsCommun)}.`);

  if (fr.repas > 0) {
    const r = a.frais.repas;
    const prix = Math.min(r.prixMoyen, p.fraisReels.repas.plafond);
    postes.push(
      `Repas pris sur le lieu de travail : ${r.jours} repas x (${eur2(prix)}${r.prixMoyen > prix ? ` (coût réel ${eur2(r.prixMoyen)}, limité au plafond)` : ""} - ${eur2(
        p.fraisReels.repas.valeurForfaitaire,
      )} de valeur forfaitaire du repas pris au domicile${r.participationEmployeur > 0 ? ` - ${eur2(r.participationEmployeur)} de participation de l'employeur` : ""}) = ${eur(fr.repas)}.`,
    );
  }

  const tt = fr.teletravailDetail;
  const t = a.frais.teletravail;
  if (tt.total > 0) {
    if (t.mode === "forfait" && tt.forfait > 0) {
      postes.push(
        `Télétravail, évaluation forfaitaire : ${t.jours} jours x ${eur2(p.fraisReels.teletravail.parJour)}${
          t.jours * p.fraisReels.teletravail.parJour > p.fraisReels.teletravail.plafondAnnuel ? `, limité au plafond annuel de ${eur2(p.fraisReels.teletravail.plafondAnnuel)}` : ""
        } = ${eur(tt.forfait)}.`,
      );
    } else if (t.mode === "reel") {
      const morceaux = [
        `Télétravail, frais réels (${t.statut === "locataire" ? "locataire" : "propriétaire"}, ${t.jours} jours de télétravail).`,
        `Bureau de ${n(t.surfaceBureau)} m² sur un logement de ${n(t.surfaceLogement)} m², soit ${pct(tt.ratioSurface)}${t.studio ? " (studio, limité à la moitié de la surface)" : ""}${
          t.pieceDediee ? ", pièce exclusivement affectée au travail." : ", pièce à usage mixte."
        }`,
      ];
      if (tt.localFixes > 0) {
        morceaux.push(
          `${t.statut === "locataire" ? "Loyer, charges" : "Taxe foncière, charges de copropriété"}, assurance et entretien : ${eur(tt.depensesFixes)} x ${pct(tt.quotePartFixes)} = ${eur(tt.localFixes)}.`,
        );
      }
      if (tt.localEnergies > 0) {
        morceaux.push(`Électricité, chauffage et eau : ${eur(tt.depensesEnergies)} x ${pct(tt.ratioSurface)} x ${t.jours}/365 jours = ${eur(tt.localEnergies)}.`);
      }
      const bureau = tt.local - tt.localFixes - tt.localEnergies;
      if (bureau > 0) morceaux.push(`Dépenses propres au bureau : ${eur(bureau)}.`);
      if (tt.internet > 0) morceaux.push(`Internet et téléphone : ${eur(t.internet.montant)} x ${pct(t.internet.usagePro / 100)} d'usage professionnel = ${eur(tt.internet)}.`);
      postes.push(morceaux.join(" "));
    }
    t.equipements.forEach((e, k) => {
      const d = tt.equipements[k];
      if (!d || d.montant <= 0) return;
      const ht = e.prix / (1 + p.fraisReels.tauxTVA);
      const duree = e.categorie === "informatique" ? p.fraisReels.dureeAmortissementMateriel : p.fraisReels.dureeAmortissementMobilier;
      postes.push(
        `${e.libelle || (e.categorie === "informatique" ? "Matériel informatique" : "Mobilier")} de télétravail : ${eur(e.prix)} TTC (${eur(ht)} HT)${
          d.amorti ? `, amorti sur ${duree} ans (valeur supérieure à ${eur(p.fraisReels.seuilAmortissementMateriel)} HT)` : `, déduit l'année d'achat (valeur inférieure à ${eur(p.fraisReels.seuilAmortissementMateriel)} HT)`
        }${e.usagePro < 100 ? `, usage professionnel ${pct(e.usagePro / 100)}` : ""} = ${eur(d.montant)}.`,
      );
    });
  }

  if (fr.materiel > 0) {
    const m = a.frais.materiel;
    const amorti = m.prix / (1 + p.fraisReels.tauxTVA) > p.fraisReels.seuilAmortissementMateriel;
    postes.push(
      `Matériel professionnel : ${eur(m.prix)} TTC${amorti ? `, amorti sur ${p.fraisReels.dureeAmortissementMateriel} ans` : ", déduit l'année d'achat"}${
        m.usagePro < 100 ? `, usage professionnel ${pct(m.usagePro / 100)}` : ""
      } = ${eur(deductionBien(m.prix, m.usagePro, p.fraisReels.dureeAmortissementMateriel, p))}.`,
    );
  }
  if (fr.doubleResidence > 0) postes.push(`Double résidence pour raisons professionnelles (loyer, charges, déménagement) : ${eur(fr.doubleResidence)}.`);
  if (fr.formation > 0) postes.push(`Frais de formation professionnelle : ${eur(fr.formation)}.`);
  if (fr.documentation > 0) postes.push(`Documentation professionnelle : ${eur(fr.documentation)}.`);
  if (fr.vetements > 0) postes.push(`Vêtements de travail spécifiques et leur entretien : ${eur(fr.vetements)}.`);
  if (fr.cotisationsSyndicales > 0) {
    postes.push(`Cotisations syndicales : ${eur(a.frais.cotisationsSyndicales)}, retenues dans la limite de 1 % des salaires, soit ${eur(fr.cotisationsSyndicales)}.`);
  }
  if (fr.autres > 0) postes.push(`Autres frais professionnels : ${eur(fr.autres)}.`);

  postes.forEach((txt, k) => lignes.push(`${k + 1}. ${txt}`));

  lignes.push("");
  lignes.push(`Total des frais réels : ${eur(fr.total)}.`);
  if (a.frais.remboursementsEmployeur > 0) {
    lignes.push(`Les allocations et remboursements versés par l'employeur (${eur(a.frais.remboursementsEmployeur)}) sont inclus dans les salaires déclarés case ${CASES.salaires[indexDeclarant].code}.`);
  }
  lignes.push("Justificatifs conservés et tenus à la disposition de l'administration.");

  return lignes.join("\n");
}
