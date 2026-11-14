---
name: nextjs-conventions
description: Conventions Next.js App Router, separation serveur/client, arborescence et bonnes pratiques.
---

# Next.js Conventions

## Objectif
Maintenir une architecture Next.js (App Router) propre, lisible et performante, facile a expliquer et a maintenir pour Camille et les developpeurs du projet.

## Instructions
1. Decoupage Server / Client Components :
   - Par defaut, les composants sont des Server Components pour optimiser la performance et securiser les acces aux donnees.
   - Utiliser 'use client' uniquement lorsque l'interactivite est requise (formulaires avec etat local, ecouteurs d'evenements, filtres reactifs).
   - Ne jamais importer de code client cote serveur si des secrets ou du code d'acces base sont en jeu.

2. Structure des dossiers :
   - app/ : Gestion des routes, pages, layouts, loading.tsx et error.tsx.
   - components/ui/ : Composants generiques et reutilisables (boutons, badges, modales, etc.).
   - components/features/ : Composants metier specifiques au challenge Hexavia.
   - lib/ : Fonctions metier pures, parseurs, heuristiques et acces donnees.
   - types/ : Definitions et interfaces TypeScript strictes.

3. Zero logique metier dans les pages :
   - Les pages et layouts orchestrent l'affichage et appellent les fonctions dans lib/.
   - Tout calcul (scoring, detection de doublons, parsing) doit resider dans un module lib/ dedie et teste unitairement.

4. Gestion des etats speciaux :
   - Fournir systematiquement un loading.tsx et un composant d'erreur error.tsx pour chaque vue principale.
   - Toujours prevoir un EmptyState clair et convivial pour guider l'utilisateur.

## Contraintes
- Pas de tiret cadratin dans les fichiers de code ou la documentation.
- Mode strict TypeScript active (aucune utilisation de 'any').
- Code concis et comprehensible sans bibliotheque complexe.
