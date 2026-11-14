---
name: ui-components
description: Regles de conception du kit de composants UI reutilisables, accessibles et sobres.
---

# UI Components Kit

## Objectif
Fournir un ensemble coherent de composants d interface sobres, accessibles et entierement documentes pour une utilisation fluide par Camille.

## Composants Requis dans components/ui
- Button : Bouton d action avec variantes (primaire, secondaire, discret, danger) et etat de chargement.
- Input : Champ de saisie texte avec label explicite et message d aide/erreur.
- Select : Liste deroulante accessible pour les filtres de direction et de theme.
- Badge : Etiquette coloree pour les themes, statuts et doublons.
- Card : Conteneur sobre pour structurer l affichage des idees.
- Dialog : Modale accessible pour la confirmation de doublons ou l edition detaillee.
- Table : Tableau accessible pour la consultation synthétique et la shortlist.
- Tabs : Navigation par onglets (Toutes les idees, Doublons, Shortlist).
- Toast : Notifications ephemeres de confirmation (sauvegarde, import reussi).
- Spinner / Skeleton : Indicateurs de chargement non intrusifs.
- EmptyState : Etat vide chaleureux invitant a l action ("Aucune idee importee, commencez par importer le fichier").
- ErrorMessage : Affichage clair et actionnable des erreurs de saisie ou d import.
- ScoreInput : Selecteur ergonomique de note de 1 a 5 avec rappel du critere.

## Regles et Bonnes Pratiques
1. Typage strict des props avec TypeScript (interfaces documentees).
2. Fichier unique de jetons de design dans lib/theme.ts ou tailwind.config pour garantir l harmonie visuelle (couleurs, rayons, espacements).
3. Textes et labels 100 % en francais.
4. Accessibilite prioritaire :
   - Contraste de couleurs conforme WCAG AA.
   - Navigation au clavier sur les elements interactifs (focus visible).
   - Attributs ARIA pour les boites de dialogue, onglets et alertes.
5. Gestion systematique des 3 etats : chargement, vide et erreur.

## Contraintes
- Pas de tiret cadratin dans les libelles ou commentaires.
- Aucun composant lourd tiers (pas d installation de frameworks UI volumineux) : composants natifs Tailwind bien concus.
