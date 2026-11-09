# SprintAlert — WoW Forever (Classic+)

Deux alertes pour voleur, en gros au centre de l'écran avec un son :
- **« SPRINT PRÊT ! »** quand Sprint revient de recharge ;
- **« RIPOSTE ! »** quand tu pares une attaque et que Riposte est utilisable
  (seulement si tu as le talent Riposte, et pas si Riposte est en recharge).

## Installation
1. Copie le dossier `SprintAlert` dans le dossier `Interface\AddOns` **du client WoW Forever**
   (là où se trouvent déjà tes autres add-ons).
2. Vérifie le chemin : `...\Interface\AddOns\SprintAlert\SprintAlert.toc`
   (pas de dossier `SprintAlert` dans un autre dossier `SprintAlert`).
3. Relance complètement le jeu.
4. À l'écran de sélection du personnage, clique sur **AddOns** (en bas à gauche), coche **SprintAlert**,
   puis **OK**. S'il est marqué « périmé », coche **Charger les add-ons périmés**.

## Tester
- `/sa test sprint` et `/sa test riposte` : le texte et le son (différents) doivent apparaître.
- Sprint : utilise-le, attends 5 minutes, l'alerte se déclenche quand il est prêt.
- Riposte : va voir un mob de ton niveau, laisse-le te taper de face sans attaquer
  (ou en attaquant), et à la première parade « RIPOSTE ! » doit s'afficher.
  Tape `/sa` pour vérifier que Riposte a bien été trouvée dans ton grimoire.

## Commandes
- `/sa` : aide + réglages actuels
- `/sa test` ou `/sa test sprint` : joue l'alerte Sprint
- `/sa test riposte` : joue l'alerte Riposte
- `/sa mode texte` / `/sa mode son` / `/sa mode les deux` (pour toutes les alertes)
- `/sa son <id>` : son du Sprint (8959 par défaut)
- `/sa sonriposte <id>` : son de Riposte (12867 par défaut)
- `/sa riposte on` / `/sa riposte off` : active ou coupe l'alerte Riposte
- `/sa taille <nombre>` : taille du texte (10 à 200, 48 par défaut)

Les réglages sont sauvegardés (SavedVariable `SprintAlertDB`).

## Voir les erreurs
Tape `/console scriptErrors 1` puis `/reload` : les erreurs Lua s'afficheront dans une fenêtre.
(`/console scriptErrors 0` pour les masquer à nouveau.)

## Vérifier le numéro d'interface
Tape `/run print(select(4, GetBuildInfo()))`. Si le chiffre n'est pas `16001`,
remplace-le à la ligne `## Interface:` de `SprintAlert.toc`.
