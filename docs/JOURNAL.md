# Journal de Bord - Challenge Innovation Hexavia

Ce journal recense les etapes, decisions architecturales et validations effectuees au fil du developpement du projet Hexavia.

## 2026-11-14 15:50 - Initialisation du projet et Cadrage
- **Etape** : Etape 1 - Instructions du projet et competences d assistance (skills).
- **Actions** :
  - Analyse complete du cahier des charges et de l ensemble des 40 idees du fichier `data/idees_hexavia.csv`.
  - Identification des pieges de donnees : budgets heterogenes ("40 000 €", "15k€", "35k", "?", "0", texte libre), doublon exact (IDEA-002 et IDEA-014), doublons proches (compresseurs, chatbot RH, dictee vocale, covoiturage), formats de date (ex. IDEA-033 en JJ/MM/AAAA contre AAAA-MM-JJ), donnees manquantes (theme vide sur IDEA-015 et IDEA-029, site vide sur IDEA-040).
  - Creation de `AGENTS.md` a la racine avec la stack technique, les regles d architecture, l arborescence cible, les commandes et la liste d interdictions strictes (aucun tiret cadratin, pas de secret, pas d etat global lourd, pas d appel direct vers une API payante).
  - Creation des 5 competences Antigravity dans `.agents/skills/` :
    * `nextjs-conventions`
    * `ui-components`
    * `idea-scoring-domain`
    * `testing-and-ci`
    * `readme-and-journal`
- **Decisions & Arbitrages** :
  - Stockage separe de l avis IA et de la notation humaine : les corrections de Camille ne doivent jamais ecraser la proposition initiale.
  - Protection des donnees salariees : mot de passe applicatif unique via `APP_PASSWORD` valide par middleware, directive `noindex`, et interdiction formelle d inclure des noms ou prenoms dans les logs serveur.
  - Scoring deterministe heuristique : utilisation de `MockScoringProvider` avec explications structurees en francais et prise en compte de la faisabilite budgetaire.
- **Statut de validation** : Fichiers crees, conformes a la consigne et sans tiret cadratin.

## 2026-11-14 16:08 - Echafaudage technique et Integration Continue (Step 2 - Scaffold)
- **Etape** : Configuration des outils de test et du workflow CI.
- **Actions** :
  - Installation de Vitest et de la bibliotheque Supabase (`@supabase/supabase-js`).
  - Configuration de `vitest.config.mts` avec alias de chemin `@/`.
  - Creation de `.env.example` documentant les variables (APP_PASSWORD, SUPABASE_URL, LLM_API_KEY).
  - Mise a jour de `.gitignore` pour exclure les fichiers d environnement reels tout en trackant `.env.example`.
  - Creation du workflow GitHub Actions `.github/workflows/ci.yml` executant lint, typecheck, tests Vitest et build Next.js.
  - Creation d un premier test de validation `tests/smoke.test.ts`.
- **Decisions & Arbitrages** :
  - Utilisation de Node 22 pour aligner l environnement local et la CI.
  - Utilisation du format ESM (`.mts`) pour `vitest.config.mts` afin d eliminer tout avertissement de configuration.
- **Statut de validation** : Tests Vitest (100 % succes), lint et build Next.js valides avec succes localement.

## 2026-11-14 16:15 - Premier Deploiement Vercel (Step 2 - Vercel Deploy)
- **Etape** : Deploiement initial sur Vercel et liaison du depot GitHub `youssef1129/hexavia`.
- **Actions** :
  - Mise a jour de la CLI Vercel vers la version native 65.16.0.
  - Creation du projet `hexavia` et connexion au depot GitHub `youssef1129/hexavia`.
  - Premier deploiement reussi en production.
  - URL de production : `https://hexavia.vercel.app`.
- **Statut de validation** : Build et deploiement Vercel termines avec succes (etat READY).

## 2026-11-14 16:23 - Couche Donnees, Parsing et Moteur de Scoring (Step 3 - Data & Scoring)
- **Etape** : Parseur de budget, parseur CSV et fournisseur de scoring IA deterministe.
- **Actions** :
  - Implementation de `lib/budget-parser.ts` avec gestion de tous les pieges (k€, k, ?, 0, devises, annotations).
  - Implementation de `lib/csv-parser.ts` prenant en charge UTF-8 avec BOM, separateur point-virgule, normalisation des dates (ex. 03/10/2026 -> 2026-10-03) et export CSV.
  - Implementation de `lib/scoring-provider.ts` avec interface `ScoringProvider`, heuristiques deterministes `MockScoringProvider`, bouchon `LlmScoringProvider` et fabrique securisee sans appel externe.
  - Creation des suites de tests unitaires :
    * `tests/budget-parser.test.ts` (10 tests)
    * `tests/csv-parser.test.ts` (5 tests validant l integralite des 40 idees du CSV Hexavia)
    * `tests/scoring-provider.test.ts` (4 tests)
- **Decisions & Arbitrages** :
  - Le scoring est totalise sur 20 points (4 criteres de 1 a 5 a poids egaux).
  - Les idees triviales (ex. "Cafe gratuit") recoivent une notation minimale (impact 1, innovation 1, alignement 1) et une justification explicite.
  - Les formats heterogenes de date sont uniformises des l import.
- **Statut de validation** : 20/20 tests Vitest reussis, aucun tiret cadratin, lint ESLint et compilation TypeScript 100 % au vert.
