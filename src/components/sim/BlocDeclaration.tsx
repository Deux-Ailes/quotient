"use client";

import { FileText } from "@phosphor-icons/react/dist/ssr";
import { detailDeclaration, type LigneDecl } from "@/lib/fiscal/declaration";
import type { Resultat } from "@/lib/fiscal/engine";
import type { Foyer } from "@/lib/fiscal/types";
import { Card } from "./ui";

function BadgeCase({ ligne }: { ligne: LigneDecl }) {
  if (!ligne.case) return <span aria-hidden />;
  const { code, aVerifier } = ligne.case;
  return (
    <span
      title={aVerifier ? "Case à vérifier sur votre déclaration" : undefined}
      className={`inline-flex h-6 items-center justify-center self-start justify-self-start rounded-full px-2 font-mono text-xs font-semibold whitespace-nowrap ${
        aVerifier ? "bg-amber-50 text-amber ring-1 ring-amber/30" : "bg-brand-50 text-brand"
      }`}
    >
      {code}
      {aVerifier && <span className="ml-0.5">?</span>}
    </span>
  );
}

export function BlocDeclaration({ foyer, r }: { foyer: Foyer; r: Resultat }) {
  const sections = detailDeclaration(foyer, r);
  const aVerifier = sections.some((s) => s.lignes.some((l) => l.case?.aVerifier));

  return (
    <Card
      title="Détail complet et cases de la déclaration"
      icon={<FileText aria-hidden className="size-5" />}
      description={
        <>
          Chaque montant saisi, la case où le reporter et les étapes du calcul. Numérotation de la déclaration 2026 (revenus 2025)
          {r.params.provisoire && ", susceptible d'évoluer pour la déclaration 2027"}.
        </>
      }
    >
      <div className="space-y-8">
        {sections.map((s) => (
          <section key={s.titre} className="break-inside-avoid">
            <h4 className="mb-2 text-sm font-semibold text-ink">{s.titre}</h4>
            <dl className="divide-y divide-line rounded-2xl border border-line">
              {s.lignes.map((l, k) => (
                <div
                  key={k}
                  className={`grid grid-cols-[4.5rem_1fr_auto] items-baseline gap-x-3 px-4 py-2.5 sm:grid-cols-[6rem_1fr_auto] ${
                    l.fort ? "bg-canvas/60" : ""
                  }`}
                >
                  <BadgeCase ligne={l} />
                  <dt className={l.detail ? "pl-3 text-sm text-ink-soft" : `text-sm ${l.fort ? "font-semibold text-ink" : "text-ink"}`}>
                    {l.detail && <span className="mr-1.5 text-ink-muted">└</span>}
                    {l.libelle}
                    {l.calcul && <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">{l.calcul}</span>}
                  </dt>
                  <dd className={`tabular text-right text-sm whitespace-nowrap ${l.fort ? "font-semibold text-ink" : l.detail ? "text-ink-soft" : "font-medium text-ink"}`}>
                    {l.valeur}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-muted">
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex h-5 items-center rounded-full bg-brand-50 px-2 font-mono font-semibold text-brand">1AJ</span>
          case à remplir ou vérifier (souvent pré-remplie)
        </span>
        {aVerifier && (
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex h-5 items-center rounded-full bg-amber-50 px-2 font-mono font-semibold text-amber ring-1 ring-amber/30">7UQ ?</span>
            numéro à confirmer sur votre déclaration
          </span>
        )}
      </div>
    </Card>
  );
}
