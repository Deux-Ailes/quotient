"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CaretUp as ChevronUp } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/Logo";
import { simuler, type Resultat } from "@/lib/fiscal/engine";
import { PARAMS, type Annee } from "@/lib/fiscal/params";
import { formatEur, formatPct } from "@/lib/format";
import { StepDeductions } from "./StepDeductions";
import { StepFoyer } from "./StepFoyer";
import { StepFrais } from "./StepFrais";
import { StepResultat } from "./StepResultat";
import { StepRevenus } from "./StepRevenus";
import { AnimatedNumber, Segmented } from "./ui";
import { useFoyer } from "./useFoyer";

const ETAPES = [
  { id: "foyer", titre: "Foyer", sousTitre: "Situation et enfants" },
  { id: "revenus", titre: "Revenus", sousTitre: "Salaires, pensions, loyers" },
  { id: "frais", titre: "Frais réels", sousTitre: "Trajets, repas, télétravail" },
  { id: "deductions", titre: "Déductions", sousTitre: "Réductions et crédits" },
  { id: "resultat", titre: "Résultat", sousTitre: "Votre estimation" },
] as const;

function PanneauLive({ r, onVoir }: { r: Resultat; onVoir: () => void }) {
  const restitution = r.impotNet < 0;
  const lignes = [
    { l: "Revenu net imposable", v: formatEur(r.revenuNetImposable) },
    { l: "Parts", v: String(r.parts.total).replace(".", ",") },
    { l: "Impôt au barème", v: formatEur(r.qf.impotBrut) },
    ...(r.decote > 0 ? [{ l: "Décote", v: `− ${formatEur(r.decote)}` }] : []),
    ...(r.reductions.imputees > 0 ? [{ l: "Réductions", v: `− ${formatEur(r.reductions.imputees)}` }] : []),
    ...(r.credits.total > 0 ? [{ l: "Crédits", v: `− ${formatEur(r.credits.total)}` }] : []),
  ];
  return (
    <div className="overflow-hidden rounded-3xl bg-night text-white shadow-lift">
      <div className="bg-brand-gradient p-6">
        <p className="text-sm text-white/70">{restitution ? "Remboursement estimé" : "Impôt estimé"}</p>
        <p className="tabular mt-1 font-display text-4xl font-bold">
          <AnimatedNumber value={Math.abs(r.impotNet)} format={formatEur} />
        </p>
        <div className="mt-4 flex gap-5 text-sm">
          <div>
            <p className="text-white/60">Taux moyen</p>
            <p className="tabular font-semibold">{formatPct(r.tauxMoyen)}</p>
          </div>
          <div>
            <p className="text-white/60">TMI</p>
            <p className="tabular font-semibold">{formatPct(r.tmi)}</p>
          </div>
          <div>
            <p className="text-white/60">Taux PAS</p>
            <p className="tabular font-semibold">{formatPct(r.pas.tauxFoyer)}</p>
          </div>
        </div>
      </div>
      <dl className="space-y-2.5 p-6 text-sm">
        {lignes.map((x) => (
          <div key={x.l} className="flex justify-between">
            <dt className="text-white/60">{x.l}</dt>
            <dd className="tabular font-medium">{x.v}</dd>
          </div>
        ))}
        {r.prelevementsSociaux > 0 && (
          <div className="flex justify-between border-t border-white/10 pt-2.5">
            <dt className="text-white/60">Prélèvements sociaux</dt>
            <dd className="tabular font-medium">{formatEur(r.prelevementsSociaux)}</dd>
          </div>
        )}
      </dl>
      <div className="px-6 pb-6">
        <button type="button" onClick={onVoir} className="w-full rounded-full bg-white/10 py-2.5 text-sm font-semibold ring-1 ring-white/15 transition hover:bg-white/20">
          Voir le détail
        </button>
      </div>
    </div>
  );
}

export function Simulateur() {
  const { foyer, maj, reinitialiser, charge, exemple } = useFoyer();
  const [etape, setEtape] = useState(0);

  // Étape initiale optionnelle : /simulateur?etape=3 (1 à 5).
  useEffect(() => {
    const n = Number(new URLSearchParams(window.location.search).get("etape"));
    if (n >= 1 && n <= ETAPES.length) setEtape(n - 1);
  }, []);
  const [adulteActif, setAdulteActif] = useState(0);
  const [panneauMobile, setPanneauMobile] = useState(false);
  const haut = useRef<HTMLDivElement>(null);

  const resultat = useMemo(() => simuler(foyer), [foyer]);
  const params = PARAMS[foyer.annee];

  useEffect(() => {
    haut.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [etape]);

  const aller = (k: number) => setEtape(Math.max(0, Math.min(ETAPES.length - 1, k)));
  const derniere = etape === ETAPES.length - 1;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-line/60 bg-canvas/80 backdrop-blur-xl print:hidden">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-ink-muted sm:inline">Année</span>
            <Segmented<Annee>
              size="sm"
              value={foyer.annee}
              onChange={(v) => maj((d) => void (d.annee = v))}
              options={[
                { value: 2026, label: "Revenus 2026" },
                { value: 2025, label: "2025" },
              ]}
            />
          </div>
        </div>
      </header>

      <div ref={haut} className="mx-auto max-w-7xl scroll-mt-16 px-4 pt-8 pb-36 sm:px-6 lg:pb-16">
        {/* Progression */}
        <nav aria-label="Étapes" className="print:hidden">
          <ol className="grid grid-cols-5 gap-2">
            {ETAPES.map((e, k) => {
              const fait = k < etape;
              const courant = k === etape;
              return (
                <li key={e.id}>
                  <button type="button" onClick={() => aller(k)} className="group w-full text-left" aria-current={courant ? "step" : undefined}>
                    <span className={`block h-1.5 rounded-full transition-all duration-500 ${fait || courant ? "bg-brand" : "bg-line group-hover:bg-brand-100"}`} />
                    <span className="mt-3 hidden items-center gap-2 md:flex">
                      <span
                        className={`grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold transition ${
                          fait ? "bg-mint text-white" : courant ? "bg-brand text-white" : "bg-surface text-ink-muted ring-1 ring-line"
                        }`}
                      >
                        {fait ? <Check className="size-3.5" weight="bold" /> : k + 1}
                      </span>
                      <span>
                        <span className={`block text-sm font-semibold ${courant ? "text-ink" : "text-ink-soft"}`}>{e.titre}</span>
                        <span className="block text-xs text-ink-muted">{e.sousTitre}</span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="mt-3 text-sm font-semibold md:hidden">
            Étape {etape + 1} / {ETAPES.length} · {ETAPES[etape].titre}
          </p>
        </nav>

        {exemple && (
          <p className="mt-6 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-ink-soft print:hidden">
            <strong className="text-ink">Foyer d&apos;exemple.</strong> Vos modifications ne sont pas enregistrées.{" "}
            <a href="/simulateur" className="font-semibold text-brand underline-offset-2 hover:underline">
              Commencer avec mes chiffres
            </a>
          </p>
        )}

        {params.provisoire && etape === 0 && (
          <p className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-ink-soft print:hidden">
            <strong className="text-ink">Revenus 2026 :</strong> barème provisoire issu du projet de loi de finances 2027, en cours d&apos;examen au
            Parlement. Choisissez « 2025 » pour des paramètres définitifs.
          </p>
        )}

        <div className={`mt-8 grid items-start gap-8 ${derniere ? "" : "lg:grid-cols-[1fr_340px]"}`}>
          <div key={`${etape}-${charge}`} className="min-w-0">
            <div className="animate-fade-up mb-6">
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{ETAPES[etape].titre}</h1>
              <p className="mt-1 text-ink-soft">{ETAPES[etape].sousTitre}</p>
            </div>

            {etape === 0 && <StepFoyer foyer={foyer} maj={maj} />}
            {etape === 1 && <StepRevenus foyer={foyer} maj={maj} actif={adulteActif} setActif={setAdulteActif} />}
            {etape === 2 && <StepFrais foyer={foyer} maj={maj} resultat={resultat} actif={adulteActif} setActif={setAdulteActif} />}
            {etape === 3 && <StepDeductions foyer={foyer} maj={maj} resultat={resultat} />}
            {etape === 4 && (
              <StepResultat
                r={resultat}
                onReset={() => {
                  reinitialiser();
                  setEtape(0);
                }}
              />
            )}

            <div className="mt-8 flex items-center justify-between gap-3 print:hidden">
              <button
                type="button"
                onClick={() => aller(etape - 1)}
                disabled={etape === 0}
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-ink-soft transition hover:bg-surface hover:text-ink disabled:invisible"
              >
                <ArrowLeft className="size-4" /> Précédent
              </button>
              {!derniere && (
                <button
                  type="button"
                  onClick={() => aller(etape + 1)}
                  className="bg-brand-gradient group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lift transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                >
                  {etape === ETAPES.length - 2 ? "Voir mon estimation" : "Continuer"}
                  <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                </button>
              )}
            </div>
          </div>

          {!derniere && (
            <aside className="sticky top-24 hidden lg:block">
              <PanneauLive r={resultat} onVoir={() => aller(ETAPES.length - 1)} />
              <p className="mt-4 px-2 text-xs leading-relaxed text-ink-muted">
                Calcul effectué dans votre navigateur. Brouillon enregistré sur cet appareil uniquement.
              </p>
            </aside>
          )}
        </div>
      </div>

      {/* Barre mobile */}
      {!derniere && (
        <div className="fixed inset-x-0 bottom-0 z-40 p-3 lg:hidden print:hidden">
          {panneauMobile && (
            <div className="mb-2 max-h-[60vh] overflow-y-auto">
              <PanneauLive
                r={resultat}
                onVoir={() => {
                  setPanneauMobile(false);
                  aller(ETAPES.length - 1);
                }}
              />
            </div>
          )}
          <button
            type="button"
            onClick={() => setPanneauMobile((o) => !o)}
            className="flex w-full items-center justify-between rounded-2xl bg-night px-5 py-3.5 text-white shadow-lift"
            aria-expanded={panneauMobile}
          >
            <span className="text-sm text-white/70">{resultat.impotNet < 0 ? "Remboursement estimé" : "Impôt estimé"}</span>
            <span className="flex items-center gap-2">
              <span className="tabular font-display text-xl font-bold">
                <AnimatedNumber value={Math.abs(resultat.impotNet)} format={formatEur} />
              </span>
              <ChevronUp className={`size-5 transition ${panneauMobile ? "rotate-180" : ""}`} />
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
