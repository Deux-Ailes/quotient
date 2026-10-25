"use client";

import { useState } from "react";
import { Check, ClipboardText, Copy } from "@phosphor-icons/react/dist/ssr";
import type { Resultat } from "@/lib/fiscal/engine";
import { resumeFraisReels } from "@/lib/fiscal/resumeFraisReels";
import type { Foyer } from "@/lib/fiscal/types";
import { Card, Note } from "./ui";

function BlocTexte({ titre, texte }: { titre: string; texte: string }) {
  const [copie, setCopie] = useState<"ok" | "erreur" | null>(null);

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(texte);
      setCopie("ok");
    } catch {
      setCopie("erreur");
    }
    setTimeout(() => setCopie(null), 2500);
  };

  return (
    <div className="rounded-2xl bg-canvas/60 p-4 ring-1 ring-line">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold">{titre}</p>
        <div className="flex items-center gap-3">
          <span className="tabular text-xs text-ink-muted">{texte.length} caractères</span>
          <button
            type="button"
            onClick={copier}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 active:scale-[0.98] print:hidden"
          >
            {copie === "ok" ? <Check className="size-4" weight="bold" /> : <Copy className="size-4" weight="bold" />}
            {copie === "ok" ? "Copié" : "Copier le texte"}
          </button>
        </div>
      </div>
      <textarea
        readOnly
        value={texte}
        rows={Math.min(18, texte.split("\n").length + 4)}
        onFocus={(e) => e.currentTarget.select()}
        aria-label={titre}
        className="w-full resize-y rounded-xl border border-line bg-surface p-3 font-mono text-xs leading-relaxed text-ink outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
      />
      {copie === "erreur" && (
        <p className="mt-2 text-xs text-rose" role="alert">
          La copie automatique a échoué : sélectionnez le texte et copiez-le avec Ctrl+C.
        </p>
      )}
    </div>
  );
}

/** Justificatif des frais réels à coller sur impots.gouv.fr, un par déclarant qui les a retenus. */
export function ResumeFraisReels({ foyer, r }: { foyer: Foyer; r: Resultat }) {
  const adultesSrc = r.couple ? foyer.adultes : [foyer.adultes[0]];
  const blocs = r.adultes
    .map((ra, i) => ({ ra, a: adultesSrc[i], i }))
    .filter(({ ra }) => ra.salairesBruts > 0 && ra.modeRetenu === "reels" && ra.fraisReels.total > 0);

  if (blocs.length === 0) return null;

  return (
    <Card
      title="Justificatif des frais réels"
      icon={<ClipboardText className="size-5" />}
      description="Texte prêt à coller dans la zone « Précisions » de la case frais réels, sur la déclaration en ligne. Chaque montant y est justifié par son calcul."
    >
      <div className="space-y-4">
        {blocs.map(({ ra, a, i }) => (
          <BlocTexte key={i} titre={`Frais réels de ${ra.prenom || `déclarant ${i + 1}`}`} texte={resumeFraisReels(a, ra, r.params, i)} />
        ))}
      </div>
      <div className="mt-4">
        <Note>
          Relisez le texte avant de l&apos;envoyer et complétez-le si besoin (circonstances d&apos;une distance supérieure à 40 km, par exemple). Si la zone de
          saisie limite le nombre de caractères, gardez les lignes principales et le total.
        </Note>
      </div>
    </Card>
  );
}
