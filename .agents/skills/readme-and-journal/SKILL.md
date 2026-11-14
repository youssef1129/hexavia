---
name: readme-and-journal
description: Structure du README de synthese, tenue du journal de bord horodate et suivi des prompts/erreurs IA.
---

# Guide de Documentation : README, Journal et Prompts

## Objectif
Maintenir une documentation claire, vivante et fidele au processus de realisation, permettant a Camille et au jury d evaluer a la fois le resultat technique, la rigueur methodologique et l esprit critique face a l IA.

## 1. Structure Obligatoire du README.md (en Francais)
Le fichier `README.md` doit faire entre 1 et 2 pages et respecter le plan suivant :
- Apercu : Synthese du projet, du contexte Hexavia et des objectifs cles.
- Lancer l outil : Guide rapide de demarrage local (prerequis, installation, variables d environnement, commandes).
- 1. Cadrage : Analyse du besoin de Camille, contraintes metier, public non-technique, protection des donnees salariees.
- 2. Conception : Architecture logicielle, choix de la stack, modelisation des donnees, logique metier pure dans lib/.
- 3. Construction avec l IA : Interaction avec les outils d IA, prompts efficaces, pieges detectes et corriges.
- 4. Fiabilisation : Strategie de test (parseur budget, doublons, scoring), pieges de donnees resolus, verification continue.
- 5. Livraison : Deploiement Vercel, acces securise par mot de passe, fonctionnalites d export (PDF / CSV).
- 6. Journal : Synthese des etapes cles et liens vers le journal detaille.
- 7. Suite et questions pour Camille : Hypotheses prises (ponderation egale des criteres, note sur 20, seuil de 8 idees) et questions en suspens pour le futur challenge.

## 2. Tenue du Journal de Bord (`docs/JOURNAL.md`)
Chaque intervention notable doit etre consignee avec :
- Horodatage precis (date et heure).
- Etape du projet concernee (ex. Cadrage, Parsing, UI, Tests, Deploiement).
- Action realisee.
- Decisions prises et arbitrages techniques.
- Statut de validation des tests.

## 3. Registre des Prompts et Vigilance IA (`docs/PROMPTS.md`)
Consigner rigoureusement :
- Les prompts les plus utiles et efficaces pour generer la logique metier ou les composants.
- Les erreurs ou hallucinations de l IA rencontrees au cours du developpement (ex. oubli de cas limites sur les budgets, hypothetique dependance lourde, formats de date inattendus).
- La methode concrete employee pour detecter et corriger chaque erreur (tests unitaires, relecture de code, typage strict).

## Contraintes
- Zero tiret cadratin dans tous les fichiers de documentation.
- Transparence totale sur ce qui a ete execute, teste et deploye avec succes.
