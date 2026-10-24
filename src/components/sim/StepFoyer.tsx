"use client";

import { Baby, Heart, Plus, Trash2, User } from "lucide-react";
import { nouvelEnfant } from "@/lib/fiscal/defaults";
import type { Foyer } from "@/lib/fiscal/types";
import type { Maj } from "./useFoyer";
import { Card, Grid, Note, NumberField, Segmented, Switch, TextField } from "./ui";

export function StepFoyer({ foyer, maj }: { foyer: Foyer; maj: Maj }) {
  const couple = foyer.situation === "couple";
  const adultes = couple ? foyer.adultes : [foyer.adultes[0]];

  return (
    <div className="space-y-5">
      <Card title="Situation familiale" icon={<Heart className="size-5" />} description="Au 31 décembre de l'année des revenus.">
        <Segmented
          value={foyer.situation}
          onChange={(v) => maj((d) => void (d.situation = v))}
          options={[
            { value: "couple", label: "Marié(e) ou pacsé(e)" },
            { value: "celibataire", label: "Célibataire, divorcé(e), veuf(ve)" },
          ]}
        />
        {!couple && (
          <div className="mt-5 space-y-3">
            {foyer.enfants.length > 0 ? (
              <Switch
                checked={foyer.parentIsole}
                onChange={(v) => maj((d) => void (d.parentIsole = v))}
                label="Je vis seul(e) avec mes enfants (case T)"
                hint="Donne une demi-part supplémentaire aux parents isolés."
              />
            ) : (
              <Switch
                checked={foyer.caseL}
                onChange={(v) => maj((d) => void (d.caseL = v))}
                label="J'ai élevé seul(e) un enfant pendant au moins 5 ans (case L)"
                hint="Demi-part supplémentaire, avec un avantage plafonné."
              />
            )}
          </div>
        )}
      </Card>

      <Card title={couple ? "Les déclarants" : "Le déclarant"} icon={<User className="size-5" />}>
        <div className={`grid gap-6 ${couple ? "md:grid-cols-2" : ""}`}>
          {adultes.map((a, i) => (
            <div key={i} className="space-y-3 rounded-2xl bg-canvas/60 p-4 ring-1 ring-line">
              <TextField label="Prénom" value={a.prenom} onChange={(v) => maj((d) => void (d.adultes[i].prenom = v))} />
              <Switch
                checked={a.plus65ans}
                onChange={(v) => maj((d) => void (d.adultes[i].plus65ans = v))}
                label="65 ans ou plus"
                hint="Abattement spécial sous conditions de revenus."
              />
              <Switch
                checked={a.invalide}
                onChange={(v) => maj((d) => void (d.adultes[i].invalide = v))}
                label="Titulaire d'une carte d'invalidité (CMI)"
                hint="Demi-part supplémentaire et abattement spécial."
              />
            </div>
          ))}
        </div>
      </Card>

      <Card
        title="Enfants à charge"
        icon={<Baby className="size-5" />}
        description="Enfants mineurs, ou majeurs rattachés à votre foyer fiscal."
        action={
          <button
            type="button"
            onClick={() => maj((d) => void d.enfants.push(nouvelEnfant(`Enfant ${d.enfants.length + 1}`)))}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-2 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white"
          >
            <Plus className="size-4" /> Ajouter
          </button>
        }
      >
        {foyer.enfants.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-ink-muted">Aucun enfant à charge.</p>
        ) : (
          <div className="space-y-4">
            {foyer.enfants.map((e, i) => (
              <div key={e.id} className="rounded-2xl bg-canvas/60 p-4 ring-1 ring-line">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-semibold">{e.prenom || `Enfant ${i + 1}`}</p>
                  <button
                    type="button"
                    aria-label="Supprimer l'enfant"
                    onClick={() => maj((d) => void d.enfants.splice(i, 1))}
                    className="grid size-8 place-items-center rounded-full text-ink-muted transition hover:bg-rose/10 hover:text-rose"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <Grid>
                  <TextField label="Prénom" value={e.prenom} onChange={(v) => maj((d) => void (d.enfants[i].prenom = v))} />
                  <NumberField
                    label="Âge au 1er janvier"
                    suffix="ans"
                    max={30}
                    value={e.age}
                    placeholder="0"
                    onChange={(v) => maj((d) => void (d.enfants[i].age = Math.round(v)))}
                  />
                </Grid>
                <div className="mt-3 grid gap-1 sm:grid-cols-2">
                  <Switch checked={e.gardeAlternee} onChange={(v) => maj((d) => void (d.enfants[i].gardeAlternee = v))} label="Résidence alternée" />
                  <Switch checked={e.handicap} onChange={(v) => maj((d) => void (d.enfants[i].handicap = v))} label="Titulaire d'une carte d'invalidité" />
                </div>
              </div>
            ))}
          </div>
        )}
        {foyer.enfants.some((e) => e.age >= 18) && (
          <div className="mt-4">
            <Note>Un enfant majeur peut être rattaché s&apos;il a moins de 21 ans, ou moins de 25 ans s&apos;il poursuit des études.</Note>
          </div>
        )}
      </Card>
    </div>
  );
}
