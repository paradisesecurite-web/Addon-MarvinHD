# Marvin HD contre Sauce

Mini-jeu web 3D (un seul fichier `index.html`, Three.js chargé depuis un CDN).
Ouvre `index.html` dans un navigateur, sur PC ou sur téléphone en mode paysage.

## Ajouter un événement absurde
Dans `index.html`, section 15 (`const EVENTS = [...]`) : copie un bloc, change `id`, `nom`, `phrase` et `run`.
La boîte à outils `T` (section 16) fournit `T.wait`, `T.say`, `T.overlay`, `T.finish`, `T.defeat`, etc.

## Test « Quel perso dois-tu jouer ? »
Deuxième bouton de l'écran d'accueil. Questionnaire en entonnoir (18 à 25 questions) pour WoW Forever, côté Horde.
- `quiz-data.js` : la banque de questions et tous les textes du résultat (classes, spés, races). Chaque question a sa phase, son étiquette et ses points secrets, expliqués en haut du fichier.
- `quiz.js` : le moteur (choix de la question la plus utile, calcul du résultat) et les écrans.
- `node test-quiz.js` : simulation de plusieurs milliers de parties pour vérifier que tout reste cohérent après une modification.
