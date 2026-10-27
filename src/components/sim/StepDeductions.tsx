"use client";

import { Baby, Building, HandHeart, House as Home, PiggyBank, Plus, Trash as Trash2 } from "@phosphor-icons/react/dist/ssr";
import type { Resultat } from "@/lib/fiscal/engine";
import { PARAMS } from "@/lib/fiscal/params";
import type { Foyer, NiveauScolaire } from "@/lib/fiscal/types";
import { formatEur } from "@/lib/format";
import type { Maj } from "./useFoyer";
import { Card, Collapsible, Grid, Note, NumberField, Pill, Segmented, SelectField, Switch } from "./ui";

const NIVEAUX: { value: NiveauScolaire; label: string }[] = [
  { value: "aucun", label: "Non scolarisé / primaire" },
  { value: "college", label: "Collège" },
  { value: "lycee", label: "Lycée" },
  { value: "superieur", label: "Études supérieures" },
];

function Montant({ v }: { v: number }) {
  return v > 0 ? <span className="tabular text-sm font-semibold text-mint">− {formatEur(v)}</span> : null;
}

export function StepDeductions({ foyer, maj, resultat }: { foyer: Foyer; maj: Maj; resultat: Resultat }) {
  const p = PARAMS[foyer.annee];
  const couple = foyer.situation === "couple";
  const adultes = couple ? foyer.adultes : [foyer.adultes[0]];
  const r = resultat;

  return (
    <div className="space-y-5">
      {foyer.enfants.length > 0 && (
        <Card
          title="Enfants : garde et scolarité"
          icon={<Baby aria-hidden className="size-5" />}
          description={`Crédit de ${p.credits.gardeEnfant.taux * 100} % des frais de garde hors domicile des moins de ${p.credits.gardeEnfant.ageMax} ans, réductions forfaitaires pour la scolarité.`}
          action={<Montant v={r.credits.gardeEnfant + r.reductions.scolarite} />}
        >
          <div className="space-y-4">
            {foyer.enfants.map((e, k) => (
              <div key={e.id} className="rounded-2xl bg-canvas/60 p-4 ring-1 ring-line">
                <p className="mb-3 font-semibold">
                  {e.prenom || `Enfant ${k + 1}`} <span className="font-normal text-ink-muted">· {e.age} ans</span>
                </p>
                <Grid>
                  {e.age < p.credits.gardeEnfant.ageMax ? (
                    <NumberField
                      label="Frais de garde (crèche, assistante maternelle)"
                      value={e.fraisGarde}
                      onChange={(v) => maj((d) => void (d.enfants[k].fraisGarde = v))}
                      hint={`Net des aides (CMG). Plafond ${formatEur(p.credits.gardeEnfant.plafondParEnfant)} par enfant.`}
                    />
                  ) : (
                    <SelectField
                      label="Scolarité"
                      value={e.scolarite}
                      onChange={(v) => maj((d) => void (d.enfants[k].scolarite = v))}
                      options={NIVEAUX}
                      hint={`Collège ${p.reductions.scolarite.college} €, lycée ${p.reductions.scolarite.lycee} €, supérieur ${p.reductions.scolarite.superieur} €.`}
                    />
                  )}
                </Grid>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card
        title="Épargne retraite (PER)"
        icon={<PiggyBank aria-hidden className="size-5" />}
        description="Versements volontaires déductibles du revenu imposable, dans la limite du plafond épargne retraite."
        action={<span className="tabular text-sm font-semibold text-mint">{r.charges.per > 0 ? `− ${formatEur(r.charges.per)} de revenu` : ""}</span>}
      >
        <div className={`grid gap-4 ${couple ? "md:grid-cols-2" : ""}`}>
          {adultes.map((a, i) => (
            <div key={i} className="space-y-3 rounded-2xl bg-canvas/60 p-4 ring-1 ring-line">
              <p className="font-semibold">{a.prenom || `Déclarant ${i + 1}`}</p>
              <NumberField label="Versements PER" value={a.per.versements} onChange={(v) => maj((d) => void (d.adultes[i].per.versements = v))} />
              <NumberField
                label="Plafond disponible (avis d'impôt)"
                value={a.per.plafondDisponible ?? 0}
                placeholder={String(r.adultes[i]?.perPlafond ?? "")}
                onChange={(v) => maj((d) => void (d.adultes[i].per.plafondDisponible = v > 0 ? v : null))}
                hint="Laissez vide pour une estimation à 10 % des revenus professionnels."
              />
            </div>
          ))}
        </div>
      </Card>

      <Card
        title="Emploi à domicile"
        icon={<Home aria-hidden className="size-5" />}
        description="Ménage, jardinage, soutien scolaire, garde à domicile : crédit d'impôt de 50 %."
        action={<Montant v={r.credits.emploiDomicile} />}
      >
        <Grid>
          <NumberField
            label="Dépenses annuelles (net des aides)"
            value={foyer.reductions.emploiDomicile.depenses}
            onChange={(v) => maj((d) => void (d.reductions.emploiDomicile.depenses = v))}
            hint={`Plafond ${formatEur(p.credits.emploiDomicile.plafond)} + ${formatEur(p.credits.emploiDomicile.majoration)} par enfant ou membre de 65 ans et plus.`}
          />
          <div className="pt-6">
            <Switch
              checked={foyer.reductions.emploiDomicile.premiereAnnee}
              onChange={(v) => maj((d) => void (d.reductions.emploiDomicile.premiereAnnee = v))}
              label="Première année d'emploi direct"
              hint={`Plafond porté à ${formatEur(p.credits.emploiDomicile.plafondPremiereAnnee)}.`}
            />
          </div>
        </Grid>
      </Card>

      <Card title="Dons" icon={<HandHeart aria-hidden className="size-5" />} description="Réduction d'impôt, dans la limite de 20 % du revenu imposable." action={<Montant v={r.reductions.dons} />}>
        <Grid>
          <NumberField
            label="Aide aux personnes en difficulté"
            value={foyer.reductions.dons75}
            onChange={(v) => maj((d) => void (d.reductions.dons75 = v))}
            hint={`Restos du cœur, Secours populaire… 75 % jusqu'à ${formatEur(p.reductions.dons.plafond75)}, puis 66 %.`}
          />
          {p.reductions.dons.avantBascule && foyer.reductions.dons75 > 0 && (
            <NumberField
              label={`dont dons versés avant le ${p.reductions.dons.avantBascule.date}`}
              value={foyer.reductions.dons75AvantBascule}
              max={foyer.reductions.dons75}
              onChange={(v) => maj((d) => void (d.reductions.dons75AvantBascule = Math.min(v, d.reductions.dons75)))}
              hint={`Plafond de ${formatEur(p.reductions.dons.avantBascule.plafond)} pour ces dons, ${formatEur(p.reductions.dons.plafond75)} au total sur l'année.`}
            />
          )}
          <NumberField
            label="Autres associations d'intérêt général"
            value={foyer.reductions.dons66}
            onChange={(v) => maj((d) => void (d.reductions.dons66 = v))}
            hint="Réduction de 66 %."
          />
        </Grid>
      </Card>

      <Card title="Pensions alimentaires versées" icon={<HandHeart aria-hidden className="size-5" />} description="Déductibles du revenu imposable." action={<span className="tabular text-sm font-semibold text-mint">{r.charges.pensionsAlimentaires > 0 ? `− ${formatEur(r.charges.pensionsAlimentaires)} de revenu` : ""}</span>}>
        <div className="space-y-3">
          {foyer.deductions.pensionEnfantsMajeurs.map((v, k) => (
            <div key={k} className="flex items-end gap-2">
              <div className="flex-1">
                <NumberField
                  label={`Enfant majeur non rattaché ${k + 1}`}
                  value={v}
                  onChange={(x) => maj((d) => void (d.deductions.pensionEnfantsMajeurs[k] = x))}
                  hint={`Plafond ${formatEur(p.pensionAlimentaireEnfantMajeur)} par enfant.`}
                />
              </div>
              <button
                type="button"
                aria-label="Supprimer"
                onClick={() => maj((d) => void d.deductions.pensionEnfantsMajeurs.splice(k, 1))}
                className="mb-6 grid size-11 place-items-center rounded-xl text-ink-muted transition hover:bg-rose/10 hover:text-rose"
              >
                <Trash2 aria-hidden className="size-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => maj((d) => void d.deductions.pensionEnfantsMajeurs.push(0))}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand"
          >
            <Plus aria-hidden className="size-4" /> Pension à un enfant majeur
          </button>
          <NumberField
            label="Pension versée à un ex-conjoint ou un enfant mineur non à charge"
            value={foyer.deductions.pensionExConjoint}
            onChange={(v) => maj((d) => void (d.deductions.pensionExConjoint = v))}
          />
        </div>
      </Card>

      <Card title="Investissement locatif et dépendance" icon={<Building aria-hidden className="size-5" />} description="Dispositifs moins courants.">
        <div className="space-y-3">
          <Collapsible title="Pinel" subtitle="Réduction annuelle indiquée sur votre attestation" badge={r.reductions.pinel > 0 ? <Pill tone="mint">− {formatEur(r.reductions.pinel)}</Pill> : null}>
            <NumberField label="Réduction annuelle Pinel" value={foyer.reductions.pinelReductionAnnuelle} onChange={(v) => maj((d) => void (d.reductions.pinelReductionAnnuelle = v))} />
          </Collapsible>
          <Collapsible title="Denormandie" subtitle="Ancien rénové dans les communes éligibles" badge={r.reductions.denormandie > 0 ? <Pill tone="mint">− {formatEur(r.reductions.denormandie)}</Pill> : null}>
            <div className="space-y-4">
              <NumberField
                label="Prix de revient (achat + travaux)"
                value={foyer.reductions.denormandie.prix}
                onChange={(v) => maj((d) => void (d.reductions.denormandie.prix = v))}
                hint={`Retenu dans la limite de ${formatEur(p.reductions.denormandie.prixMax)}.`}
              />
              <Segmented
                size="sm"
                label="Durée d'engagement de location"
                value={foyer.reductions.denormandie.duree}
                onChange={(v) => maj((d) => void (d.reductions.denormandie.duree = v))}
                options={[
                  { value: 0, label: "Aucun" },
                  { value: 6, label: "6 ans (12 %)" },
                  { value: 9, label: "9 ans (18 %)" },
                  { value: 12, label: "12 ans (21 %)" },
                ]}
              />
            </div>
          </Collapsible>
          <Collapsible title="Hébergement en EHPAD" subtitle={`Réduction de 25 % des frais de dépendance et d'hébergement, plafonnés à ${formatEur(p.reductions.ehpad.plafondParPersonne)} par personne`} badge={r.reductions.ehpad > 0 ? <Pill tone="mint">− {formatEur(r.reductions.ehpad)}</Pill> : null}>
            <div className="space-y-3">
              {foyer.reductions.ehpad.map((v, k) => (
                <div key={k} className="flex items-end gap-2">
                  <div className="flex-1">
                    <NumberField label={`Dépenses, personne ${k + 1}`} value={v} onChange={(x) => maj((d) => void (d.reductions.ehpad[k] = x))} />
                  </div>
                  <button
                    type="button"
                    aria-label="Supprimer"
                    onClick={() => maj((d) => void d.reductions.ehpad.splice(k, 1))}
                    className="grid size-11 place-items-center rounded-xl text-ink-muted transition hover:bg-rose/10 hover:text-rose"
                  >
                    <Trash2 aria-hidden className="size-4" />
                  </button>
                </div>
              ))}
              {foyer.reductions.ehpad.length < (couple ? 2 : 1) && (
                <button type="button" onClick={() => maj((d) => void d.reductions.ehpad.push(0))} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                  <Plus aria-hidden className="size-4" /> Ajouter une personne hébergée
                </button>
              )}
            </div>
          </Collapsible>
        </div>
        {r.plafonnementNiches > 0 && (
          <div className="mt-4">
            <Note tone="warn">Le plafonnement global des niches fiscales ({formatEur(p.plafondNiches)}) réduit vos avantages de {formatEur(r.plafonnementNiches)}.</Note>
          </div>
        )}
      </Card>
    </div>
  );
}
