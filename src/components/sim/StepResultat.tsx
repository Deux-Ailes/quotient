"use client";

import { AlertTriangle, CalendarClock, Printer, RotateCcw, Sparkles } from "lucide-react";
import type { Resultat } from "@/lib/fiscal/engine";
import { formatEur, formatNombre, formatPct } from "@/lib/format";
import { AnimatedNumber, Card, Note, Pill } from "./ui";

type Ligne = { label: string; valeur: number; signe?: "+" | "−" | "="; detail?: string; fort?: boolean; masquerSiZero?: boolean };

function TableCalcul({ lignes }: { lignes: Ligne[] }) {
  return (
    <dl className="divide-y divide-line text-sm">
      {lignes
        .filter((l) => !(l.masquerSiZero && Math.round(l.valeur) === 0))
        .map((l, k) => (
          <div key={k} className={`flex items-baseline justify-between gap-4 py-2.5 ${l.fort ? "font-semibold text-ink" : "text-ink-soft"}`}>
            <dt className="flex items-baseline gap-2">
              <span className="w-3 shrink-0 text-center text-ink-muted">{l.signe ?? ""}</span>
              <span>
                {l.label}
                {l.detail && <span className="block text-xs font-normal text-ink-muted">{l.detail}</span>}
              </span>
            </dt>
            <dd className="tabular shrink-0">{formatEur(l.valeur)}</dd>
          </div>
        ))}
    </dl>
  );
}

function Bareme({ r }: { r: Resultat }) {
  const q = r.parts.total > 0 ? r.revenuNetImposable / r.parts.total : 0;
  const tranches = r.params.bareme;
  const max = Math.max(q * 1.15, tranches[2].jusqua);
  const segments = tranches
    .map((t, k) => {
      const bas = k === 0 ? 0 : tranches[k - 1].jusqua;
      const haut = Math.min(t.jusqua, max);
      return { taux: t.taux, bas, haut, largeur: ((haut - bas) / max) * 100 };
    })
    .filter((s) => s.largeur > 0);
  return (
    <div>
      <div className="flex gap-0.5">
        {segments.map((s) => {
          const rempli = q <= s.bas ? 0 : Math.min(1, (q - s.bas) / (s.haut - s.bas || 1));
          return (
            <div key={s.taux} style={{ width: `${s.largeur}%` }}>
              <div className="h-3 overflow-hidden rounded-full bg-canvas ring-1 ring-line">
                <div className="bg-brand-gradient h-full transition-all duration-500" style={{ width: `${rempli * 100}%`, opacity: 0.35 + s.taux * 1.4 }} />
              </div>
              <p className={`mt-1.5 text-[11px] ${s.taux === r.tmi ? "font-semibold text-brand" : "text-ink-muted"}`}>{formatPct(s.taux)}</p>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-sm text-ink-soft">
        Revenu par part : <strong className="tabular text-ink">{formatEur(q)}</strong>, soit une tranche marginale de{" "}
        <strong className="text-ink">{formatPct(r.tmi)}</strong>.
      </p>
    </div>
  );
}

export function StepResultat({ r, onReset }: { r: Resultat; onReset: () => void }) {
  const restitution = r.impotNet < 0;
  const reels = r.adultes.filter((a) => a.salairesBruts > 0);

  const lignes: Ligne[] = [
    ...r.adultes.map<Ligne>((a) => ({
      label: `Salaires nets de ${a.prenom}`,
      valeur: a.salairesNets,
      detail: a.salairesBruts > 0 ? `${formatEur(a.salairesBruts)} − ${a.modeRetenu === "reels" ? "frais réels" : "abattement 10 %"} ${formatEur(a.deductionRetenue)}` : undefined,
      masquerSiZero: true,
    })),
    { label: "Pensions nettes", valeur: r.revenus.pensions, masquerSiZero: true, signe: "+" },
    { label: "Bénéfices micro (après abattement)", valeur: r.revenus.micro, masquerSiZero: true, signe: "+" },
    { label: `Revenus fonciers (${r.revenus.foncierRegime === "micro" ? "micro-foncier" : "réel"})`, valeur: r.revenus.foncier, masquerSiZero: true, signe: "+" },
    { label: "Déficit foncier imputé", valeur: r.revenus.deficitFoncierImpute, masquerSiZero: true, signe: "−" },
    { label: "Revenus de capitaux au barème", valeur: r.revenus.capitauxBareme, masquerSiZero: true, signe: "+" },
    { label: "Revenu brut global", valeur: r.revenuBrutGlobal, signe: "=", fort: true },
    { label: "Versements PER", valeur: r.charges.per, masquerSiZero: true, signe: "−" },
    { label: "Pensions alimentaires", valeur: r.charges.pensionsAlimentaires, masquerSiZero: true, signe: "−" },
    { label: "Abattement personnes âgées / invalides", valeur: r.abattementAge, masquerSiZero: true, signe: "−" },
    { label: "Revenu net imposable", valeur: r.revenuNetImposable, signe: "=", fort: true },
  ];

  const lignesImpot: Ligne[] = [
    {
      label: "Impôt au barème",
      valeur: r.qf.impotBrut,
      detail: `${formatNombre(r.parts.total)} parts${r.qf.plafonne ? " · plafonnement du quotient familial appliqué" : ""}`,
    },
    { label: "Décote", valeur: r.decote, signe: "−", masquerSiZero: true },
    { label: "Prélèvement forfaitaire (12,8 %) sur placements", valeur: r.pfu, signe: "+", masquerSiZero: true },
    { label: "Réductions d'impôt", valeur: r.reductions.imputees, signe: "−", masquerSiZero: true, detail: "Dons, scolarité, investissement locatif, EHPAD" },
    { label: "Crédits d'impôt", valeur: r.credits.total, signe: "−", masquerSiZero: true, detail: "Garde d'enfants, emploi à domicile, cotisations syndicales" },
    { label: "Contribution exceptionnelle hauts revenus", valeur: r.cehr, signe: "+", masquerSiZero: true },
    { label: restitution ? "Restitution" : "Impôt sur le revenu net", valeur: r.impotNet, signe: "=", fort: true },
    { label: "Prélèvements sociaux (patrimoine)", valeur: r.prelevementsSociaux, signe: "+", masquerSiZero: true },
  ];

  return (
    <div className="space-y-5">
      {/* Synthèse */}
      <section className="bg-brand-gradient animate-fade-up relative overflow-hidden rounded-3xl p-6 text-white shadow-lift sm:p-8">
        <div className="absolute -top-20 -right-16 size-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm text-white/70">{restitution ? "Remboursement estimé" : "Impôt sur le revenu estimé"}</p>
            <p className="tabular mt-1 font-display text-5xl font-bold tracking-tight sm:text-6xl">
              <AnimatedNumber value={Math.abs(r.impotNet)} format={formatEur} />
            </p>
            {r.prelevementsSociaux > 0 && (
              <p className="mt-2 text-sm text-white/80">
                + {formatEur(r.prelevementsSociaux)} de prélèvements sociaux, soit {formatEur(r.totalAPayer)} au total
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { l: "Taux moyen", v: formatPct(r.tauxMoyen) },
              { l: "TMI", v: formatPct(r.tmi) },
              { l: "Parts", v: formatNombre(r.parts.total) },
              { l: "Revenu fiscal de réf.", v: formatEur(r.revenuFiscalReference) },
            ].map((x) => (
              <div key={x.l} className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
                <p className="text-white/60">{x.l}</p>
                <p className="tabular font-semibold">{x.v}</p>
              </div>
            ))}
          </div>
        </div>
        {r.params.provisoire && (
          <p className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs">
            <AlertTriangle className="size-3.5" /> Estimation provisoire : barème du projet de loi de finances 2027
          </p>
        )}
      </section>

      {r.alertes.length > 0 && (
        <div className="space-y-2">
          {r.alertes.map((a) => (
            <Note key={a} tone="warn">
              {a}
            </Note>
          ))}
        </div>
      )}

      {/* Frais réels */}
      {reels.length > 0 && (
        <Card title="Abattement ou frais réels" icon={<Sparkles className="size-5" />}>
          <div className={`grid gap-3 ${reels.length > 1 ? "sm:grid-cols-2" : ""}`}>
            {reels.map((a) => (
              <div key={a.prenom} className="rounded-2xl bg-canvas/60 p-4 ring-1 ring-line">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{a.prenom}</p>
                  <Pill tone={a.modeRetenu === "reels" ? "mint" : "muted"}>{a.modeRetenu === "reels" ? "Frais réels" : "Abattement 10 %"}</Pill>
                </div>
                <div className="tabular mt-3 flex justify-between text-sm text-ink-soft">
                  <span>10 % : {formatEur(a.abattementForfaitaire)}</span>
                  <span>Réels : {formatEur(a.fraisReels.total)}</span>
                </div>
                {a.fraisReels.total > 0 && (
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-mint transition-all duration-500"
                      style={{ width: `${Math.min(100, (a.fraisReels.total / Math.max(a.fraisReels.total, a.abattementForfaitaire)) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Détail */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Du revenu au revenu imposable">
          <TableCalcul lignes={lignes} />
        </Card>
        <Card title="De l'impôt brut à l'impôt net">
          <TableCalcul lignes={lignesImpot} />
          {r.sousSeuilRecouvrement && <p className="mt-3 text-xs text-ink-muted">Impôt inférieur à 61 € : il n&apos;est pas mis en recouvrement.</p>}
        </Card>
      </div>

      <Card title="Votre position dans le barème">
        <Bareme r={r} />
      </Card>

      {/* PAS */}
      <Card title="Prélèvement à la source" icon={<CalendarClock className="size-5" />} description="Estimation du taux appliqué à partir de septembre suivant la déclaration.">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-canvas/60 p-4 ring-1 ring-line">
            <p className="text-sm text-ink-soft">Taux du foyer</p>
            <p className="tabular font-display text-3xl font-bold">{formatPct(r.pas.tauxFoyer)}</p>
          </div>
          <div className="rounded-2xl bg-canvas/60 p-4 ring-1 ring-line">
            <p className="text-sm text-ink-soft">Retenue mensuelle</p>
            <p className="tabular font-display text-3xl font-bold">{formatEur(r.pas.mensualite)}</p>
            <p className="text-xs text-ink-muted">sur salaires et pensions</p>
          </div>
          <div className="rounded-2xl bg-canvas/60 p-4 ring-1 ring-line">
            <p className="text-sm text-ink-soft">Acompte mensuel</p>
            <p className="tabular font-display text-3xl font-bold">{formatEur(r.pas.acompteMensuel)}</p>
            <p className="text-xs text-ink-muted">loyers et revenus indépendants</p>
          </div>
        </div>
        {r.pas.individualise && (
          <div className="mt-4 rounded-2xl bg-brand-50 p-4">
            <p className="text-sm font-semibold text-ink">Option taux individualisé</p>
            <p className="mt-1 text-sm text-ink-soft">Utile quand les revenus du couple sont déséquilibrés. Le total prélevé reste le même.</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {r.pas.individualise.map((x) => (
                <span key={x.prenom} className="tabular rounded-full bg-white px-3 py-1.5 text-sm font-semibold ring-1 ring-brand-100">
                  {x.prenom} : {formatPct(x.taux)}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Paramètres */}
      <Card title="Hypothèses de calcul">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
          <li>{r.params.libelle}.</li>
          {r.params.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
          <li>Non modélisé : revenus exceptionnels (quotient), contribution différentielle sur les hauts revenus, plus-values, report des déficits et réductions des années antérieures.</li>
        </ul>
      </Card>

      <div className="flex flex-wrap gap-3 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand"
        >
          <Printer className="size-4" /> Imprimer le récapitulatif
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm("Effacer toutes les données saisies ?")) onReset();
          }}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink-soft transition hover:border-rose hover:text-rose"
        >
          <RotateCcw className="size-4" /> Nouvelle simulation
        </button>
      </div>
    </div>
  );
}
