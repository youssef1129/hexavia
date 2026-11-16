# Hexavia - Challenge Innovation

Outil interne pour examiner les idees du challenge innovation Hexavia, comparer une evaluation heuristique a celle de Camille, examiner les doublons et preparer une shortlist. L'interface est en francais et l'acces peut etre protege par un mot de passe.

## Lancer l'outil

Prerequis : Node.js 22 et npm.

```bash
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Ouvrir http://localhost:3000. Dans `.env.local`, remplacer `APP_PASSWORD` par un mot de passe local prive. Pour un acces sans mot de passe en developpement, laisser cette variable vide. Ne jamais commiter `.env.local` ni utiliser le mot de passe d'exemple en production.

Commandes de verification : `npm run lint`, `npx tsc --noEmit`, `npm run test` et `npm run build`.

## 1. Cadrage

Le besoin est de donner a Camille et au jury un outil simple pour parcourir les idees, filtrer le catalogue, enregistrer des notes, verifier les propositions de doublons et exporter une selection. Les donnees peuvent contenir les noms des collaborateurs : l'application ajoute `noindex`, protege les pages par mot de passe si `APP_PASSWORD` est configure et ne doit pas journaliser les noms.

## 2. Conception

Le projet utilise Next.js 16 App Router, React, TypeScript strict et Tailwind CSS. Les pages et composants d'interface se trouvent dans `app/` et `components/`; parsing CSV et budget, scoring, detection des doublons et shortlist sont dans `lib/`. L'evaluation locale est deterministe et n'appelle aucun service LLM.

Le catalogue initial est charge depuis `data/idees_hexavia.csv`. En local, l'etat modifie est conserve dans `.next/hexavia-state.json`. Cette persistance fichier et la memoire du processus ne constituent pas un stockage durable sur Vercel : les modifications peuvent etre perdues lors d'un redemarrage ou varier entre instances. Prevoir un stockage partage et durable avant un usage de production multi-utilisateur. La configuration Supabase documentee dans `.env.example` n'est pas encore branchee a `lib/storage.ts`.

## 3. Construction avec l'IA

Les prompts efficaces ont demande des modules metier purs et testables, une separation entre note IA et note consultant, ainsi que des validations sur les cas limites de budget, dates et doublons. Les sorties ont ete confrontees au CSV source, au typage strict et aux tests. Les erreurs rencontrees et leur correction sont detaillees dans [docs/PROMPTS.md](docs/PROMPTS.md).

## 4. Fiabilisation

Vitest couvre les parseurs CSV et budget, le scoring, les doublons, la shortlist et les composants. La suite actuelle contient 32 tests. CI execute le typecheck, ESLint, Vitest et le build Next.js. La verification locale du 16 novembre 2026 a confirme ces controles; le deploiement distant doit etre relance apres publication des changements.

## 5. Livraison sur Vercel

Importer le depot dans Vercel avec le preset Next.js et conserver les commandes par defaut (`npm run build`). Ajouter `APP_PASSWORD` dans les variables d'environnement Vercel pour Production et Preview, avec une valeur aleatoire privee, puis redeployer. Sans cette variable, le middleware laisse l'application accessible sans connexion. `NEXT_PUBLIC_APP_URL` peut etre defini sur l'URL publique; il n'est pas necessaire au rendu principal.

La configuration Next.js inclut explicitement le CSV dans le trace des routes API afin que le jeu initial soit disponible dans les fonctions Vercel. Les imports, notes et arbitrages doivent etre traites comme temporaires sur Vercel tant qu'un stockage persistant partage n'est pas branche. L'export CSV est disponible dans l'application; l'export PDF peut etre fait via l'impression du navigateur sur la page shortlist.

## 6. Journal

Les etapes et validations sont resumees dans [docs/JOURNAL.md](docs/JOURNAL.md). Les prompts et erreurs d'assistance sont suivis dans [docs/PROMPTS.md](docs/PROMPTS.md).

## 7. Suite et questions pour Camille

Hypotheses actuelles : quatre criteres ponderes egalement, note totale sur 20 et shortlist recommandee de 8 idees. A confirmer avec Camille : faut-il ajuster ces poids ou le nombre de finalistes, et quel stockage partage doit etre retenu pour conserver les arbitrages en production ?
