import { PARAMS, type ParamsFiscaux, type Tranche } from "./params";
import { calculerFraisReels, type DetailFraisReels } from "./fraisReels";
import type { Adulte, Enfant, Foyer } from "./types";

const pos = (n: number) => Math.max(0, Number.isFinite(n) ? n : 0);
const arrondi = (n: number) => Math.round(n);

/* ------------------------------------------------------------------ */
/* Barème et quotient familial                                         */
/* ------------------------------------------------------------------ */

/** Impôt pour un revenu imposable et un nombre de parts (sans plafonnement). */
export function impotBareme(revenu: number, parts: number, bareme: Tranche[]): number {
  if (revenu <= 0 || parts <= 0) return 0;
  const q = revenu / parts;
  let impot = 0;
  let bas = 0;
  for (const t of bareme) {
    if (q > bas) impot += (Math.min(q, t.jusqua) - bas) * t.taux;
    bas = t.jusqua;
  }
  return impot * parts;
}

export function tauxMarginal(revenu: number, parts: number, bareme: Tranche[]): number {
  const q = parts > 0 ? revenu / parts : 0;
  return (bareme.find((t) => q <= t.jusqua) ?? bareme[bareme.length - 1]).taux;
}

export interface DetailParts {
  base: number;
  enfants: number;
  parentIsole: number;
  caseL: number;
  invalidite: number;
  total: number;
  /** Avantage maximal autorisé par le plafonnement du quotient familial. */
  plafond: number;
}

/** Parts liées aux enfants : rang calculé enfants à charge exclusive d'abord, puis garde alternée. */
export function partsEnfants(enfants: Enfant[]): number {
  const ordonnes = [...enfants].sort((a, b) => Number(a.gardeAlternee) - Number(b.gardeAlternee));
  return ordonnes.reduce((s, e, rang) => {
    const base = rang < 2 ? 0.5 : 1;
    const handicap = e.handicap ? 0.5 : 0;
    return s + (base + handicap) * (e.gardeAlternee ? 0.5 : 1);
  }, 0);
}

export function calculerParts(foyer: Foyer, p: ParamsFiscaux): DetailParts {
  const qf = p.quotientFamilial;
  const couple = foyer.situation === "couple";
  const base = couple ? 2 : 1;
  const enfants = partsEnfants(foyer.enfants);
  const aEnfants = foyer.enfants.length > 0;
  const tousAlternes = aEnfants && foyer.enfants.every((e) => e.gardeAlternee);

  const parentIsole = !couple && foyer.parentIsole && aEnfants ? (tousAlternes ? 0.25 : 0.5) : 0;
  const caseL = !couple && !aEnfants && foyer.caseL ? 0.5 : 0;
  const adultes = couple ? foyer.adultes : [foyer.adultes[0]];
  const invalidite = adultes.filter((a) => a.invalide).length * 0.5;

  const plafond =
    (enfants / 0.5) * qf.demiPart +
    (parentIsole / 0.5) * (qf.parentIsole - qf.demiPart) +
    (caseL / 0.5) * qf.caseL +
    (invalidite / 0.5) * qf.invalide;

  return {
    base,
    enfants,
    parentIsole,
    caseL,
    invalidite,
    total: base + enfants + parentIsole + caseL + invalidite,
    plafond,
  };
}

export interface ImpotQF {
  sansPlafonnement: number;
  partsBase: number;
  impotPartsBase: number;
  avantage: number;
  plafonne: boolean;
  impotBrut: number;
}

export function impotAvecQuotient(revenu: number, parts: DetailParts, bareme: Tranche[]): ImpotQF {
  const sansPlafonnement = impotBareme(revenu, parts.total, bareme);
  const impotPartsBase = impotBareme(revenu, parts.base, bareme);
  const avantage = impotPartsBase - sansPlafonnement;
  const plafonne = avantage > parts.plafond;
  return {
    sansPlafonnement,
    partsBase: parts.base,
    impotPartsBase,
    avantage: plafonne ? parts.plafond : avantage,
    plafonne,
    impotBrut: plafonne ? impotPartsBase - parts.plafond : sansPlafonnement,
  };
}

export function calculerDecote(impot: number, couple: boolean, p: ParamsFiscaux): number {
  const seuil = couple ? p.decote.seuilCouple : p.decote.seuilCelibataire;
  const decote = seuil - p.decote.coef * impot;
  return Math.min(impot, Math.max(0, decote));
}

/* ------------------------------------------------------------------ */
/* Revenus catégoriels                                                 */
/* ------------------------------------------------------------------ */

export interface ResultatAdulte {
  prenom: string;
  salairesBruts: number;
  /** Salaires + remboursements employeur réintégrés en cas de frais réels. */
  salairesBrutsReels: number;
  abattementForfaitaire: number;
  fraisReels: DetailFraisReels;
  modeRetenu: "forfait" | "reels";
  gainFraisReels: number;
  deductionRetenue: number;
  salairesNets: number;
  pensionsBrutes: number;
  abattementPensions: number;
  pensionsNettes: number;
  microCA: number;
  microAbattement: number;
  microNet: number;
  microDepasseSeuil: boolean;
  perVersements: number;
  perPlafond: number;
  perDeduit: number;
  cotisationsSyndicalesCredit: number;
}

function microParams(type: Adulte["micro"]["type"], p: ParamsFiscaux) {
  return type === "aucun" ? null : p.micro[type];
}

function calculerAdulte(a: Adulte, p: ParamsFiscaux): Omit<ResultatAdulte, "abattementPensions" | "pensionsNettes" | "perPlafond" | "perDeduit"> & { abattementPensionsBrut: number } {
  const salairesBruts = pos(a.salaires) + pos(a.chomage);
  const { taux, min, max } = p.abattementSalaires;
  const abattementForfaitaire = salairesBruts > 0 ? Math.min(salairesBruts, Math.min(max, Math.max(min, salairesBruts * taux))) : 0;

  const salairesBrutsReels = salairesBruts + pos(a.frais.remboursementsEmployeur);
  const fraisReels = calculerFraisReels(a.frais, pos(a.salaires), p);
  const netForfait = salairesBruts - abattementForfaitaire;
  const netReels = Math.max(0, salairesBrutsReels - fraisReels.total);

  let modeRetenu: "forfait" | "reels";
  if (a.modeFrais === "auto") modeRetenu = netReels < netForfait ? "reels" : "forfait";
  else modeRetenu = a.modeFrais;

  const salairesNets = arrondi(modeRetenu === "reels" ? netReels : netForfait);
  const deductionRetenue = modeRetenu === "reels" ? fraisReels.total : abattementForfaitaire;

  const pensionsBrutes = pos(a.pensions);
  const ap = p.abattementPensions;
  const abattementPensionsBrut = pensionsBrutes > 0 ? Math.min(pensionsBrutes, Math.max(ap.min, pensionsBrutes * ap.taux)) : 0;

  const mp = microParams(a.micro.type, p);
  const microCA = mp ? pos(a.micro.chiffreAffaires) : 0;
  const microAbattement = mp ? Math.min(microCA, Math.max(p.micro.abattementMin, microCA * mp.taux)) : 0;

  // Crédit de 66 % sur les cotisations syndicales si elles ne sont pas déduites en frais réels.
  const cotis = Math.min(pos(a.frais.cotisationsSyndicales), pos(a.salaires) * p.fraisReels.cotisationsSyndicalesPlafond);
  const cotisationsSyndicalesCredit = modeRetenu === "reels" ? 0 : cotis * p.credits.cotisationsSyndicales.taux;

  return {
    prenom: a.prenom,
    salairesBruts,
    salairesBrutsReels,
    abattementForfaitaire: arrondi(abattementForfaitaire),
    fraisReels,
    modeRetenu,
    gainFraisReels: arrondi(netForfait - netReels),
    deductionRetenue: arrondi(deductionRetenue),
    salairesNets,
    pensionsBrutes,
    abattementPensionsBrut,
    microCA,
    microAbattement: arrondi(microAbattement),
    microNet: arrondi(microCA - microAbattement),
    microDepasseSeuil: !!mp && microCA > mp.seuil,
    perVersements: pos(a.per.versements),
    cotisationsSyndicalesCredit,
  };
}

/* ------------------------------------------------------------------ */
/* Résultat global                                                     */
/* ------------------------------------------------------------------ */

export interface Resultat {
  params: ParamsFiscaux;
  couple: boolean;
  parts: DetailParts;
  adultes: ResultatAdulte[];

  revenus: {
    salaires: number;
    pensions: number;
    micro: number;
    foncier: number;
    foncierRegime: "micro" | "reel";
    deficitFoncierImpute: number;
    capitauxBareme: number;
  };
  revenuBrutGlobal: number;
  charges: { per: number; pensionsAlimentaires: number; total: number };
  revenuNetGlobal: number;
  abattementAge: number;
  revenuNetImposable: number;

  qf: ImpotQF;
  decote: number;
  impotApresDecote: number;
  pfu: number;

  reductions: {
    dons: number;
    scolarite: number;
    ehpad: number;
    pinel: number;
    denormandie: number;
    total: number;
    imputees: number;
  };
  credits: {
    gardeEnfant: number;
    emploiDomicile: number;
    cotisationsSyndicales: number;
    total: number;
  };
  plafonnementNiches: number;
  sousSeuilRecouvrement: boolean;

  impotRevenu: number;
  cehr: number;
  prelevementsSociaux: number;
  /** Impôt sur le revenu net (après crédits) + CEHR. Peut être négatif (restitution). */
  impotNet: number;
  totalAPayer: number;

  revenuFiscalReference: number;
  tmi: number;
  tauxMoyen: number;
  pas: {
    tauxFoyer: number;
    baseMensuelle: number;
    mensualite: number;
    acompteMensuel: number;
    individualise: { prenom: string; taux: number }[] | null;
  };
  alertes: string[];
}

function arrondiTauxPAS(t: number) {
  return Math.max(0, Math.floor(t * 1000) / 1000);
}

export function simuler(foyer: Foyer): Resultat {
  const p = PARAMS[foyer.annee];
  const couple = foyer.situation === "couple";
  const alertes: string[] = [];
  const adultesSrc = couple ? foyer.adultes : [foyer.adultes[0]];

  /* --- Revenus par adulte --- */
  const calc = adultesSrc.map((a) => calculerAdulte(a, p));

  // Abattement 10 % pensions : plafond global par foyer, réparti au prorata.
  const totalAbattPensions = calc.reduce((s, c) => s + c.abattementPensionsBrut, 0);
  const ratioPensions = totalAbattPensions > p.abattementPensions.maxFoyer ? p.abattementPensions.maxFoyer / totalAbattPensions : 1;

  const adultes: ResultatAdulte[] = calc.map((c) => {
    const abattementPensions = arrondi(c.abattementPensionsBrut * ratioPensions);
    const { abattementPensionsBrut: _ignore, ...reste } = c;
    void _ignore;
    return {
      ...reste,
      abattementPensions,
      pensionsNettes: arrondi(c.pensionsBrutes - abattementPensions),
      perPlafond: 0,
      perDeduit: 0,
    };
  });

  adultes.forEach((r, i) => {
    if (r.microDepasseSeuil) alertes.push(`${r.prenom || `Déclarant ${i + 1}`} : chiffre d'affaires au-dessus du seuil du régime micro.`);
  });

  /* --- PER : plafond individuel --- */
  adultes.forEach((r, i) => {
    const src = adultesSrc[i];
    const revenusPro = r.salairesNets + r.microNet;
    const plafondCalcule = Math.max(0.1 * Math.min(revenusPro, 8 * p.per.pass), 0.1 * p.per.pass);
    r.perPlafond = arrondi(src.per.plafondDisponible ?? plafondCalcule);
    r.perDeduit = arrondi(Math.min(r.perVersements, r.perPlafond));
  });

  /* --- Foncier --- */
  const recettes = pos(foyer.foncier.recettes);
  let foncierRegime = foyer.foncier.regime;
  if (foncierRegime === "micro" && recettes > p.foncier.seuilMicro) {
    foncierRegime = "reel";
    alertes.push("Revenus fonciers au-dessus de 15 000 € : le régime réel s'applique.");
  }
  let foncier = 0;
  let deficitFoncierImpute = 0;
  if (foncierRegime === "micro") {
    foncier = arrondi(recettes * (1 - p.foncier.abattementMicro));
  } else {
    const resultat = recettes - pos(foyer.foncier.charges);
    if (resultat >= 0) foncier = arrondi(resultat);
    else deficitFoncierImpute = arrondi(Math.min(-resultat, p.foncier.deficitImputableMax));
  }

  /* --- Capitaux mobiliers --- */
  const dividendes = pos(foyer.capitaux.dividendes);
  const interets = pos(foyer.capitaux.interets);
  const auBareme = foyer.capitaux.option === "bareme";
  const capitauxBareme = auBareme ? arrondi(dividendes * (1 - p.capitaux.abattementDividendes) + interets) : 0;
  const pfu = auBareme ? 0 : arrondi((dividendes + interets) * p.capitaux.pfuIR);

  const revenus = {
    salaires: adultes.reduce((s, r) => s + r.salairesNets, 0),
    pensions: adultes.reduce((s, r) => s + r.pensionsNettes, 0),
    micro: adultes.reduce((s, r) => s + r.microNet, 0),
    foncier,
    foncierRegime,
    deficitFoncierImpute,
    capitauxBareme,
  };

  const revenuBrutGlobal = Math.max(
    0,
    revenus.salaires + revenus.pensions + revenus.micro + revenus.foncier + revenus.capitauxBareme - deficitFoncierImpute,
  );

  /* --- Charges déductibles --- */
  const per = adultes.reduce((s, r) => s + r.perDeduit, 0);
  const pensionsAlimentaires = arrondi(
    foyer.deductions.pensionEnfantsMajeurs.reduce((s, v) => s + Math.min(pos(v), p.pensionAlimentaireEnfantMajeur), 0) +
      pos(foyer.deductions.pensionExConjoint),
  );
  const chargesTotal = per + pensionsAlimentaires;
  const revenuNetGlobal = Math.max(0, revenuBrutGlobal - chargesTotal);

  /* --- Abattement personnes âgées ou invalides --- */
  const beneficiaires = adultesSrc.filter((a) => a.plus65ans || a.invalide).length;
  const aa = p.abattementAge;
  const abattementUnitaire = revenuNetGlobal <= aa.seuil1 ? aa.montant1 : revenuNetGlobal <= aa.seuil2 ? aa.montant2 : 0;
  const abattementAge = Math.min(revenuNetGlobal, abattementUnitaire * beneficiaires);

  const revenuNetImposable = Math.floor(revenuNetGlobal - abattementAge);

  /* --- Impôt au barème --- */
  const parts = calculerParts(foyer, p);
  const qf = impotAvecQuotient(revenuNetImposable, parts, p.bareme);
  const impotBrut = arrondi(qf.impotBrut);
  const decote = arrondi(calculerDecote(impotBrut, couple, p));
  const impotApresDecote = impotBrut - decote;

  /* --- Réductions d'impôt (non remboursables) --- */
  const rd = p.reductions;
  const dons75 = Math.min(pos(foyer.reductions.dons75), rd.dons.plafond75);
  const dons66Base = Math.min(
    pos(foyer.reductions.dons66) + pos(foyer.reductions.dons75) - dons75,
    revenuNetImposable * rd.dons.plafondRevenu,
  );
  const dons = arrondi(dons75 * rd.dons.taux75 + dons66Base * rd.dons.taux66);

  const scolarite = foyer.enfants.reduce((s, e) => {
    const montant = e.scolarite === "aucun" ? 0 : rd.scolarite[e.scolarite];
    return s + (e.gardeAlternee ? montant / 2 : montant);
  }, 0);

  const ehpad = arrondi(
    foyer.reductions.ehpad.reduce((s, d) => s + Math.min(pos(d), rd.ehpad.plafondParPersonne) * rd.ehpad.taux, 0),
  );
  const pinel = arrondi(pos(foyer.reductions.pinelReductionAnnuelle));
  const dn = foyer.reductions.denormandie;
  const denormandie = dn.duree ? arrondi((Math.min(pos(dn.prix), rd.denormandie.prixMax) * rd.denormandie.taux[dn.duree]) / dn.duree) : 0;

  /* --- Crédits d'impôt (remboursables) --- */
  const cg = p.credits.gardeEnfant;
  const gardeEnfant = arrondi(
    foyer.enfants
      .filter((e) => e.age < cg.ageMax)
      .reduce((s, e) => {
        const plafond = e.gardeAlternee ? cg.plafondParEnfant / 2 : cg.plafondParEnfant;
        return s + Math.min(pos(e.fraisGarde), plafond) * cg.taux;
      }, 0),
  );

  const ed = p.credits.emploiDomicile;
  const majorations =
    foyer.enfants.reduce((s, e) => s + (e.gardeAlternee ? 0.5 : 1), 0) + adultesSrc.filter((a) => a.plus65ans).length;
  const plafondED = foyer.reductions.emploiDomicile.premiereAnnee
    ? Math.min(ed.plafondPremiereAnnee + majorations * ed.majoration, ed.plafondMaxPremiereAnnee)
    : Math.min(ed.plafond + majorations * ed.majoration, ed.plafondMax);
  const emploiDomicile = arrondi(Math.min(pos(foyer.reductions.emploiDomicile.depenses), plafondED) * ed.taux);

  const cotisationsSyndicales = arrondi(adultes.reduce((s, r) => s + r.cotisationsSyndicalesCredit, 0));

  /* --- Plafonnement global des niches (10 000 €) --- */
  const nichesPlafonnees = gardeEnfant + emploiDomicile + pinel + denormandie;
  const plafonnementNiches = Math.max(0, nichesPlafonnees - p.plafondNiches);
  const ratioNiches = plafonnementNiches > 0 ? p.plafondNiches / nichesPlafonnees : 1;
  if (plafonnementNiches > 0) alertes.push("Plafonnement global des niches fiscales (10 000 €) appliqué.");

  const reductionsTotal = dons + scolarite + ehpad + arrondi((pinel + denormandie) * ratioNiches);
  const creditsTotal = arrondi((gardeEnfant + emploiDomicile) * ratioNiches) + cotisationsSyndicales;

  const impotAvantReductions = impotApresDecote + pfu;
  const reductionsImputees = Math.min(reductionsTotal, impotAvantReductions);
  let impotApresReductions = impotAvantReductions - reductionsImputees;

  const sousSeuilRecouvrement = impotApresReductions > 0 && impotApresReductions < p.seuilRecouvrement;
  if (sousSeuilRecouvrement) impotApresReductions = 0;

  const impotRevenu = impotApresReductions - creditsTotal;

  /* --- Revenu fiscal de référence et CEHR --- */
  const revenuFiscalReference = arrondi(
    revenuNetImposable + (auBareme ? dividendes * p.capitaux.abattementDividendes : dividendes + interets),
  );
  const tranchesCehr = couple ? p.cehr.couple : p.cehr.celibataire;
  const cehr = arrondi(
    tranchesCehr.reduce((s, t, i) => {
      const haut = tranchesCehr[i + 1]?.seuil ?? Infinity;
      return s + Math.max(0, Math.min(revenuFiscalReference, haut) - t.seuil) * t.taux;
    }, 0),
  );

  /* --- Prélèvements sociaux sur revenus du patrimoine --- */
  const meuble = adultes.reduce((s, r, i) => {
    const t = adultesSrc[i].micro.type;
    return t.startsWith("meuble") ? s + r.microNet : s;
  }, 0);
  const prelevementsSociaux = arrondi(
    (dividendes + interets) * p.capitaux.psCapitaux + foncier * p.capitaux.psFoncier + meuble * p.capitaux.psCapitaux,
  );

  const impotNet = impotRevenu + cehr;
  const totalAPayer = impotNet + prelevementsSociaux;

  /* --- Indicateurs --- */
  const tmi = tauxMarginal(revenuNetImposable, parts.total, p.bareme);
  const revenusTotaux =
    adultes.reduce((s, r) => s + r.salairesBruts + r.pensionsBrutes + r.microCA, 0) + recettes + dividendes + interets;
  const tauxMoyen = revenusTotaux > 0 ? Math.max(0, impotNet) / revenusTotaux : 0;

  /* --- Prélèvement à la source --- */
  const nonMeubleMicro = revenus.micro;
  const netPAS = revenus.salaires + revenus.pensions + revenus.foncier + nonMeubleMicro;
  const ratioPAS = revenuBrutGlobal > 0 ? Math.min(1, netPAS / revenuBrutGlobal) : 0;
  const impotPAS = impotApresDecote * ratioPAS;
  const baseRevenusRemplacement = adultes.reduce((s, r) => s + r.salairesBruts + r.pensionsBrutes, 0);
  const baseAcompte = revenus.foncier + revenus.micro;
  const basePAS = baseRevenusRemplacement + baseAcompte;
  const tauxFoyer = basePAS > 0 ? arrondiTauxPAS(impotPAS / basePAS) : 0;

  let individualise: Resultat["pas"]["individualise"] = null;
  if (couple && basePAS > 0 && tauxFoyer > 0) {
    const bases = adultes.map((r) => r.salairesBruts + r.pensionsBrutes + r.microNet);
    if (bases[0] > 0 && bases[1] > 0) {
      const iBas = bases[0] <= bases[1] ? 0 : 1;
      const iHaut = 1 - iBas;
      const rb = adultes[iBas];
      const netBas = rb.salairesNets + rb.pensionsNettes + rb.microNet;
      const partsBas: DetailParts = {
        ...parts,
        base: 1,
        enfants: parts.enfants / 2,
        parentIsole: 0,
        caseL: 0,
        invalidite: adultesSrc[iBas].invalide ? 0.5 : 0,
        total: 1 + parts.enfants / 2 + (adultesSrc[iBas].invalide ? 0.5 : 0),
        plafond: (parts.enfants / 2 / 0.5) * p.quotientFamilial.demiPart + (adultesSrc[iBas].invalide ? p.quotientFamilial.invalide : 0),
      };
      const impBasBrut = impotAvecQuotient(netBas, partsBas, p.bareme).impotBrut;
      const impBas = impBasBrut - calculerDecote(impBasBrut, false, p);
      const tauxBas = arrondiTauxPAS(impBas / bases[iBas]);
      const tauxHaut = arrondiTauxPAS((impotPAS - tauxBas * bases[iBas]) / bases[iHaut]);
      if (tauxBas < tauxFoyer) {
        individualise = [];
        individualise[iBas] = { prenom: adultes[iBas].prenom, taux: tauxBas };
        individualise[iHaut] = { prenom: adultes[iHaut].prenom, taux: tauxHaut };
      }
    }
  }

  return {
    params: p,
    couple,
    parts,
    adultes,
    revenus,
    revenuBrutGlobal,
    charges: { per, pensionsAlimentaires, total: chargesTotal },
    revenuNetGlobal,
    abattementAge,
    revenuNetImposable,
    qf,
    decote,
    impotApresDecote,
    pfu,
    reductions: {
      dons,
      scolarite,
      ehpad,
      pinel,
      denormandie,
      total: reductionsTotal,
      imputees: reductionsImputees,
    },
    credits: {
      gardeEnfant,
      emploiDomicile,
      cotisationsSyndicales,
      total: creditsTotal,
    },
    plafonnementNiches,
    sousSeuilRecouvrement,
    impotRevenu,
    cehr,
    prelevementsSociaux,
    impotNet,
    totalAPayer,
    revenuFiscalReference,
    tmi,
    tauxMoyen,
    pas: {
      tauxFoyer,
      baseMensuelle: baseRevenusRemplacement / 12,
      mensualite: arrondi((tauxFoyer * baseRevenusRemplacement) / 12),
      acompteMensuel: arrondi((tauxFoyer * baseAcompte) / 12),
      individualise,
    },
    alertes,
  };
}
