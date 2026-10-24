# Quotient

Simulateur d'impôt sur le revenu pour les particuliers en France : landing page + assistant en 5 étapes
(foyer, revenus, frais réels, déductions, résultat). Tous les calculs sont faits dans le navigateur, et le brouillon
est conservé en `localStorage`.

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
| `src/lib/fiscal/engine.test.ts` | Cas de référence calculés à la main |
| `src/app/page.tsx` | Landing page (l'exemple affiché est calculé par le vrai moteur) |
| `src/components/sim/` | Assistant de simulation |

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
