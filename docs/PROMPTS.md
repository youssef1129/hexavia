# Registre des Prompts et Suivi des Erreurs IA

Ce document reference les prompts structurants utilises lors de la construction du projet, les ecarts ou erreurs detectes lors de l interaction avec l IA, et les actions correctives apportees.

## 1. Prompts Majeurs et Structurants

### Prompt d Initialisation et Cadrage des Competences (Step 1)
- **Objectif** : Formaliser la gouvernance du projet, les skills agents et les directives d architecture.
- **Formulation cle** :
  "Mettre en place une architecture modulaire en fonctions pures dans lib/, isoler les composants d interface sous components/ui et components/features, separer la proposition IA de la notation consultant, et interdire tout tiret cadratin ainsi que tout secret dans le code."
- **Resultat obtenu** : Creation immediate de AGENTS.md, des 5 competences Antigravity (.agents/skills/) et des guides de documentation.

## 2. Erreurs, Hallucinations et Vigilance IA

### Cas 1 : Normalisation des formats monetaires libres
- **Piege potentiel** : Risque d interpreter naïvement les chaines numeriques avec un simple `parseInt(val)` ou `Number(val)`.
- **Ecart observe** : Un parseur naif ignore les suffixes multiplicateurs comme "15k€" ou "35k", et interprete mal les formats contenant des parentheses explicatives ("80 000 € (deplacement des machines)").
- **Detection & Correction** : Etablissement immediat d une matrice de cas de test stricts dans `idea-scoring-domain` et `testing-and-ci` pour couvrir les cas "40 000 €", "15k€", "35k", "?", "0 €", chaine vide, et annotations de texte.

### Cas 2 : Formats de dates heterogenes
- **Piege potentiel** : Presumer que toutes les dates respectent le format ISO 8601 (AAAA-MM-JJ).
- **Ecart observe** : L observation minutieuse du fichier source montre que IDEA-033 est encode en "03/10/2026" (JJ/MM/AAAA) tandis que les autres utilisent "2026-10-07".
- **Detection & Correction** : Ajout d une regle de normalisation des dates dans le parseur CSV des le premier jalon.

### Cas 3 : Verification du libelle de justification pour les idees de faible valeur
- **Piege potentiel** : Divergence entre la chaine generee par le fournisseur de scoring et l assertion de test sur le mot-cle ("faible").
- **Ecart observe** : Le mock initial generait "Proposition conviviale mais sans impact economique...", faisant echouer le test unitaire `attribue un score bas a une idee a faible valeur`.
- **Detection & Correction** : Echec detecte immediatement par `vitest run`. Correction dans `MockScoringProvider` pour expliciter "Proposition a faible valeur : sans impact economique..." et harmoniser l interface utilisateur et les tests.
