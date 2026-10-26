import type { Metadata } from "next";
import Link from "next/link";
import { EncartSimulateur, GuideLayout } from "@/components/guides/GuideLayout";
import { nouveauVehicule } from "@/lib/fiscal/defaults";
import { fraisVehicule } from "@/lib/fiscal/fraisReels";
import { PARAMS_2026, type FormuleKm } from "@/lib/fiscal/params";
import type { Vehicule } from "@/lib/fiscal/types";
import { formatEur, formatNombre } from "@/lib/format";
import { guide } from "@/lib/guides";
import { IMAGE_PARTAGE } from "@/lib/site";

const g = guide("frais-kilometriques-2026");

export const metadata: Metadata = {
  title: g.titreSEO,
  description: g.description,
  alternates: { canonical: `/guides/${g.slug}/` },
  openGraph: { type: "article", locale: "fr_FR", title: g.titreSEO, description: g.description, url: `/guides/${g.slug}/`, images: [IMAGE_PARTAGE] },
  twitter: { card: "summary_large_image", title: g.titreSEO, description: g.description, images: [IMAGE_PARTAGE.url] },
};

const p = PARAMS_2026;
const km = p.bareme_km;
// Coefficients du barème : toujours 3 décimales, comme dans le texte officiel (0,529 ; 0,340…).
const formatCoef = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const coef = (c: number) => formatCoef.format(c);

/** Formule d'une tranche du barème, au format officiel : « d × 0,606 » ou « (d × 0,340) + 1 330 ». */
const formule = (f: FormuleKm, majoration = 1) =>
  f.fixe > 0 ? `(d × ${coef(f.coef * majoration)}) + ${formatNombre(Math.round(f.fixe * majoration))}` : `d × ${coef(f.coef * majoration)}`;

const VOITURES: [keyof typeof km.voiture, string][] = [
  ["3", "3 CV et moins"],
  ["4", "4 CV"],
  ["5", "5 CV"],
  ["6", "6 CV"],
  ["7", "7 CV et plus"],
];
const MOTOS: [keyof typeof km.moto, string][] = [
  ["1-2", "1 ou 2 CV"],
  ["3-5", "3 à 5 CV"],
  ["6", "Plus de 5 CV"],
];

const JOURS = 218;
const montant = (v: Partial<Vehicule>) => fraisVehicule({ ...nouveauVehicule(), joursParAn: JOURS, ...v }, p);
const EXEMPLES = [10, 20, 30, 40, 50].map((d) => ({
  d,
  km: montant({ distanceAller: d }).km,
  thermique: montant({ distanceAller: d }).montant,
  electrique: montant({ distanceAller: d, type: "voiture_electrique" }).montant,
}));

function TableBareme({ titre, lignes, bornes }: { titre: string; lignes: [string, FormuleKm[]][]; bornes: [string, string, string] }) {
  return (
    <div className="tableau">
      <table>
        <thead>
          <tr>
            <th>{titre}</th>
            {bornes.map((b) => (
              <th key={b}>{b}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lignes.map(([libelle, f]) => (
            <tr key={libelle}>
              <td>
                <strong>{libelle}</strong>
              </td>
              {f.map((t, k) => (
                <td key={k}>{formule(t)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function GuideFraisKilometriques() {
  return (
    <GuideLayout
      guide={g}
      intro={
        <p>
          Si vous allez travailler avec votre véhicule personnel, le barème kilométrique fiscal permet de déduire vos trajets aux frais réels. Il couvre
          en une seule formule le carburant, l&apos;entretien, l&apos;assurance et la dépréciation du véhicule. Voici le barème, les règles de distance et
          des exemples de calcul.
        </p>
      }
      sources={[
        { libelle: "BOFiP : barème kilométrique (BOI-BAREME-000001)", url: "https://bofip.impots.gouv.fr/bofip/2185-PGP.html" },
        { libelle: "BOFiP : frais de transport du domicile au lieu de travail (BOI-RSA-BASE-30-50-30-20)", url: "https://bofip.impots.gouv.fr/bofip/2161-PGP.html" },
        { libelle: "Service-Public : frais réels des salariés (F1989)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F1989" },
      ]}
    >
      <h2>Quel barème pour 2026 ?</h2>
      <p>
        Le barème kilométrique n&apos;a pas changé depuis les revenus 2022 : il s&apos;applique tel quel aux revenus 2025, déclarés en 2026. Pour les
        revenus 2026, une revalorisation est évoquée lors des débats sur la loi de finances 2027 ; tant qu&apos;elle n&apos;est pas votée, le barème
        ci-dessous reste la référence. Cette page sera mise à jour en cas de changement.
      </p>
      <p>
        Il se lit avec <strong>d</strong>, la distance professionnelle parcourue dans l&apos;année avec le véhicule. On choisit la colonne selon cette
        distance annuelle, puis on applique la formule de la ligne correspondant à la puissance fiscale indiquée sur la carte grise.
      </p>

      <h3>Voitures</h3>
      <TableBareme
        titre="Puissance"
        lignes={VOITURES.map(([k, l]) => [l, km.voiture[k]])}
        bornes={["Jusqu'à 5 000 km", "De 5 001 à 20 000 km", "Au-delà de 20 000 km"]}
      />

      <h3>Motocyclettes</h3>
      <TableBareme
        titre="Puissance"
        lignes={MOTOS.map(([k, l]) => [l, km.moto[k]])}
        bornes={["Jusqu'à 3 000 km", "De 3 001 à 6 000 km", "Au-delà de 6 000 km"]}
      />

      <h3>Cyclomoteurs (50 cm³ au plus)</h3>
      <TableBareme titre="Véhicule" lignes={[["Cyclomoteur", km.cyclomoteur]]} bornes={["Jusqu'à 3 000 km", "De 3 001 à 6 000 km", "Au-delà de 6 000 km"]} />

      <p className="encadre">
        <strong>Véhicule électrique : +20 %.</strong> Pour une voiture ou une moto 100 % électrique, le montant obtenu est majoré de{" "}
        {Math.round(p.fraisReels.majorationElectrique * 100)} %. Par exemple, pour une voiture électrique de 5 CV entre 5 001 et 20 000 km :{" "}
        {formule(km.voiture["5"][1], 1 + p.fraisReels.majorationElectrique)}.
      </p>

      <h2>Les règles de distance</h2>
      <ul>
        <li>
          <strong>40 km par trajet au plus</strong>, sauf circonstances particulières : au-delà, seuls les 40 premiers kilomètres sont retenus. Les
          exceptions admises tiennent à la situation personnelle (emploi du conjoint, emploi précaire, difficultés de logement, santé).
        </li>
        <li>
          <strong>Un aller-retour par jour</strong>. Le retour au domicile pour déjeuner n&apos;est admis que pour des raisons particulières (santé,
          horaires atypiques).
        </li>
        <li>
          <strong>Les jours réellement travaillés sur site</strong> : sans les congés, les jours de télétravail, les arrêts.
        </li>
        <li>
          <strong>Les autres déplacements professionnels</strong> non remboursés par l&apos;employeur (rendez-vous, formation) s&apos;ajoutent à la
          distance annuelle.
        </li>
      </ul>
      <p>
        <strong>Péages et frais de stationnement</strong> liés aux trajets professionnels s&apos;ajoutent au montant du barème, sur justificatifs. En
        revanche, carburant, entretien, assurance et réparations sont déjà compris dans le barème : on ne peut pas les ajouter.
      </p>

      <h2>Exemples de calcul</h2>
      <p>
        Pour une voiture de 5 CV utilisée {JOURS} jours par an (un temps plein, hors congés), avec un aller-retour par jour :
      </p>
      <div className="tableau">
        <table>
          <thead>
            <tr>
              <th>Distance aller</th>
              <th className="nombre">Kilomètres retenus</th>
              <th className="nombre">Thermique</th>
              <th className="nombre">Électrique</th>
            </tr>
          </thead>
          <tbody>
            {EXEMPLES.map((e) => (
              <tr key={e.d}>
                <td>
                  {e.d} km{e.d > p.fraisReels.plafondDistanceKm && " (plafonnés à 40 km)"}
                </td>
                <td className="nombre">{formatNombre(e.km)} km</td>
                <td className="nombre">{formatEur(e.thermique)}</td>
                <td className="nombre">{formatEur(e.electrique)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Exemple détaillé pour 30 km : 30 × 2 × {JOURS} jours = {formatNombre(EXEMPLES[2].km)} km par an, dans la tranche de 5 001 à 20 000 km. Formule :{" "}
        ({formatNombre(EXEMPLES[2].km)} × 0,357) + 1 395 = <strong>{formatEur(EXEMPLES[2].thermique)}</strong>.
      </p>

      <EncartSimulateur
        titre="Calculez vos frais kilométriques"
        texte="Plusieurs véhicules, électrique, distance plafonnée, péages : le simulateur applique le barème et compare avec l'abattement de 10 %."
        lien="/simulateur/?etape=3"
      />

      <h2>Frais kilométriques et abattement de 10 %</h2>
      <p>
        Le barème ne s&apos;utilise que si vous optez pour les frais réels, qui remplacent l&apos;abattement automatique de 10 % sur vos salaires. Le guide{" "}
        <Link href="/guides/frais-reels-ou-abattement-10/">frais réels ou abattement de 10 %</Link> donne, selon votre salaire, la distance à partir de
        laquelle vos trajets suffisent à rendre les frais réels plus intéressants.
      </p>
      <p>
        Le total se déclare case <strong>1AK</strong> (ou <strong>1BK</strong> pour le second déclarant), avec le détail du calcul : voir{" "}
        <Link href="/guides/justificatif-frais-reels/">justifier ses frais réels</Link>.
      </p>

      <h2>Questions fréquentes</h2>
      <h3>J&apos;utilise deux véhicules : comment faire ?</h3>
      <p>
        On applique le barème séparément à chaque véhicule, avec la distance parcourue par chacun, puis on additionne. Le simulateur gère plusieurs
        véhicules.
      </p>
      <h3>Et si mon employeur me rembourse une partie des trajets ?</h3>
      <p>
        Les indemnités kilométriques ou la prime de transport versées par l&apos;employeur doivent être ajoutées au salaire déclaré si vous passez aux
        frais réels.
      </p>
      <h3>Puis-je déduire mes frais de carburant réels à la place du barème ?</h3>
      <p>
        Oui, à condition de justifier l&apos;ensemble des dépenses réelles du véhicule (carburant, entretien, assurance, dépréciation) et la part
        professionnelle de son usage. C&apos;est plus contraignant ; le barème est la solution retenue par la plupart des salariés.
      </p>
    </GuideLayout>
  );
}
