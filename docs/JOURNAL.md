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
