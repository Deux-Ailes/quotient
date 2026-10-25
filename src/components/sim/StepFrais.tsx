"use client";

import { Car, GraduationCap, Plus, Scales as Scale, Trash as Trash2, ForkKnife as UtensilsCrossed, Wrench } from "@phosphor-icons/react/dist/ssr";
import { nouveauVehicule } from "@/lib/fiscal/defaults";
import type { Resultat } from "@/lib/fiscal/engine";
import { PARAMS } from "@/lib/fiscal/params";
import type { Foyer, Vehicule } from "@/lib/fiscal/types";
import { formatEur, formatEurCents, formatNombre } from "@/lib/format";
import { AdultTabs } from "./StepRevenus";
import { CarteTeletravail } from "./CarteTeletravail";
import { ResumeFraisReels } from "./ResumeFraisReels";
import type { Maj } from "./useFoyer";
import { Card, Collapsible, Grid, Note, NumberField, Pill, Segmented, SelectField, Switch } from "./ui";

const TYPES_VEHICULE: { value: Vehicule["type"]; label: string }[] = [
  { value: "voiture", label: "Voiture thermique ou hybride" },
  { value: "voiture_electrique", label: "Voiture électrique (+20 %)" },
  { value: "moto", label: "Moto" },
  { value: "moto_electrique", label: "Moto électrique (+20 %)" },
  { value: "cyclomoteur", label: "Cyclomoteur ≤ 50 cm³" },
];

export function StepFrais({
  foyer,
  maj,
  resultat,
  actif,
  setActif,
}: {
  foyer: Foyer;
  maj: Maj;
  resultat: Resultat;
  actif: number;
  setActif: (i: number) => void;
}) {
  const p = PARAMS[foyer.annee];
  const i = foyer.situation === "couple" ? actif : 0;
  const a = foyer.adultes[i];
  const r = resultat.adultes[i];
  const f = a.frais;
  const sansSalaire = a.salaires + a.chomage <= 0;

  return (
    <div className="space-y-5">
      <AdultTabs foyer={foyer} actif={actif} onChange={setActif} />

      {/* Comparatif */}
      <section className="overflow-hidden rounded-3xl bg-night p-5 text-white shadow-lift sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-white/10">
              <Scale className="size-5" />
            </span>
            <div>
              <p className="font-semibold">10 % ou frais réels ?</p>
              <p className="text-sm text-white/60">{a.prenom || `Déclarant ${i + 1}`}</p>
            </div>
          </div>
          <Segmented
            size="sm"
            value={a.modeFrais}
            onChange={(v) => maj((d) => void (d.adultes[i].modeFrais = v))}
            options={[
              { value: "auto", label: "Auto" },
              { value: "forfait", label: "10 %" },
              { value: "reels", label: "Réels" },
            ]}
          />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {(["forfait", "reels"] as const).map((m) => {
            const retenu = r.modeRetenu === m;
            const montant = m === "forfait" ? r.abattementForfaitaire : r.fraisReels.total;
            return (
              <div key={m} className={`rounded-2xl p-4 transition ${retenu ? "bg-surface text-ink" : "bg-white/5 ring-1 ring-white/10"}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm ${retenu ? "text-ink-soft" : "text-white/60"}`}>{m === "forfait" ? "Abattement 10 %" : "Frais réels"}</p>
                  {retenu && <Pill tone="mint">retenu</Pill>}
                </div>
                <p className="tabular mt-1 font-display text-2xl font-bold">{formatEur(montant)}</p>
              </div>
            );
          })}
        </div>
        {r.modeRetenu === "reels" && r.gainFraisReels > 0 && (
          <p className="mt-4 text-sm text-white/70">
            Les frais réels réduisent le revenu imposable de <strong className="text-white">{formatEur(r.gainFraisReels)}</strong> de plus que
            l&apos;abattement.
          </p>
        )}
        {a.modeFrais === "reels" && r.gainFraisReels < 0 && (
          <p className="mt-4 text-sm text-amber">Attention : l&apos;abattement de 10 % serait plus avantageux.</p>
        )}
      </section>

      {sansSalaire && <Note tone="warn">Aucun salaire saisi pour ce déclarant : les frais réels ne s&apos;appliquent qu&apos;aux salaires et allocations chômage.</Note>}

      {/* Véhicules */}
      <Card
        title="Trajets domicile-travail"
        icon={<Car className="size-5" />}
        description="Barème kilométrique officiel, plafond de 40 km par trajet sauf circonstances particulières."
        action={
          <button
            type="button"
            onClick={() => maj((d) => void d.adultes[i].frais.vehicules.push(nouveauVehicule()))}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-2 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white"
          >
            <Plus className="size-4" /> Véhicule
          </button>
        }
      >
        {f.vehicules.length === 0 ? (
          <button
            type="button"
            onClick={() => maj((d) => void d.adultes[i].frais.vehicules.push(nouveauVehicule()))}
            className="w-full rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-ink-muted transition hover:border-brand hover:text-brand"
          >
            Ajouter un véhicule pour calculer vos frais kilométriques
          </button>
        ) : (
          <div className="space-y-4">
            {f.vehicules.map((v, k) => {
              const detail = r.fraisReels.vehicules.find((x) => x.id === v.id);
              const set = (recette: (vv: Vehicule) => void) => maj((d) => recette(d.adultes[i].frais.vehicules[k]));
              const voiture = v.type === "voiture" || v.type === "voiture_electrique";
              const moto = v.type === "moto" || v.type === "moto_electrique";
              return (
                <div key={v.id} className="rounded-2xl bg-canvas/60 p-4 ring-1 ring-line">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">Véhicule {k + 1}</p>
                      <p className="tabular text-xs text-ink-muted">
                        {formatNombre(detail?.km ?? 0)} km/an · <span className="font-semibold text-brand">{formatEur(detail?.montant ?? 0)}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="Supprimer le véhicule"
                      onClick={() => maj((d) => void d.adultes[i].frais.vehicules.splice(k, 1))}
                      className="grid size-8 place-items-center rounded-full text-ink-muted transition hover:bg-rose/10 hover:text-rose"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <Grid>
                    <SelectField label="Type" value={v.type} onChange={(x) => set((vv) => void (vv.type = x))} options={TYPES_VEHICULE} />
                    {voiture && (
                      <SelectField
                        label="Puissance fiscale"
                        value={v.puissanceVoiture}
                        onChange={(x) => set((vv) => void (vv.puissanceVoiture = x))}
                        options={[
                          { value: "3", label: "3 CV et moins" },
                          { value: "4", label: "4 CV" },
                          { value: "5", label: "5 CV" },
                          { value: "6", label: "6 CV" },
                          { value: "7", label: "7 CV et plus" },
                        ]}
                      />
                    )}
                    {moto && (
                      <SelectField
                        label="Puissance fiscale"
                        value={v.puissanceMoto}
                        onChange={(x) => set((vv) => void (vv.puissanceMoto = x))}
                        options={[
                          { value: "1-2", label: "1 ou 2 CV" },
                          { value: "3-5", label: "3 à 5 CV" },
                          { value: "6", label: "Plus de 5 CV" },
                        ]}
                      />
                    )}
                    <NumberField label="Distance domicile-travail (aller)" suffix="km" step={0.1} value={v.distanceAller} onChange={(x) => set((vv) => void (vv.distanceAller = x))} />
                    <NumberField
                      label="Jours travaillés sur site"
                      suffix="jours"
                      value={v.joursParAn}
                      onChange={(x) => set((vv) => void (vv.joursParAn = Math.round(x)))}
                      hint="Environ 218 jours pour un temps plein, hors télétravail."
                    />
                    <NumberField
                      label="Autres km professionnels"
                      suffix="km"
                      value={v.kmSupplementaires}
                      onChange={(x) => set((vv) => void (vv.kmSupplementaires = x))}
                      hint="Déplacements non remboursés par l'employeur."
                    />
                    <NumberField label="Péages et parkings" value={v.peagesParking} onChange={(x) => set((vv) => void (vv.peagesParking = x))} />
                  </Grid>
                  <div className="mt-3 grid gap-1 sm:grid-cols-2">
                    <Switch
                      checked={v.allerRetoursParJour === 2}
                      onChange={(x) => set((vv) => void (vv.allerRetoursParJour = x ? 2 : 1))}
                      label="Retour au domicile le midi"
                      hint="Admis seulement pour raisons particulières (santé, horaires…)."
                    />
                    {v.distanceAller > p.fraisReels.plafondDistanceKm && (
                      <Switch
                        checked={v.depasse40Justifie}
                        onChange={(x) => set((vv) => void (vv.depasse40Justifie = x))}
                        label="Distance > 40 km justifiée"
                        hint="Emploi précaire, conjoint, difficultés de logement…"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-4">
          <NumberField
            label="Transports en commun (part non remboursée)"
            value={f.transportsCommun}
            onChange={(v) => maj((d) => void (d.adultes[i].frais.transportsCommun = v))}
          />
        </div>
      </Card>

      {/* Repas */}
      <Card
        title="Repas sur le lieu de travail"
        icon={<UtensilsCrossed className="size-5" />}
        description={`Déductible : prix du repas (plafonné à ${formatEurCents(p.fraisReels.repas.plafond)}) moins ${formatEurCents(p.fraisReels.repas.valeurForfaitaire)} de valeur d'un repas à domicile.`}
        action={<span className="tabular text-sm font-semibold text-brand">{formatEur(r.fraisReels.repas)}</span>}
      >
        <Grid cols={3}>
          <NumberField label="Nombre de repas" suffix="repas" value={f.repas.jours} onChange={(v) => maj((d) => void (d.adultes[i].frais.repas.jours = Math.round(v)))} />
          <NumberField label="Prix moyen" step={0.1} value={f.repas.prixMoyen} onChange={(v) => maj((d) => void (d.adultes[i].frais.repas.prixMoyen = v))} />
          <NumberField
            label="Part employeur / repas"
            step={0.1}
            value={f.repas.participationEmployeur}
            onChange={(v) => maj((d) => void (d.adultes[i].frais.repas.participationEmployeur = v))}
            hint="Part patronale du titre-restaurant."
          />
        </Grid>
      </Card>

      {/* Télétravail */}
      <CarteTeletravail
        t={f.teletravail}
        set={(recette) => maj((d) => recette(d.adultes[i].frais.teletravail))}
        remboursements={f.remboursementsEmployeur}
        setRemboursements={(v) => maj((d) => void (d.adultes[i].frais.remboursementsEmployeur = v))}
        p={p}
      />

      {/* Autres */}
      <Card title="Autres frais professionnels" icon={<Wrench className="size-5" />} description="Uniquement les dépenses non remboursées et justifiables.">
        <div className="space-y-3">
          <Collapsible title="Matériel informatique et outillage" subtitle={`Amorti sur ${p.fraisReels.dureeAmortissementMateriel} ans au-delà de ${p.fraisReels.seuilAmortissementMateriel} € HT`} badge={r.fraisReels.materiel > 0 ? <Pill>{formatEur(r.fraisReels.materiel)}</Pill> : null}>
            <Grid>
              <NumberField label="Prix d'achat" value={f.materiel.prix} onChange={(v) => maj((d) => void (d.adultes[i].frais.materiel.prix = v))} />
              <NumberField label="Usage professionnel" suffix="%" max={100} value={f.materiel.usagePro} onChange={(v) => maj((d) => void (d.adultes[i].frais.materiel.usagePro = v))} />
            </Grid>
          </Collapsible>
          <Collapsible title="Formation, documentation, vêtements" badge={r.fraisReels.formation + r.fraisReels.documentation + r.fraisReels.vetements > 0 ? <Pill>{formatEur(r.fraisReels.formation + r.fraisReels.documentation + r.fraisReels.vetements)}</Pill> : null}>
            <Grid cols={3}>
              <NumberField label="Formation" value={f.formation} onChange={(v) => maj((d) => void (d.adultes[i].frais.formation = v))} />
              <NumberField label="Documentation" value={f.documentation} onChange={(v) => maj((d) => void (d.adultes[i].frais.documentation = v))} />
              <NumberField label="Vêtements spécifiques" value={f.vetements} onChange={(v) => maj((d) => void (d.adultes[i].frais.vetements = v))} hint="Tenues de travail, EPI, entretien." />
            </Grid>
          </Collapsible>
          <Collapsible title="Double résidence" subtitle="Loyer du second logement pour raisons professionnelles" badge={f.doubleResidence > 0 ? <Pill>{formatEur(f.doubleResidence)}</Pill> : null}>
            <NumberField
              label="Frais de double résidence"
              value={f.doubleResidence}
              onChange={(v) => maj((d) => void (d.adultes[i].frais.doubleResidence = v))}
              hint="Loyer, charges, frais de déménagement. Ajoutez les trajets hebdomadaires comme un véhicule."
            />
          </Collapsible>
          <Collapsible title="Cotisations syndicales" subtitle="En frais réels, ou crédit d'impôt de 66 % sinon" badge={f.cotisationsSyndicales > 0 ? <Pill>{formatEur(f.cotisationsSyndicales)}</Pill> : null}>
            <NumberField
              label="Cotisations versées"
              value={f.cotisationsSyndicales}
              onChange={(v) => maj((d) => void (d.adultes[i].frais.cotisationsSyndicales = v))}
              hint="Retenues dans la limite de 1 % des salaires."
            />
          </Collapsible>
          <Collapsible title="Autres frais" badge={f.autres > 0 ? <Pill>{formatEur(f.autres)}</Pill> : null}>
            <NumberField label="Montant" value={f.autres} onChange={(v) => maj((d) => void (d.adultes[i].frais.autres = v))} hint="Frais de recherche d'emploi, bureau à domicile pour non-télétravailleurs…" />
          </Collapsible>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-ink-muted">
          <GraduationCap className="size-4" /> Conservez vos justificatifs pendant 3 ans.
        </div>
      </Card>

      <ResumeFraisReels foyer={foyer} r={resultat} />
    </div>
  );
}
