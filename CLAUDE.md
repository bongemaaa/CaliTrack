# CaliTrack

App perso de suivi de calisthénie, PWA installée sur iPhone. Version actuelle : v6.

- Hébergement : GitHub Pages, https://bongemaaa.github.io/CaliTrack/ (dépôt `bongemaaa/CaliTrack`).
- Pas de build, pas de dépendances : les fichiers du dépôt sont servis tels quels.

## Fichiers

Les noms doivent rester **exacts** sur GitHub (ils sont référencés par `sw.js`, `manifest.webmanifest` et `index.html`) :

| Fichier | Rôle |
|---|---|
| `index.html` | Toute l'app (HTML + CSS + JS dans un seul fichier) |
| `sw.js` | Service worker : cache hors ligne, réseau d'abord pour la page |
| `manifest.webmanifest` | Manifeste PWA |
| `icon-180.png`, `icon-192.png`, `icon-512.png` | Icônes (180 = apple-touch-icon) |

## Workflow de mise à jour

1. Claude pousse une branche (jamais directement sur `main`).
2. L'utilisateur crée la PR et la fusionne sur GitHub.
3. Attendre 1–2 min (déploiement GitHub Pages), puis rouvrir l'app 2 fois sur l'iPhone.

Ne pas créer de PR sauf demande explicite.

## Données

- `localStorage`, clé principale `"calitrack.v6"` (autres clés : `calitrack.draft6` brouillon, `calitrack.ui6` état UI, `carnet.theme` thème).
- Export / import JSON dans l'onglet Historique.
- Ne jamais changer la clé ni casser le format sans migration : les données de l'utilisateur n'existent que sur son téléphone (et dans ses exports).

## Onglets

Enregistrer · Routines · Exercices · Progrès · Historique

## Modèle

- **Bibliothèque d'exercices** : mesure en reps / secondes / tentatives ; option avec charge ; option unilatéral ; option « sollicite les poignets » (`wrist`) ; progression aucune / signal / charge / durée / étapes ; fiche « Comment faire ».
- **Routines** : séries, objectif min–max, repos réglé via une roue min/s, enchaîner, level up auto, note.
- **Progrès** : courbe par exercice (1 / 3 / 6 mois / Tout), record de l'exercice sous la courbe ; doigt maintenu sur la courbe = repère qui affiche la séance (date, séries).

### Level up / régression

- **Level up** : haut de la fourchette atteint sur toutes les séries, 2 séances d'affilée.
- **Régression** : moins de la moitié des séries atteint le bas de la fourchette, 2 fois de suite.

## Design

- Style iOS natif, police système ; tailles de texte multipliées par `--ts` (réglage Taille du texte d'iOS, entre ×1 et ×1,24) : toute nouvelle taille s'écrit `font-size:calc(Npx*var(--ts,1))`.
- Accent bleu cobalt (`#2457F5`).
- Mode sombre : fond noir.
- Suppression : glisser vers la gauche puis toucher « Supprimer », ou glisser jusqu'au bout (au-delà de la moitié de la ligne) ; dans les deux cas, confirmation (bouton « Supprimer » rouge / « Annuler » qui remet la ligne en place).
- Animations : uniquement `transform` et `opacity`, interruptibles, sans bibliothèque ; `render()` réécrit `#main`, donc toute animation de contenu est lancée par l'action (WAAPI `el.animate()`), jamais par le rendu. `prefers-reduced-motion` : plus de déplacement, les fondus restent (variable JS `RM`).

## Garde-fou poignets

Avant une séance contenant des kick-ups ou un exercice marqué « Sollicite les poignets » (champ `wrist`, coché d'office quand le nom contient « handstand », y compris par migration des anciennes données), l'app demande l'état des poignets. Si la gêne est > 3/10, les kick-ups sont retirés de la séance.

## Règles pour toute modification

1. **Chaque modification de `index.html` doit garder les noms de fichiers exacts** (`index.html`, `sw.js`, `manifest.webmanifest`, `icon-180.png`, `icon-192.png`, `icon-512.png`) et **continuer à fonctionner hors ligne via `sw.js`**. Concrètement :
   - aucune ressource externe (CDN, police web, script distant) : tout reste inline dans `index.html` ;
   - ne pas retirer l'enregistrement du service worker (`navigator.serviceWorker.register("sw.js")`) ;
   - tout nouveau fichier statique doit être ajouté à la liste `FILES` de `sw.js`.
2. `sw.js` sert la page en réseau d'abord (une nouvelle version de `index.html` apparaît sans toucher à `sw.js`), mais les autres fichiers en cache d'abord : si on modifie une icône, le manifeste ou la liste `FILES`, **incrémenter `CACHE`** dans `sw.js` (ex. `calitrack-v2` → `calitrack-v3`).
3. Préserver la compatibilité des données `calitrack.v6` (voir Données).
4. Rester dans le style iOS natif décrit plus haut ; interface en français.

## Historique des modifications

- **2026-11-02** (PR #2, #3, #4) — Audit iPhone/PWA et corrections : alarme de fin de repos en `<audio>` (WAV généré, en boucle jusqu'à ✕ / ±15 / série suivante / 60 s) avec session audio « playback », qui sonne en mode silencieux et met la musique en pause (la reprise automatique de la musique est impossible en web) ; `sw.js` sert la copie en cache si le réseau ne répond pas en 2,5 s ; alerte si l'enregistrement échoue, `storage.persist()`, rappel d'export dans Historique (date dans `calitrack.ui6`, format `calitrack.v6` inchangé) ; `touch-action: manipulation` (plus de zoom au double-tap sur +/−) et pas de sélection au appui long sur les contrôles ; barre d'onglets et minuteur masqués clavier ouvert ; page derrière une feuille ou une alerte bloquée au niveau du toucher (`touchmove`, pas de `position:fixed` sur `body`, qui figeait la roue de repos) ; `theme-color` suit le thème forcé ; `<title>` remis dans `<head>`, champ d'export de secours en 16 px.
- **2026-11-03** (PR #5, #6, #7) — Stress-test « données extrêmes » (noms longs, non latins et emoji, notes longues, historique vide, 500 séances, charges et reps énormes ; données de test en mémoire uniquement, jamais dans `calitrack.v6`) et corrections : garde-fou poignets basé sur l'option « Sollicite les poignets » (`wrist`, posée par migration additive quand le nom contient « handstand », format `calitrack.v6` inchangé) au lieu du nom ; champs de série en texte + clavier décimal (« 12,5 » lu correctement, plus 125 ni 0) ; confirmation « Valeur inhabituelle » si une saisie dépasse 3× le maximum de l'historique ; retrait d'un exercice d'une séance passée par glissement ; glissement imbriqué corrigé (sélecteurs enfant `>`) ; note de séance repliée à 3 lignes (tap pour déplier) ; URL et mots longs coupés sans défilement horizontal ; champs de série sur deux lignes sous 375 px ; « Sans nom » pour une routine vide, pluriels, année dans les dates hors année en cours ; import : identifiants vérifiés, séries ≤ 20 et repos ≤ 10:59 ; Progrès : période « Tout », lecture au doigt sur la courbe (repère + séance dans l'en-tête), record de l'exercice sous la courbe (la liste Records quitte Historique) ; sauvegarde : un seul fichier partagé et question « Fichier enregistré ? » quand iOS renvoie « annulé » après « Enregistrer dans Fichiers ».
- **2026-11-03** (PR #8, #9) — Revue de finition UI (grille emil-design-eng, identité iOS conservée) et corrections : retour au toucher partout (lignes surlignées par un voile `--press`, contrôles atténués, écouteur `touchstart` pour que Safari iOS applique `:active`), bouton ✓ qui s'enfonce avec une coche qui se dessine, boutons qui pâlissent tout de suite et reviennent en fondu ; feuille qui monte du bas, alerte qui se pose, toast qui glisse du haut, avec sortie animée (`showEl` / `hideEl`, `@starting-style`) ; liseré intérieur sur les champs au lieu du contour web ; mode sombre avec surfaces en relief (#1C1C1E / #2C2C2E) au lieu d'un minuteur et d'un toast blancs ; listes Routines et Exercices groupées à la manière d'iOS, notes de bas de liste alignées (`.foot`), chevrons dessinés, « Abandonner la séance » en texte rouge ; cibles −/+ des steppers à 44 px quand ils sont seuls sur la ligne ; barre du repos continue (`scaleX`) ; « Réduire les animations » coupe les déplacements mais garde les fondus ; glissement pour supprimer à courbe iOS, ouvert par un geste rapide, et glissement jusqu'au bout (au-delà de la moitié de la ligne) qui demande la confirmation, « Annuler » remettant la ligne en place ; carte de routine en appui sous un voile translucide (les puces restaient invisibles). Noms de fichiers, `sw.js` et format `calitrack.v6` inchangés.
- **2026-11-05** (PR #10, #14, #15) — Animations (transform / opacity, interruptibles, `prefers-reduced-motion` respecté) : glissement pour supprimer sans animer `width`, rattrapable en vol, libellé « Supprimer » qui suit la ligne, ligne supprimée qui s'efface puis liste qui se referme (FLIP) ; garde-fou contre les lignes figées sur iOS (fin de geste perdue) ; fondu au changement d'onglet ; minuteur de repos qui monte du bas ; pastille des contrôles segmentés qui glisse ; bandeau Level up qui apparaît une fois ; ouverture / retour d'une routine ou d'un exercice en léger glissement iOS ; + / − Série et « Retirer » en séance animés ; bilan de séance en cascade ; fondu du détail du jour (Historique) et de la courbe (Progrès). La roue de repos reste plate (effet cylindre essayé puis retiré).
- **2026-11-05** — Feuille qu'on tire vers le bas pour la fermer (suit le doigt 1:1, voile qui s'éclaircit avec, fermeture décidée par projection de la vitesse façon iOS et poursuivie à la vitesse du doigt, sinon retour en place ; rattrapable en vol ; la roue de repos et les champs gardent leur geste). Tirée vers le haut (contenu qui ne défile pas), elle résiste en élastique et son bas reste collé au bord de l'écran (couche `#sheetFill` de la couleur de la feuille, montrée en opacité). Le voile est une couche à part (`#sheetScrim`). Haptique essayé (`<input type="checkbox" switch>` caché, astuce iOS 18) puis retiré (PR #17, #18) : aucun retour sur l'iPhone (iOS 27) ; `navigator.vibrate` n'existe pas sur Safari iOS. Noms de fichiers, `sw.js` et format `calitrack.v6` inchangés.
- **2026-11-05** (PR #19) — Matériaux iOS : alerte, toast et minuteur de repos en couche translucide floutée (`--alert-mat`, `--float-mat`, `--card-mat`, `--mat-blur` : `saturate(180%) blur(30px)`) ; minuteur dépassé reste bleu plein ; retour aux couleurs opaques avec Réduire la transparence ou Augmenter le contraste (`prefers-reduced-transparency`, `prefers-contrast: more`). Le voile de l'alerte devient une couche à part (`#modalScrim`) : voile et boîte s'estompent chacun de leur côté, car un parent qui s'estompe coupe le flou de la page. « Réduire les animations » : l'alerte n'apparaît plus qu'en fondu (le zoom n'était pas neutralisé). Élastique du glissement vers la droite non fait : l'arrêt net est le comportement iOS. Noms de fichiers, `sw.js` et format `calitrack.v6` inchangés.
- **2026-11-05** (PR #20) — Alertes : ponctuation française insécable (`nb()` : pas de retour à la ligne avant `? ! : ; »` ni après `«`) et titre équilibré (`text-wrap:balance`) ; « Valeur inhabituelle » en question neutre (« Non » / « Garder » en bleu gras, le rouge reste réservé aux suppressions). Toast : peu translucide en sombre car posé sur l'en-tête noir (rien derrière à flouter), laissé tel quel. Liquid Glass (réfraction iOS 26+) non reproductible en web, à faire dans une éventuelle app native.
- **2026-11-05** (PR #21) — Navigation iOS : barre de titre compacte (`#navbar`, matériau de la tab bar, z-index 25) qui apparaît en fondu quand le grand titre passe dessous, titre centré et « ‹ Routines » / « ‹ Exercices » sur les fiches (`updNav()`, au défilement et après chaque rendu) ; retour par glissement depuis le bord gauche (< 24 px) sur une fiche routine ou exercice : la fiche suit le doigt, la liste est déjà dessinée dessous (`.edge-ghost`, parallaxe −30 % → 0, léger voile), validation par projection de la vitesse et fin à la vitesse du doigt, sinon retour ; rattrapable ; « Réduire les animations » : suit le doigt puis fondu. Retour commun `backFrom()` (lien, barre, geste). « Valeur inhabituelle » : « Garder » de nouveau rouge gras (préférence de l'utilisateur). Noms de fichiers, `sw.js` et format `calitrack.v6` inchangés.
- **2026-11-05** (PR #22) — Retours de test : barre compacte réservée à la **séance en cours** (chrono de séance à gauche, nom au centre, apparaît quand le titre passe dessous ; absente des autres onglets et des fiches) ; glissement retour sans parallaxe (la liste reste en place, légèrement assombrie : son titre était coupé) ; plus de « dézoom » iOS pendant le glissement (`html{overflow-x:hidden}` + `body{overflow-x:clip}` : un écran qui sort à droite élargissait la page) ; bouton « Ajouter les routines du programme » retiré (Routines). Noms de fichiers, `sw.js` et format `calitrack.v6` inchangés.
- **2026-11-06** (PR #23) — Glissement retour : l'écran qui glisse emporte sa marge latérale (`#main.edge-drag` en marges négatives + padding de la même valeur, car les marges de 16 px sont sur `body`) — son contenu ne colle plus à son bord ; bord visible : ombre, liseré clair en sombre (`--edge-line`), liste dessous assombrie (`--edge-dim` : 0,1 clair, 0,3 sombre). Noms de fichiers, `sw.js` et format `calitrack.v6` inchangés.
- **2026-11-06** (PR #24) — Glissement retour en clair : ombre portée et voile retirés (dégradé gris sur la liste et rectangle gris sous l'en-tête, jugés laids) ; bord marqué par un liseré fin seulement (`--edge-line` : gris en clair, clair en sombre) ; en sombre la liste reste assombrie (`--edge-dim` 0,3, 0 en clair). Noms de fichiers, `sw.js` et format `calitrack.v6` inchangés.
- **2026-11-06** (PR #25) — Glissement retour sans ligne au bord de la fiche (liseré `--edge-line` retiré, clair et sombre) : glissement « sans couture » voulu par l'utilisateur ; seule reste, en sombre, la liste dessous assombrie (`--edge-dim`). Noms de fichiers, `sw.js` et format `calitrack.v6` inchangés.
- **2026-11-09** (PR #26) — Fin de l'audit iOS : taille du texte d'iOS suivie (`applyTS()` lit `-apple-system-body`, `--ts` borné à ×1–×1,24 pour ne jamais rapetisser ni casser les lignes de séries ; les ~100 `font-size` en `calc(Npx*var(--ts,1))`) ; espacement des lettres global retiré ; ressorts sans bibliothèque (`springEase()` → easing `linear()` analytique, sans rebond, avec la vitesse du doigt) pour la pastille segmentée, le retour en place de la feuille, de la fiche (glissement retour annulé) et des lignes glissées ; interrupteur : pouce sur ressort qui s'allonge à l'appui (`scaleX`) ; minuteur dépassé : pulsation en opacité au lieu de grossir. Recul de la page derrière une feuille non fait (iOS ne le fait que pour les feuilles pleine hauteur). Noms de fichiers, `sw.js` et format `calitrack.v6` inchangés.
- **2026-11-09** — Ligne ouverte (« Supprimer ») refermée en touchant ailleurs : ressort partant de l'arrêt (`closeSwipe()`, `springEase(.42,1,0)`, ~0,6 s) au lieu de la courbe drawer qui partait d'un coup (« effet de surprise ») ; relâcher d'une ligne : ressort plus doux (réponse 0,4 s, vitesse du doigt plafonnée). Minuteur dépassé : bleu plein fixe, sans pulsation ni grossissement (préférence de l'utilisateur). Noms de fichiers, `sw.js` et format `calitrack.v6` inchangés.
