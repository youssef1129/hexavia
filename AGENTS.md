# Hexavia - Guide Agent & Regles du Projet

<!-- BEGIN:nextjs-agent-rules -->
## Next.js Conventions
Ce projet utilise Next.js avec l'App Router. Consulter la documentation locale dans node_modules/next/dist/docs/ si necessaire.
<!-- END:nextjs-agent-rules -->

## Stack Technique
- Framework : Next.js 16 (App Router)
- Langage : TypeScript (mode strict, noImplicitAny)
- Styles : Tailwind CSS
- Base de donnees : Supabase (Postgres) avec fallback local/in-memory securise
- Tests : Vitest
- CI / CD : GitHub Actions et deploiement Vercel
- Langue : 100 % francais pour toutes les interfaces utilisateur

## Regles d Architecture
1. Logique metier pure dans `lib/` :
   - Fonctions pures, testables unitairement, independantes des composants React.
   - Modules clairs : `parseCsv`, `parseBudget`, `scoring`, `findDuplicates`, `buildShortlist`.
2. Separation stricte UI / Metier :
   - Aucun calcul metier complexe dans les pages ou composants.
   - Composants reutilisables dans `components/ui/`.
   - Composants fonctionnels dans `components/features/`.
3. Notation IA vs Consultant :
   - Stocker separement la note suggeree par l'IA et la note corrigee par Camille.
   - Fournisseur de scoring derriere une interface `ScoringProvider` :
     * `MockScoringProvider` : heuristiques deterministes basees sur les regles metier.
     * `LlmScoringProvider` : bouchon pret pour un futur modele avec cle configurable par variable d'environnement (LLM_API_KEY).
     * Jamais d'appel reel a une API payante ou externe pendant l'evaluation.
4. Gestion des doublons :
   - Normalisation du texte et calcul de similarite textuelle.
   - Classification en doublons exacts et doublons proches avec score de confiance.
   - Validation humaine : Camille confirme ou rejette, jamais de suppression automatique.
   - Pour la shortlist : retenir au maximum une idee par groupe de doublons confirmes.
5. Protection des donnees :
   - Protection de l'application par mot de passe simple via `APP_PASSWORD` verifie dans le middleware.
   - Balise `noindex` sur toutes les pages.
   - Ne jamais journaliser (logs) les noms ou prenoms des collaborateurs.
   - Variables d'environnement sensibles reservees au serveur (`.env.example` documente, aucun secret commite).

## Structure du Dossier
```
hexavia/
├── .agents/
│   └── skills/                # Competences d'assistance pour le projet
│       ├── nextjs-conventions/SKILL.md
│       ├── ui-components/SKILL.md
│       ├── idea-scoring-domain/SKILL.md
│       ├── testing-and-ci/SKILL.md
│       └── readme-and-journal/SKILL.md
├── .github/
│   └── workflows/
│       └── ci.yml             # Workflow GitHub Actions (lint, typecheck, test)
├── app/                       # App Router Next.js
│   ├── api/                   # Routes API serveur (import, scoring, export)
│   ├── duplicates/            # Vue de gestion des doublons
│   ├── shortlist/             # Vue de selection et export de la shortlist
│   ├── layout.tsx             # Layout global
│   ├── page.tsx               # Vue principale (liste des idees, filtres, detail)
│   ├── loading.tsx            # Etat de chargement global
│   └── error.tsx              # Gestion d'erreur globale
├── components/
│   ├── ui/                    # Composants atomiques (design system sobre)
│   └── features/              # Composants metier (filtres, cartes, scoring, tableau)
├── data/                      # Fichiers de donnees (idees_hexavia.csv)
├── docs/                      # Documentation projet, journal et prompts
│   ├── JOURNAL.md
│   └── PROMPTS.md
├── lib/                       # Logique metier pure et utilitaires
│   ├── budget-parser.ts
│   ├── csv-parser.ts
│   ├── duplicate-detector.ts
│   ├── scoring-provider.ts
│   ├── shortlist.ts
│   └── supabase.ts
├── types/                     # Definitions TypeScript strictes
└── tests/                     # Tests unitaires et d'integration Vitest
```

## Commandes Principales
- `npm run dev` : Lancement du serveur de developpement local.
- `npm run build` : Verification du build de production Next.js.
- `npm run lint` : Verification ESLint.
- `npm run test` : Execution de la suite de tests Vitest.
- `npm run test:watch` : Tests en mode interactif.

## Liste d'Interdictions ("Do Not")
- JAMAIS de tiret cadratin (em dash) dans le texte, les commentaires ou la documentation. Utiliser le tiret simple (-), les deux-points (:) ou des parentheses.
- JAMAIS de secret dans le repository (cles API, mots de passe).
- JAMAIS de bibliotheque d'etat globale lourde (Redux, Zustand, MobX) : l'etat reste simple avec React et le serveur.
- JAMAIS de fonctionnalite superflue non demandee.
- JAMAIS de code mort ou d'imports inutilises.
- JAMAIS d'appel externe reel vers un LLM sans validation explicite (utiliser les heuristiques deterministes de MockScoringProvider).
- JAMAIS de suppression automatique d'idees lors de la detection de doublons.
