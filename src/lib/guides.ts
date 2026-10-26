/** Registre des guides : titres, descriptions et dates, utilisés par les pages, l'index et le sitemap. */

export interface Guide {
  slug: string;
  /** Titre affiché (H1). */
  titre: string;
  /** Balise <title>, 50 à 60 caractères. */
  titreSEO: string;
  /** Meta description, 140 à 160 caractères. */
  description: string;
  /** Accroche de la carte dans les listes. */
  resume: string;
  publie: string;
  misAJour: string;
  lecture: number;
}

export const GUIDES: Guide[] = [
  {
    slug: "frais-reels-teletravail",
    titre: "Frais réels de télétravail : le calcul pas à pas",
    titreSEO: "Frais réels télétravail 2026 : calcul pas à pas | Quotient",
    description:
      "Forfait de 2,70 € par jour ou frais réels : quote-part du loyer, électricité, chauffage, internet et matériel. Méthode, règles officielles et exemple chiffré.",
    resume: "Forfait journalier ou quote-part du logement, des énergies et du matériel : la méthode et un exemple chiffré.",
    publie: "2026-10-26",
    misAJour: "2026-10-26",
    lecture: 7,
  },
  {
    slug: "frais-reels-ou-abattement-10",
    titre: "Frais réels ou abattement de 10 % : comment choisir",
    titreSEO: "Frais réels ou abattement 10 % : comment choisir | Quotient",
    description:
      "À partir de combien de kilomètres les frais réels battent-ils l'abattement de 10 % ? Règles, seuils de rentabilité selon le salaire et exemple chiffré.",
    resume: "Comment fonctionne l'abattement, à partir de quelle distance les frais réels deviennent rentables, et les pièges à éviter.",
    publie: "2026-10-26",
    misAJour: "2026-10-26",
    lecture: 6,
  },
  {
    slug: "justificatif-frais-reels",
    titre: "Justifier ses frais réels : modèle de détail à fournir",
    titreSEO: "Justificatif des frais réels : modèle à copier | Quotient",
    description:
      "Où déclarer vos frais réels (case 1AK), comment rédiger le détail du calcul, quelles pièces garder et combien de temps. Modèle de texte prêt à copier.",
    resume: "Où déclarer, quoi écrire et quoi conserver, avec un modèle de détail des frais réels prêt à adapter.",
    publie: "2026-10-26",
    misAJour: "2026-10-26",
    lecture: 5,
  },
];

export const guide = (slug: string): Guide => {
  const g = GUIDES.find((x) => x.slug === slug);
  if (!g) throw new Error(`Guide inconnu : ${slug}`);
  return g;
};

const dateFr = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });
export const formatDate = (iso: string) => dateFr.format(new Date(`${iso}T12:00:00`));
