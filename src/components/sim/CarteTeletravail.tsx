"use client";

import { Laptop, Plus, Trash as Trash2 } from "@phosphor-icons/react/dist/ssr";
import { nouvelEquipement } from "@/lib/fiscal/defaults";
import { CLES_ENERGIES, fraisTeletravail } from "@/lib/fiscal/fraisReels";
import type { ParamsFiscaux } from "@/lib/fiscal/params";
import type { DepensesLogement, Teletravail } from "@/lib/fiscal/types";
import { formatEur, formatEurCents, formatPct } from "@/lib/format";
import { Card, Collapsible, Grid, Note, NumberField, Pill, Segmented, SelectField, Switch, TextField } from "./ui";

type ChampDepense = { cle: keyof DepensesLogement; label: string; hint?: string; statut?: Teletravail["statut"] };

const DEPENSES: ChampDepense[] = [
  { cle: "loyer", label: "Loyer (hors charges)", statut: "locataire" },
  { cle: "chargesLocatives", label: "Charges locatives", statut: "locataire", hint: "Provisions de charges versées au bailleur." },
  { cle: "taxeFonciere", label: "Taxe foncière", statut: "proprietaire" },
  { cle: "chargesCopropriete", label: "Charges de copropriété", statut: "proprietaire" },
  { cle: "electricite", label: "Électricité", hint: "Éclairage, appareils, chauffage électrique." },
  { cle: "chauffage", label: "Chauffage (gaz, fioul, bois, réseau)" },
  { cle: "eau", label: "Eau" },
  { cle: "assurance", label: "Assurance habitation" },
  { cle: "entretien", label: "Entretien et réparations", hint: "Ramonage, nettoyage, petites réparations du logement." },
];

export function CarteTeletravail({
  t,
  set,
  remboursements,
  setRemboursements,
  p,
}: {
  t: Teletravail;
  set: (recette: (t: Teletravail) => void) => void;
  remboursements: number;
  setRemboursements: (v: number) => void;
  p: ParamsFiscaux;
}) {
  const tt = p.fraisReels.teletravail;
  const detail = fraisTeletravail(t, p);
  const autreMode = fraisTeletravail({ ...t, mode: t.mode === "forfait" ? "reel" : "forfait" }, p);
  const forfait = t.mode === "forfait" ? detail : autreMode;
  const reel = t.mode === "reel" ? detail : autreMode;
  const quotePartDe = (cle: keyof DepensesLogement) =>
    (CLES_ENERGIES as readonly string[]).includes(cle) ? detail.quotePartEnergies : detail.quotePartFixes;
  const reelRenseigne = t.surfaceLogement > 0 || t.internet.montant > 0;

  return (
    <Card
      title="Télétravail"
      icon={<Laptop className="size-5" />}
      description="Forfait journalier, ou frais réels : quote-part du logement et des énergies au prorata de la surface du bureau."
      action={<span className="tabular text-sm font-semibold text-brand">{formatEur(detail.total)}</span>}
    >
      <Grid>
        <NumberField
          label="Jours télétravaillés dans l'année"
          suffix="jours"
          value={t.jours}
          onChange={(v) => set((x) => void (x.jours = Math.round(v)))}
        />
        <NumberField
          label="Allocations reçues de l'employeur"
          value={remboursements}
          onChange={setRemboursements}
          hint="Allocation télétravail, indemnités kilométriques… À ajouter au salaire si vous optez pour les frais réels."
        />
      </Grid>

      {/* Choix du mode */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        {(
          [
            { mode: "forfait", titre: `Forfait ${formatEurCents(tt.parJour)}/jour`, montant: forfait.total, sous: `Plafond ${formatEurCents(tt.plafondAnnuel)}/an` },
            { mode: "reel", titre: "Frais réels", montant: reel.total, sous: reelRenseigne ? `Surface ${formatPct(reel.ratioSurface)}` : "À renseigner ci-dessous" },
          ] as const
        ).map((o) => {
          const actif = t.mode === o.mode;
          const meilleur = o.mode === "reel" ? reel.total > forfait.total && reelRenseigne : forfait.total >= reel.total;
          return (
            <button
              key={o.mode}
              type="button"
              aria-pressed={actif}
              onClick={() => set((x) => void (x.mode = o.mode))}
              className={`rounded-2xl p-4 text-left ring-1 transition ${actif ? "bg-brand-50 ring-brand" : "bg-surface ring-line hover:ring-brand-100"}`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-ink">{o.titre}</span>
                {meilleur && (t.jours > 0 || reelRenseigne) && <Pill tone="mint">plus avantageux</Pill>}
              </span>
              <span className="tabular mt-1 block font-display text-2xl font-bold text-ink">{formatEur(o.montant)}</span>
              <span className="block text-xs text-ink-muted">{o.sous}</span>
            </button>
          );
        })}
      </div>

      {t.mode === "reel" && (
        <div className="mt-6 space-y-3">
          {/* Récapitulatif, toujours visible au-dessus des sections repliables */}
          <dl className="space-y-2 rounded-2xl bg-night p-4 text-sm text-white">
            <div className="flex justify-between gap-4">
              <dt className="text-white/65">
                Loyer et charges : {formatEur(detail.depensesFixes)} × {formatPct(detail.quotePartFixes)}
              </dt>
              <dd className="tabular font-medium">{formatEur(detail.localFixes)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-white/65">
                Énergies : {formatEur(detail.depensesEnergies)} × {formatPct(detail.quotePartEnergies)}
              </dt>
              <dd className="tabular font-medium">{formatEur(detail.localEnergies)}</dd>
            </div>
            {t.depensesBureau > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="text-white/65">Dépenses propres au bureau</dt>
                <dd className="tabular font-medium">{formatEur(detail.local - detail.localFixes - detail.localEnergies)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-white/65">Internet et téléphone</dt>
              <dd className="tabular font-medium">{formatEur(detail.internet)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-white/65">Équipements</dt>
              <dd className="tabular font-medium">{formatEur(detail.totalEquipements)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-white/10 pt-2 font-semibold">
              <dt>Total télétravail</dt>
              <dd className="tabular">{formatEur(detail.total)}</dd>
            </div>
          </dl>

          {t.jours === 0 && (
            <Note tone="warn">Indiquez vos jours de télétravail en haut de la carte : les énergies sont déduites au prorata de ces jours.</Note>
          )}

          <Collapsible
            title="Logement"
            subtitle={t.surfaceLogement > 0 ? `${t.statut === "locataire" ? "Locataire" : "Propriétaire"}, bureau de ${t.surfaceBureau} m² sur ${t.surfaceLogement} m²` : "Statut et surfaces"}
            defaultOpen={t.surfaceLogement === 0}
          >
          <div className="space-y-4">
            <Segmented
              size="sm"
              value={t.statut}
              onChange={(v) => set((x) => void (x.statut = v))}
              options={[
                { value: "locataire", label: "Locataire" },
                { value: "proprietaire", label: "Propriétaire" },
              ]}
            />
            <Grid>
              <NumberField label="Surface du bureau" suffix="m²" step={0.5} value={t.surfaceBureau} onChange={(v) => set((x) => void (x.surfaceBureau = v))} />
              <NumberField label="Surface totale du logement" suffix="m²" step={0.5} value={t.surfaceLogement} onChange={(v) => set((x) => void (x.surfaceLogement = v))} />
            </Grid>
            <div className="grid gap-1 sm:grid-cols-2">
              <Switch
                checked={t.pieceDediee}
                onChange={(v) => set((x) => void (x.pieceDediee = v))}
                label="Pièce réservée au travail"
                hint="Sinon, seule la part d'usage professionnel est retenue (estimée par vos jours de télétravail)."
              />
              <Switch
                checked={t.studio}
                onChange={(v) => set((x) => void (x.studio = v))}
                label="Logement d'une seule pièce (studio)"
                hint="La surface retenue ne peut dépasser la moitié du logement."
              />
            </div>

            {/* Quote-part */}
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  titre: "Loyer et charges fixes",
                  taux: detail.quotePartFixes,
                  calcul: t.pieceDediee
                    ? `Surface ${formatPct(detail.ratioSurface)} (pièce dédiée toute l'année)`
                    : `Surface ${formatPct(detail.ratioSurface)} × ${t.jours} j / 365`,
                },
                {
                  titre: "Énergies et eau",
                  taux: detail.quotePartEnergies,
                  calcul: `Surface ${formatPct(detail.ratioSurface)} × ${t.jours} j / 365`,
                },
              ].map((q) => (
                <div key={q.titre} className="rounded-2xl bg-canvas/60 p-4 ring-1 ring-line">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm text-ink-soft">{q.titre}</p>
                    <p className="tabular font-display text-2xl font-bold text-brand">{formatPct(q.taux)}</p>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
                    <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${Math.min(100, q.taux * 100)}%` }} />
                  </div>
                  <p className="tabular mt-2 text-xs text-ink-muted">
                    {q.calcul}
                    {t.studio && detail.ratioSurface === tt.plafondSurfaceStudio && " · limite studio"}
                  </p>
                </div>
              ))}
            </div>
          </div>
          </Collapsible>

          <Collapsible
            title="Dépenses annuelles du logement"
            subtitle="Montants de tout le logement ; la quote-part est calculée automatiquement"
            badge={detail.local > 0 ? <Pill>{formatEur(detail.local)}</Pill> : null}
            defaultOpen={detail.depensesCommunes === 0}
          >
          <div className="space-y-4">
            <Grid>
              {DEPENSES.filter((c) => !c.statut || c.statut === t.statut).map((c) => (
                <NumberField
                  key={c.cle}
                  label={c.label}
                  value={t.depenses[c.cle]}
                  onChange={(v) => set((x) => void (x.depenses[c.cle] = v))}
                  hint={
                    t.depenses[c.cle] > 0 ? (
                      <>
                        Déductible : <strong className="tabular text-ink-soft">{formatEur(t.depenses[c.cle] * quotePartDe(c.cle))}</strong>
                      </>
                    ) : (
                      c.hint
                    )
                  }
                />
              ))}
              <NumberField
                label="Dépenses propres au bureau"
                value={t.depensesBureau}
                onChange={(v) => set((x) => void (x.depensesBureau = v))}
                hint="Peinture, aménagement, éclairage dédié : retenues en totalité (pièce dédiée)."
              />
            </Grid>
            {t.statut === "proprietaire" && (
              <Note>
                Propriétaire : ni le prix d&apos;achat, ni un loyer fictif, ni l&apos;amortissement du logement ne sont déductibles. Les intérêts
                d&apos;emprunt ne le sont que dans des cas limités (travaux de construction ou d&apos;agrandissement du local).
              </Note>
            )}
          </div>
          </Collapsible>

          <Collapsible title="Internet et téléphone" badge={detail.internet > 0 ? <Pill>{formatEur(detail.internet)}</Pill> : null}>
            <Grid>
              <NumberField label="Abonnements annuels" value={t.internet.montant} onChange={(v) => set((x) => void (x.internet.montant = v))} />
              <NumberField
                label="Part d'usage professionnel"
                suffix="%"
                max={100}
                value={t.internet.usagePro}
                onChange={(v) => set((x) => void (x.internet.usagePro = v))}
                hint={t.internet.montant > 0 ? `Déductible : ${formatEur(detail.internet)}` : undefined}
              />
            </Grid>
          </Collapsible>
        </div>
      )}

      {/* Équipements */}
      <div className="mt-3">
      <Collapsible
        title="Mobilier et matériel de télétravail"
        subtitle={`Déduits jusqu'à ${p.fraisReels.seuilAmortissementMateriel} € HT, sinon amortis (${p.fraisReels.dureeAmortissementMateriel} ans informatique, ${p.fraisReels.dureeAmortissementMobilier} ans mobilier)`}
        badge={detail.totalEquipements > 0 ? <Pill>{formatEur(detail.totalEquipements)}</Pill> : null}
        defaultOpen={t.equipements.length > 0}
      >
      <div className="space-y-3">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => set((x) => void x.equipements.push(nouvelEquipement()))}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-2 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white"
          >
            <Plus className="size-4" /> Ajouter
          </button>
        </div>
        {t.equipements.map((e, k) => {
          const d = detail.equipements[k];
          return (
            <div key={e.id} className="rounded-2xl bg-canvas/60 p-4 ring-1 ring-line">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">
                  {e.libelle || `Équipement ${k + 1}`}{" "}
                  <span className="tabular font-normal text-brand">· {formatEur(d?.montant ?? 0)}</span>
                </p>
                <div className="flex items-center gap-2">
                  {d?.amorti && <Pill tone="muted">amorti</Pill>}
                  <button
                    type="button"
                    aria-label="Supprimer l'équipement"
                    onClick={() => set((x) => void x.equipements.splice(k, 1))}
                    className="grid size-8 place-items-center rounded-full text-ink-muted transition hover:bg-rose/10 hover:text-rose"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-4">
                <TextField label="Libellé" value={e.libelle} onChange={(v) => set((x) => void (x.equipements[k].libelle = v))} />
                <SelectField
                  label="Catégorie"
                  value={e.categorie}
                  onChange={(v) => set((x) => void (x.equipements[k].categorie = v))}
                  options={[
                    { value: "informatique", label: "Informatique" },
                    { value: "mobilier", label: "Mobilier" },
                  ]}
                />
                <NumberField label="Prix TTC" value={e.prix} onChange={(v) => set((x) => void (x.equipements[k].prix = v))} />
                <NumberField label="Usage pro" suffix="%" max={100} value={e.usagePro} onChange={(v) => set((x) => void (x.equipements[k].usagePro = v))} />
              </div>
            </div>
          );
        })}
      </div>
      </Collapsible>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-ink-muted">
        Références : BOI-RSA-BASE-30-50-30-30 (frais de local, prorata de surface) et BOI-RSA-BASE-30-50-30-40 (matériel, mobilier,
        communications). Conservez factures et quittances pendant 3 ans.
      </p>
    </Card>
  );
}
