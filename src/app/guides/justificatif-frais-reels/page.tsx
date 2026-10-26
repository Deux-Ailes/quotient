import type { Metadata } from "next";
import Link from "next/link";
import { EncartSimulateur, GuideLayout } from "@/components/guides/GuideLayout";
import { simuler } from "@/lib/fiscal/engine";
import { foyerExemple } from "@/lib/fiscal/exemple";
import { resumeFraisReels } from "@/lib/fiscal/resumeFraisReels";
import { guide } from "@/lib/guides";
import { IMAGE_PARTAGE } from "@/lib/site";

const g = guide("justificatif-frais-reels");

export const metadata: Metadata = {
  title: g.titreSEO,
  description: g.description,
  alternates: { canonical: `/guides/${g.slug}/` },
  openGraph: { type: "article", locale: "fr_FR", title: g.titreSEO, description: g.description, url: `/guides/${g.slug}/`, images: [IMAGE_PARTAGE] },
  twitter: { card: "summary_large_image", title: g.titreSEO, description: g.description, images: [IMAGE_PARTAGE.url] },
};

// Texte d'exemple produit par le simulateur pour le foyer de démonstration.
const f = foyerExemple();
const r = simuler(f);
const modele = resumeFraisReels(f.adultes[0], r.adultes[0], r.params, 0);

const PIECES: [string, string][] = [
  ["Trajets", "Carte grise du véhicule, justificatif de domicile et adresse du lieu de travail, relevé des jours travaillés sur site, tickets de péage et de parking."],
  ["Repas", "Relevé des jours de repas pris sur place, notes ou relevés de carte, et le cas échéant la part employeur des titres-restaurant (bulletins de paie)."],
  ["Télétravail", "Accord ou attestation de télétravail avec le nombre de jours ; au réel : quittances, factures d'énergie et d'internet, surfaces du logement."],
  ["Matériel", "Factures d'achat datées, avec le prix hors taxes pour vérifier le seuil de 500 € HT."],
  ["Autres frais", "Factures de formation, de documentation, de vêtements spécifiques, reçus de cotisations syndicales."],
];

export default function GuideJustificatif() {
  return (
    <GuideLayout
      guide={g}
      intro={
        <p>
          Déclarer ses frais réels, c&apos;est indiquer un montant global, mais aussi être capable d&apos;expliquer comment il a été obtenu. Un détail
          clair, poste par poste, avec les calculs, évite la plupart des demandes de l&apos;administration et vous fait gagner du temps si elle en adresse
          une.
        </p>
      }
      sources={[
        { libelle: "Service-Public : frais réels des salariés, justificatifs et conservation (F1989)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F1989" },
        { libelle: "BOFiP : frais de transport et distance de 40 km (BOI-RSA-BASE-30-50-30-20)", url: "https://bofip.impots.gouv.fr/bofip/2161-PGP.html" },
        { libelle: "impots.gouv.fr : simulateurs et déclaration en ligne", url: "https://www.impots.gouv.fr/simulateurs" },
      ]}
    >
      <h2>Où déclarer les frais réels</h2>
      <p>
        Le montant total se reporte case <strong>1AK</strong> pour le déclarant 1 et <strong>1BK</strong> pour le déclarant 2, dans la rubrique des
        traitements et salaires. Dès que cette case est remplie, l&apos;abattement automatique de 10 % ne s&apos;applique plus pour cette personne.
      </p>
      <p>
        Pensez à vérifier le salaire pré-rempli case <strong>1AJ</strong> ou <strong>1BJ</strong> : si votre employeur vous a versé des indemnités
        kilométriques ou une allocation de télétravail exonérées, ajoutez-les au salaire déclaré. C&apos;est la contrepartie des frais réels.
      </p>

      <h2>Faut-il joindre des justificatifs ?</h2>
      <p>
        Non. Aucune pièce n&apos;est à envoyer avec la déclaration en ligne. Mais vous devez pouvoir justifier chaque dépense et la méthode de calcul :
        conservez les pièces <strong>pendant trois ans</strong>, le délai pendant lequel l&apos;administration peut revenir sur la déclaration.
      </p>
      <p>
        La déclaration en ligne permet d&apos;ajouter des précisions en texte libre. Y indiquer le détail de vos frais réels montre que le montant est
        calculé et documenté. Si la place manque, gardez au minimum les grands postes et le total, et conservez le détail complet prêt à être envoyé.
      </p>

      <h2>Ce que doit contenir le détail</h2>
      <ol>
        <li>
          <strong>Le total déclaré</strong> et la case utilisée, pour que le lecteur retrouve le montant.
        </li>
        <li>
          <strong>Un poste par ligne</strong> : trajets, repas, télétravail, matériel, autres.
        </li>
        <li>
          <strong>Le calcul de chaque poste</strong>, avec les données d&apos;entrée : distance, nombre de jours, puissance fiscale et formule du barème ;
          nombre de repas et montants ; surfaces et quote-part pour le télétravail.
        </li>
        <li>
          <strong>Les justifications particulières</strong> : distance supérieure à 40 km, retour le midi, véhicule électrique.
        </li>
        <li>
          <strong>La mention des allocations réintégrées</strong> et de la conservation des justificatifs.
        </li>
      </ol>

      <h2>Modèle de détail</h2>
      <p>
        Voici le texte produit par Quotient pour le foyer d&apos;exemple du simulateur : Camille, 32 km de trajet en voiture de 5 CV, repas sur place et 45
        jours de télétravail.
      </p>
      <pre>{modele}</pre>
      <p className="encadre">
        Chaque montant est arrondi à l&apos;euro avant l&apos;addition : les postes retombent exactement sur le total déclaré, ce qui évite un écart
        d&apos;un euro que l&apos;administration pourrait relever.
      </p>

      <EncartSimulateur
        titre="Générez le détail de vos propres frais"
        texte="Saisissez vos trajets, repas et jours de télétravail : le simulateur rédige ce texte avec vos chiffres, prêt à copier."
        lien="/simulateur/?etape=3"
      />

      <h2>Les pièces à conserver, poste par poste</h2>
      <div className="tableau">
        <table>
          <thead>
            <tr>
              <th>Poste</th>
              <th>Pièces à garder</th>
            </tr>
          </thead>
          <tbody>
            {PIECES.map(([poste, pieces]) => (
              <tr key={poste}>
                <td>
                  <strong>{poste}</strong>
                </td>
                <td>{pieces}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Justifier une distance de plus de 40 km</h2>
      <p>
        Au-delà de 40 km par trajet, seuls les 40 premiers kilomètres sont retenus, sauf circonstances particulières. Expliquez-les en une phrase dans le
        détail, par exemple :
      </p>
      <ul>
        <li>emploi du conjoint dans une autre ville, qui impose un domicile entre les deux lieux de travail ;</li>
        <li>emploi précaire ou à durée déterminée, qui ne justifie pas de déménager ;</li>
        <li>difficultés à trouver un logement près du lieu de travail, ou raisons de santé.</li>
      </ul>

      <h2>Les erreurs qui attirent l&apos;attention</h2>
      <ul>
        <li>Un total sans aucune explication, ou un détail dont les postes ne retombent pas sur le total.</li>
        <li>Plus de jours de trajet que de jours travaillés, ou des trajets les jours de télétravail.</li>
        <li>Des allocations de l&apos;employeur non réintégrées au salaire.</li>
        <li>Un ordinateur à plus de 500 € HT déduit en une seule fois au lieu d&apos;être amorti.</li>
      </ul>
      <p>
        Pour vérifier d&apos;abord que les frais réels valent le coup, lisez{" "}
        <Link href="/guides/frais-reels-ou-abattement-10/">frais réels ou abattement de 10 %</Link>.
      </p>
    </GuideLayout>
  );
}
