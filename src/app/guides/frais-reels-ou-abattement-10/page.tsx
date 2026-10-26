import type { Metadata } from "next";
import Link from "next/link";
import { EncartSimulateur, GuideLayout } from "@/components/guides/GuideLayout";
import { nouveauVehicule } from "@/lib/fiscal/defaults";
import { simuler } from "@/lib/fiscal/engine";
import { foyerExemple } from "@/lib/fiscal/exemple";
import { fraisVehicule } from "@/lib/fiscal/fraisReels";
import { PARAMS_2025, PARAMS_2026 } from "@/lib/fiscal/params";
import { formatEur, formatNombre } from "@/lib/format";
import { guide } from "@/lib/guides";
import { IMAGE_PARTAGE } from "@/lib/site";

const g = guide("frais-reels-ou-abattement-10");

export const metadata: Metadata = {
  title: g.titreSEO,
  description: g.description,
  alternates: { canonical: `/guides/${g.slug}/` },
  openGraph: { type: "article", locale: "fr_FR", title: g.titreSEO, description: g.description, url: `/guides/${g.slug}/`, images: [IMAGE_PARTAGE] },
  twitter: { card: "summary_large_image", title: g.titreSEO, description: g.description, images: [IMAGE_PARTAGE.url] },
};

const p = PARAMS_2026;
const JOURS = 218;

const abattement = (salaire: number) => Math.min(p.abattementSalaires.max, Math.max(p.abattementSalaires.min, salaire * p.abattementSalaires.taux));

/** Distance aller (km) à partir de laquelle les seuls trajets en voiture 5 CV dépassent l'abattement. */
function seuilKm(salaire: number): number {
  const cible = abattement(salaire);
  for (let d = 1; d <= 40; d += 0.5) {
    if (fraisVehicule({ ...nouveauVehicule(), distanceAller: d, joursParAn: JOURS }, p).montant > cible) return d;
  }
  return Infinity;
}

const SALAIRES = [22000, 30000, 40000, 55000, 75000];
const seuils = SALAIRES.map((s) => ({ salaire: s, abattement: abattement(s), km: seuilKm(s) }));

// Exemple du simulateur : Camille (frais réels) et son conjoint (abattement).
const f = foyerExemple();
const avecReels = simuler(f);
const sansReels = simuler({ ...f, adultes: [{ ...f.adultes[0], modeFrais: "forfait" }, f.adultes[1]] });
const camille = avecReels.adultes[0];

export default function GuideAbattement() {
  return (
    <GuideLayout
      guide={g}
      intro={
        <p>
          Chaque salarié bénéficie automatiquement d&apos;un abattement de 10 % sur ses salaires pour frais professionnels. Mais si vos frais réels
          (trajets, repas, télétravail…) dépassent ce forfait, les déclarer fait baisser votre impôt. Voici comment savoir lequel choisir, avec des seuils
          chiffrés.
        </p>
      }
      sources={[
        { libelle: "Service-Public : frais professionnels, abattement de 10 % ou frais réels (F1989)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F1989" },
        { libelle: "BOFiP : barème kilométrique (BOI-BAREME-000001)", url: "https://bofip.impots.gouv.fr/bofip/2185-PGP.html" },
        { libelle: "BOFiP : frais de transport du domicile au lieu de travail (BOI-RSA-BASE-30-50-30-20)", url: "https://bofip.impots.gouv.fr/bofip/2161-PGP.html" },
      ]}
    >
      <h2>Comment fonctionne l&apos;abattement de 10 %</h2>
      <p>
        L&apos;administration retire automatiquement 10 % de vos salaires (et allocations chômage) avant de calculer l&apos;impôt. Rien à déclarer, aucun
        justificatif. Ce montant est encadré :
      </p>
      <div className="tableau">
        <table>
          <thead>
            <tr>
              <th>Revenus</th>
              <th className="nombre">Minimum</th>
              <th className="nombre">Maximum</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2025 (déclaration 2026)</td>
              <td className="nombre">{formatEur(PARAMS_2025.abattementSalaires.min)}</td>
              <td className="nombre">{formatEur(PARAMS_2025.abattementSalaires.max)}</td>
            </tr>
            <tr>
              <td>2026 (déclaration 2027, estimation)</td>
              <td className="nombre">{formatEur(p.abattementSalaires.min)}</td>
              <td className="nombre">{formatEur(p.abattementSalaires.max)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Les montants 2026 sont une estimation : ils seront fixés par la loi de finances 2027. Dans un couple, chacun bénéficie de son propre abattement.
      </p>

      <h2>Ce que comprennent les frais réels</h2>
      <p>Opter pour les frais réels, c&apos;est remplacer l&apos;abattement par la somme de vos dépenses professionnelles justifiées :</p>
      <ul>
        <li>
          <strong>Trajets domicile-travail</strong> au barème kilométrique, dans la limite de 40 km par trajet sauf circonstances particulières, plus
          péages et parking.
        </li>
        <li>
          <strong>Repas</strong> pris sur le lieu de travail, pour la part qui dépasse la valeur d&apos;un repas pris chez soi.
        </li>
        <li>
          <strong>Télétravail</strong> : forfait journalier ou quote-part du logement, voir le guide{" "}
          <Link href="/guides/frais-reels-teletravail/">frais réels de télétravail</Link>.
        </li>
        <li>
          <strong>Matériel, formation, documentation, vêtements spécifiques</strong>, double résidence, cotisations syndicales.
        </li>
      </ul>
      <p className="encadre">
        <strong>C&apos;est tout ou rien.</strong> On ne peut pas garder l&apos;abattement et ajouter un seul poste : les frais réels remplacent
        l&apos;abattement pour l&apos;ensemble des frais de l&apos;année. Le choix se fait en revanche séparément pour chaque membre du foyer.
      </p>

      <h2>À partir de combien de kilomètres les frais réels gagnent</h2>
      <p>
        Les trajets sont presque toujours le poste qui fait basculer le calcul. Le tableau ci-dessous indique la distance domicile-travail (aller) à
        partir de laquelle <strong>les seuls trajets</strong> en voiture de 5 CV, sur {JOURS} jours, dépassent l&apos;abattement de 10 %.
      </p>
      <div className="tableau">
        <table>
          <thead>
            <tr>
              <th>Salaire net imposable</th>
              <th className="nombre">Abattement de 10 %</th>
              <th className="nombre">Distance aller à partir de</th>
            </tr>
          </thead>
          <tbody>
            {seuils.map((s) => (
              <tr key={s.salaire}>
                <td>{formatEur(s.salaire)}</td>
                <td className="nombre">{formatEur(s.abattement)}</td>
                <td className="nombre">{Number.isFinite(s.km) ? `${formatNombre(s.km)} km` : "plus de 40 km"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Ces seuils baissent dès qu&apos;on ajoute d&apos;autres frais : des repas sur place, quelques jours de télétravail ou un véhicule électrique
        (+20 % sur le barème) suffisent souvent à rendre les frais réels intéressants à partir de 15 km.
      </p>

      <h2>Exemple : un couple, deux choix différents</h2>
      <p>
        Camille gagne {formatEur(camille.salairesBruts)}, fait {formatNombre(f.adultes[0].frais.vehicules[0].distanceAller)} km pour aller au travail{" "}
        {f.adultes[0].frais.vehicules[0].joursParAn} jours par an, déjeune sur place et télétravaille {f.adultes[0].frais.teletravail.jours} jours. Son conjoint
        gagne {formatEur(avecReels.adultes[1].salairesBruts)} et a peu de frais.
      </p>
      <ul>
        <li>
          Camille : abattement de {formatEur(camille.abattementForfaitaire)} contre <strong>{formatEur(camille.fraisReels.total)}</strong> de frais réels. Les
          frais réels sont retenus.
        </li>
        <li>Son conjoint garde l&apos;abattement de 10 %, plus favorable dans son cas.</li>
        <li>
          Résultat : l&apos;impôt du foyer passe de {formatEur(sansReels.impotNet)} à <strong>{formatEur(avecReels.impotNet)}</strong>, soit{" "}
          <strong>{formatEur(sansReels.impotNet - avecReels.impotNet)} d&apos;économie</strong>.
        </li>
      </ul>

      <EncartSimulateur
        titre="Faites le calcul pour votre foyer"
        texte="Le simulateur compare automatiquement l'abattement et les frais réels pour chaque déclarant et retient le plus avantageux."
        lien="/simulateur/?exemple&etape=3"
      />

      <h2>Les pièges à éviter</h2>
      <ul>
        <li>
          <strong>Oublier les remboursements de l&apos;employeur</strong> : indemnités kilométriques, allocation télétravail, prime de transport doivent être
          ajoutés au salaire déclaré si vous passez aux frais réels.
        </li>
        <li>
          <strong>Dépasser 40 km sans justification</strong> : au-delà, seuls 40 km sont retenus, sauf circonstances particulières (emploi du conjoint,
          précarité de l&apos;emploi, difficultés de logement).
        </li>
        <li>
          <strong>Compter deux allers-retours par jour</strong> : le retour le midi n&apos;est admis que pour des raisons particulières (santé, horaires).
        </li>
        <li>
          <strong>Ne pas garder les preuves</strong> : carte grise, distance, jours travaillés, notes de repas et factures sont à conserver trois ans.
        </li>
      </ul>

      <h2>Comment déclarer</h2>
      <p>
        Le montant total des frais réels se déclare case <strong>1AK</strong> (déclarant 1) ou <strong>1BK</strong> (déclarant 2), et l&apos;abattement de
        10 % ne s&apos;applique alors plus pour cette personne. Indiquez aussi le détail du calcul : le guide{" "}
        <Link href="/guides/justificatif-frais-reels/">justifier ses frais réels</Link> propose un modèle.
      </p>
    </GuideLayout>
  );
}
