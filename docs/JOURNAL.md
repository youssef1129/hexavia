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

## 2026-11-14 20:10 - Moteur de Doublons et Constitution de la Shortlist (Step 4 - Duplicates & Shortlist)
- **Etape** : Algorithmes purs de detection de doublons et generation de la shortlist.
- **Actions** :
  - Implementation de `lib/duplicate-detector.ts` combinant normalisation sans accents, filtrage des mots vides francais, similarite lexicale Jaccard et 3-grammes de caracteres, avec reconnaissance thematique ciblee (compresseurs, chatbot RH, dictee vocale de rapports, covoiturage).
  - Implementation de `lib/shortlist.ts` :
    * Priorite stricte de la notation consultant sur l IA sans ecraser la proposition originale.
    * De-doublonnage par composantes connexes : exclusion automatique du doublon le moins bien note lorsqu une paire est confirmee par Camille.
    * Ordonnancement multicritere (score total, impact business, sobriete budgetaire).
    * Capacite d ajout et de retrait manuel d idees.
    * Calcul automatique des metriques pour le jury (budget global, note moyenne, idees non budgetees).
  - Creation des suites de tests unitaires :
    * `tests/duplicate-detector.test.ts` (5 tests validant les cas d ecole exacts et proches).
    * `tests/shortlist.test.ts` (5 tests validant priorite consultant, de-doublonnage et regles manuelles).
- **Decisions & Arbitrages** :
  - Seuil de similarite calibre a 0.35 avec renfort thematique sur les compresseurs, chatbots RH, dictee de rapports et covoiturage.
  - Shortlist fixee par defaut a 8 idees (recommandation INSKIP / Hexavia) tout en offrant a Camille le controle total d ajustement.
- **Statut de validation** : 30/30 tests Vitest au vert, lint ESLint et types TypeScript sans erreur.

## 2026-11-14 21:50 - Kit de Composants UI, Persistance et Securisation (Step 5 - UI Kit & API)
- **Etape** : Composants atomiques sobres, routes API serveur, persistance locale/Supabase et protection d acces.
- **Actions** :
  - Creation de `lib/theme.ts` centralisant les jetons de design (couleurs industrielles, palettes par theme metier).
  - Creation des composants atomiques sous `components/ui/` :
    * `Button` (variantes primaire, secondaire, contour, discret, danger, etat de chargement)
    * `Input` (champs texte avec icones, libelles et erreurs)
    * `Select` (selection deroulante accessible)
    * `Badge` (etiquettes thematiques et statutaires)
    * `Card`, `CardHeader`, `CardBody`, `CardFooter` (conteneurs modulaires)
    * `Dialog` (fenetre modale accessible avec gestion Echap et piege de focus)
    * `Table` (tableaux responsives avec tri)
    * `Tabs` (navigation par onglets avec compteurs)
    * `Toast` (notifications temporaires de confirmation)
    * `Spinner` et `Skeleton` (indicateurs de chargement discrets)
    * `EmptyState` (etat d accueil chaleureux et actionnable)
    * `ErrorMessage` (bandeau d alerte d erreur)
    * `ScoreInput` (selecteur ergonomique 1 a 5 affichant distinctement la suggestion IA et la correction consultant)
  - Implementation de la persistance locale et abstraction Supabase (`lib/storage.ts`, `lib/supabase.ts`).
  - Creation des routes API :
    * `GET/POST /api/ideas` (liste, import CSV avec verification et notation automatique)
    * `POST /api/ideas/reset` (rechargement des 40 idees natives Hexavia)
    * `POST /api/ideas/clear` (mise a zero pour tester l ecran vide)
    * `POST /api/ideas/[id]/score` (sauvegarde de la note et des remarques de Camille)
    * `POST /api/duplicates/[pairId]` (statut confirme / rejete)
    * `POST /api/shortlist/toggle` et `POST /api/shortlist/target` (arbitrages manuels)
    * `GET /api/export/csv` (telechargement CSV conforme avec BOM)
  - Implementation de `middleware.ts` pour verifier `APP_PASSWORD` et injecter la directive `X-Robots-Tag: noindex, nofollow` preservant la confidentialite des collaborateurs.
  - Creation de tests unitaires pour le theme UI (`tests/ui-components.test.ts`).
- **Decisions & Arbitrages** :
  - Respect scrupuleux de l interdiction des librairies tierces d etat global : l etat reste gere directement par l API Next.js et React.
  - L interface de notation `ScoreInput` met visuellement en exergue les divergences entre l avis IA et l arbitrage de Camille.
- **Statut de validation** : 32/32 tests Vitest reussis, 0 erreur ESLint, 0 erreur TypeScript.

## 2026-11-16 - Correction du deploiement Vercel et documentation
- **Etape** : Fiabilisation CI et livraison.
- **Actions** :
  - Verification du typecheck local et correction deja presente dans `app/layout.tsx` : remplacement de `LayoutProps<"/">` par un type explicite pour `children`, qui ne depend pas des types de route generes.
  - Ajout de `outputFileTracingIncludes` pour inclure le CSV initial dans les fonctions API deployeees sur Vercel.
  - Reecriture du README en francais avec demarrage, configuration Vercel, limites du stockage temporaire serverless et fonctionnalites disponibles.
- **Decisions & Arbitrages** : Le fallback fichier/memoire est conserve pour le mode local. Un stockage durable partage devra etre branche avant de conserver les modifications sur Vercel.
- **Statut de validation** : TypeScript, lint et 32 tests Vitest reussis avant ces changements; build Next.js a relancer avec la nouvelle configuration.
- **Mise a jour de validation (2026-11-16)** : Suppression du telechargement de polices Google a la compilation, apres reproduction d'un echec `next/font` sans acces reseau. TypeScript, ESLint, 32 tests Vitest et `npm run build` passent apres correction.
