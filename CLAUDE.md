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
5. Chaque modification ajoute 2 lignes maximum dans CHANGELOG.md.

Historique : voir CHANGELOG.md, à ne lire que sur demande.
