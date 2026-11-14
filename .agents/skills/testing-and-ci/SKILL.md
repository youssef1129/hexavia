---
name: testing-and-ci
description: Directives pour la couverture de tests avec Vitest et le pipeline GitHub Actions CI.
---

# Directives de Tests et Integration Continue

## Objectif
Garantir la fiabilite de la logique metier et empecher les regressions grace a des tests automatises rigoureux et un pipeline d integration continue complet.

## Perimetre des Tests Unitaires et d Integration
1. Parseur CSV (`csv-parser.test.ts`) :
   - Prise en charge du separateur point-virgule (;).
   - Gestion de l encodage UTF-8 avec BOM.
   - Normalisation des sauts de ligne CRLF et LF.
   - Gestion des champs manquants (themes vides, sites vides, benefices absents).
   - Gestion des formats de date heterogenes (YYYY-MM-DD vs DD/MM/YYYY).

2. Parseur de Budget (`budget-parser.test.ts`) :
   - Formats monétaires standards ("40 000 €", "30 000 euros").
   - Notations avec multiplicateur ("15k€", "35k").
   - Valeurs nulles ("0", "0 €").
   - Valeurs incertaines ou marqueurs d interrogation ("?").
   - Valeurs manquantes (chaine vide, espaces, undefined).
   - Valeurs mixtes contenant des annotations parenthetiques ("80 000 € (deplacement des machines)").

3. Scoring IA Deterministe (`scoring-provider.test.ts`) :
   - Notation fidele sur les quatre criteres (1 a 5).
   - Generation systematique de justifications en francais claires et motivees.
   - Detection et sous-notation appropriee des idees anecdotiques ou sans impact metier ("Cafe gratuit").
   - Absence d effet de bord ou d appel reseau.

4. Detection de Doublons (`duplicate-detector.test.ts`) :
   - Detection infaillible des doublons stricts (ex. IDEA-002 et IDEA-014).
   - Detection robuste des doublons proches cibles (compresseurs, chatbot RH, dictee vocale, covoiturage).
   - Calcul coherent du niveau de confiance (0 a 1).

5. Constitution de la Shortlist (`shortlist.test.ts`) :
   - Ordonnancement correct selon le score total.
   - Exclusion de la seconde idee pour un groupe de doublons confirmes.
   - Respect de la limite cible (environ 8 idees) avec capacite d ajout et de retrait manuel.

## Conventions Vitest
- Fichiers de test localises dans tests/ ou a cote du fichier source (.test.ts).
- Tests rapides, deterministes et auto-suffisants.
- Pas de dependance a un serveur de base de donnees externe pour les tests unitaires purs.

## Pipeline GitHub Actions (.github/workflows/ci.yml)
Le workflow doit executer a chaque commit et pull request :
1. Checkout du repository.
2. Mise en place de Node.js (version 20 LTS).
3. Installation propre des dependances (`npm ci`).
4. Verification du typage TypeScript (`npx tsc --noEmit`).
5. Verification du linter (`npm run lint`).
6. Execution de la suite de tests (`npm run test`).
7. Verification du build Next.js (`npm run build`).

## Contraintes
- Zero tiret cadratin dans les fichiers de test ou les rapports.
- Tout test doit etre execute et verifie localement avant le commit.
