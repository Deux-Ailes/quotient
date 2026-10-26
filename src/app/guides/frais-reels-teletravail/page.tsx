import type { Metadata } from "next";
import Link from "next/link";
import { EncartSimulateur, GuideLayout } from "@/components/guides/GuideLayout";
import { teletravailVide } from "@/lib/fiscal/defaults";
import { fraisTeletravail } from "@/lib/fiscal/fraisReels";
import { PARAMS_2026 } from "@/lib/fiscal/params";
import type { Teletravail } from "@/lib/fiscal/types";
import { formatEur, formatEurCents, formatPct } from "@/lib/format";
import { guide } from "@/lib/guides";
import { IMAGE_PARTAGE } from "@/lib/site";

const g = guide("frais-reels-teletravail");

export const metadata: Metadata = {
  title: g.titreSEO,
  description: g.description,
  alternates: { canonical: `/guides/${g.slug}/` },
  openGraph: { type: "article", locale: "fr_FR", title: g.titreSEO, description: g.description, url: `/guides/${g.slug}/`, images: [IMAGE_PARTAGE] },
  twitter: { card: "summary_large_image", title: g.titreSEO, description: g.description, images: [IMAGE_PARTAGE.url] },
};

const p = PARAMS_2026;
const tt = p.fraisReels.teletravail;

/** Exemple : locataire, bureau de 10 m² dans 70 m², 146 jours de télétravail. Calculé par le moteur du simulateur. */
const exemple: Teletravail = {
  ...teletravailVide(),
  mode: "reel",
  jours: 146,
  statut: "locataire",
  surfaceBureau: 10,
  surfaceLogement: 70,
  pieceDediee: true,
  depenses: { loyer: 9600, chargesLocatives: 600, electricite: 900, chauffage: 700, eau: 300, assurance: 200, taxeFonciere: 0, chargesCopropriete: 0, entretien: 0 },
  internet: { montant: 480, usagePro: 50 },
  equipements: [
    { id: "ecran", libelle: "Écran", prix: 230, usagePro: 100, categorie: "informatique" },
    { id: "fauteuil", libelle: "Fauteuil de bureau", prix: 480, usagePro: 100, categorie: "mobilier" },
    { id: "pc", libelle: "Ordinateur portable", prix: 1200, usagePro: 100, categorie: "informatique" },
  ],
};
const reel = fraisTeletravail(exemple, p);
const forfait = fraisTeletravail({ ...exemple, mode: "forfait" }, p);

// Chaque ligne du tableau est arrondie à l'euro : les totaux additionnent les montants affichés.
const r = Math.round;
const lignesEquipements = reel.equipements.map((e) => r(e.montant));
const totalEquipements = lignesEquipements.reduce((s, v) => s + v, 0);
const totalReel = r(reel.localFixes) + r(reel.localEnergies) + r(reel.internet) + totalEquipements;
const totalForfait = r(forfait.forfait) + totalEquipements;

export default function GuideTeletravail() {
  return (
    <GuideLayout
      guide={g}
      intro={
        <p>
          Si vous travaillez chez vous, une partie de votre loyer, de vos factures d&apos;énergie, de votre box internet et de votre matériel peut être
          déduite de vos revenus. Deux méthodes existent : un forfait par jour, simple, ou les frais réels, plus avantageux dès que le logement coûte
          cher. Voici comment calculer les deux.
        </p>
      }
      sources={[
        { libelle: "Service-Public : frais réels des salariés (F1989)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F1989" },
        { libelle: "BOFiP : frais de locaux professionnels (BOI-RSA-BASE-30-50-30-30)", url: "https://bofip.impots.gouv.fr/bofip/7671-PGP.html" },
        { libelle: "BOFiP : matériel, mobilier et communications (BOI-RSA-BASE-30-50-30-40)", url: "https://bofip.impots.gouv.fr/bofip/7672-PGP.html" },
      ]}
    >
      <h2>Le préalable : opter pour les frais réels</h2>
      <p>
        Les frais de télétravail ne se déduisent que si vous renoncez à l&apos;abattement automatique de 10 % sur vos salaires. Ce choix vaut pour
        l&apos;ensemble de vos frais professionnels de l&apos;année : trajets, repas, télétravail, formation. Il n&apos;est intéressant que si le total
        dépasse l&apos;abattement. Le guide <Link href="/guides/frais-reels-ou-abattement-10/">frais réels ou abattement de 10 %</Link> détaille cette
        comparaison.
      </p>
      <p>
        Autre condition : les allocations de télétravail versées par votre employeur doivent alors être ajoutées à votre salaire imposable. Elles sont
        exonérées tant que vous restez à l&apos;abattement, mais plus si vous passez aux frais réels.
      </p>

      <h2>Méthode 1 : le forfait journalier</h2>
      <p>
        L&apos;administration admet une évaluation forfaitaire de <strong>{formatEurCents(tt.parJour)} par jour de télétravail</strong>, dans la limite de{" "}
        {formatEurCents(tt.plafondMensuel)} par mois et {formatEurCents(tt.plafondAnnuel)} par an. Ce montant est confirmé pour les revenus 2025 par la
        brochure pratique 2026. Il couvre les frais de local, d&apos;énergie et de connexion, sans justificatif de dépenses : il suffit de pouvoir prouver les jours
        télétravaillés (accord ou attestation de l&apos;employeur).
      </p>
      <p>
        Le mobilier et le matériel achetés pour travailler ne sont pas couverts par ce forfait. Ils peuvent s&apos;y ajouter selon les règles décrites plus
        bas.
      </p>

      <h2>Méthode 2 : les frais réels du logement</h2>
      <h3>1. Calculer la quote-part de surface</h3>
      <p>
        Les dépenses communes au logement sont déductibles en proportion de la surface du bureau par rapport à la surface totale. Un bureau de 10 m² dans
        un appartement de 70 m² donne une quote-part de {formatPct(10 / 70)}. Deux limites :
      </p>
      <ul>
        <li>
          <strong>Une pièce, pas plus</strong> dans un logement de plusieurs pièces. Dans un studio, au plus la moitié de la surface.
        </li>
        <li>
          <strong>Pièce dédiée ou non</strong> : si le bureau est exclusivement réservé au travail, la quote-part de surface s&apos;applique toute
          l&apos;année. S&apos;il sert aussi à la famille (salon, chambre d&apos;amis), seule la part d&apos;usage professionnel est retenue, que Quotient
          estime par le nombre de jours télétravaillés sur l&apos;année.
        </li>
      </ul>

      <h3>2. Lister les dépenses selon votre statut</h3>
      <p>Chacun ne déduit que ce qui lui incombe réellement :</p>
      <ul>
        <li>
          <strong>Locataire</strong> : loyer hors charges, charges locatives, assurance habitation, électricité, chauffage, eau, entretien.
        </li>
        <li>
          <strong>Propriétaire</strong> : taxe foncière, charges de copropriété, assurance, énergies, entretien. Ni le prix d&apos;achat, ni un loyer
          fictif, ni l&apos;amortissement du logement ne sont déductibles, et les intérêts d&apos;emprunt seulement dans des cas limités.
        </li>
      </ul>

      <h3>3. Distinguer charges fixes et énergies</h3>
      <p>
        Le loyer et les charges fixes courent toute l&apos;année : pour une pièce dédiée, on leur applique la quote-part de surface. Les énergies (électricité,
        chauffage, eau) ne sont consommées pour le travail que les jours télétravaillés : Quotient leur applique en plus la proportion{" "}
        <em>jours télétravaillés ÷ 365</em>. Aucun texte ne fixe cette répartition dans le détail : c&apos;est une méthode prudente, facile à justifier en
        cas de question.
      </p>

      <h3>4. Ajouter internet, téléphone et matériel</h3>
      <ul>
        <li>
          <strong>Internet et téléphone</strong> : l&apos;abonnement au prorata de l&apos;usage professionnel (par exemple 50 %).
        </li>
        <li>
          <strong>Matériel et mobilier</strong> : un bien dont la valeur ne dépasse pas {formatEur(p.fraisReels.seuilAmortissementMateriel)} HT se déduit
          l&apos;année de l&apos;achat. Au-delà, on déduit une annuité d&apos;amortissement : sur {p.fraisReels.dureeAmortissementMateriel} ans pour
          l&apos;informatique, sur sa durée d&apos;usage pour le mobilier ({p.fraisReels.dureeAmortissementMobilier} ans dans Quotient). Toujours au prorata
          de l&apos;usage professionnel.
        </li>
      </ul>

      <h2>Exemple chiffré</h2>
      <p>
        Camille est locataire d&apos;un 70 m² et télétravaille {exemple.jours} jours par an (environ 3 jours par semaine) dans une pièce de 10 m²
        réservée au travail. Cette année, elle a acheté un écran, un fauteuil et un ordinateur portable.
      </p>
      <div className="tableau">
        <table>
          <thead>
            <tr>
              <th>Poste</th>
              <th>Calcul</th>
              <th className="nombre">Déductible</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Loyer, charges, assurance</td>
              <td>
                {formatEur(reel.depensesFixes)} × {formatPct(reel.quotePartFixes)}
              </td>
              <td className="nombre">{formatEur(reel.localFixes)}</td>
            </tr>
            <tr>
              <td>Électricité, chauffage, eau</td>
              <td>
                {formatEur(reel.depensesEnergies)} × {formatPct(reel.ratioSurface)} × {exemple.jours}/365
              </td>
              <td className="nombre">{formatEur(reel.localEnergies)}</td>
            </tr>
            <tr>
              <td>Internet</td>
              <td>{formatEur(exemple.internet.montant)} × 50 %</td>
              <td className="nombre">{formatEur(reel.internet)}</td>
            </tr>
            <tr>
              <td>Écran (230 € TTC)</td>
              <td>moins de 500 € HT : déduit en totalité</td>
              <td className="nombre">{formatEur(lignesEquipements[0])}</td>
            </tr>
            <tr>
              <td>Fauteuil (480 € TTC, soit 400 € HT)</td>
              <td>moins de 500 € HT : déduit en totalité</td>
              <td className="nombre">{formatEur(lignesEquipements[1])}</td>
            </tr>
            <tr>
              <td>Ordinateur (1 200 € TTC, soit 1 000 € HT)</td>
              <td>amorti sur 3 ans</td>
              <td className="nombre">{formatEur(lignesEquipements[2])}</td>
            </tr>
            <tr>
              <th>Total frais réels</th>
              <th />
              <th className="nombre">{formatEur(totalReel)}</th>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Au forfait, Camille aurait déduit {exemple.jours} × {formatEurCents(tt.parJour)} = {formatEur(forfait.forfait)}, plus le même matériel, soit{" "}
        <strong>{formatEur(totalForfait)}</strong>. Les frais réels lui permettent de déduire <strong>{formatEur(totalReel - totalForfait)}</strong> de
        plus. Avec un logement bon marché ou peu de jours télétravaillés, l&apos;écart se réduit, et le forfait reste plus simple.
      </p>

      <EncartSimulateur
        titre="Calculez votre propre quote-part"
        texte="Saisissez vos surfaces, vos dépenses et vos jours : le simulateur compare forfait et frais réels, et les intègre au calcul de l'impôt."
        lien="/simulateur/?etape=3"
      />

      <h2>Ce qu&apos;il faut conserver</h2>
      <ul>
        <li>Quittances de loyer ou avis de taxe foncière, factures d&apos;énergie, d&apos;eau, d&apos;assurance et d&apos;internet.</li>
        <li>Un plan ou une attestation des surfaces, et la preuve que la pièce est affectée au travail.</li>
        <li>L&apos;accord de télétravail ou une attestation de l&apos;employeur indiquant le nombre de jours.</li>
        <li>Les factures du matériel et du mobilier.</li>
      </ul>
      <p>
        Ces pièces ne sont pas à joindre à la déclaration, mais à garder trois ans. Le guide{" "}
        <Link href="/guides/justificatif-frais-reels/">justifier ses frais réels</Link> donne un modèle de détail du calcul à indiquer.
      </p>

      <h2>Questions fréquentes</h2>
      <h3>Peut-on cumuler le forfait et les frais réels du logement ?</h3>
      <p>
        Non : pour le local, l&apos;énergie et la connexion, c&apos;est l&apos;un ou l&apos;autre. En revanche, le matériel et le mobilier peuvent
        s&apos;ajouter au forfait.
      </p>
      <h3>Et si mon employeur me verse déjà une allocation ?</h3>
      <p>
        Si vous optez pour les frais réels, ajoutez l&apos;allocation à votre salaire imposable, puis déduisez vos frais. L&apos;opération n&apos;est
        intéressante que si vos frais dépassent l&apos;allocation.
      </p>
      <h3>Le télétravail suffit-il à passer aux frais réels ?</h3>
      <p>
        Rarement à lui seul, car l&apos;abattement de 10 % est souvent plus élevé. C&apos;est le cumul avec les trajets des jours sur site et les repas qui
        fait basculer le calcul.
      </p>
    </GuideLayout>
  );
}
