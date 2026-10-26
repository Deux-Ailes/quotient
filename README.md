# Quotient : simulateur d'impôt sur le revenu et de frais réels

**Utiliser le simulateur : [deux-ailes.github.io/quotient](https://deux-ailes.github.io/quotient/)**

Simulateur gratuit et open source de l'impôt sur le revenu pour les particuliers en France (revenus 2026 et 2025).
Tous les calculs sont faits dans le navigateur : aucun compte, aucune donnée envoyée.

- **Frais réels** : barème kilométrique officiel (voiture, moto, électrique +20 %, plafond de 40 km), repas,
  télétravail au forfait ou au réel (prorata de surface, énergies selon les jours télétravaillés), matériel amorti
- **Comparaison automatique** frais réels / abattement de 10 % pour chaque déclarant
- **Quotient familial** plafonné, décote, réductions et crédits d'impôt (garde d'enfants, emploi à domicile, dons, PER…)
- **Détail complet du calcul** avec les cases de la déclaration 2042 (1AJ, 1AK, 7GA…)
- **Justificatif des frais réels** prêt à coller sur impots.gouv.fr
- Taux de prélèvement à la source, foyer et individualisé

## Démarrer

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # tests du moteur fiscal (vitest)
npm run build
```

## Structure

| Chemin | Rôle |
| --- | --- |
| `src/lib/fiscal/params.ts` | **Tous les paramètres fiscaux** par année de revenus (barème, décote, QF, plafonds, barème km…) |
| `src/lib/fiscal/engine.ts` | Moteur : revenus catégoriels, quotient familial plafonné, décote, réductions, crédits, CEHR, PAS |
| `src/lib/fiscal/fraisReels.ts` | Frais kilométriques, repas, télétravail, matériel amorti |
| `src/lib/fiscal/cases.ts` | Numéros de cases de la déclaration 2042 |
| `src/lib/fiscal/declaration.ts` | Détail complet du calcul, case par case |
| `src/lib/fiscal/resumeFraisReels.ts` | Justificatif des frais réels à copier-coller |
| `src/lib/fiscal/*.test.ts` | Cas de référence calculés à la main |
| `src/lib/site.ts` | URL publique, titres et descriptions (SEO) |
| `src/app/page.tsx` | Landing page (l'exemple affiché est calculé par le vrai moteur) |
| `src/components/sim/` | Assistant de simulation |

## Déploiement

Le site est un export statique publié sur GitHub Pages par `.github/workflows/deploy.yml` à chaque push sur
`master` (tests, build, publication, puis signalement des pages à Bing via IndexNow). Les pull requests sont
testées et construites sans être publiées.

Pour un nom de domaine propre, définir `NEXT_PUBLIC_SITE_URL` (et `NEXT_PUBLIC_BASE_PATH` vide) dans le workflow.

## Mettre à jour les paramètres

Les revenus 2026 utilisent le barème du **PLF 2027** (+2,1 %), pas encore voté : `PARAMS_2026.provisoire = true`.
Après promulgation de la loi de finances :

1. Corriger `PARAMS_2026` dans `params.ts` (barème, décote, plafonds QF, abattements…) et passer `provisoire` à `false`.
2. Mettre à jour `notes` (affichées dans « Hypothèses de calcul »).
3. Mettre à jour les tests correspondants, puis lancer `npm test`.

Points à surveiller en particulier :

- plafond de l'abattement de 10 % sur les pensions (le PLF propose 3 000 € ; non retenu ici) ;
- revalorisation éventuelle de 10 % du barème kilométrique ;
- forfait repas (valeur du repas pris au domicile et plafond) et forfait télétravail.

## Limites connues

Non modélisé : revenus exceptionnels (système du quotient), contribution différentielle sur les hauts revenus,
plus-values, reports de déficits et de réductions, mutualisation des plafonds PER entre conjoints, réduction pour
frais de dépendance hors EHPAD, versement libératoire des micro-entrepreneurs.
