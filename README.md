# MarvinHD — add-on WoW Classic Era

Quand tu cibles un mob attaquable, une phrase qui taquine Marvin HD s'affiche en gros au milieu de l'écran, avec un son d'alerte.

## Installation
1. Télécharge `MarvinHD.zip` et décompresse-le.
2. Mets le dossier `MarvinHD` dans :
   - Windows : `C:\Program Files (x86)\World of Warcraft\_classic_era_\Interface\AddOns\`
   - Mac : `/Applications/World of Warcraft/_classic_era_/Interface/AddOns/`
   (crée `Interface` et `AddOns` s'ils n'existent pas)
3. Tu dois avoir `...\AddOns\MarvinHD\MarvinHD.toc` (pas `MarvinHD\MarvinHD\...`).
4. Lance le jeu → écran de sélection du perso → bouton **AddOns** en bas à gauche → coche **MarvinHD**.
   Si l'add-on apparaît « Périmé », coche **Charger les AddOns périmés**.

## Commandes
- `/marvin` : activer / désactiver
- `/marvin test` : afficher une phrase sans cibler

## Modifier les phrases
Ouvre `MarvinHD.lua` : les listes `PHRASES` et `PHRASES_BAS_NIVEAU` sont en haut du fichier.
`%s` = nom du mob, `%d` = niveau. Tape `/reload` en jeu après modification.

Interface : 11509 (patch 1.15.9).
