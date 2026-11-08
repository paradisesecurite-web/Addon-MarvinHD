# SprintAlert — WoW Forever (Classic+)

Affiche **« SPRINT PRÊT ! »** en gros au centre de l'écran et joue un son quand le Sprint de ton voleur est de nouveau disponible.

## Installation
1. Copie le dossier `SprintAlert` dans le dossier `Interface\AddOns` **du client WoW Forever**
   (là où se trouvent déjà tes autres add-ons).
2. Vérifie le chemin : `...\Interface\AddOns\SprintAlert\SprintAlert.toc`
   (pas de dossier `SprintAlert` dans un autre dossier `SprintAlert`).
3. Relance complètement le jeu.
4. À l'écran de sélection du personnage, clique sur **AddOns** (en bas à gauche), coche **SprintAlert**,
   puis **OK**. S'il est marqué « périmé », coche **Charger les add-ons périmés**.

## Tester
- En jeu, tape `/sa test` : le texte et le son doivent apparaître.
- Utilise Sprint, attends 5 minutes : l'alerte se déclenche quand il est prêt.

## Commandes
- `/sa` : aide + réglages actuels
- `/sa test` : joue l'alerte complète
- `/sa mode texte` / `/sa mode son` / `/sa mode les deux`
- `/sa son <id>` : change le son (ex. `/sa son 8959`, le son par défaut)
- `/sa taille <nombre>` : taille du texte (10 à 200, 48 par défaut)

Les réglages sont sauvegardés (SavedVariable `SprintAlertDB`).

## Voir les erreurs
Tape `/console scriptErrors 1` puis `/reload` : les erreurs Lua s'afficheront dans une fenêtre.
(`/console scriptErrors 0` pour les masquer à nouveau.)

## Vérifier le numéro d'interface
Tape `/run print(select(4, GetBuildInfo()))`. Si le chiffre n'est pas `16001`,
remplace-le à la ligne `## Interface:` de `SprintAlert.toc`.
