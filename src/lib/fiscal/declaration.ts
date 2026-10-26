import { formatEur, formatEurCents, formatNombre, formatPct } from "../format";
import { CASES, type CaseDecl } from "./cases";
import type { Resultat } from "./engine";
import { kmAnnuels } from "./fraisReels";
import type { Foyer, TypeMicro, Vehicule } from "./types";

export interface LigneDecl {
  /** Case de la déclaration où reporter la valeur, absente pour une ligne de calcul. */
  case?: CaseDecl;
  libelle: string;
  valeur: string;
  /** Explication du calcul ou consigne de report. */
  calcul?: string;
  /** Ligne de résultat intermédiaire, mise en avant. */
  fort?: boolean;
  /** Ligne de détail rattachée à la ligne précédente. */
  detail?: boolean;
}

export interface SectionDecl {
  titre: string;
  lignes: LigneDecl[];
}

const NB = (n: number) => formatNombre(n);
const libelleVehicule: Record<Vehicule["type"], string> = {
  voiture: "voiture",
  voiture_electrique: "voiture électrique (+20 %)",
  moto: "moto",
  moto_electrique: "moto électrique (+20 %)",
  cyclomoteur: "cyclomoteur",
};

const CASES_MICRO: Record<Exclude<TypeMicro, "aucun">, { cases: readonly [CaseDecl, CaseDecl]; libelle: string }> = {
  vente: { cases: CASES.microVente, libelle: "Micro-BIC, vente de marchandises" },
  services: { cases: CASES.microServices, libelle: "Micro-BIC, prestations de services" },
  bnc: { cases: CASES.microBnc, libelle: "Micro-BNC, recettes" },
  meubleLongueDuree: { cases: CASES.meubleLongueDuree, libelle: "Location meublée longue durée" },
  meubleTourismeClasse: { cases: CASES.meubleTourismeClasse, libelle: "Meublé de tourisme classé" },
  meubleTourismeNonClasse: { cases: CASES.meubleTourismeNonClasse, libelle: "Meublé de tourisme non classé" },
};

/** Détail complet du calcul, avec la case de la déclaration correspondant à chaque montant saisi. */
export function detailDeclaration(f: Foyer, r: Resultat): SectionDecl[] {
  const p = r.params;
  const sections: SectionDecl[] = [];
  const adultesSrc = r.couple ? f.adultes : [f.adultes[0]];

  /* ---------- Situation et parts ---------- */
  const situation: LigneDecl[] = [
    {
      case: r.couple ? CASES.situationCouple : CASES.situationSeul,
      libelle: r.couple ? "Marié(e) ou pacsé(e)" : "Célibataire, divorcé(e) ou veuf(ve)",
      valeur: "à cocher",
      calcul: `${NB(r.parts.base)} part${r.parts.base > 1 ? "s" : ""} de base`,
    },
  ];
  const mineurs = f.enfants.filter((e) => e.age < 18);
  const majeurs = f.enfants.filter((e) => e.age >= 18);
  const compter = (alterne: boolean, invalide?: boolean) =>
    mineurs.filter((e) => e.gardeAlternee === alterne && (invalide === undefined || e.handicap === invalide)).length;
  const ajouterEnfants = (cas: CaseDecl, libelle: string, n: number) => {
    if (n > 0) situation.push({ case: cas, libelle, valeur: NB(n) });
  };
  ajouterEnfants(CASES.enfantsMineurs, "Enfants mineurs à charge", compter(false));
  ajouterEnfants(CASES.enfantsMineursInvalides, "dont titulaires d'une carte d'invalidité", compter(false, true));
  ajouterEnfants(CASES.enfantsAlternes, "Enfants en résidence alternée", compter(true));
  ajouterEnfants(CASES.enfantsAlternesInvalides, "dont titulaires d'une carte d'invalidité", compter(true, true));
  ajouterEnfants(CASES.enfantsMajeurs, "Enfants majeurs rattachés", majeurs.length);
  if (r.parts.parentIsole > 0) situation.push({ case: CASES.parentIsole, libelle: "Parent vivant seul avec ses enfants", valeur: "à cocher" });
  if (r.parts.caseL > 0) situation.push({ case: CASES.caseL, libelle: "A élevé seul(e) un enfant pendant au moins 5 ans", valeur: "à cocher" });
  adultesSrc.forEach((a, i) => {
    if (a.invalide) situation.push({ case: CASES.invalidite[i], libelle: `${a.prenom} : carte d'invalidité`, valeur: "à cocher" });
  });
  const composantes = [
    `${NB(r.parts.base)} de base`,
    r.parts.enfants > 0 && `${NB(r.parts.enfants)} pour les enfants`,
    r.parts.parentIsole > 0 && `${NB(r.parts.parentIsole)} parent isolé`,
    r.parts.caseL > 0 && `${NB(r.parts.caseL)} case L`,
    r.parts.invalidite > 0 && `${NB(r.parts.invalidite)} invalidité`,
  ].filter(Boolean);
  situation.push({ libelle: "Nombre de parts", valeur: NB(r.parts.total), calcul: composantes.join(" + "), fort: true });
  sections.push({ titre: "Situation et parts", lignes: situation });

  /* ---------- Revenus par déclarant ---------- */
  r.adultes.forEach((ra, i) => {
    const a = adultesSrc[i];
    const lignes: LigneDecl[] = [];
    const reels = ra.modeRetenu === "reels";

    if (a.salaires > 0 || (reels && a.frais.remboursementsEmployeur > 0)) {
      const montant = a.salaires + (reels ? a.frais.remboursementsEmployeur : 0);
      lignes.push({
        case: CASES.salaires[i],
        libelle: "Salaires nets imposables",
        valeur: formatEur(montant),
        calcul:
          reels && a.frais.remboursementsEmployeur > 0
            ? `dont ${formatEur(a.frais.remboursementsEmployeur)} d'allocations employeur réintégrées (frais réels)`
            : undefined,
      });
    }
    if (a.chomage > 0) lignes.push({ case: CASES.chomage[i], libelle: "Allocations chômage", valeur: formatEur(a.chomage) });

    if (ra.salairesBruts > 0) {
      if (reels) {
        const fr = ra.fraisReels;
        lignes.push({ case: CASES.fraisReels[i], libelle: "Frais réels", valeur: formatEur(fr.total), calcul: "Remplace l'abattement de 10 %" });
        a.frais.vehicules.forEach((v, k) => {
          const d = fr.vehicules.find((x) => x.id === v.id);
          const km = kmAnnuels(v, p);
          const puissance = v.type.startsWith("voiture") ? `${v.puissanceVoiture} CV` : v.type.startsWith("moto") ? `${v.puissanceMoto} CV` : "";
          lignes.push({
            libelle: `Véhicule ${k + 1}, ${libelleVehicule[v.type]} ${puissance}`.trim(),
            valeur: formatEur(d?.montant ?? 0),
            calcul: `${NB(Math.min(v.distanceAller, v.depasse40Justifie ? Infinity : p.fraisReels.plafondDistanceKm))} km × 2 × ${v.allerRetoursParJour} × ${v.joursParAn} j${
              v.kmSupplementaires > 0 ? ` + ${NB(v.kmSupplementaires)} km` : ""
            } = ${NB(km)} km, barème kilométrique${v.peagesParking > 0 ? ` + ${formatEur(v.peagesParking)} de péages` : ""}`,
            detail: true,
          });
        });
        if (fr.transportsCommun > 0) lignes.push({ libelle: "Transports en commun", valeur: formatEur(fr.transportsCommun), detail: true });
        if (fr.repas > 0) {
          const rp = a.frais.repas;
          lignes.push({
            libelle: "Repas",
            valeur: formatEur(fr.repas),
            calcul: `(${formatEurCents(Math.min(rp.prixMoyen, p.fraisReels.repas.plafond))} − ${formatEurCents(p.fraisReels.repas.valeurForfaitaire)}${
              rp.participationEmployeur > 0 ? ` − ${formatEurCents(rp.participationEmployeur)}` : ""
            }) × ${rp.jours} repas`,
            detail: true,
          });
        }
        const tt = fr.teletravailDetail;
        if (tt.total > 0) {
          const t = a.frais.teletravail;
          lignes.push({
            libelle: "Télétravail",
            valeur: formatEur(tt.total),
            calcul:
              t.mode === "forfait"
                ? `${t.jours} j × ${formatEurCents(p.fraisReels.teletravail.parJour)}, plafonné à ${formatEurCents(p.fraisReels.teletravail.plafondAnnuel)}${
                    tt.totalEquipements > 0 ? ` + ${formatEur(tt.totalEquipements)} d'équipements` : ""
                  }`
                : `charges ${formatEur(tt.depensesFixes)} × ${formatPct(tt.quotePartFixes)} + énergies ${formatEur(tt.depensesEnergies)} × ${formatPct(
                    tt.quotePartEnergies,
                  )} + internet ${formatEur(tt.internet)} + équipements ${formatEur(tt.totalEquipements)}`,
            detail: true,
          });
        }
        const autres: [string, number][] = [
          ["Double résidence", fr.doubleResidence],
          ["Formation", fr.formation],
          ["Matériel", fr.materiel],
          ["Cotisations syndicales", fr.cotisationsSyndicales],
          ["Vêtements", fr.vetements],
          ["Documentation", fr.documentation],
          ["Autres frais", fr.autres],
        ];
        autres.filter(([, v]) => v > 0).forEach(([l, v]) => lignes.push({ libelle: l, valeur: formatEur(v), detail: true }));
      } else {
        lignes.push({
          libelle: "Abattement de 10 %",
          valeur: `− ${formatEur(ra.abattementForfaitaire)}`,
          calcul: `Automatique, rien à déclarer. 10 % de ${formatEur(ra.salairesBruts)}, entre ${formatEur(p.abattementSalaires.min)} et ${formatEur(
            p.abattementSalaires.max,
          )}`,
        });
      }
      lignes.push({ libelle: "Salaires nets après frais", valeur: formatEur(ra.salairesNets), fort: true });
    }

    if (ra.pensionsBrutes > 0) {
      lignes.push({ case: CASES.pensions[i], libelle: "Pensions et retraites", valeur: formatEur(ra.pensionsBrutes) });
      lignes.push({
        libelle: "Abattement de 10 % sur les pensions",
        valeur: `− ${formatEur(ra.abattementPensions)}`,
        calcul: `Automatique, plafonné à ${formatEur(p.abattementPensions.maxFoyer)} par foyer`,
      });
    }

    if (a.micro.type !== "aucun" && ra.microCA > 0) {
      const m = CASES_MICRO[a.micro.type];
      lignes.push({ case: m.cases[i], libelle: m.libelle, valeur: formatEur(ra.microCA), calcul: "Chiffre d'affaires brut, déclaration 2042-C-PRO" });
      lignes.push({
        libelle: "Abattement forfaitaire micro",
        valeur: `− ${formatEur(ra.microAbattement)}`,
        calcul: `${formatPct(p.micro[a.micro.type].taux)}, minimum ${formatEur(p.micro.abattementMin)}`,
      });
    }

    if (ra.perVersements > 0) {
      lignes.push({
        case: CASES.per[i],
        libelle: "Versements sur un PER",
        valeur: formatEur(ra.perVersements),
        calcul: `Déduits dans la limite de ${formatEur(ra.perPlafond)}, soit ${formatEur(ra.perDeduit)}`,
      });
    }

    if (lignes.length > 0) sections.push({ titre: `Revenus de ${ra.prenom || `déclarant ${i + 1}`}`, lignes });
  });

  /* ---------- Revenus du foyer ---------- */
  const foyerLignes: LigneDecl[] = [];
  if (f.foncier.recettes > 0) {
    if (r.revenus.foncierRegime === "micro") {
      foyerLignes.push({
        case: CASES.foncierMicro,
        libelle: "Loyers bruts (micro-foncier)",
        valeur: formatEur(f.foncier.recettes),
        calcul: `Abattement de ${formatPct(p.foncier.abattementMicro)} : revenu imposable ${formatEur(r.revenus.foncier)}`,
      });
    } else if (r.revenus.deficitFoncierImpute > 0) {
      foyerLignes.push({
        case: CASES.foncierDeficitGlobal,
        libelle: "Déficit foncier imputable sur le revenu global",
        valeur: formatEur(r.revenus.deficitFoncierImpute),
        calcul: `Annexe 2044 : ${formatEur(f.foncier.recettes)} de loyers − ${formatEur(f.foncier.charges)} de charges, dans la limite de ${formatEur(
          p.foncier.deficitImputableMax,
        )}`,
      });
    } else {
      foyerLignes.push({
        case: CASES.foncierBenefice,
        libelle: "Bénéfice foncier (régime réel)",
        valeur: formatEur(r.revenus.foncier),
        calcul: `Annexe 2044 : ${formatEur(f.foncier.recettes)} de loyers − ${formatEur(f.foncier.charges)} de charges`,
      });
    }
  }
  const auBareme = f.capitaux.option === "bareme";
  if (f.capitaux.dividendes > 0) {
    foyerLignes.push({
      case: CASES.dividendes,
      libelle: "Dividendes",
      valeur: formatEur(f.capitaux.dividendes),
      calcul: auBareme ? `Abattement de 40 % au barème : ${formatEur(f.capitaux.dividendes * 0.6)} imposables` : "Imposés à 12,8 % (flat tax)",
    });
  }
  if (f.capitaux.interets > 0) {
    foyerLignes.push({
      case: CASES.interets,
      libelle: "Intérêts et produits de placement",
      valeur: formatEur(f.capitaux.interets),
      calcul: auBareme ? "Imposés au barème" : "Imposés à 12,8 % (flat tax)",
    });
  }
  if (auBareme && f.capitaux.dividendes + f.capitaux.interets > 0) {
    foyerLignes.push({ case: CASES.optionBareme, libelle: "Option pour le barème progressif", valeur: "à cocher" });
  }
  if (foyerLignes.length > 0) sections.push({ titre: "Revenus du foyer", lignes: foyerLignes });

  /* ---------- Charges déductibles ---------- */
  const charges: LigneDecl[] = [];
  const pensionsMajeurs = f.deductions.pensionEnfantsMajeurs.filter((v) => v > 0);
  if (pensionsMajeurs.length > 0) {
    charges.push({ case: CASES.pensionEnfantsMajeursNombre, libelle: "Nombre d'enfants majeurs aidés", valeur: NB(pensionsMajeurs.length) });
    charges.push({
      case: CASES.pensionEnfantsMajeursMontant,
      libelle: "Pensions versées aux enfants majeurs",
      valeur: formatEur(pensionsMajeurs.reduce((s, v) => s + v, 0)),
      calcul: `Plafond de ${formatEur(p.pensionAlimentaireEnfantMajeur)} par enfant`,
    });
  }
  if (f.deductions.pensionExConjoint > 0) {
    charges.push({ case: CASES.pensionAutres, libelle: "Autres pensions alimentaires", valeur: formatEur(f.deductions.pensionExConjoint) });
  }
  if (charges.length > 0) sections.push({ titre: "Charges déductibles", lignes: charges });

  /* ---------- Calcul de l'impôt ---------- */
  const calcul: LigneDecl[] = [{ libelle: "Revenu brut global", valeur: formatEur(r.revenuBrutGlobal), fort: true }];
  if (r.charges.total > 0) calcul.push({ libelle: "Charges déductibles (PER, pensions)", valeur: `− ${formatEur(r.charges.total)}` });
  if (r.abattementAge > 0) calcul.push({ libelle: "Abattement personnes âgées ou invalides", valeur: `− ${formatEur(r.abattementAge)}` });
  calcul.push({ libelle: "Revenu net imposable", valeur: formatEur(r.revenuNetImposable), fort: true });

  const parts = r.qf.plafonne ? r.parts.base : r.parts.total;
  const q = parts > 0 ? r.revenuNetImposable / parts : 0;
  calcul.push({ libelle: "Quotient familial", valeur: formatEur(q), calcul: `${formatEur(r.revenuNetImposable)} ÷ ${NB(parts)} parts` });
  let bas = 0;
  for (const t of p.bareme) {
    if (q <= bas) break;
    const tranche = Math.min(q, t.jusqua) - bas;
    calcul.push({
      libelle: `Tranche à ${formatPct(t.taux)}`,
      valeur: formatEur(tranche * t.taux * parts),
      calcul: `${formatEur(tranche)} × ${formatPct(t.taux)} × ${NB(parts)} parts`,
      detail: true,
    });
    bas = t.jusqua;
  }
  if (r.qf.plafonne) {
    calcul.push({
      libelle: "Plafonnement du quotient familial",
      valeur: `− ${formatEur(r.qf.avantage)}`,
      calcul: `Avantage des demi-parts limité (impôt avec ${NB(r.parts.total)} parts : ${formatEur(r.qf.sansPlafonnement)})`,
    });
  }
  calcul.push({ libelle: "Impôt au barème", valeur: formatEur(r.qf.impotBrut), fort: true });
  if (r.decote > 0) {
    const seuil = r.couple ? p.decote.seuilCouple : p.decote.seuilCelibataire;
    calcul.push({
      libelle: "Décote",
      valeur: `− ${formatEur(r.decote)}`,
      calcul: `${formatEur(seuil)} − ${formatPct(p.decote.coef)} × ${formatEur(r.qf.impotBrut)}`,
    });
  }
  if (r.pfu > 0) {
    calcul.push({
      libelle: "Prélèvement forfaitaire sur placements",
      valeur: `+ ${formatEur(r.pfu)}`,
      calcul: `${formatEur(f.capitaux.dividendes + f.capitaux.interets)} × ${formatPct(p.capitaux.pfuIR)}`,
    });
  }
  sections.push({ titre: "Calcul de l'impôt", lignes: calcul });

  /* ---------- Réductions et crédits ---------- */
  const rc: LigneDecl[] = [];
  const rd = p.reductions;
  if (f.reductions.dons75 > 0) {
    const b = rd.dons.avantBascule;
    const libelle = "Dons aux organismes d'aide aux personnes en difficulté";
    if (b) {
      // Année de transition : deux cases selon la date du versement.
      const avant = Math.min(f.reductions.dons75AvantBascule, f.reductions.dons75);
      const apres = f.reductions.dons75 - avant;
      if (avant > 0) {
        rc.push({
          case: CASES.dons75,
          libelle: `${libelle}, versés avant le ${b.date}`,
          valeur: formatEur(avant),
          calcul: `75 % dans la limite de ${formatEur(b.plafond)}, 66 % au-delà`,
        });
      }
      if (apres > 0) {
        rc.push({
          case: CASES.dons75ApresBascule,
          libelle: `${libelle}, versés à partir du ${b.date}`,
          valeur: formatEur(apres),
          calcul: `75 % jusqu'à ${formatEur(rd.dons.plafond75)} au total avec les dons d'avant le ${b.date}, 66 % au-delà`,
        });
      }
    } else {
      rc.push({ case: CASES.dons75, libelle, valeur: formatEur(f.reductions.dons75), calcul: `75 % jusqu'à ${formatEur(rd.dons.plafond75)}, 66 % au-delà` });
    }
  }
  if (f.reductions.dons66 > 0) {
    rc.push({ case: CASES.dons66, libelle: "Autres dons", valeur: formatEur(f.reductions.dons66), calcul: "66 %, dans la limite de 20 % du revenu imposable" });
  }
  if (r.reductions.dons > 0) rc.push({ libelle: "Réduction pour dons", valeur: `− ${formatEur(r.reductions.dons)}`, detail: true });

  (["college", "lycee", "superieur"] as const).forEach((niveau) => {
    const libelle = { college: "collège", lycee: "lycée", superieur: "études supérieures" }[niveau];
    [false, true].forEach((alterne) => {
      const n = f.enfants.filter((e) => e.scolarite === niveau && e.gardeAlternee === alterne).length;
      if (n > 0) {
        rc.push({
          case: CASES.scolarite[niveau][alterne ? 1 : 0],
          libelle: `Enfants au ${libelle}${alterne ? " (résidence alternée)" : ""}`,
          valeur: NB(n),
          calcul: `${formatEur(alterne ? rd.scolarite[niveau] / 2 : rd.scolarite[niveau])} par enfant`,
        });
      }
    });
  });

  f.reductions.ehpad.forEach((d, k) => {
    if (d > 0 && k < 2) {
      rc.push({ case: CASES.ehpad[k], libelle: `Dépenses d'hébergement en EHPAD, personne ${k + 1}`, valeur: formatEur(d), calcul: `25 % dans la limite de ${formatEur(rd.ehpad.plafondParPersonne)}` });
    }
  });
  if (r.reductions.pinel > 0) rc.push({ case: CASES.pinel, libelle: "Réduction Pinel", valeur: formatEur(r.reductions.pinel), calcul: "Case selon l'année d'investissement, voir l'attestation" });
  if (r.reductions.denormandie > 0) {
    rc.push({ case: CASES.denormandie, libelle: "Réduction Denormandie", valeur: formatEur(r.reductions.denormandie), calcul: "Case selon l'année d'investissement" });
  }

  const cg = p.credits.gardeEnfant;
  let rangExclusif = 0;
  let rangAlterne = 0;
  f.enfants
    .filter((e) => e.age < cg.ageMax && e.fraisGarde > 0)
    .forEach((e) => {
      const cases = e.gardeAlternee ? CASES.gardeEnfantAlterne : CASES.gardeEnfant;
      const rang = e.gardeAlternee ? rangAlterne++ : rangExclusif++;
      rc.push({
        case: cases[Math.min(rang, cases.length - 1)],
        libelle: `Frais de garde de ${e.prenom || "l'enfant"}`,
        valeur: formatEur(e.fraisGarde),
        calcul: `Crédit de 50 % dans la limite de ${formatEur(e.gardeAlternee ? cg.plafondParEnfant / 2 : cg.plafondParEnfant)}`,
      });
    });
  if (f.reductions.emploiDomicile.depenses > 0) {
    rc.push({ case: CASES.emploiDomicile, libelle: "Emploi d'un salarié à domicile", valeur: formatEur(f.reductions.emploiDomicile.depenses), calcul: "Crédit de 50 %, dépenses nettes des aides" });
    if (f.reductions.emploiDomicile.premiereAnnee) rc.push({ case: CASES.emploiDomicilePremiereAnnee, libelle: "Première année d'emploi direct", valeur: "à cocher" });
  }
  adultesSrc.forEach((a, i) => {
    if (r.adultes[i].cotisationsSyndicalesCredit > 0) {
      rc.push({ case: CASES.cotisationsSyndicales[i], libelle: `Cotisations syndicales de ${a.prenom}`, valeur: formatEur(a.frais.cotisationsSyndicales), calcul: "Crédit de 66 %, dans la limite de 1 % des salaires" });
    }
  });
  if (r.reductions.imputees > 0) rc.push({ libelle: "Total des réductions imputées", valeur: `− ${formatEur(r.reductions.imputees)}`, fort: true });
  if (r.credits.total > 0) rc.push({ libelle: "Total des crédits d'impôt", valeur: `− ${formatEur(r.credits.total)}`, fort: true, calcul: "Remboursés même sans impôt à payer" });
  if (r.plafonnementNiches > 0) rc.push({ libelle: "Plafonnement global des niches", valeur: `− ${formatEur(r.plafonnementNiches)}`, calcul: `Avantages limités à ${formatEur(p.plafondNiches)}` });
  if (rc.length > 0) sections.push({ titre: "Réductions et crédits d'impôt", lignes: rc });

  /* ---------- Résultat ---------- */
  const fin: LigneDecl[] = [];
  if (r.sousSeuilRecouvrement) fin.push({ libelle: "Seuil de recouvrement", valeur: "0 €", calcul: `Impôt inférieur à ${formatEur(p.seuilRecouvrement)} : non recouvré` });
  if (r.cehr > 0) fin.push({ libelle: "Contribution exceptionnelle hauts revenus", valeur: `+ ${formatEur(r.cehr)}`, calcul: `Sur un revenu fiscal de référence de ${formatEur(r.revenuFiscalReference)}` });
  fin.push({ libelle: r.impotNet < 0 ? "Restitution" : "Impôt sur le revenu net", valeur: formatEur(Math.abs(r.impotNet)), fort: true });
  if (r.prelevementsSociaux > 0) {
    fin.push({ libelle: "Prélèvements sociaux", valeur: `+ ${formatEur(r.prelevementsSociaux)}`, calcul: `${formatPct(p.capitaux.psCapitaux)} sur placements, ${formatPct(p.capitaux.psFoncier)} sur loyers` });
    fin.push({ libelle: "Total à payer", valeur: formatEur(r.totalAPayer), fort: true });
  }
  sections.push({ titre: "Résultat", lignes: fin });

  return sections;
}
