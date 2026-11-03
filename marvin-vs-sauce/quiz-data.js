/* =====================================================================
   QUIZ « Quel perso dois-tu jouer ? » — BANQUE DE QUESTIONS ET TEXTES
   ---------------------------------------------------------------------
   Ce fichier ne contient QUE des données : tu peux le modifier librement.

   COMMENT LIRE UNE QUESTION
     Q('phase', 'besoin', "Texte de la question", [
       ["Texte de la réponse", "effets"],
       ...
     ])

   - phase  : 'tri' (grands axes), 'affinage' (départage les classes en
              course) ou 'confirmation' (mises en situation finales).
              Les questions de race sont plus bas (RACE_QUESTIONS).
   - besoin : l'étiquette de ce que la question mesure. Plusieurs
              questions partagent le même besoin : elles sont
              équivalentes et tirées au hasard (jamais deux fois la même).
   - effets : points SECRETS donnés par la réponse, séparés par des espaces :
        axe+N / axe-N      un trait de profil (liste des axes plus bas)
        c.classe+N         bonus direct à une classe   (ex. c.voleur+2)
        s.classe.spe+N     bonus direct à une spécialisation (ex. s.mage.feu+2)
     Raccourcis d'axes : distance = -contact, groupe = -solo,
                         pve = -pvp, patient = -explosif, simple = -complexe.

   RÈGLE D'OR : aucun nom de classe ou de race dans les questions et les
   réponses (le test le vérifie automatiquement).
   ===================================================================== */
(function (root) {
  'use strict';
  const D = {};

  /* ---------- Les axes du profil ---------- */
  D.AXES = ['tank', 'soin', 'degats', 'contact', 'solo', 'pvp', 'explosif', 'complexe', 'compagnon',
    'furtif', 'sombre', 'nature', 'lumiere', 'polyvalent', 'controle', 'robuste', 'elements', 'metamorphe'];

  /* ---------- Phrases « tu as dit que… donc… » par axe : [si positif, si négatif] ---------- */
  D.RAISONS = {
    tank: ["tu veux être celui qui prend les coups à la place des autres", "tu n'as aucune envie de servir de punching-ball"],
    soin: ["tu as le réflexe de garder les autres en vie", "soigner les autres, très peu pour toi"],
    degats: ["ce qui t'intéresse, c'est de faire tomber l'adversaire", "les gros chiffres, ce n'est pas ta priorité"],
    contact: ["tu veux voir le blanc des yeux de ton adversaire", "tu préfères garder une distance de sécurité"],
    solo: ["tu aimes te débrouiller seul", "tu es fait pour jouer en groupe"],
    pvp: ["affronter de vrais joueurs te fait vibrer", "tu préfères les défis du monde du jeu aux disputes entre joueurs"],
    explosif: ["tu es nerveux et explosif", "tu es patient et méthodique"],
    complexe: ["les mécaniques compliquées ne te font pas peur", "tu veux de l'efficace sans prise de tête"],
    compagnon: ["tu aimes avoir un compagnon à tes côtés", "tu ne fais confiance qu'à toi-même"],
    furtif: ["tu aimes frapper sans être vu", "tu préfères arriver par la grande porte"],
    sombre: ["le côté obscur ne te fait pas peur", "tu restes du bon côté de la force"],
    nature: ["tu as un vrai lien avec la nature et les esprits", "la nature, ce n'est pas trop ton truc"],
    lumiere: ["tu as un sens aigu de la justice et du devoir", "les grands discours sur la justice te laissent froid"],
    polyvalent: ["tu aimes t'adapter et toucher à tout", "tu préfères te spécialiser dans une seule chose"],
    controle: ["tu aimes contrôler la situation", "tu ne cherches pas à tout contrôler"],
    robuste: ["tu veux être increvable", "tu acceptes d'être fragile si c'est pour être efficace"],
    elements: ["les éléments te fascinent", "les éléments, tu t'en passes très bien"],
    metamorphe: ["changer de forme te fait rêver", "tu tiens à rester toi-même"],
  };

  /* ---------- Les 9 classes : textes du résultat ---------- */
  D.CLASSES = {
    guerrier: {
      nom: 'Guerrier', emoji: '⚔️', couleur: '#C79C6E',
      pourquoi: "Tu n'aimes pas tourner autour du pot : tu veux être au cœur de l'action, prendre les coups et en rendre le double. Le guerrier, c'est la classe la plus honnête du jeu : de l'acier, de la rage et zéro chichi.",
      forts: ["Increvable quand il est bien équipé", "Indispensable en raid, en tank comme en dégâts", "Des gros coups critiques qui font du bien au moral"],
      agacer: ["Tu dépends énormément de ton équipement", "Sans soigneur, la vie est très, très dure", "Tu vas passer ta vie à courir après des gens qui te ralentissent"],
      conclusion: "Tu tapes d'abord, tu réfléchis ensuite. Parfois jamais.",
      direct: "c'est exactement comme ça que pense un guerrier",
      pire: "Toi en guerrier ? Tu passerais ta vie par terre à attendre qu'un soigneur te regarde.",
    },
    chasseur: {
      nom: 'Chasseur', emoji: '🏹', couleur: '#ABD473',
      pourquoi: "Tu aimes être autonome, garder tes distances et avoir un fidèle compagnon qui fait le sale boulot. Le chasseur est la classe parfaite pour se débrouiller seul, partout, tout le temps.",
      forts: ["La classe la plus autonome du jeu", "Un animal qui encaisse les coups pour toi", "Des dégâts réguliers à distance, même en courant"],
      agacer: ["Ton animal va parfois attirer toute la salle", "Tout le monde dira que ta classe est « facile »", "Les munitions et la nourriture du familier à gérer"],
      conclusion: "Ton animal fera la moitié du travail. Et franchement, il sera sûrement meilleur que toi.",
      direct: "c'est le réflexe typique d'un chasseur",
      pire: "Toi en chasseur ? Ton animal démissionnerait au bout de deux jours.",
    },
    mage: {
      nom: 'Mage', emoji: '❄️', couleur: '#69CCF0',
      pourquoi: "Tu aimes contrôler la situation, frapper fort de loin et ne jamais te faire toucher. Le mage est l'artillerie du jeu : fragile, mais redoutable entre de bonnes mains.",
      forts: ["Des dégâts énormes à distance", "Le meilleur contrôle du jeu (gel, mouton, blink)", "Tu crées l'eau et la nourriture : tout le monde t'aime"],
      agacer: ["Tu es en papier mâché", "Tout le monde te réclame de l'eau et des portails", "Les voleurs vont te détester (c'est réciproque)"],
      conclusion: "Tu seras indispensable… surtout pour distribuer de l'eau gratuite.",
      direct: "c'est la logique même d'un mage",
      pire: "Toi en mage ? Tu te gèlerais toi-même. Ah, attends…",
    },
    voleur: {
      nom: 'Voleur', emoji: '🗡️', couleur: '#FFF569',
      pourquoi: "Tu es malin, imprévisible et tu aimes frapper au moment parfait. Le voleur choisit ses combats, ouvre depuis l'ombre et repart avant que l'adversaire comprenne ce qui lui arrive.",
      forts: ["Tu choisis quand le combat commence", "Surprise et contrôle redoutables en PvP", "Une porte de sortie pour chaque situation"],
      agacer: ["En raid, tu ne fais « que » taper, encore et encore", "Tout le monde t'accusera de tricher", "Une vie de méfiance, même envers ta propre guilde"],
      conclusion: "Tu seras sournois, efficace et détesté. Comme Sauce. C'est un compliment.",
      direct: "c'est un vrai réflexe de voleur",
      pire: "Toi en voleur ? On t'entendrait arriver depuis Orgrimmar.",
    },
    demoniste: {
      nom: 'Démoniste', emoji: '😈', couleur: '#9482C9',
      pourquoi: "Tu n'as pas peur du côté obscur et tu aimes les combats qui se gagnent dans la durée. Le démoniste maudit, invoque, draine et transforme sa propre vie en puissance.",
      forts: ["Très autonome grâce à tes serviteurs", "Des malédictions qui font fondre l'adversaire", "Tu invoques tes amis : ils te doivent tous un service"],
      agacer: ["Les fragments d'âme à farmer sans fin", "Tout le monde te réclame des pierres de soins et des invocations", "Tu passes ta vie à jongler entre ta santé et ta mana"],
      conclusion: "Tu as signé un pacte avec des forces obscures. Les petites lignes disaient : « tu feras les invocations du raid pour toujours ».",
      direct: "c'est exactement l'état d'esprit d'un démoniste",
      pire: "Toi en démoniste ? Ton serviteur te renverrait dans ton monde.",
    },
    chaman: {
      nom: 'Chaman', emoji: '⚡', couleur: '#3C9BFF',
      pourquoi: "Tu es polyvalent, proche des éléments et tu n'aimes pas être enfermé dans une seule case. Le chaman peut soigner, frapper au corps à corps ou lancer des orages : un vrai couteau suisse spirituel.",
      forts: ["Polyvalent : soin, mêlée ou distance", "Des totems qui boostent tout le groupe", "Des éclairs critiques dont on se souvient"],
      agacer: ["Poser et replacer tes totems sans arrêt", "Tout le monde voudra que tu soignes", "Ta mana fond comme neige au soleil"],
      conclusion: "Tu parles aux esprits. Ils te répondent surtout « replace ton totem ».",
      direct: "c'est tout à fait la mentalité d'un chaman",
      pire: "Toi en chaman ? Les esprits ne décrocheraient même pas.",
    },
    pretre: {
      nom: 'Prêtre', emoji: '✨', couleur: '#FFFFFF',
      pourquoi: "Tu tiens à ton groupe et tu as un vrai sens des responsabilités (même si tu juges un peu tout le monde en silence). Le prêtre est le soigneur par excellence, avec un côté ombre redoutable si besoin.",
      forts: ["Le soigneur le plus complet du jeu", "Boucliers, soins, résurrection : la panoplie entière", "Une spécialisation Ombre très dangereuse en PvP"],
      agacer: ["Tu es en tissu, donc très fragile", "Tout le groupe compte sur toi, et te le rappelle", "Les gens qui restent dans le feu"],
      conclusion: "Tu garderas tout le monde en vie. Personne ne te remerciera. Bienvenue.",
      direct: "c'est la réaction typique d'un prêtre",
      pire: "Toi en prêtre ? Le groupe serait mort avant ton premier soin.",
    },
    paladin: {
      nom: 'Paladin', emoji: '🔨', couleur: '#F58CBA',
      pourquoi: "Tu as le sens de la justice et de la loyauté, et tu aimes être solide comme un roc. Le paladin porte une armure lourde, se soigne, encaisse, et garde une bulle d'invulnérabilité pour les moments gênants.",
      forts: ["Ultra robuste et autonome", "Peut soigner, protéger ou frapper", "Des auras et des bénédictions que tout le raid adore"],
      agacer: ["Tes bénédictions à relancer sur tout le monde", "Tout le monde voudra que tu soignes", "Les blagues sur la bulle, à vie"],
      conclusion: "Paladin mort-vivant : tu défends la Lumière avec un corps en décomposition. Rien de plus cohérent.",
      direct: "c'est la droiture d'un vrai paladin",
      pire: "Toi en paladin ? Même ta bulle demanderait une pause.",
    },
    druide: {
      nom: 'Druide', emoji: '🐾', couleur: '#FF7D0A',
      pourquoi: "Tu détestes choisir et tu adores t'adapter. Le druide est l'hybride ultime : ours pour encaisser, félin pour frapper, arbre pour soigner, hibou pour la magie. Tu changes de forme comme tu changes d'avis.",
      forts: ["Tous les rôles dans un seul personnage", "Une forme pour chaque situation (voyage, nage, combat…)", "Relever un allié en plein combat"],
      agacer: ["Porter quatre équipements différents dans tes sacs", "On te demandera toujours le rôle qui manque", "Pas de vraie arme : tu te bats en pyjama de feuilles"],
      conclusion: "Tu seras tout à la fois : protecteur, soigneur, chat. Surtout chat.",
      direct: "c'est la souplesse d'esprit d'un druide",
      pire: "Toi en druide ? Tu resterais bloqué en forme de phoque.",
    },
  };

  /* ---------- Spécialisations : profil (v) et texte du résultat ---------- */
  D.SPECS = {
    'guerrier.armes': { nom: 'Armes', v: 'degats+2 contact+2 pvp+1 explosif+1 robuste+1', texte: "une énorme arme à deux mains, des coups massifs et le duel dans le sang." },
    'guerrier.fureur': { nom: 'Fureur', v: 'degats+2 contact+2 groupe+1 pve+1 explosif+2 simple+1', texte: "deux armes, de la rage, et un compteur de dégâts qui s'affole en raid." },
    'guerrier.protection': { nom: 'Protection', v: 'tank+3 contact+2 groupe+1 pve+1 robuste+2', texte: "bouclier levé, tu tiens les monstres… et les égos du groupe." },
    'chasseur.betes': { nom: 'Maîtrise des bêtes', v: 'degats+2 distance+2 solo+2 compagnon+3 simple+1 nature+1', texte: "ton animal devient un monstre et toi tu fais presque la sieste derrière." },
    'chasseur.precision': { nom: 'Précision', v: 'degats+2 distance+2 pvp+1 explosif+1 nature+1', texte: "tir visé, gros critiques, la terreur à quarante mètres." },
    'chasseur.survie': { nom: 'Survie', v: 'degats+2 distance+1 controle+2 complexe+1 nature+1 solo+1', texte: "pièges, esquives et coups tordus, pour les malins." },
    'mage.givre': { nom: 'Givre', v: 'degats+2 distance+2 controle+2 pvp+1 elements+2', texte: "gel, ralentissements, blink : personne ne te touche jamais." },
    'mage.feu': { nom: 'Feu', v: 'degats+2 distance+2 explosif+2 elements+2 groupe+1', texte: "boules de feu, embrasements et gros chiffres jaunes." },
    'mage.arcanes': { nom: 'Arcanes', v: 'degats+2 distance+2 complexe+2 explosif+1 elements+1', texte: "la magie pure, pour ceux qui aiment optimiser chaque seconde." },
    'voleur.assassinat': { nom: 'Assassinat', v: 'degats+2 contact+2 furtif+2 pvp+1 explosif+1 sombre+1', texte: "poisons et coups mortels, rapide et sans pitié." },
    'voleur.combat': { nom: 'Combat', v: 'degats+2 contact+2 pve+1 explosif+1 simple+1 furtif+1', texte: "des épées, de la régularité et des dégâts constants en raid." },
    'voleur.finesse': { nom: 'Finesse', v: 'degats+2 contact+2 furtif+3 pvp+2 controle+1 complexe+1', texte: "camouflage, embuscades et contrôle total en PvP." },
    'demoniste.affliction': { nom: 'Affliction', v: 'degats+2 distance+2 sombre+3 patient+2 complexe+1 controle+1 solo+1 compagnon+1', texte: "des malédictions qui rongent lentement, mais sûrement." },
    'demoniste.demonologie': { nom: 'Démonologie', v: 'degats+2 distance+2 sombre+2 compagnon+3 solo+2 robuste+1', texte: "ton serviteur est à la fois ton meilleur ami et ton bouclier." },
    'demoniste.destruction': { nom: 'Destruction', v: 'degats+2 distance+2 sombre+2 explosif+2 elements+1', texte: "du feu venu d'un autre monde et des critiques monstrueux." },
    'chaman.elementaire': { nom: 'Élémentaire', v: 'degats+2 distance+2 nature+2 elements+3 explosif+1 polyvalent+1', texte: "éclairs, lave et orages, de loin et très fort." },
    'chaman.amelioration': { nom: 'Amélioration', v: 'degats+2 contact+2 nature+2 elements+1 explosif+1 polyvalent+2', texte: "une arme dans chaque main… et la foudre dans chaque coup." },
    'chaman.restauration': { nom: 'Restauration', v: 'soin+3 distance+1 nature+2 groupe+2 polyvalent+1 elements+1', texte: "des soins en chaîne qui rebondissent sur tout le groupe." },
    'pretre.sacre': { nom: 'Sacré', v: 'soin+3 distance+2 lumiere+3 groupe+2 patient+1', texte: "le soin pur et puissant, pour tout le groupe." },
    'pretre.discipline': { nom: 'Discipline', v: 'soin+3 distance+2 lumiere+1 complexe+2 controle+1 pvp+1', texte: "boucliers et prévention : le soigneur stratège." },
    'pretre.ombre': { nom: 'Ombre', v: 'degats+2 distance+2 sombre+2 patient+1 controle+2 pvp+1 soin+1 groupe+1 compagnon-1', texte: "la face cachée, qui rend tes adversaires complètement fous." },
    'paladin.sacre': { nom: 'Sacré', v: 'soin+3 lumiere+3 robuste+2 groupe+2 contact+1', texte: "de gros soins en armure lourde : impossible à tuer." },
    'paladin.protection': { nom: 'Protection', v: 'tank+3 contact+2 lumiere+2 robuste+3 groupe+1', texte: "un mur sacré qui attire tous les ennemis sur lui." },
    'paladin.vindicte': { nom: 'Vindicte', v: 'degats+2 contact+2 lumiere+3 robuste+2 simple+1 polyvalent+1', texte: "un gros marteau à deux mains, et la Lumière qui frappe avec toi." },
    'druide.equilibre': { nom: 'Équilibre', v: 'degats+2 distance+2 nature+3 metamorphe+2 polyvalent+1 patient+1', texte: "la magie des étoiles et de la lune, en forme de hibou." },
    'druide.farouche': { nom: 'Combat farouche', v: 'degats+1 tank+2 contact+2 nature+2 metamorphe+3 polyvalent+2 furtif+1', texte: "ours pour encaisser, félin pour lacérer : tu choisis selon l'humeur." },
    'druide.restauration': { nom: 'Restauration', v: 'soin+3 distance+1 nature+3 metamorphe+1 groupe+2 patient+1 polyvalent+1', texte: "des soins qui durent, et une forme d'arbre très chic." },
  };

  /* ---------- Les 5 races jouables côté Horde (WoW Forever) ---------- */
  D.RACES = {
    orc: { nom: 'Orc', emoji: '🪓', v: 'contact+1 explosif+2 robuste+2 pvp+1 simple+1',
      classes: ['guerrier', 'chasseur', 'mage', 'voleur', 'demoniste', 'chaman'],
      phrase: "Orc : direct, loyal et têtu comme une porte d'Orgrimmar. Tu fonces, tu assumes, et ta fureur raciale te ressemble beaucoup trop." },
    mortvivant: { nom: 'Mort-vivant', emoji: '💀', v: 'sombre+3 furtif+1 solo+2 complexe+1',
      classes: ['guerrier', 'mage', 'voleur', 'pretre', 'demoniste', 'paladin'],
      phrase: "Mort-vivant : humour noir, détachement total et un petit côté « j'ai déjà vécu pire ». Tu es libre, cynique, et plus rien ne te fait peur." },
    tauren: { nom: 'Tauren', emoji: '🐂', v: 'nature+3 robuste+2 patient+2 groupe+1',
      classes: ['guerrier', 'chasseur', 'druide', 'chaman'],
      phrase: "Tauren : calme, solide et bienveillant… jusqu'à ce qu'on t'énerve. Un gros nounours de trois mètres qui piétine les problèmes." },
    troll: { nom: 'Troll', emoji: '🌴', v: 'explosif+1 nature+1 polyvalent+2 solo+1 sombre+1',
      classes: ['guerrier', 'chasseur', 'mage', 'voleur', 'pretre', 'demoniste', 'chaman'],
      phrase: "Troll : détendu, imprévisible et increvable grâce à ta régénération. Tu prends la vie comme elle vient, avec le sourire (et des défenses)." },
    skyborne: { nom: 'Skyborne', emoji: '🪽', v: 'complexe+2 distance+1 lumiere+1 controle+1 polyvalent+1',
      classes: ['guerrier', 'chasseur', 'voleur', 'druide', 'chaman'],
      phrase: "Skyborne : élégant, curieux et toujours la tête dans les nuages. La nouvelle race parfaite pour quelqu'un qui aime sortir des sentiers battus." },
  };

  /* Blague quand une seule race est possible (le paladin) */
  D.BLAGUE_RACE_UNIQUE = "Bonne nouvelle : pour ce qui t'attend, côté Horde, il n'y a qu'une seule option possible. Pas besoin de questions sur ta race : la mort s'en est déjà chargée.";
  /* Réponse neutre ajoutée quand il ne reste que 2 races possibles */
  D.NEUTRES = ["Aucune de ces réponses, je suis inclassable", "Je passe mon tour, Sauce me regarde", "Un peu des deux, honnêtement"];

  /* =====================================================================
     LES QUESTIONS
     ===================================================================== */
  const Q = (phase, need, q, a) => ({ phase, need, q, a });
  D.QUESTIONS = [

    /* ================= PHASE 1 : TRI (un besoin = un grand axe) ================= */
    // --- besoin « role » : protéger, soigner ou faire des dégâts ---
    Q('tri', 'role', "Un collègue te pique ton dernier yaourt dans le frigo du bureau :", [
      ["Je le confronte devant tout le monde, torse bombé", 'tank+2 contact+1 robuste+1'],
      ["J'attends la nuit et je lui pique son sandwich", 'degats+2 furtif+2 contact+1'],
      ["Je lui lance un regard noir et j'attends qu'il craque tout seul", 'degats+1 patient+2 sombre+1 controle+1'],
      ["Je lui laisse un mot passif-agressif… et un yaourt de rechange", 'soin+2 groupe+1'],
    ]),
    Q('tri', 'role', "En soirée, tu es plutôt :", [
      ["Celui qui ramasse ceux qui ont trop bu", 'soin+3 groupe+1'],
      ["Celui qui se met devant quand ça chauffe à la sortie", 'tank+3 robuste+1'],
      ["Celui qui met l'ambiance et finit debout sur la table", 'degats+2 explosif+2'],
      ["Celui qui part sans dire au revoir", 'degats+1 furtif+2 solo+1'],
    ]),
    Q('tri', 'role', "Ton groupe de donjon meurt à cause de celui qui devait encaisser. Ta réaction :", [
      ["« Je prends sa place la prochaine fois, poussez-vous »", 'tank+3'],
      ["Tu soignes en soupirant très fort", 'soin+3'],
      ["Tu étais déjà en train de fuir", 'degats+1 solo+2 furtif+1'],
      ["Tu relèves tout le monde et tu lâches un message sarcastique", 'soin+2 complexe+1'],
    ]),
    Q('tri', 'role', "Dans un déménagement entre potes, tu :", [
      ["Portes le frigo tout seul, parce que tu peux", 'tank+2 robuste+2 contact+1'],
      ["Gères les pizzas, l'eau et les doigts écrasés", 'soin+3 groupe+1'],
      ["Démontes les meubles à une vitesse inquiétante", 'degats+2 explosif+1'],
      ["Diriges les opérations depuis le canapé", 'degats+1 distance+1 controle+2'],
    ]),
    Q('tri', 'role', "Au foot du dimanche, ton poste naturel :", [
      ["Défenseur central : personne ne passe", 'tank+3 robuste+1'],
      ["Attaquant : je suis là pour marquer, point", 'degats+3 explosif+1'],
      ["Celui qui court partout pour aider tout le monde", 'soin+2 polyvalent+2 groupe+1'],
      ["Gardien qui hurle des consignes à tout le monde", 'soin+1 controle+2 distance+1'],
    ]),
    Q('tri', 'role', "Quelle phrase te ressemble le plus ?", [
      ["« Tapez-moi dessus, moi, pas eux »", 'tank+3'],
      ["« Personne ne meurt tant que je suis là »", 'soin+3'],
      ["« Le meilleur soin, c'est un ennemi mort »", 'degats+3'],
      ["« Je fais un peu de tout, et plutôt bien »", 'polyvalent+3 degats+1 soin+1 tank+1'],
    ]),
    // --- besoin « portee » : contact ou distance ---
    Q('tri', 'portee', "Une araignée géante dans la salle de bain :", [
      ["Chausson en main, je fonce", 'contact+3 explosif+1'],
      ["Je la vise à la bombe insecticide depuis le couloir", 'distance+3'],
      ["Je ferme la porte et j'envoie le chat", 'distance+1 compagnon+3'],
      ["Je la capture délicatement et je la relâche dehors", 'distance+1 nature+2 patient+1'],
    ]),
    Q('tri', 'portee', "Pour régler un conflit, tu préfères :", [
      ["Les yeux dans les yeux, à vingt centimètres", 'contact+3'],
      ["Un long message bien argumenté, de loin", 'distance+3 complexe+1'],
      ["Envoyer quelqu'un parler à ta place", 'distance+1 compagnon+2'],
      ["Ça dépend complètement de mon humeur du jour", 'polyvalent+2'],
    ]),
    Q('tri', 'portee', "Au paintball, ta stratégie :", [
      ["Je charge en hurlant", 'contact+3 explosif+2'],
      ["Je me poste en hauteur et je ne bouge plus", 'distance+3 patient+2'],
      ["Je contourne tout le monde par derrière", 'contact+2 furtif+3'],
      ["Je pose des pièges et j'attends qu'ils viennent", 'distance+2 controle+2'],
    ]),
    Q('tri', 'portee', "Le feu d'artifice du 14 juillet, tu le regardes :", [
      ["Au premier rang, quitte à sentir la poudre", 'contact+2 explosif+1'],
      ["De loin, avec une vue sur tout", 'distance+3'],
      ["C'est moi qui allume les mèches", 'distance+1 explosif+2 elements+2'],
    ]),
    Q('tri', 'portee', "En jeu, la consigne « reste à distance » te fait :", [
      ["Rire. Je veux sentir l'odeur de mon adversaire", 'contact+3'],
      ["Plaisir, c'est toute ma vie", 'distance+3'],
      ["Hausser les épaules, je m'adapte", 'polyvalent+2'],
    ]),
    Q('tri', 'portee', "Le combat idéal ressemble à :", [
      ["Une bagarre de saloon", 'contact+3 robuste+1'],
      ["Un duel de tireurs d'élite", 'distance+3 patient+1'],
      ["Une partie d'échecs où l'autre ne me touche jamais", 'distance+2 controle+3'],
      ["Un coup de couteau dans une ruelle sombre", 'contact+2 furtif+2 sombre+1'],
    ]),
    // --- besoin « groupe » : solo ou groupe ---
    Q('tri', 'groupe', "Le vendredi soir idéal :", [
      ["Seul, plaid, série, et personne ne m'appelle", 'solo+3'],
      ["Un resto avec toute la bande, et ça finit tard", 'groupe+3'],
      ["Un petit comité de deux ou trois potes", 'groupe+1 solo+1'],
      ["Avec mon chien, c'est mon meilleur pote", 'solo+2 compagnon+3'],
    ]),
    Q('tri', 'groupe', "Une quête « groupe de 5 recommandé » :", [
      ["Je la fais seul, par fierté", 'solo+3 robuste+1'],
      ["Je cherche un groupe, c'est plus drôle", 'groupe+3'],
      ["Je l'abandonne, trop de social", 'solo+2'],
      ["Je propose mes services, ils auront sûrement besoin de moi", 'groupe+2 soin+1 tank+1'],
    ]),
    Q('tri', 'groupe', "Au boulot, tu préfères :", [
      ["Travailler seul dans mon coin, au calme", 'solo+3'],
      ["Les projets d'équipe, même les réunions", 'groupe+3'],
      ["Être le pilier dont tout le monde dépend", 'groupe+2 tank+1 soin+1'],
      ["Bosser seul, mais que tout le monde voie mes résultats", 'solo+1 degats+2'],
    ]),
    Q('tri', 'groupe', "Ta guilde organise une soirée de quatre heures contre un gros boss :", [
      ["J'y suis, avec des chips", 'groupe+3 pve+1'],
      ["Quatre heures ? Je préfère farmer tranquille", 'solo+3'],
      ["Seulement si on a vraiment besoin de moi", 'groupe+1 soin+1 tank+1'],
      ["J'y vais surtout pour l'ambiance du vocal", 'groupe+2'],
    ]),
    Q('tri', 'groupe', "Tu pars en voyage :", [
      ["Sac à dos, seul au bout du monde", 'solo+3'],
      ["Voyage organisé, tout le monde ensemble", 'groupe+3'],
      ["Avec un ou deux potes de confiance", 'groupe+1'],
      ["Avec mon animal, sinon je ne pars pas", 'compagnon+3 solo+1'],
    ]),
    Q('tri', 'groupe', "Les gens qui te demandent de l'aide, c'est :", [
      ["Mon carburant, j'adore être utile", 'groupe+2 soin+2'],
      ["Une gêne : débrouillez-vous", 'solo+3'],
      ["Ça dépend s'ils m'apportent des croissants", 'solo+1 groupe+1'],
    ]),
    // --- besoin « mode » : PvP ou PvE ---
    Q('tri', 'mode', "Sur un jeu de société, tu es celui qui :", [
      ["Veut écraser les autres, même au Uno", 'pvp+3 explosif+1'],
      ["Préfère les jeux coopératifs : on gagne ensemble", 'pve+3 groupe+1'],
      ["Lit toutes les règles et optimise sa stratégie", 'pve+1 complexe+2'],
      ["Triche un peu, très discrètement", 'pvp+2 furtif+2'],
    ]),
    Q('tri', 'mode', "Ce qui te procure le plus de plaisir en jeu :", [
      ["Battre un vrai joueur qui se croyait fort", 'pvp+3'],
      ["Tomber un boss que personne n'avait encore tué", 'pve+3'],
      ["Finir une quête épique avec une belle histoire", 'pve+2 patient+1'],
      ["Tendre une embuscade au milieu de la route", 'pvp+2 furtif+2'],
    ]),
    Q('tri', 'mode', "Un joueur adverse te nargue à l'entrée du village :", [
      ["Je le provoque en duel immédiatement", 'pvp+3 contact+1'],
      ["Je l'ignore, j'ai des quêtes à finir", 'pve+3'],
      ["Je le suis discrètement… et j'attends qu'il soit occupé", 'pvp+2 furtif+3'],
      ["J'appelle toute la guilde", 'pvp+1 groupe+2'],
    ]),
    Q('tri', 'mode', "Ton jeu vidéo préféré parle plutôt de :", [
      ["Affronter d'autres joueurs en ligne", 'pvp+3'],
      ["Explorer un monde immense", 'pve+2 solo+1 nature+1'],
      ["Monter une équipe pour vaincre de gros monstres", 'pve+2 groupe+2'],
      ["Construire, optimiser, calculer", 'pve+1 complexe+3'],
    ]),
    Q('tri', 'mode', "Un champ de bataille à 40 contre 40 :", [
      ["Le paradis sur terre", 'pvp+3 groupe+1'],
      ["Un enfer bruyant, très peu pour moi", 'pve+3'],
      ["J'y vais, mais je garde un drapeau tout seul dans mon coin", 'pvp+1 solo+2'],
      ["Je soigne tout ce qui bouge", 'pvp+1 soin+2 groupe+1'],
    ]),
    Q('tri', 'mode', "Ta plus grande fierté de joueur :", [
      ["Mon classement en arène", 'pvp+3'],
      ["Mon équipement arraché aux boss les plus durs", 'pve+3 groupe+1'],
      ["Ma collection de montures et d'animaux", 'pve+1 compagnon+2'],
      ["Le nombre de joueurs qui me détestent", 'pvp+2 furtif+1 sombre+1'],
    ]),
    // --- besoin « tempo » : explosif ou patient ---
    Q('tri', 'tempo', "Au restaurant, le serveur est très lent :", [
      ["Je m'énerve au bout de cinq minutes", 'explosif+3'],
      ["J'attends, j'ai tout mon temps", 'patient+3'],
      ["Je commande tout d'un coup pour gagner du temps", 'explosif+1 complexe+1'],
      ["Je calcule le moment parfait pour l'interpeller", 'patient+1 controle+2'],
    ]),
    Q('tri', 'tempo', "Au jeu vidéo, tu préfères :", [
      ["Un gros coup qui fait exploser le compteur", 'explosif+3'],
      ["Des dégâts qui grignotent l'ennemi jusqu'à la fin", 'patient+3 sombre+1'],
      ["Un rythme régulier, sans surprise", 'patient+1 simple+2'],
    ]),
    Q('tri', 'tempo', "Ta conduite en voiture :", [
      ["Pied au plancher, toujours", 'explosif+3'],
      ["Prudent, régulier, j'arrive entier", 'patient+3 robuste+1'],
      ["J'anticipe tous les feux, je ne freine jamais", 'patient+1 complexe+2'],
      ["Ça dépend de la musique", 'polyvalent+2 explosif+1'],
    ]),
    Q('tri', 'tempo', "Pour un gâteau d'anniversaire :", [
      ["J'improvise, four à fond, on verra bien", 'explosif+3 simple+1'],
      ["Recette au gramme près, minuteur à la main", 'patient+2 complexe+2'],
      ["J'en achète un, la vie est courte", 'simple+3'],
    ]),
    Q('tri', 'tempo', "Face à un ennemi très résistant, tu :", [
      ["Balances tout dès la première seconde", 'explosif+3'],
      ["Places tes effets et tu les laisses faire le travail", 'patient+3 sombre+1'],
      ["Gardes ton plus gros coup pour la fin", 'patient+1 explosif+1 controle+1'],
    ]),
    Q('tri', 'tempo', "Tes amis te décrivent comme :", [
      ["Une pile électrique", 'explosif+3'],
      ["Un roc, calme en toutes circonstances", 'patient+3 robuste+1'],
      ["Imprévisible", 'explosif+1 polyvalent+2'],
      ["Le cerveau de la bande", 'complexe+3'],
    ]),
    // --- besoin « complexite » : simple ou compliqué ---
    Q('tri', 'complexite', "Tu reçois un nouveau téléphone :", [
      ["Je lis le manuel en entier et je règle chaque option", 'complexe+3'],
      ["Je l'allume et ça doit marcher", 'simple+3'],
      ["Je le personnalise jusqu'à ce que plus personne ne sache s'en servir", 'complexe+2 solo+1'],
    ]),
    Q('tri', 'complexite', "Ta barre de raccourcis idéale :", [
      ["Trois boutons. Quatre, maximum", 'simple+3'],
      ["Toutes mes touches sont prises, même Maj+Ctrl+F12", 'complexe+3'],
      ["Juste assez pour réagir à tout", 'complexe+1 polyvalent+1'],
    ]),
    Q('tri', 'complexite', "Une recette de cuisine en 25 étapes :", [
      ["Défi accepté", 'complexe+3 patient+1'],
      ["Je saute directement à l'étape 25 et je goûte", 'simple+3 explosif+1'],
      ["Je la simplifie à ma sauce", 'simple+1 polyvalent+1'],
    ]),
    Q('tri', 'complexite', "Les jeux où il faut gérer dix choses en même temps :", [
      ["J'adore, plus c'est dur, plus c'est bon", 'complexe+3'],
      ["Ça me donne mal à la tête", 'simple+3'],
      ["Ça va, tant que je garde le contrôle", 'complexe+1 controle+2'],
    ]),
    Q('tri', 'complexite', "Un meuble en kit à monter :", [
      ["Notice suivie à la lettre, vis triées par taille", 'complexe+2 patient+2'],
      ["Au feeling. Il reste trois vis, c'est normal", 'simple+3 explosif+1'],
      ["Je paie quelqu'un pour le faire", 'simple+2 compagnon+1'],
      ["J'invente un meuble mieux que celui de la notice", 'complexe+2 polyvalent+1'],
    ]),
    Q('tri', 'complexite', "Ce que tu cherches dans un personnage de jeu :", [
      ["Facile à prendre en main, efficace tout de suite", 'simple+3'],
      ["Difficile à maîtriser, mais monstrueux entre de bonnes mains", 'complexe+3'],
      ["Un peu de tout, pour ne jamais m'ennuyer", 'polyvalent+3'],
    ]),

    /* ================= PHASE 2 : AFFINAGE ================= */
    // --- compagnon ---
    Q('affinage', 'compagnon', "Un animal de compagnie, pour toi, c'est :", [
      ["Un membre de la famille, il dort dans mon lit", 'compagnon+3 nature+1'],
      ["Des poils partout, non merci", 'compagnon-2'],
      ["Pratique pour faire le sale boulot", 'compagnon+2 sombre+2'],
      ["Pourquoi pas, s'il est bien dressé", 'compagnon+1 controle+1'],
    ]),
    Q('affinage', 'compagnon', "Tu préférerais avoir comme acolyte :", [
      ["Un loup fidèle", 'compagnon+3 nature+2'],
      ["Une créature terrifiante qui obéit au doigt et à l'œil", 'compagnon+3 sombre+3'],
      ["Personne, je bosse seul", 'compagnon-2 solo+1'],
      ["Un ami qui me soigne quand je fais n'importe quoi", 'groupe+2'],
    ]),
    Q('affinage', 'compagnon', "Dans un film, ton personnage préféré est souvent :", [
      ["Celui qui parle aux animaux", 'compagnon+2 nature+3'],
      ["Le méchant avec son monstre de compagnie", 'compagnon+2 sombre+3'],
      ["Le loup solitaire sans attaches", 'solo+2 compagnon-1 furtif+1'],
      ["Le héros qui protège tout le monde", 'lumiere+2 tank+1'],
    ]),
    Q('affinage', 'compagnon', "Ton fidèle compagnon tombe au combat. Tu :", [
      ["Le pleures, puis tu le ramènes à la vie", 'compagnon+3 nature+1'],
      ["En appelles un autre, il y en a plein", 'compagnon+2 sombre+2'],
      ["Quel compagnon ? Je me débrouille seul", 'compagnon-3'],
    ]),
    Q('affinage', 'compagnon', "Tu as un chien. Il est :", [
      ["Dressé pour attaquer sur commande", 'compagnon+3 pvp+1'],
      ["Un gros pépère qui dort toute la journée", 'compagnon+1 patient+1'],
      ["Je n'ai pas de chien et c'est très bien comme ça", 'compagnon-2'],
      ["C'est un chat. Méchant. Comme moi.", 'compagnon+1 sombre+1 furtif+1'],
    ]),
    Q('affinage', 'compagnon', "Laisser un compagnon faire la moitié du travail :", [
      ["Génial, je délègue tout", 'compagnon+3 simple+1'],
      ["Jamais, je ne fais confiance qu'à moi", 'compagnon-3 solo+1'],
      ["Oui, mais c'est moi qui donne les ordres", 'compagnon+2 controle+1'],
    ]),
    // --- furtif ---
    Q('affinage', 'furtif', "Tu arrives à une soirée où tu ne connais personne :", [
      ["Personne ne me voit arriver, c'est le but", 'furtif+3'],
      ["J'entre en criant « QUI VEUT DANSER ? »", 'explosif+2 furtif-2'],
      ["Je repère d'abord la sortie et le buffet", 'furtif+1 controle+1'],
      ["Je vais aider en cuisine, ça m'occupe", 'soin+1 groupe+1'],
    ]),
    Q('affinage', 'furtif', "Ta façon préférée de gagner un combat :", [
      ["Frapper avant qu'il comprenne ce qui se passe", 'furtif+3 explosif+1'],
      ["Encaisser tout ce qu'il a, puis répondre", 'robuste+3 tank+1'],
      ["Le prendre de vitesse avec la magie", 'distance+2 elements+2'],
      ["Le laisser s'épuiser sur mes protections", 'robuste+2 lumiere+1 patient+1'],
    ]),
    Q('affinage', 'furtif', "Ta technique au cache-cache :", [
      ["Si bien caché qu'ils arrêtent de me chercher", 'furtif+3 solo+1'],
      ["Je compte, je trouve tout le monde, je gagne", 'pvp+1 controle+1'],
      ["Je me déguise en plante verte", 'metamorphe+3 nature+1'],
      ["Je ne joue pas, c'est pour les enfants", 'simple+1'],
    ]),
    Q('affinage', 'furtif', "Tu dois récupérer un objet dans un camp ennemi :", [
      ["J'y vais seul, en silence, personne ne saura", 'furtif+3 solo+1'],
      ["J'y vais en force, qu'ils viennent", 'robuste+2 contact+2'],
      ["Je mets les gardes hors d'état de nuire de loin", 'controle+3 distance+1'],
      ["J'envoie mon fidèle compagnon le chercher", 'compagnon+3'],
    ]),
    Q('affinage', 'furtif', "Ouvrir un combat, idéalement, c'est :", [
      ["Depuis l'ombre, par derrière", 'furtif+3 contact+1'],
      ["De très loin, avant qu'il me voie", 'distance+3'],
      ["En courant droit sur lui", 'contact+2 explosif+2 furtif-1'],
      ["Peu importe, c'est la fin qui compte", 'robuste+1'],
    ]),
    Q('affinage', 'furtif', "Ce qu'on te reproche le plus souvent :", [
      ["De disparaître sans prévenir", 'furtif+3 solo+1'],
      ["De parler trop fort", 'explosif+2 furtif-1'],
      ["D'en faire trop pour les autres", 'soin+2 groupe+1'],
      ["De tout compliquer", 'complexe+2'],
    ]),
    // --- sombre ---
    Q('affinage', 'sombre', "Un pouvoir incroyable, mais il te coûte un peu de santé à chaque fois :", [
      ["Signé. Le prix fait partie du jeu", 'sombre+3'],
      ["Hors de question, je reste pur", 'lumiere+3 sombre-2'],
      ["Seulement si c'est la nature qui me le donne", 'nature+3'],
      ["Je préfère compter sur mes muscles", 'contact+1 robuste+2'],
    ]),
    Q('affinage', 'sombre', "Ton genre de film préféré :", [
      ["Horreur, malédictions, maisons hantées", 'sombre+3'],
      ["Chevaliers, honneur, le bien triomphe", 'lumiere+3'],
      ["Grands espaces, forêts, animaux sauvages", 'nature+3'],
      ["Science-fiction et grosses explosions", 'elements+2 explosif+2'],
    ]),
    Q('affinage', 'sombre', "Tu peux maudire quelqu'un. Tu :", [
      ["Commences une liste. Une longue liste", 'sombre+3 patient+1'],
      ["Refuses, la vengeance ce n'est pas mon truc", 'lumiere+2'],
      ["Préfères lui mettre une claque, c'est plus honnête", 'contact+2 sombre-1'],
      ["Le maudis juste pour qu'il ait le hoquet trois jours", 'sombre+1 controle+1'],
    ]),
    Q('affinage', 'sombre', "Les couleurs de ta tenue de combat :", [
      ["Noir et violet, avec des crânes si possible", 'sombre+3'],
      ["Blanc et or, comme un saint", 'lumiere+3'],
      ["Vert et marron, je me fonds dans le décor", 'nature+2 furtif+1'],
      ["Bleu glacé ou rouge feu", 'elements+3'],
    ]),
    Q('affinage', 'sombre', "Une créature des enfers te propose un contrat :", [
      ["Je lis les petites lignes et je négocie à mon avantage", 'sombre+3 complexe+1'],
      ["Je lui fais un sermon et je repars", 'lumiere+3'],
      ["Je lui mets un coup de tête", 'contact+2 explosif+1'],
      ["Je fais semblant d'accepter et je file avec le stylo", 'furtif+2'],
    ]),
    Q('affinage', 'sombre', "On te dit : « Tu as un côté sombre. » Tu réponds :", [
      ["Seulement un côté ?", 'sombre+3'],
      ["Moi ? Je suis un ange", 'lumiere+2'],
      ["Je suis juste un peu sauvage", 'nature+2 explosif+1'],
    ]),
    Q('affinage', 'sombre', "À Halloween, tu te déguises en :", [
      ["Sorcier maléfique avec sa bestiole", 'sombre+2 compagnon+2'],
      ["Rien, mais je fais peur quand même", 'sombre+2 solo+1'],
      ["Chevalier en armure, même s'il fait chaud", 'lumiere+2 robuste+2'],
      ["Loup-garou, pour la transformation", 'metamorphe+3 nature+1'],
    ]),
    // --- nature ---
    Q('affinage', 'nature', "Ton week-end parfait :", [
      ["Randonnée en forêt, sans réseau", 'nature+3 solo+1'],
      ["Bibliothèque, café et livres poussiéreux", 'complexe+2 distance+1'],
      ["Salle de sport, puis encore salle de sport", 'robuste+2 contact+1'],
      ["Grand repas de famille autour d'un feu", 'nature+1 groupe+2'],
    ]),
    Q('affinage', 'nature', "Tu parles à tes plantes ?", [
      ["Oui, et elles me répondent", 'nature+3'],
      ["Non, je les oublie et elles meurent", 'nature-2'],
      ["Je leur parle mal pour qu'elles poussent plus vite", 'sombre+1 nature+1'],
    ]),
    Q('affinage', 'nature', "La foudre tombe à dix mètres de toi :", [
      ["Magnifique. J'aimerais la contrôler", 'elements+3 nature+1'],
      ["Je cours me mettre à l'abri", 'patient+1'],
      ["Je reste calme, la nature a ses raisons", 'nature+3 patient+1'],
      ["Je fais un selfie", 'explosif+1'],
    ]),
    Q('affinage', 'nature', "Le meilleur pouvoir magique :", [
      ["Parler aux esprits des ancêtres", 'nature+2 elements+1 polyvalent+1'],
      ["Me transformer en animal", 'metamorphe+3 nature+2'],
      ["Manipuler le feu et la glace", 'elements+3'],
      ["Invoquer des créatures d'un autre monde", 'sombre+2 compagnon+2'],
    ]),
    Q('affinage', 'nature', "Camping sauvage, il pleut des cordes :", [
      ["Parfait, je dors à la belle étoile quand même", 'nature+3 robuste+1'],
      ["Je file à l'hôtel le plus proche", 'nature-2'],
      ["Je monte la tente pour tout le monde", 'groupe+2 tank+1'],
    ]),
    Q('affinage', 'nature', "Le mélange qui te parle le plus :", [
      ["Les éléments et les esprits", 'elements+2 nature+2 polyvalent+1'],
      ["La lune, les étoiles et la forêt", 'nature+3 metamorphe+1'],
      ["Le métal, la sueur et le bruit", 'robuste+2 contact+2'],
      ["Les livres, les runes et les calculs", 'complexe+3'],
    ]),
    // --- lumiere ---
    Q('affinage', 'lumiere', "Tu vois quelqu'un se faire racketter dans la rue :", [
      ["J'interviens, c'est mon devoir", 'lumiere+3 tank+1 contact+1'],
      ["J'appelle de l'aide et je m'occupe de la victime", 'soin+2 lumiere+1'],
      ["Je suis le racketteur jusque chez lui…", 'furtif+2 sombre+1'],
      ["Je filme, ça peut servir", 'distance+1'],
    ]),
    Q('affinage', 'lumiere', "Ta devise :", [
      ["Justice et honneur", 'lumiere+3 robuste+1'],
      ["La fin justifie les moyens", 'sombre+2 complexe+1'],
      ["Vivre et laisser vivre", 'nature+2 patient+1'],
      ["Taper d'abord, discuter après", 'explosif+2 contact+1'],
    ]),
    Q('affinage', 'lumiere', "La foi, les convictions, les causes justes :", [
      ["C'est ce qui me fait avancer", 'lumiere+3'],
      ["Je crois surtout en moi", 'solo+2'],
      ["Je crois aux esprits de la nature", 'nature+3'],
      ["Je crois en mon compte en banque", 'simple+1 sombre+1'],
    ]),
    Q('affinage', 'lumiere', "Porter une armure étincelante avec une grande cape :", [
      ["Oui, et un marteau énorme avec", 'lumiere+2 robuste+3 contact+1'],
      ["Trop lourd, je préfère bouger", 'furtif+1 robuste-1'],
      ["Une robe, c'est plus confortable", 'distance+2 robuste-1'],
      ["Des peaux de bête, c'est plus authentique", 'nature+2'],
    ]),
    Q('affinage', 'lumiere', "Tu es dans un hôpital de campagne en pleine bataille :", [
      ["Je soigne, je prie, je tiens bon", 'soin+3 lumiere+2'],
      ["Je soigne avec ce que la nature m'offre", 'soin+3 nature+2'],
      ["Je garde l'entrée : personne ne passe", 'tank+3 robuste+1'],
      ["Je repars au front, c'est là qu'on gagne", 'degats+2'],
    ]),
    Q('affinage', 'lumiere', "Ton côté « bon samaritain » :", [
      ["C'est toute ma personnalité", 'lumiere+2 soin+2'],
      ["Il ressort quand on me regarde", 'pvp+1'],
      ["Très faible, je suis plutôt chat de gouttière", 'furtif+1 sombre+1 solo+1'],
    ]),
    // --- polyvalent ---
    Q('affinage', 'polyvalent', "Il manque quelqu'un dans ton groupe. Tu :", [
      ["Prends le rôle qui manque, peu importe lequel", 'polyvalent+3'],
      ["Fais ce que je sais faire : je suis spécialiste", 'polyvalent-2'],
      ["Râles, mais tu changes de rôle quand même", 'polyvalent+2 explosif+1'],
    ]),
    Q('affinage', 'polyvalent', "Couteau suisse ou katana ?", [
      ["Couteau suisse, pour tout faire", 'polyvalent+3'],
      ["Katana : une seule chose, mais parfaitement", 'polyvalent-2 explosif+1'],
      ["Une pelle, ça sert toujours", 'robuste+1 simple+1'],
    ]),
    Q('affinage', 'polyvalent', "Ton CV ressemble à :", [
      ["Douze métiers différents, tous passionnants", 'polyvalent+3'],
      ["Le même métier depuis quinze ans, et j'y excelle", 'polyvalent-2 patient+2'],
      ["Un mystère : personne ne sait vraiment ce que je fais", 'furtif+2 sombre+1'],
    ]),
    Q('affinage', 'polyvalent', "Pouvoir changer de forme selon la situation :", [
      ["Le rêve absolu", 'metamorphe+3 polyvalent+2'],
      ["Je préfère rester moi-même, avec plein d'outils", 'polyvalent+2 elements+1'],
      ["Inutile, je règle tout avec la même méthode", 'polyvalent-2 simple+1'],
    ]),
    Q('affinage', 'polyvalent', "En jeu, tu changes de façon de jouer :", [
      ["Toutes les semaines, j'aime tout tester", 'polyvalent+3 complexe+1'],
      ["Jamais, je suis fidèle", 'polyvalent-2'],
      ["Quand la guilde me le demande", 'polyvalent+1 groupe+2'],
    ]),
    Q('affinage', 'polyvalent', "En soirée, tu sais :", [
      ["Cuisiner, animer, réparer la sono et consoler les gens", 'polyvalent+3 soin+1'],
      ["Faire une seule chose, mais mieux que tout le monde", 'polyvalent-2'],
      ["Disparaître juste avant la vaisselle", 'furtif+2 solo+1'],
    ]),
    // --- controle ---
    Q('affinage', 'controle', "Dans une discussion animée, tu :", [
      ["Mènes le débat et poses les règles", 'controle+3 complexe+1'],
      ["Tapes du poing sur la table", 'explosif+2 contact+1'],
      ["Te tais et attends ton moment pour placer LA phrase", 'patient+2 furtif+1'],
      ["Calmes tout le monde", 'soin+2'],
    ]),
    Q('affinage', 'controle', "Le super-pouvoir que tu choisis :", [
      ["Figer le temps autour de moi", 'controle+3 elements+1'],
      ["Être invisible", 'furtif+3'],
      ["Être indestructible", 'robuste+3'],
      ["Guérir n'importe qui", 'soin+3'],
    ]),
    Q('affinage', 'controle', "Gérer un adversaire, c'est :", [
      ["L'empêcher de bouger, de parler, de respirer", 'controle+3'],
      ["Le frapper plus fort que lui", 'explosif+2 contact+1'],
      ["Le laisser se fatiguer contre mon bouclier", 'robuste+2 tank+1'],
      ["Le laisser à mon compagnon", 'compagnon+2'],
    ]),
    Q('affinage', 'controle', "Échecs, bras de fer ou poker ?", [
      ["Échecs, évidemment", 'controle+2 complexe+2'],
      ["Bras de fer, et je gagne", 'contact+2 robuste+2'],
      ["Poker, pour le bluff", 'furtif+2 complexe+1'],
    ]),
    Q('affinage', 'controle', "Ton plan face à trois ennemis à la fois :", [
      ["J'en neutralise deux pendant que je m'occupe du troisième", 'controle+3'],
      ["Je les prends tous en même temps, venez", 'tank+2 robuste+2'],
      ["Je recule, je les ralentis, je recommence", 'distance+2 controle+1 elements+1'],
      ["J'en endors un, j'assomme l'autre et je disparais", 'furtif+2 controle+2'],
    ]),
    Q('affinage', 'controle', "Le mot qui te décrit en combat :", [
      ["Stratège", 'controle+2 complexe+2'],
      ["Bulldozer", 'robuste+2 explosif+2'],
      ["Fantôme", 'furtif+3'],
      ["Infirmier", 'soin+3'],
    ]),
    // --- robuste ---
    Q('affinage', 'robuste', "Tu rates une marche et tu tombes dans l'escalier :", [
      ["Je me relève : même pas mal", 'robuste+3'],
      ["J'étais déjà en train de me soigner avant d'arriver en bas", 'soin+2 robuste+1'],
      ["Je fais le mort pour qu'on me plaigne", 'furtif+1 sombre+1'],
    ]),
    Q('affinage', 'robuste', "Ton rapport à la douleur :", [
      ["Elle me rend plus fort", 'robuste+3 explosif+1'],
      ["Je l'évite en ne me faisant jamais toucher", 'distance+2 controle+1'],
      ["Je la transforme en pouvoir", 'sombre+2'],
      ["Je la soigne chez les autres avant chez moi", 'soin+2 groupe+1'],
    ]),
    Q('affinage', 'robuste', "Tu préfères être :", [
      ["Inarrêtable, même si je suis lent", 'robuste+3 tank+1'],
      ["Rapide et fragile", 'explosif+2 furtif+1 robuste-1'],
      ["Loin et intouchable", 'distance+3 robuste-1'],
    ]),
    Q('affinage', 'robuste', "Quand ça tourne mal, tu es celui qui :", [
      ["Se met devant les autres", 'tank+2 robuste+2'],
      ["Garde tout le monde en vie", 'soin+3'],
      ["Sauve sa peau d'abord", 'solo+2 furtif+1'],
      ["Finit le travail coûte que coûte", 'degats+2 explosif+1'],
    ]),
    Q('affinage', 'robuste', "Ta tenue de sport :", [
      ["Gilet lesté, je cours avec vingt kilos sur le dos", 'robuste+3'],
      ["Tenue légère, je dois être rapide", 'furtif+1 explosif+1'],
      ["Pyjama. Le sport, c'est mental", 'distance+1 complexe+1'],
    ]),
    Q('affinage', 'robuste', "Mourir en jeu, pour toi, c'est :", [
      ["Rare. Très rare. Je suis increvable", 'robuste+3'],
      ["Normal, je prends des risques", 'explosif+2'],
      ["Impossible, je m'enfuis toujours à temps", 'furtif+2 controle+1'],
      ["Pas grave, je sais me relever tout seul", 'polyvalent+1 nature+1'],
    ]),
    // --- elements ---
    Q('affinage', 'elements', "Feu ou glace ?", [
      ["Le feu, pour que ça brûle", 'elements+3 explosif+2 s.mage.feu+2 s.demoniste.destruction+1'],
      ["La glace, pour que ça s'arrête", 'elements+3 controle+2 s.mage.givre+2'],
      ["La foudre, pour les deux", 'elements+3 nature+1 c.chaman+2'],
      ["Ni l'un ni l'autre : mes poings", 'contact+2 elements-1'],
    ]),
    Q('affinage', 'elements', "L'élément qui te ressemble :", [
      ["La terre et ses tremblements", 'elements+2 nature+2 robuste+1'],
      ["L'eau qui soigne", 'elements+1 soin+2 nature+1'],
      ["Le feu qui détruit", 'elements+3 explosif+1'],
      ["L'air et les tempêtes", 'elements+2 nature+1 explosif+1'],
    ]),
    Q('affinage', 'elements', "Tu veux que ta magie soit :", [
      ["Pure énergie, calculée, maîtrisée", 'complexe+2 elements+1 s.mage.arcanes+2'],
      ["Sauvage, brute, liée à la terre", 'nature+2 elements+2'],
      ["Interdite et dangereuse", 'sombre+3'],
      ["Sacrée", 'lumiere+3'],
    ]),
    Q('affinage', 'elements', "Un orage éclate pendant ton barbecue :", [
      ["Parfait, j'ajoute des éclairs à la cuisson", 'elements+3 explosif+1'],
      ["Je mets tout le monde à l'abri", 'groupe+2 soin+1'],
      ["Je continue, un peu d'eau n'a jamais tué personne", 'robuste+2 nature+1'],
    ]),
    Q('affinage', 'elements', "Ton plat préféré :", [
      ["Très épicé, qui brûle", 'elements+2 explosif+2'],
      ["Une glace à la vanille, même en hiver", 'elements+2 controle+1 patient+1'],
      ["Une grosse viande saignante", 'contact+2 robuste+1'],
      ["Une salade du jardin", 'nature+2'],
    ]),
    Q('affinage', 'elements', "Explosion ou poison lent ?", [
      ["Explosion, tout de suite", 'explosif+3 elements+2'],
      ["Poison lent : ils s'en rendront compte trop tard", 'patient+3 sombre+2'],
      ["Ni l'un ni l'autre, un bon coup bien placé", 'contact+2 furtif+1'],
    ]),
    // --- metamorphe ---
    Q('affinage', 'metamorphe', "Si tu devais te transformer en animal :", [
      ["Un ours, pour encaisser", 'metamorphe+3 tank+2'],
      ["Un félin, pour rôder dans l'ombre", 'metamorphe+3 furtif+2 degats+1'],
      ["Un oiseau, pour tout voir de haut", 'metamorphe+2 distance+2'],
      ["Aucun, je suis très bien comme ça", 'metamorphe-3'],
    ]),
    Q('affinage', 'metamorphe', "Avoir plusieurs formes avec des rôles différents :", [
      ["Génial, je change selon le besoin", 'metamorphe+3 polyvalent+2'],
      ["Trop compliqué, je veux une seule forme", 'metamorphe-2 simple+1'],
      ["Ça me va, tant que je peux soigner aussi", 'metamorphe+1 soin+2'],
    ]),
    Q('affinage', 'metamorphe', "Les loups-garous dans les films :", [
      ["La meilleure créature de tous les temps", 'metamorphe+3 explosif+1'],
      ["Bof, je préfère les vampires", 'sombre+2'],
      ["Trop de poils", 'metamorphe-2'],
    ]),
    Q('affinage', 'metamorphe', "Arbre, ours, chat ou phoque : ta forme pour le week-end ?", [
      ["L'arbre, pour ne rien faire et soigner les fleurs", 'metamorphe+2 soin+2 patient+1'],
      ["L'ours, pour dormir et cogner", 'metamorphe+2 tank+2'],
      ["Le chat, pour faire des bêtises la nuit", 'metamorphe+2 furtif+2'],
      ["Le phoque, pour nager tranquille", 'metamorphe+2 nature+2 solo+1'],
    ]),
    // --- departage-melee : au corps à corps ---
    Q('affinage', 'departage-melee', "Ton arme idéale :", [
      ["Une énorme hache à deux mains", 'c.guerrier+2 robuste+1 explosif+1'],
      ["Deux petites lames, rapides et vicieuses", 'c.voleur+2 furtif+1'],
      ["Un marteau béni et un bouclier", 'c.paladin+2 lumiere+2'],
      ["Mes griffes", 'c.druide+2 metamorphe+2'],
    ]),
    Q('affinage', 'departage-melee', "Pour toi, une bonne bagarre, c'est :", [
      ["Rentrer dedans et ne jamais reculer", 'c.guerrier+2 robuste+1'],
      ["Frapper là où ça fait mal, au bon moment", 'c.voleur+2 complexe+1'],
      ["Cogner avec la puissance de l'orage", 'c.chaman+2 elements+2'],
      ["Encaisser, me soigner un coup, et recommencer", 'c.paladin+2 robuste+1 soin+1'],
    ]),
    Q('affinage', 'departage-melee', "Ce qui te donne de la puissance :", [
      ["La colère qui monte à chaque coup que je reçois", 'c.guerrier+3 explosif+1'],
      ["Une énergie qui se recharge vite pour enchaîner", 'c.voleur+2 explosif+1'],
      ["Une réserve de magie à bien gérer", 'c.paladin+1 c.chaman+1 complexe+1'],
      ["Changer de forme selon ce qui arrive", 'c.druide+3 metamorphe+1'],
    ]),
    Q('affinage', 'departage-melee', "Au corps à corps, ton plus gros atout :", [
      ["Ma force brute", 'c.guerrier+2 robuste+1'],
      ["Ma vitesse et mes coups bas", 'c.voleur+2 furtif+1'],
      ["Me soigner en pleine bagarre", 'c.paladin+2 c.chaman+1 polyvalent+1'],
      ["Les éléments qui frappent avec moi", 'c.chaman+2 elements+2'],
    ]),
    Q('affinage', 'departage-melee', "Un ennemi s'enfuit à toute vitesse :", [
      ["Je fonce et je le rattrape", 'c.guerrier+2 explosif+1'],
      ["Je lui lance un truc dans les jambes et je l'achève", 'c.voleur+1 controle+1'],
      ["Je me transforme en bête rapide", 'c.druide+2 metamorphe+2'],
      ["Je lui envoie un éclair dans le dos", 'c.chaman+2 elements+1'],
    ]),
    Q('affinage', 'departage-melee', "Quand tu reçois un très gros coup :", [
      ["Je hurle et je tape encore plus fort", 'c.guerrier+3'],
      ["J'esquive : je n'étais déjà plus là", 'c.voleur+2 furtif+1'],
      ["Je me mets à l'abri dans une bulle, le temps de souffler", 'c.paladin+3'],
      ["Je me soigne et je continue", 'c.chaman+1 c.druide+1 polyvalent+1'],
    ]),
    Q('affinage', 'departage-melee', "Ton look au combat :", [
      ["Armure lourde, cicatrices et poussière", 'c.guerrier+2 robuste+2'],
      ["Cuir sombre, capuche et regard en coin", 'c.voleur+2 furtif+2'],
      ["Plaques brillantes et tabard impeccable", 'c.paladin+2 lumiere+2'],
      ["Peaux, plumes et colliers d'os", 'c.chaman+1 c.druide+1 nature+2'],
    ]),
    Q('affinage', 'departage-melee', "Le meilleur moment d'un combat :", [
      ["Le premier impact, quand je rentre dedans", 'c.guerrier+2 explosif+1'],
      ["Quand il se retourne et comprend qu'il est perdu", 'c.voleur+2 furtif+1'],
      ["Quand mes coups déclenchent un orage", 'c.chaman+2 elements+1'],
      ["Quand je retourne la situation alors que tout semblait perdu", 'c.paladin+1 c.druide+1 robuste+1'],
    ]),
    Q('affinage', 'departage-melee', "Ton rapport aux règles en combat :", [
      ["Combat honorable, face à face", 'c.guerrier+1 c.paladin+2 lumiere+1'],
      ["Les règles ? Le sable dans les yeux, ça compte", 'c.voleur+3'],
      ["Je m'adapte à ce que fait l'adversaire", 'c.druide+1 c.chaman+1 polyvalent+2'],
    ]),
    Q('affinage', 'departage-melee', "Ton réflexe de survie au corps à corps :", [
      ["Je pare, je bloque, j'encaisse", 'c.guerrier+2 robuste+1'],
      ["Je disparais et je reviens par derrière", 'c.voleur+3 furtif+1'],
      ["Je change de forme pour encaisser", 'c.druide+2 metamorphe+1'],
      ["Je prie un bon coup", 'c.paladin+2 lumiere+1'],
    ]),
    // --- departage-distance : à distance ---
    Q('affinage', 'departage-distance', "Ta façon de faire mal de loin :", [
      ["Des flèches. Beaucoup de flèches", 'c.chasseur+3'],
      ["Des boules de feu et des pics de glace", 'c.mage+3 elements+1'],
      ["Des malédictions qui rongent l'adversaire", 'c.demoniste+2 sombre+2 patient+1'],
      ["La foudre et la lave", 'c.chaman+2 elements+2'],
    ]),
    Q('affinage', 'departage-distance', "Ta magie préférée :", [
      ["Celle des étoiles et de la lune", 'c.druide+3 nature+1'],
      ["Celle de l'ombre, qui ronge l'esprit", 'c.pretre+2 sombre+2'],
      ["Un feu venu d'un autre monde", 'c.demoniste+2 sombre+1 elements+1'],
      ["Le givre, l'énergie pure et la téléportation", 'c.mage+3'],
    ]),
    Q('affinage', 'departage-distance', "Un ennemi te colle alors que tu attaques de loin :", [
      ["Je le gèle sur place et je m'éloigne", 'c.mage+2 controle+2'],
      ["Je lui envoie mon fidèle compagnon et je recule", 'c.chasseur+2 compagnon+1 c.demoniste+1'],
      ["Je le terrifie, il part en courant", 'c.demoniste+1 c.pretre+1 controle+2'],
      ["Je le repousse avec une onde de tonnerre", 'c.chaman+1 c.druide+1 nature+1'],
    ]),
    Q('affinage', 'departage-distance', "Ta ressource idéale :", [
      ["Une immense réserve de magie gérée au millimètre", 'c.mage+1 c.pretre+1 complexe+1'],
      ["Ma propre santé, que je sacrifie pour plus de pouvoir", 'c.demoniste+3 sombre+1'],
      ["Des munitions et un bon œil", 'c.chasseur+3'],
      ["Une harmonie avec la nature", 'c.druide+1 c.chaman+1 nature+2'],
    ]),
    Q('affinage', 'departage-distance', "Ton gadget préféré au quotidien :", [
      ["Un téléporteur pour rentrer chez moi en un clic", 'c.mage+3'],
      ["Une longue-vue et une boussole", 'c.chasseur+2 nature+1'],
      ["Un grimoire bizarre qui sent le soufre", 'c.demoniste+3'],
      ["Une bougie et beaucoup de méditation", 'c.pretre+2 patient+1'],
    ]),
    Q('affinage', 'departage-distance', "La victoire parfaite à distance contre un joueur :", [
      ["Il n'a jamais pu me toucher", 'c.mage+2 c.chasseur+1 controle+1'],
      ["Il est mort de mes malédictions en me courant après", 'c.demoniste+2 c.pretre+1 patient+1'],
      ["Mon animal l'a fini pendant que je visais", 'c.chasseur+2 compagnon+2'],
      ["Un énorme éclair pour finir", 'c.chaman+2 explosif+1'],
    ]),
    Q('affinage', 'departage-distance', "Ton pique-nique est attaqué par des guêpes :", [
      ["Je les fais toutes flamber, ainsi que la nappe", 'c.mage+2 explosif+2'],
      ["Je les fais fuir en les terrorisant", 'c.demoniste+1 c.pretre+1 sombre+1'],
      ["Je les vise une par une", 'c.chasseur+2 patient+1'],
      ["Je demande gentiment à la nature de les éloigner", 'c.druide+2 c.chaman+1 nature+1'],
    ]),
    Q('affinage', 'departage-distance', "Ce qui t'attire le plus :", [
      ["Maîtriser la magie par l'étude", 'c.mage+3 complexe+1'],
      ["Pactiser avec des forces interdites", 'c.demoniste+3 sombre+1'],
      ["Comprendre les esprits et les éléments", 'c.chaman+2 nature+1'],
      ["Plonger dans l'esprit des autres", 'c.pretre+2 sombre+1 controle+1'],
    ]),
    Q('affinage', 'departage-distance', "Ton coin préféré en forêt :", [
      ["Perché dans un arbre avec mon arc", 'c.chasseur+2 nature+1'],
      ["Une clairière au clair de lune", 'c.druide+3'],
      ["Une vieille ruine hantée", 'c.demoniste+1 c.pretre+1 sombre+2'],
      ["Aucun, je préfère ma tour pleine de livres", 'c.mage+2 complexe+1'],
    ]),
    Q('affinage', 'departage-distance', "Tu n'as droit qu'à un seul pouvoir de déplacement :", [
      ["Me téléporter quelques mètres plus loin", 'c.mage+3'],
      ["Un portail pour faire venir mes amis jusqu'à moi", 'c.demoniste+2 groupe+1'],
      ["Me transformer en loup pour courir", 'c.chaman+2'],
      ["Sauter en arrière tout en tirant", 'c.chasseur+2'],
    ]),
    // --- departage-soin : entre soigneurs ---
    Q('affinage', 'departage-soin', "Ta méthode pour soigner :", [
      ["La prière et la lumière", 'c.pretre+2 lumiere+2'],
      ["Imposer les mains en armure lourde, au milieu de la mêlée", 'c.paladin+3 robuste+1'],
      ["Des vagues d'eau qui rebondissent sur tout le groupe", 'c.chaman+3'],
      ["Des fleurs qui poussent et soignent avec le temps", 'c.druide+3 patient+1'],
    ]),
    Q('affinage', 'departage-soin', "Tu soignes de préférence :", [
      ["Un seul allié, très fort, au bon moment", 'c.paladin+2 c.pretre+1'],
      ["Tout le groupe à la fois", 'c.chaman+2 c.pretre+1'],
      ["Petit à petit, avec des soins qui durent", 'c.druide+3'],
      ["En empêchant les dégâts avant qu'ils arrivent", 'c.pretre+2 complexe+1'],
    ]),
    Q('affinage', 'departage-soin', "Le soigneur que tu veux être :", [
      ["Celui qui ne meurt jamais, même quand tout le monde le vise", 'c.paladin+2 robuste+2'],
      ["Celui qui peut aussi se battre s'il le faut", 'c.chaman+1 c.druide+1 polyvalent+2'],
      ["Celui qui soigne mieux que personne, point", 'c.pretre+3'],
    ]),
    Q('affinage', 'departage-soin', "Quand personne n'a besoin de soins :", [
      ["Je tape un peu, avec mon marteau", 'c.paladin+2 contact+1'],
      ["Je lance des éclairs pour passer le temps", 'c.chaman+2 elements+1'],
      ["Je me change en chat pour aller voir devant", 'c.druide+2 metamorphe+1'],
      ["Je médite et je juge les autres en silence", 'c.pretre+2 patient+1'],
    ]),
    Q('affinage', 'departage-soin', "Ton outil de soigneur idéal :", [
      ["Un bouclier qui absorbe les coups", 'c.pretre+3'],
      ["Un objet planté au sol qui aide tout le groupe", 'c.chaman+3 groupe+1'],
      ["Une aura qui protège tous ceux autour de moi", 'c.paladin+2 lumiere+1'],
      ["Une forme végétale qui fait pousser des soins partout", 'c.druide+3'],
    ]),
    Q('affinage', 'departage-soin', "Un allié meurt malgré tes soins :", [
      ["Je le relève, et je sais même me relever tout seul", 'c.chaman+2'],
      ["Je le relève en plein combat, c'est rare mais je peux", 'c.druide+3'],
      ["Je lui fais un sermon après l'avoir relevé", 'c.pretre+1 c.paladin+1 lumiere+1'],
      ["Tant pis pour lui, il n'avait qu'à rester derrière moi", 'c.paladin+1 robuste+1 tank+1'],
    ]),
    Q('affinage', 'departage-soin', "Ta tenue de soigneur :", [
      ["Robe blanche et capuche", 'c.pretre+2'],
      ["Plaques dorées", 'c.paladin+2'],
      ["Mailles et plumes", 'c.chaman+2'],
      ["Cuir et feuilles", 'c.druide+2'],
    ]),
    Q('affinage', 'departage-soin', "En soirée, quelqu'un se blesse :", [
      ["Trousse de secours, gestes précis, discours rassurant", 'c.pretre+2 complexe+1'],
      ["Tisane maison et remède de grand-mère", 'c.druide+2 c.chaman+1 nature+1'],
      ["Je le porte jusqu'aux urgences", 'c.paladin+2 robuste+1'],
    ]),
    // --- departage-tank : entre protecteurs ---
    Q('affinage', 'departage-tank', "Pour protéger tes potes, tu :", [
      ["Te mets devant avec un grand bouclier", 'c.guerrier+2 c.paladin+1 robuste+1'],
      ["Deviens énorme et poilu, et tu encaisses tout", 'c.druide+3'],
      ["Brilles si fort que les ennemis ne voient que toi", 'c.paladin+3 lumiere+1'],
    ]),
    Q('affinage', 'departage-tank', "Garder l'attention de tous les ennemis :", [
      ["En les provoquant un par un, avec des cris", 'c.guerrier+3'],
      ["En les attirant tous dans ma zone sacrée", 'c.paladin+3'],
      ["En devenant un mur de fourrure", 'c.druide+3'],
    ]),
    Q('affinage', 'departage-tank', "Un protecteur qui fait aussi des dégâts, c'est :", [
      ["Normal, je suis là pour gagner", 'c.guerrier+2 explosif+1'],
      ["Bien, mais je préfère pouvoir me soigner un peu", 'c.paladin+2 soin+1'],
      ["Encore mieux s'il change de rôle en deux secondes", 'c.druide+2 polyvalent+2'],
    ]),
    Q('affinage', 'departage-tank', "Ta plus grosse peur quand tu protèges le groupe :", [
      ["Être à court d'énergie au pire moment", 'c.guerrier+2'],
      ["Que le soigneur m'oublie", 'c.guerrier+1 c.druide+1'],
      ["Rien : je me soigne moi-même", 'c.paladin+2 soin+1'],
    ]),
    Q('affinage', 'departage-tank', "Ton cri de guerre :", [
      ["« POUR LA HORDE ! » et je fonce", 'c.guerrier+2 explosif+1'],
      ["« Par la Lumière ! »", 'c.paladin+3 lumiere+2'],
      ["Un rugissement qui fait trembler la forêt", 'c.druide+2 metamorphe+1 nature+1'],
    ]),
    // --- departage-ombre : côté obscur de l'esprit ou pacte avec d'autres mondes ---
    Q('affinage', 'departage-ombre', "Ton côté obscur, il vient d'où ?", [
      ["De l'esprit : je sais aussi réparer ce que je casse", 's.pretre.ombre+3 soin+1'],
      ["D'un pacte signé avec un autre monde", 'c.demoniste+3 compagnon+1'],
      ["De mon passé, je n'en parle pas", 'furtif+1 solo+1'],
    ]),
    Q('affinage', 'departage-ombre', "Pour faire souffrir quelqu'un à distance, tu préfères :", [
      ["M'insinuer dans sa tête jusqu'à ce qu'il craque", 's.pretre.ombre+3 controle+1'],
      ["Envoyer une créature faire le travail pendant que je le maudis", 'c.demoniste+3 compagnon+2'],
      ["Je ne fais souffrir personne, enfin presque", 'lumiere+1 soin+1'],
    ]),
    Q('affinage', 'departage-ombre', "Ta magie interdite, tu la tiens :", [
      ["De vieux textes religieux qu'on aurait dû brûler", 's.pretre.ombre+3 groupe+1'],
      ["D'un grimoire et d'un cercle tracé au sol", 'c.demoniste+3'],
      ["De la nature, elle n'est pas interdite, elle est sauvage", 'nature+2'],
      ["Je n'ai pas de magie interdite, juré", 'lumiere+1'],
    ]),
    // --- departage-nature : étoiles et formes, ou éléments et esprits ---
    Q('affinage', 'departage-nature', "La nature qui te parle :", [
      ["La lune, les étoiles et les animaux de la forêt", 'c.druide+3 metamorphe+1'],
      ["Les esprits de la terre, du feu, de l'eau et de l'air", 'c.chaman+3 elements+1'],
      ["Celle que je traque, arc à la main", 'c.chasseur+2'],
    ]),
    Q('affinage', 'departage-nature', "Pour te déplacer plus vite :", [
      ["Je me transforme en grand félin ou en oiseau", 'c.druide+3 metamorphe+2'],
      ["Je deviens un loup spectral", 'c.chaman+3'],
      ["Je monte sur mon fidèle destrier, comme tout le monde", 'simple+1'],
    ]),
    Q('affinage', 'departage-nature', "En plein orage, tu :", [
      ["T'abrites dans un arbre… en devenant un arbre", 'c.druide+3 metamorphe+1'],
      ["Attrapes la foudre et tu la renvoies", 'c.chaman+3 elements+2'],
      ["Rentres, il pleut", 'nature-1'],
    ]),
    // --- specialisation : affiner la spécialisation ---
    Q('affinage', 'specialisation', "Deux armes ou une énorme ?", [
      ["Deux armes, pour frapper plus souvent", 's.guerrier.fureur+2 s.voleur.combat+1 explosif+1'],
      ["Une énorme, pour frapper plus fort", 's.guerrier.armes+2 s.paladin.vindicte+1 explosif+1'],
      ["Une arme et un bouclier", 's.guerrier.protection+2 s.paladin.protection+2 tank+1'],
      ["Pas d'arme, mes sorts suffisent", 'distance+2'],
    ]),
    Q('affinage', 'specialisation', "Contre un très gros boss, ton rôle de rêve :", [
      ["Être tout en haut du compteur de dégâts", 'degats+2 groupe+1 explosif+1 s.guerrier.fureur+1 s.mage.feu+1 s.voleur.combat+1'],
      ["Tenir le boss pendant que tout le monde tape", 'tank+3 groupe+1'],
      ["Être celui qui empêche tout le monde de mourir", 'soin+3 groupe+1'],
      ["Apporter un peu de tout au groupe", 'polyvalent+2 groupe+1'],
    ]),
    Q('affinage', 'specialisation', "Un énorme coup critique :", [
      ["Oui ! Je vis pour les gros chiffres jaunes", 'explosif+3 s.mage.feu+2 s.demoniste.destruction+2 s.chasseur.precision+1'],
      ["Je préfère contrôler totalement mon adversaire", 'controle+3 s.mage.givre+2 s.voleur.finesse+1'],
      ["Je préfère qu'il meure lentement", 'patient+3 s.demoniste.affliction+2 s.pretre.ombre+1'],
    ]),
    Q('affinage', 'specialisation', "Ton poison préféré :", [
      ["Celui qui tue vite", 's.voleur.assassinat+3 explosif+1'],
      ["Celui qui empêche l'autre de se soigner", 's.voleur.finesse+1 pvp+2 controle+1'],
      ["Aucun, je veux juste taper vite et longtemps", 's.voleur.combat+2 simple+1'],
      ["Le poison, c'est lâche", 'lumiere+2 furtif-1'],
    ]),
    Q('affinage', 'specialisation', "Ton compagnon idéal en combat :", [
      ["Un gros félin qui fait tout le travail", 's.chasseur.betes+3 compagnon+2'],
      ["Il est là pour la déco, c'est moi qui fais les dégâts", 's.chasseur.precision+2 compagnon-1'],
      ["Pièges et filets : je n'ai besoin de personne", 's.chasseur.survie+3 controle+1'],
      ["Une créature venue d'ailleurs", 's.demoniste.demonologie+3 sombre+1'],
    ]),
    Q('affinage', 'specialisation', "Ton rapport aux calculs en jeu :", [
      ["J'optimise mon enchaînement à la milliseconde", 'complexe+3 s.mage.arcanes+2 s.pretre.discipline+1'],
      ["J'appuie et je regarde ce qui se passe", 'simple+3'],
      ["J'empile des effets et je les laisse travailler", 'patient+2 s.demoniste.affliction+2'],
    ]),
    Q('affinage', 'specialisation', "Soigner ou empêcher les dégâts avant qu'ils arrivent ?", [
      ["Soigner, c'est plus satisfaisant", 'soin+2 s.pretre.sacre+2 s.paladin.sacre+1'],
      ["Prévenir : un bouclier vaut mieux que dix soins", 'soin+2 s.pretre.discipline+3'],
      ["Ni l'un ni l'autre, je préfère taper", 'degats+3'],
    ]),
    Q('affinage', 'specialisation', "Dans le noir complet, tu préfères :", [
      ["Faire peur et rendre fou", 's.pretre.ombre+3 sombre+2'],
      ["Allumer une lumière pour rassurer tout le monde", 's.pretre.sacre+2 lumiere+2'],
      ["Me cacher dedans", 'furtif+3'],
    ]),
    Q('affinage', 'specialisation', "La nature, tu la préfères :", [
      ["Douce, apaisante, qui guérit", 'soin+2 nature+2 s.druide.restauration+2 s.chaman.restauration+1'],
      ["Sauvage, avec des crocs et des griffes", 's.druide.farouche+3 contact+1'],
      ["Puissante, avec des tempêtes et des étoiles filantes", 's.druide.equilibre+2 s.chaman.elementaire+2'],
      ["Peu importe, du moment que je cogne avec", 's.chaman.amelioration+2 contact+2'],
    ]),
    Q('affinage', 'specialisation', "On te donne un gros marteau. Tu :", [
      ["Frappes, et la lumière frappe avec toi", 's.paladin.vindicte+3'],
      ["Protèges tout le monde derrière ton bouclier", 's.paladin.protection+2 s.guerrier.protection+1 tank+2'],
      ["Le poses et tu soignes", 's.paladin.sacre+2 soin+2'],
      ["Le lances sur quelqu'un, c'est plus drôle", 'explosif+2 distance+1'],
    ]),
    Q('affinage', 'specialisation', "Tu préfères gagner :", [
      ["En combat singulier, l'arme à la main", 's.guerrier.armes+2 pvp+2'],
      ["En tête du classement de dégâts", 's.guerrier.fureur+1 s.voleur.combat+1 s.mage.feu+1 groupe+1'],
      ["Sans que l'adversaire ne m'ait jamais vu", 's.voleur.finesse+2 s.voleur.assassinat+1 furtif+2'],
    ]),
    Q('affinage', 'specialisation', "Ta créature invoquée idéale :", [
      ["Un gros garde du corps qui encaisse pour moi", 's.demoniste.demonologie+3 robuste+1'],
      ["Un petit diablotin qui m'assiste de loin, je fais le reste", 's.demoniste.destruction+2'],
      ["Aucune, juste moi et mes malédictions", 's.demoniste.affliction+2 patient+1'],
      ["Un esprit animal", 'c.chaman+1 c.chasseur+1 nature+1'],
    ]),
    // --- verif-role : revérifie le rôle et la portée ---
    Q('affinage', 'verif-role', "On te laisse choisir ton rôle pour ce soir :", [
      ["Le héros qui protège", 'tank+2'],
      ["Celui qui fait tout exploser", 'degats+2 explosif+1'],
      ["Celui que tout le monde remercie à la fin", 'soin+2'],
    ]),
    Q('affinage', 'verif-role', "Dans une équipe de jeu, ce qui t'énerve le plus :", [
      ["Les gens qui ne restent pas derrière moi", 'tank+2 robuste+1'],
      ["Les gens qui restent plantés dans le feu", 'soin+2'],
      ["Les gens qui tapent moins fort que moi", 'degats+2 pvp+1'],
      ["Les gens qui parlent trop", 'solo+2'],
    ]),
    Q('affinage', 'verif-role', "Tu préfères avoir la responsabilité de :", [
      ["La vie de tout le groupe", 'soin+3 groupe+1'],
      ["L'attention de tous les ennemis", 'tank+3'],
      ["Uniquement moi-même", 'degats+2 solo+1'],
    ]),
    Q('affinage', 'verif-role', "En voiture avec des potes, tu es :", [
      ["Le conducteur : c'est moi qui décide", 'tank+2 controle+1'],
      ["Celui qui distribue les gâteaux et l'eau", 'soin+2'],
      ["Celui qui met la musique à fond", 'degats+1 explosif+2'],
      ["Celui qui dort à l'arrière", 'solo+1 patient+1'],
    ]),
    Q('affinage', 'verif-role', "Ta distance de sécurité avec un adversaire :", [
      ["Zéro mètre, je veux le contact", 'contact+3'],
      ["Trente mètres minimum", 'distance+3'],
      ["Juste assez pour le voir venir", 'distance+1 controle+1'],
    ]),
    Q('affinage', 'verif-role', "Ton héros de dessin animé :", [
      ["Le costaud qui protège ses amis", 'tank+2 robuste+1'],
      ["La petite maline qui soigne tout le monde", 'soin+2'],
      ["Le tireur d'élite qui ne parle jamais", 'distance+2 solo+1'],
      ["Le ninja", 'contact+1 furtif+2'],
    ]),
    Q('affinage', 'verif-role', "Ce qui te rend le plus fier après un combat :", [
      ["Personne n'est mort", 'soin+3'],
      ["Les ennemis n'ont vu que moi, les autres étaient tranquilles", 'tank+3'],
      ["C'est moi qui ai porté le coup final", 'degats+3'],
    ]),
    Q('affinage', 'verif-role', "Une bagarre éclate au bar :", [
      ["Je suis au milieu, évidemment", 'contact+3 explosif+1'],
      ["Je lance des tabourets depuis le comptoir", 'distance+2 explosif+1'],
      ["Je soigne les blessés dans un coin", 'soin+3'],
      ["Je suis déjà dehors, avec le portefeuille de quelqu'un", 'furtif+3 sombre+1'],
    ]),
    // --- style-pvp ---
    Q('affinage', 'style-pvp', "En duel, tu gagnes surtout grâce à :", [
      ["Ma résistance : je ne tombe jamais", 'robuste+3 pvp+1'],
      ["Mon contrôle : il ne peut rien faire", 'controle+3 pvp+1'],
      ["La surprise : il n'a rien vu venir", 'furtif+3 pvp+1'],
      ["Mes dégâts : il fond", 'explosif+3'],
    ]),
    Q('affinage', 'style-pvp', "Défendre un fort ou l'attaquer ?", [
      ["Le défendre jusqu'au bout", 'tank+2 robuste+1 patient+1'],
      ["L'attaquer le premier", 'explosif+2 contact+1'],
      ["M'infiltrer et ouvrir la porte de l'intérieur", 'furtif+3'],
      ["Soigner ceux qui attaquent", 'soin+2 groupe+1'],
    ]),
    Q('affinage', 'style-pvp', "Un adversaire bien plus fort que toi :", [
      ["Je fonce quand même, sur un malentendu ça passe", 'explosif+2 contact+1'],
      ["Je le ralentis, je le gèle, je l'use", 'controle+3 distance+1 elements+1'],
      ["Je l'évite et je m'attaque à son soigneur", 'furtif+2 complexe+1'],
      ["J'appelle mes amis", 'groupe+3'],
    ]),
    Q('affinage', 'style-pvp', "Ta vengeance après être mort en jeu :", [
      ["Je reviens tout de suite, encore plus énervé", 'explosif+2 robuste+1'],
      ["J'attends patiemment le moment parfait", 'patient+2 furtif+2'],
      ["Je le maudis jusqu'à la fin de ses jours", 'sombre+3'],
      ["Je passe à autre chose, la vie est belle", 'pve+2 lumiere+1'],
    ]),
    Q('affinage', 'style-pvp', "Ton rôle idéal sur un champ de bataille :", [
      ["Porter le drapeau sans jamais mourir", 'robuste+2 tank+1 polyvalent+1'],
      ["Tuer le porteur de drapeau adverse", 'degats+2 explosif+1'],
      ["Garder la base tout seul", 'solo+2 patient+1 controle+1'],
      ["Garder mon équipe en vie", 'soin+3'],
    ]),
    Q('affinage', 'style-pvp', "Ce qui t'agace le plus chez un adversaire :", [
      ["Qu'il reste hors de portée", 'contact+2'],
      ["Qu'il me colle aux basques", 'distance+2'],
      ["Qu'il soit invisible", 'lumiere+1 controle+1'],
      ["Qu'il se soigne", 'degats+2'],
    ]),
    // --- style-groupe ---
    Q('affinage', 'style-groupe', "Dans un groupe d'amis, ton rôle :", [
      ["Le chef", 'tank+2 controle+1'],
      ["La maman", 'soin+3'],
      ["Le clown", 'explosif+2 polyvalent+1'],
      ["Le mystérieux du fond", 'furtif+2 solo+1'],
    ]),
    Q('affinage', 'style-groupe', "Une sortie à vingt personnes :", [
      ["C'est moi qui l'organise", 'groupe+3 complexe+1'],
      ["J'y vais si mes deux potes viennent", 'groupe+1'],
      ["Je préfère une balade seul avec mon chien", 'solo+2 compagnon+2'],
    ]),
    Q('affinage', 'style-groupe', "Ce qui te motive le plus en jeu :", [
      ["Être indispensable au groupe", 'groupe+2 soin+1 tank+1'],
      ["Être autonome, ne dépendre de personne", 'solo+3 robuste+1'],
      ["Être le meilleur, et que tout le monde le sache", 'degats+2 pvp+1'],
      ["Découvrir les secrets du monde", 'pve+2 complexe+1 nature+1'],
    ]),
    Q('affinage', 'style-groupe', "Pour monter de niveau, tu préfères :", [
      ["Seul, à mon rythme", 'solo+3 compagnon+1'],
      ["En duo avec un pote", 'groupe+1 polyvalent+1'],
      ["En donjon, en boucle, avec des inconnus", 'groupe+2 pve+1'],
    ]),
    Q('affinage', 'style-groupe', "Se débrouiller sans aucune aide :", [
      ["Ma spécialité : je me soigne, je tape, je fuis", 'solo+2 polyvalent+2'],
      ["Possible, avec mon fidèle compagnon", 'solo+2 compagnon+2'],
      ["Difficile, je suis fait pour le groupe", 'groupe+3'],
      ["Facile, rien ne me tue", 'robuste+3 solo+1'],
    ]),
    // --- verif-tempo ---
    Q('affinage', 'verif-tempo', "Aux jeux de cartes, tu :", [
      ["Gardes tes meilleures cartes pour la fin", 'patient+3 controle+1'],
      ["Joues tout, tout de suite", 'explosif+3'],
      ["Bluffes", 'furtif+2 complexe+1'],
    ]),
    Q('affinage', 'verif-tempo', "Ton rythme le matin :", [
      ["Debout, café, action", 'explosif+2'],
      ["Une heure pour émerger, lentement", 'patient+2'],
      ["Ça dépend complètement du jour", 'polyvalent+2'],
    ]),
    Q('affinage', 'verif-tempo', "Tu préfères que tes dégâts soient :", [
      ["Réguliers et constants, du début à la fin", 'patient+2 simple+1'],
      ["Tous concentrés en quelques secondes", 'explosif+3'],
      ["Cachés, et qu'ils s'accumulent sans qu'on les voie", 'patient+2 sombre+2'],
    ]),
    Q('affinage', 'verif-tempo', "Coincé dans un embouteillage, tu :", [
      ["Klaxonnes", 'explosif+3'],
      ["Écoutes un podcast de trois heures", 'patient+3 complexe+1'],
      ["Prends un chemin secret que personne ne connaît", 'furtif+2 complexe+1'],
      ["Aides la voiture en panne devant toi", 'soin+2 tank+1'],
    ]),
    // --- verif-complexite ---
    Q('affinage', 'verif-complexite', "Les pouvoirs que tu préfères :", [
      ["Ceux qui changent selon ce que j'ai lancé avant", 'complexe+3'],
      ["Un gros bouton qui fait très mal", 'simple+3 explosif+1'],
      ["Ceux qui m'offrent des choix tactiques", 'complexe+2 controle+1'],
    ]),
    Q('affinage', 'verif-complexite', "Un tutoriel, pour toi :", [
      ["Je le regarde en entier, puis je cherche des guides avancés", 'complexe+3'],
      ["Je le passe, j'apprends en jouant", 'simple+2 explosif+1'],
      ["Je le passe, je meurs, je recommence", 'explosif+2 robuste+1'],
    ]),
    Q('affinage', 'verif-complexite', "Ton bureau :", [
      ["Parfaitement rangé, chaque chose à sa place", 'complexe+2 patient+1 controle+1'],
      ["Un chaos dans lequel je retrouve tout", 'polyvalent+2'],
      ["Vide. J'ai un ordinateur portable et c'est tout", 'simple+3'],
    ]),
    Q('affinage', 'verif-complexite', "Gérer plusieurs jauges à la fois (vie, magie, munitions, compagnon…) :", [
      ["Plus il y en a, mieux c'est", 'complexe+3'],
      ["Une seule jauge, c'est très bien", 'simple+3'],
      ["Ça va, tant qu'un compagnon m'aide", 'compagnon+2'],
    ]),

    /* ================= PHASE 3 : CONFIRMATION (mises en situation) ================= */
    Q('confirmation', 'situation', "Le donjon tourne mal, tout le monde panique. Toi :", [
      ["Je hurle « sur moi ! » et j'attire tous les monstres", 'c.guerrier+2 tank+1'],
      ["Je disparais, je reviendrai quand ce sera calme", 'c.voleur+2 furtif+1'],
      ["Je gèle tout ce qui bouge et je m'éloigne", 'c.mage+2 controle+1'],
      ["Je fais tomber une pluie de soins", 'c.druide+1 c.chaman+1 soin+1'],
    ]),
    Q('confirmation', 'situation', "Ta journée parfaite en jeu, honnêtement :", [
      ["Farmer seul avec mon animal en écoutant de la musique", 'c.chasseur+2 solo+1'],
      ["Enchaîner les arènes jusqu'à trois heures du matin", 'c.voleur+1 c.mage+1 pvp+2'],
      ["Porter tout le raid sur mes épaules", 'c.guerrier+1 c.paladin+1 tank+1'],
      ["Être réclamé partout parce que je soigne", 'c.pretre+2 soin+1'],
    ]),
    Q('confirmation', 'situation', "On te propose un pacte secret :", [
      ["J'accepte, le pouvoir n'a pas de prix", 'c.demoniste+3'],
      ["Je refuse, mon honneur avant tout", 'c.paladin+2 c.guerrier+1'],
      ["Je demande d'abord conseil aux esprits", 'c.chaman+2'],
      ["Je demande d'abord conseil à la forêt", 'c.druide+2'],
    ]),
    Q('confirmation', 'situation', "Tu as dix secondes pour arrêter quelqu'un qui s'enfuit à trente mètres :", [
      ["Je tire, je tire, je tire", 'c.chasseur+3'],
      ["Un énorme sort de feu", 'c.mage+2 c.demoniste+1'],
      ["Je cours, je le rattrape, je le frappe", 'c.guerrier+2 c.chaman+1'],
      ["Je le maudis : il tombera plus loin, de toute façon", 'c.demoniste+2 c.pretre+1'],
    ]),
    Q('confirmation', 'piege', "Question piège : tu préfères être aimé ou craint ?", [
      ["Aimé : je prends soin des gens", 'c.pretre+1 c.druide+1 soin+2'],
      ["Craint : c'est plus efficace", 'c.demoniste+1 c.voleur+1 sombre+1'],
      ["Respecté, nuance", 'c.guerrier+2 c.paladin+1'],
      ["Ignoré : je fais ma vie", 'c.chasseur+1 solo+2'],
    ]),
    Q('confirmation', 'situation', "Le boss enrage, il lui reste 5 % de vie :", [
      ["Je lance tout ce qui me reste, tant pis pour la réserve", 'c.mage+2 explosif+1'],
      ["Je me place entre lui et le soigneur", 'c.guerrier+1 c.paladin+2'],
      ["Je relève quelqu'un en plein combat", 'c.druide+3'],
      ["Je reste en vie quoi qu'il arrive et je finis le travail", 'c.chasseur+1 c.voleur+1 robuste+1'],
    ]),
    Q('confirmation', 'piege', "Ton plus gros défaut en équipe :", [
      ["Je fonce sans attendre les autres", 'c.guerrier+2 explosif+1'],
      ["Je fais ma vie dans mon coin avec mon compagnon", 'c.chasseur+2 c.demoniste+1'],
      ["Je juge les autres quand ils restent dans le feu", 'c.pretre+2'],
      ["Je change d'avis toutes les cinq minutes", 'c.druide+1 c.chaman+2'],
    ]),
    Q('confirmation', 'situation', "Une seule arme pour survivre sur une île déserte :", [
      ["Un arc", 'c.chasseur+3'],
      ["Une dague", 'c.voleur+3'],
      ["Un bouclier", 'c.guerrier+1 c.paladin+2'],
      ["Un bâton magique", 'c.mage+1 c.druide+1 c.chaman+1'],
    ]),
    Q('confirmation', 'situation', "Un ennemi invisible rôde autour de toi :", [
      ["Je le révèle et je le juge", 'c.paladin+1 c.pretre+1 lumiere+1'],
      ["Je me cache aussi, on verra qui craque le premier", 'c.voleur+3'],
      ["Mon animal le sent, il va le trouver", 'c.chasseur+2'],
      ["Je gèle tout autour de moi et j'attends", 'c.mage+2'],
    ]),
    Q('confirmation', 'situation', "Tes potes te laissent choisir le resto :", [
      ["Un grill : de la viande, et on parle fort", 'c.guerrier+2'],
      ["Un petit resto bio, ambiance forêt", 'c.druide+2'],
      ["Un restaurant chic où tout est pesé au gramme", 'c.mage+2 complexe+1'],
      ["Un bar louche au fond d'une ruelle", 'c.voleur+1 c.demoniste+1'],
    ]),
    Q('confirmation', 'piege', "Choisis une seule de ces sensations :", [
      ["Faire tomber l'adversaire d'un seul coup", 'c.voleur+1 c.guerrier+1 explosif+1'],
      ["Voir mes malédictions le ronger", 'c.demoniste+2 c.pretre+1'],
      ["Survivre à l'impossible", 'c.paladin+2 robuste+1'],
      ["Sentir l'orage sortir de mes mains", 'c.chaman+3'],
    ]),
    Q('confirmation', 'piege', "Un ami te prête son jeu pour une soirée. Tu prends :", [
      ["Le personnage le plus simple, pour gagner tout de suite", 'c.chasseur+1 c.paladin+1 simple+1'],
      ["Celui que personne ne sait jouer", 'c.druide+1 c.voleur+1 complexe+1'],
      ["Celui qui fait les plus gros chiffres", 'c.mage+2'],
      ["Celui qui ne meurt jamais", 'c.guerrier+1 c.paladin+1 c.demoniste+1'],
    ]),
    Q('confirmation', 'piege', "Ton animal fétiche (pour rire) :", [
      ["Le loup", 'c.chaman+2'],
      ["Le hibou", 'c.druide+2'],
      ["Le chat noir", 'c.voleur+2 c.demoniste+1'],
      ["Le taureau", 'c.guerrier+2'],
    ]),
    Q('confirmation', 'situation', "Une file d'attente interminable :", [
      ["Je double tout le monde, discrètement", 'c.voleur+2'],
      ["Je patiente en lisant un vieux grimoire", 'c.mage+1 c.demoniste+1'],
      ["Je papote et je rends service autour de moi", 'c.pretre+1 c.chaman+1'],
      ["Je pousse, poliment mais fermement", 'c.guerrier+1 c.paladin+1'],
    ]),
    Q('confirmation', 'piege', "Le rôle que tu as toujours rêvé de jouer :", [
      ["Le chevalier sacré", 'c.paladin+3'],
      ["Le sorcier aux pouvoirs interdits", 'c.demoniste+2'],
      ["Le gardien de la forêt", 'c.druide+2'],
      ["Le confesseur qui lit dans les esprits", 'c.pretre+2'],
    ]),
    Q('confirmation', 'piege', "Question piège : quand tu perds, c'est la faute de :", [
      ["Mon soigneur", 'c.guerrier+1 c.voleur+1'],
      ["Celui qui devait encaisser", 'c.pretre+1 c.chaman+1 soin+1'],
      ["Mon animal, il est nul", 'c.chasseur+2'],
      ["Personne, je ne perds jamais (sauf contre Sauce)", 'c.paladin+1 c.mage+1'],
    ]),
    Q('confirmation', 'situation', "Ta façon d'ouvrir un colis :", [
      ["Je l'éventre à mains nues", 'c.guerrier+2'],
      ["Je le découpe proprement avec un petit couteau", 'c.voleur+2'],
      ["Je le fais flamber", 'c.mage+1 c.demoniste+1'],
      ["Avec mes griffes… pardon, mes ongles", 'c.druide+2'],
    ]),
    Q('confirmation', 'piege', "Dans une histoire de fantasy, tu es :", [
      ["Le traqueur solitaire et son loup", 'c.chasseur+3'],
      ["Le vieux sage qui parle aux esprits", 'c.chaman+2'],
      ["Le saint homme qui doute de tout", 'c.pretre+2'],
      ["Le vétéran couvert de cicatrices", 'c.guerrier+2'],
    ]),
    Q('confirmation', 'situation', "Tu reçois un super-pouvoir pour une journée :", [
      ["Ne jamais être touché", 'c.voleur+1 c.mage+1'],
      ["Ne jamais mourir", 'c.paladin+2'],
      ["Commander une armée de créatures", 'c.demoniste+1 c.chasseur+1'],
      ["Changer de corps à volonté", 'c.druide+3'],
    ]),
    Q('confirmation', 'piege', "Ta réaction quand Sauce te bat (encore) :", [
      ["Je relance un duel immédiatement", 'c.guerrier+1 c.voleur+1'],
      ["J'analyse ce qui n'a pas marché", 'c.mage+1 c.pretre+1'],
      ["Je lui envoie mon compagnon", 'c.chasseur+1 c.demoniste+1'],
      ["Je soigne mon ego et je vais cueillir des fleurs", 'c.druide+1 c.chaman+1'],
    ]),
  ];

  /* =====================================================================
     PHASE 4 : RACE — une réponse par race (seules les races compatibles
     avec la classe trouvée sont proposées).
     ===================================================================== */
  const R = (q, orc, mortvivant, tauren, troll, skyborne) => ({ q, r: { orc, mortvivant, tauren, troll, skyborne } });
  D.RACE_QUESTIONS = [
    R("Ton look idéal :", "Massif, peau verte, mâchoire carrée, regard qui dit « essaie pour voir »", "Maigre, os apparents, élégance macabre", "Énorme, des cornes, un gros câlin potentiel", "Grand, dégingandé, avec une crête de cheveux colorée", "Élancé, raffiné, le regard tourné vers le ciel"),
    R("Ta philosophie de vie :", "L'honneur avant tout, même quand ça fait mal", "La vie est courte. La mort aussi, apparemment", "Respire, la terre te porte", "Tranquille, on verra demain", "Toujours plus haut, toujours plus loin"),
    R("Ton humour :", "Direct, et parfois avec les poings", "Noir. Très noir", "Gentil, avec un gros rire grave", "Absurde, je ris de tout", "Fin, subtil, avec un sourcil levé"),
    R("Ton habitat idéal :", "Une forteresse de bois et de pierre dans un désert rouge", "Une ville souterraine, humide et calme", "Des plaines immenses et des tentes sous le vent", "Une île, des palmiers et des huttes au bord de l'eau", "Une cité perchée au-dessus des nuages"),
    R("Le défaut qu'on te reproche :", "Têtu comme une mule", "Cynique", "Trop lent", "Pas sérieux", "Un peu snob"),
    R("Ta danse de victoire :", "Je frappe ma poitrine en hurlant", "Une petite danse raide qui grince", "Je tape des pieds, le sol tremble", "Une danse tribale déchaînée, avec des cris", "Un salut gracieux, presque une révérence"),
    R("Ce qui te rend fier :", "Ma force et ma loyauté envers mon clan", "Avoir survécu à tout, même à la mort", "Ma sagesse et ma patience", "Ma capacité à me remettre de tout", "Ma liberté : personne ne me tient en laisse"),
    R("Un talent inné, offert à la naissance :", "Une fureur qui me rend plus fort au combat", "Ne plus ressentir la peur", "Un coup de sabot qui assomme tout le monde autour", "Des blessures qui se referment toutes seules", "Planer doucement au lieu de tomber"),
    R("Ta boisson :", "Une bière forte dans une chope énorme", "De l'eau. Je n'ai plus vraiment d'estomac", "Une tisane aux herbes des plaines", "Un cocktail exotique avec une petite ombrelle", "Un thé rare, servi dans une tasse en porcelaine"),
    R("Ta musique :", "Des tambours de guerre", "Un violon grinçant dans le brouillard", "Une flûte et des chants autour du feu", "Des percussions, ambiance plage", "Une harpe et le vent dans les cheveux"),
    R("Ton rapport aux autres :", "Fidèle jusqu'à la mort à ceux qui le méritent", "Méfiant : on m'a déjà trahi", "Protecteur, je veille sur les miens", "Cool avec tout le monde, sauf ceux qui me cherchent", "Curieux de tout le monde, mais je garde mes distances"),
    R("En voyage, tu prends :", "Le chemin le plus direct, en ligne droite", "Le chemin qui passe par le cimetière", "Le plus long, à pied, sans se presser", "Celui qui passe par la plage", "Le plus haut, pour la vue"),
    R("Ta façon de parler :", "Fort, court, efficace", "D'une voix rauque et sarcastique", "Lentement, chaque mot est pesé", "Avec un accent chantant et des « mon pote » partout", "Avec élégance et un vocabulaire choisi"),
    R("Au réveil :", "À l'aube, pour l'entraînement", "Je ne dors plus vraiment", "Lentement, comme une montagne qui s'étire", "Midi, c'est bien", "Avec le soleil, sur un balcon en hauteur"),
    R("Ce qui te fait peur :", "Perdre mon honneur", "Rien. Plus rien", "Qu'on abîme la nature", "Manquer une bonne fête", "Être enfermé"),
    R("Ta taille idéale :", "Grand et large, bâti pour la bagarre", "Peu importe, il manque déjà des morceaux", "Le plus grand possible, je veux pouvoir porter des gens", "Grand mais voûté, pour l'élégance", "Fin et élancé"),
    R("Tes vacances :", "Un tournoi de bras de fer", "Une vieille ville pleine d'histoire et de fantômes", "En pleine nature, au calme", "Sur une île, à pêcher et à ne rien faire", "En montagne, tout en haut, au-dessus de tout"),
    R("Ton rapport à la mort :", "Mourir au combat, c'est la plus belle fin", "On a déjà fait connaissance", "Elle fait partie du cycle, ça va", "Les esprits m'attendent, mais ils peuvent attendre", "Je préfère ne pas y penser, je regarde le ciel"),
    R("Ton défaut caché :", "Colérique", "Je sens un peu", "Gourmand", "Paresseux", "Je me crois un peu supérieur"),
    R("Ton cri :", "Un cri de guerre qui fait trembler les murs", "Un ricanement qui glace le sang", "Un mugissement grave et apaisant", "Un rire qui résonne dans toute la jungle", "Un sifflement aigu, comme un rapace"),
    R("Ta démarche :", "Lourde, en roulant des épaules", "Saccadée, mais déterminée", "Lente et puissante", "Souple, voûtée, presque en dansant", "Légère, on dirait que je ne touche pas le sol"),
    R("Le cadeau parfait pour toi :", "Une nouvelle hache", "Un livre de poisons", "Un tambour en peau", "Un masque sculpté et des épices", "Un télescope"),
    R("Ce que tes amis disent de toi :", "« Il ne lâche jamais rien »", "« Il a un humour très particulier »", "« Un gros nounours »", "« Un sacré phénomène »", "« Toujours la tête dans les nuages »"),
    R("Ta coiffure :", "Une tresse de combattant, ou rien du tout", "Il me reste trois cheveux et j'y tiens", "Une crinière tressée avec des perles", "Une crête énorme et colorée", "Longue, soignée, qui vole au vent"),
    R("Pour toi, la Horde, c'est :", "Ma famille, mon sang, ma fierté", "Un arrangement pratique", "Une alliance pour protéger la terre", "Des potes avec qui faire la fête", "Une nouvelle aventure qui commence"),
    R("Le soir autour du feu :", "Je raconte mes batailles, en exagérant", "Je raconte des histoires qui font peur", "Je raconte les légendes des anciens", "Je fais danser tout le monde", "Je regarde les étoiles et je rêve de voler"),
    R("Ton surnom idéal :", "Brise-Crâne", "Le Sans-Repos", "Grand-Sabot-Tranquille", "Le Rigolo", "Plume-de-Vent"),
    R("Ta relation au ciel :", "Tant qu'il ne pleut pas sur le campement", "Il est toujours gris, de toute façon", "Je le respecte, c'est lui qui donne la pluie", "Il sert à bronzer", "J'y appartiens"),
    R("Ton rapport aux règles :", "Les règles du clan, sinon rien", "Je fais les miennes depuis que je suis mort… euh, depuis longtemps", "Celles de la nature suffisent", "Les règles ? Quelles règles ?", "Les règles, c'est pour ceux qui ne volent pas"),
    R("Ton sport préféré :", "La lutte", "L'escrime, avec des coups bas", "Le lancer de tronc", "Le surf", "Le parapente"),
  ];

  root.MVS_QUIZ_DATA = D;
  if (typeof module !== 'undefined' && module.exports) module.exports = D;
})(typeof window !== 'undefined' ? window : globalThis);
