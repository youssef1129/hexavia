---
name: idea-scoring-domain
description: Regles metier d evaluation d idees, scoring heuristique IA, detection de doublons et shortlist.
---

# Domaine Scoring d Idees et Detection de Doublons

## Objectif
Formaliser les regles metier de la grille d evaluation Hexavia, le parseur de budget, les heuristiques de scoring IA, l algorithme de detection de doublons et la constitution de la shortlist.

## 1. Grille d Evaluation
Quatre criteres notes chacun de 1 a 5 :
- Impact business : Gains financiers, gains de temps, reduction des couts ou des pannes.
- Faisabilite : Facilite de mise en oeuvre technique et humaine compte tenu du budget et des ressources.
- Alignement strategique : Coherence avec la securite, la transition ecologique, la performance industrielle et la modernisation QHSE/IT.
- Innovation : Caractere novateur, rupture ou amelioration continue par rapport a l existant.

Score total : somme simple des quatre criteres (note globale sur 20 points, poids egaux par defaut).

## 2. Fournisseur de Scoring (ScoringProvider)
- Interface abstraite `ScoringProvider` avec methode `evaluateIdea(idea: Idea): Promise<ScoreEvaluation>`.
- `MockScoringProvider` :
  * Analyse deterministe basee sur des regles de mots-cles (economies, pannes, securite, IA, etc.), la clarte des benefices et le montant du budget.
  * Genere un score de 1 a 5 par critere ainsi qu une justification detaillee et motivee en francais.
  * Identifie les idees a faible valeur (ex. "Cafe gratuit" -> score d impact et d innovation minimal).
- `LlmScoringProvider` :
  * Bouchon active uniquement si `process.env.LLM_API_KEY` est renseigne.
  * Ne jamais emettre d appel reseau reel vers une API payante en phase de test ou de demonstration.
- Separation stricte des donnees :
  * `aiScore` et `aiJustification` : proposition initiale de l IA.
  * `consultantScore` et `consultantNotes` : note et remarques saisies par Camille, stockees separement sans jamais ecraser l avis initial de l IA.

## 3. Analyse et Normalisation des Budgets
Fonction pure `parseBudget(raw: string | undefined): BudgetParseResult`.
Cas a gerer et tester :
- Format monetaire classique : "40 000 €" -> 40000
- Notation abrégée : "15k€" ou "35k" -> 15000 et 35000
- Format texte avec libelle : "30 000 euros" -> 30000
- Montant nul : "0", "0 €" -> 0
- Montant inconnu ou incertain : "?" -> null (avec flag isUncertain: true)
- Montant manquant : "" ou undefined -> null
- Montant avec texte explicatif additionnel : "80 000 € (deplacement des machines et formation)" -> 80000

## 4. Detection des Doublons
- Normalisation : passage en minuscules, suppression des accents, suppression de la ponctuation et des mots vides (stop words).
- Deux niveaux de detection :
  * Doublons exacts : meme titre normalise et meme description normalisee (confiance 1.0). Exemple : IDEA-002 et IDEA-014.
  * Doublons proches : similarite semantique/textuelle elevee (ex. indice de Jaccard sur 3-grammes ou mots-cles) depassant un seuil de 0.65.
    Exemples : maintenance des compresseurs (IDEA-001 vs IDEA-007), chatbot RH (IDEA-003 vs IDEA-019), dictee vocale (IDEA-017 vs IDEA-018), covoiturage (IDEA-008 vs IDEA-027).
- Workflow de validation : Camille valide ou ecarte manuellement le doublon. Aucune suppression automatique.

## 5. Shortlist et Export
- Selection initiale recommandee : les 8 idees les mieux notees selon le score total (score de Camille si disponible, sinon score propose par l IA).
- Regle de de-doublonnage : si deux idees appartiennent a un groupe de doublons confirme, seule la meilleure idee du groupe est conservee dans la shortlist recommandee.
- Flexibilite consultant : Camille peut ajouter ou retirer manuellement n importe quelle idee de la shortlist.
- Formats d export :
  * Page d impression / PDF epuree et professionnelle via le navigateur.
  * Fichier CSV exportable contenant les idees retenues, les scores par critere et la synthese.

## Contraintes
- Zero tiret cadratin dans le code ou les libelles.
- Fonctions pures dans lib/, independantes de l interface utilisateur.
