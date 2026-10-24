"use client";

import { Briefcase, Buildings as Building2, ChartLine as LineChart } from "@phosphor-icons/react/dist/ssr";
import { PARAMS } from "@/lib/fiscal/params";
import type { Foyer, TypeMicro } from "@/lib/fiscal/types";
import { formatEur, formatPct } from "@/lib/format";
import type { Maj } from "./useFoyer";
import { Card, Collapsible, Grid, Note, NumberField, Pill, Segmented, SelectField } from "./ui";

const MICRO_OPTIONS: { value: TypeMicro; label: string }[] = [
  { value: "aucun", label: "Aucune activité" },
  { value: "vente", label: "Micro-BIC : vente de marchandises (71 %)" },
  { value: "services", label: "Micro-BIC : prestations de services (50 %)" },
  { value: "bnc", label: "Micro-BNC : profession libérale (34 %)" },
  { value: "meubleLongueDuree", label: "Location meublée longue durée (50 %)" },
  { value: "meubleTourismeClasse", label: "Meublé de tourisme classé (50 %)" },
  { value: "meubleTourismeNonClasse", label: "Meublé de tourisme non classé (30 %)" },
];

export function AdultTabs({ foyer, actif, onChange }: { foyer: Foyer; actif: number; onChange: (i: number) => void }) {
  if (foyer.situation !== "couple") return null;
  return (
    <Segmented
      value={actif}
      onChange={onChange}
      options={foyer.adultes.map((a, i) => ({ value: i, label: a.prenom || `Déclarant ${i + 1}` }))}
    />
  );
}

export function StepRevenus({ foyer, maj, actif, setActif }: { foyer: Foyer; maj: Maj; actif: number; setActif: (i: number) => void }) {
  const p = PARAMS[foyer.annee];
  const i = foyer.situation === "couple" ? actif : 0;
  const a = foyer.adultes[i];

  return (
    <div className="space-y-5">
      <AdultTabs foyer={foyer} actif={actif} onChange={setActif} />

      <Card
        title={`Revenus de ${a.prenom || `Déclarant ${i + 1}`}`}
        icon={<Briefcase className="size-5" />}
        description="Montants annuels nets imposables, tels qu'ils figurent sur vos bulletins de décembre ou attestations."
      >
        <Grid>
          <NumberField
            label="Salaires nets imposables"
            value={a.salaires}
            onChange={(v) => maj((d) => void (d.adultes[i].salaires = v))}
            hint="« Net imposable » cumulé sur l'année, heures sup. exonérées exclues."
          />
          <NumberField
            label="Allocations chômage"
            value={a.chomage}
            onChange={(v) => maj((d) => void (d.adultes[i].chomage = v))}
            hint="Bénéficient du même abattement que les salaires."
          />
          <NumberField
            label="Pensions et retraites"
            value={a.pensions}
            onChange={(v) => maj((d) => void (d.adultes[i].pensions = v))}
            hint={`Abattement de 10 %, plafonné à ${formatEur(p.abattementPensions.maxFoyer)} par foyer.`}
          />
        </Grid>

        <div className="mt-5">
          <Collapsible
            title="Activité indépendante ou location meublée"
            subtitle="Régimes micro-BIC et micro-BNC"
            defaultOpen={a.micro.type !== "aucun"}
            badge={a.micro.type !== "aucun" ? <Pill>actif</Pill> : null}
          >
            <Grid>
              <SelectField
                label="Type d'activité"
                value={a.micro.type}
                onChange={(v) => maj((d) => void (d.adultes[i].micro.type = v))}
                options={MICRO_OPTIONS}
              />
              {a.micro.type !== "aucun" && (
                <NumberField
                  label="Chiffre d'affaires / recettes annuelles"
                  value={a.micro.chiffreAffaires}
                  onChange={(v) => maj((d) => void (d.adultes[i].micro.chiffreAffaires = v))}
                  hint={`Plafond du régime micro : ${formatEur(p.micro[a.micro.type].seuil)}.`}
                />
              )}
            </Grid>
            <div className="mt-3">
              <Note>Hors versement libératoire. Les cotisations sociales des indépendants ne sont pas calculées ici.</Note>
            </div>
          </Collapsible>
        </div>
      </Card>

      <Card title="Revenus fonciers" icon={<Building2 className="size-5" />} description="Loyers de locations vides, pour l'ensemble du foyer.">
        <Segmented
          size="sm"
          value={foyer.foncier.regime}
          onChange={(v) => maj((d) => void (d.foncier.regime = v))}
          options={[
            { value: "micro", label: "Micro-foncier" },
            { value: "reel", label: "Régime réel" },
          ]}
        />
        <div className="mt-4">
          <Grid>
            <NumberField
              label="Loyers bruts encaissés"
              value={foyer.foncier.recettes}
              onChange={(v) => maj((d) => void (d.foncier.recettes = v))}
              hint={foyer.foncier.regime === "micro" ? "Abattement forfaitaire de 30 %, jusqu'à 15 000 € de loyers." : undefined}
            />
            {foyer.foncier.regime === "reel" && (
              <NumberField
                label="Charges déductibles"
                value={foyer.foncier.charges}
                onChange={(v) => maj((d) => void (d.foncier.charges = v))}
                hint={`Travaux, intérêts, taxe foncière, gestion… Déficit imputable jusqu'à ${formatEur(p.foncier.deficitImputableMax)}.`}
              />
            )}
          </Grid>
        </div>
      </Card>

      <Card title="Placements financiers" icon={<LineChart className="size-5" />} description="Dividendes et intérêts hors PEA, livrets réglementés et assurance-vie.">
        <Grid>
          <NumberField label="Dividendes bruts" value={foyer.capitaux.dividendes} onChange={(v) => maj((d) => void (d.capitaux.dividendes = v))} />
          <NumberField label="Intérêts (comptes à terme, obligations…)" value={foyer.capitaux.interets} onChange={(v) => maj((d) => void (d.capitaux.interets = v))} />
        </Grid>
        <div className="mt-4">
          <Segmented
            size="sm"
            label="Mode d'imposition"
            value={foyer.capitaux.option}
            onChange={(v) => maj((d) => void (d.capitaux.option = v))}
            options={[
              { value: "pfu", label: `Flat tax (${formatPct(p.capitaux.pfuIR)} + PS)` },
              { value: "bareme", label: "Barème progressif" },
            ]}
          />
        </div>
        <div className="mt-3">
          <Note>
            Le barème applique un abattement de 40 % sur les dividendes ; il est souvent intéressant si votre TMI est de 0 % ou 11 %.
            Prélèvements sociaux : {formatPct(p.capitaux.psCapitaux)}.
          </Note>
        </div>
      </Card>
    </div>
  );
}
