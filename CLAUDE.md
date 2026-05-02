# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ServerForge

Gestionnaire de serveurs dédiés de jeux vidéo. Actuellement supporte Palworld.

## Stack

- **Electron 31** (main / preload / renderer)
- **React 19** + **MUI 9** (Material-UI) — pas de Tailwind
- **TypeScript 6** strict — types partagés dans `src/shared/types.ts`
- **Vite 5** via **electron-vite**
- **Yarn** comme gestionnaire de paquets
- **i18n** : `react-i18next` + `i18next` + `i18next-browser-languagedetector` (FR + EN)
- Dépendances-clés : `archiver` + `extract-zip` (backups ZIP), `systeminformation` (CPU/RAM, détection de processus), `date-fns`
- **Auto-update** : `electron-updater` + `electron-log` — pull GitHub Releases (configuré dans `electron-builder.yml`)

Pas de tests unitaires configurés dans ce projet — ne pas en chercher ni en ajouter sans demander.

## Commandes

| Commande                   | Description                                   |
| -------------------------- | --------------------------------------------- |
| `yarn dev`                 | Mode développement (hot reload)               |
| `yarn build`               | Compiler + packager en .exe (NSIS + portable) |
| `yarn typecheck`           | Vérifier les types (node + web)               |
| `yarn lint`                | ESLint avec auto-fix                          |
| `yarn format`              | Prettier sur tout le projet                   |
| `yarn fix:prettier <file>` | Prettier sur un fichier spécifique            |

Un hook PostToolUse (`.claude/settings.local.json`) lance automatiquement `fix:prettier` après chaque Write/Edit.

## Architecture — points non-évidents

```
src/
├── shared/types.ts        # Source unique des types qui traversent IPC
├── main/                  # Process Node.js
│   ├── ipc/
│   │   ├── handlers.ts    # Setup : instancie les services, construit IpcContext
│   │   ├── context.ts     # IpcContext passé aux sous-handlers
│   │   └── handlers/*.ts  # Un fichier par domaine (server, backup, palapi, etc.)
│   ├── server/            # ServerManager, PalworldApiClient
│   ├── players/           # PlayerHistoryTracker (poller API + JSON)
│   ├── updater/           # AppUpdater (electron-updater wrapper)
│   ├── backup/, scheduler/, firewall/, monitor/, steamcmd/, config/
├── preload/
│   ├── index.ts           # contextBridge → window.api
│   └── index.d.ts         # Déclare Window.api globalement (importe depuis shared)
└── renderer/src/
    ├── context/           # ServerContext (useReducer), NotificationContext (toasts)
    ├── i18n/              # Setup react-i18next + __i18n__/{fr,en}.ts pour strings communs
    ├── games/palworld/    # Tout ce qui est spécifique à Palworld
    │   └── pages/<Page>/  # Page.tsx + hooks/ + components/ + __i18n__/{fr,en}.ts
    └── pages/, components/, services/  # Partagé entre jeux (avec __i18n__/ également)
```

### Communication IPC

```
Renderer (React) → window.api.xxx() → Preload (contextBridge) → ipcMain.handle() → Main
                 ← event listener    ← ipcRenderer.on()        ← event.sender.send()
```

Les services du main (`ServerManager`, `BackupManager`, etc.) sont instanciés **une seule fois** dans `registerIpcHandlers()` puis passés aux sous-handlers via `IpcContext`. Ne pas les instancier ailleurs.

### Types partagés

`src/shared/types.ts` est la source unique pour tout ce qui traverse IPC. Si un type traverse la frontière, il **doit** être là.

- **main** : `import type { ... } from "../../shared/types"`
- **renderer** : `import type { ... } from "@shared/types"` (alias vite + tsconfig)
- **preload/index.d.ts** : importe et déclare `Window.api` globalement

### Structure multi-jeux

Le code spécifique à Palworld est dans `games/palworld/`. Les composants partagés (Sidebar, Titlebar) et services communs (dialog, monitor) restent à la racine. Pour ajouter un jeu :

1. Créer `src/renderer/src/games/<jeu>/` avec la même structure (pages, hooks, services)
2. Ajouter les types spécifiques dans `src/shared/types.ts` si ils traversent IPC
3. Ajouter les handlers IPC dans `src/main/ipc/handlers/<jeu>.ts` et les wirer dans `handlers.ts`
4. Ajouter l'onglet dans `Sidebar.tsx` et le routage dans `App.tsx`
5. Créer `__i18n__/{fr,en}.ts` dans chaque page + wirer dans `src/renderer/src/i18n/index.ts`

### Internationalisation (i18n)

- Langues supportées : **FR** (défaut) + **EN**. Détection initiale via navigateur, choix persisté dans `localStorage.locale`.
- Sélecteur de langue : ToggleButtonGroup FR/EN au bas de la Sidebar.
- **Chaque page et composant avec du texte a son dossier `__i18n__/` avec `fr.ts` et `en.ts`**. Les fichiers exportent un objet par défaut qui sera mergé dans la ressource globale par `src/renderer/src/i18n/index.ts`.
- Pour ajouter des strings à une page : éditer `<Page>/__i18n__/fr.ts` ET `en.ts`, puis utiliser `const { t } = useTranslation(); t("page.key")`.
- Pour ajouter une nouvelle page : créer son `__i18n__/{fr,en}.ts` et l'importer dans `src/renderer/src/i18n/index.ts` (merger dans les objets `fr` et `en`).
- **Interpolation** : `t("key", { name: "Bob" })` + `"Hello {{name}}"` dans la traduction.
- **Values vs labels** : les `value` des `<Select>` (ex: `Casual`, `ItemAndEquipment` de `Difficulty`/`DeathPenalty`) restent les valeurs INI brutes — seuls les labels UI sont traduits via `labelKey` dans `SelectOption`.
- **Config Palworld** : `fields.ts` ne contient plus que les clés + types. Les labels et descriptions sont dans `Config/__i18n__/{fr,en}.ts` sous `config.fields.<Key>.label` / `.description`.
- Ce qui n'est **pas** traduit : logs du process serveur (viennent du jeu), tokens de coloration de logs (`[Manager]`, `[ERR]`), brand « ServerForge » dans la Titlebar.

### Adoption d'un processus existant

Au démarrage, `ServerManager.tryAdopt()` scanne les processus via `systeminformation` pour détecter un `PalServer.exe` en cours (orphelin d'une session précédente). Si trouvé, le statut passe à `running` et on peut stop/restart via l'API REST + `taskkill`. **Les logs stdout/stderr ne sont pas récupérables** pour un processus adopté (le pipe appartenait à l'ancien parent).

## Conventions

- **UI bilingue FR/EN** via `react-i18next` — toute string user-facing passe par `t()` (jamais de texte en dur dans les JSX). Commentaires de code en français.
- **MUI uniquement** — pas de Tailwind, pas de CSS custom sauf `index.css` minimal
- **Notifications** : `useNotification().notify()` avec `t()` — jamais `alert()` ni état d'erreur local
- **Imports main** : ne jamais importer depuis `src/main/` dans le renderer (passer par IPC)
- **Fichiers < 200 lignes** : dès qu'une page dépasse, extraire hooks/components/data

## Palworld REST API

> **Avertissement** : ces API ne sont pas conçues pour être exposées sur Internet.
> L'app force `hostname: '127.0.0.1'` dans `PalworldApiClient` — ne pas changer ça.

- **Port** : `RESTAPIPort` (défaut 8212)
- **Auth** : HTTP Basic — `admin:{AdminPassword}` (depuis `PalWorldSettings.ini`)
- **Timeout** : 8 secondes

### Endpoints utilisés

| Endpoint           | Méthode | Rôle                                |
| ------------------ | ------- | ----------------------------------- |
| `/v1/api/info`     | GET     | `PalServerInfo`                     |
| `/v1/api/players`  | GET     | `{ players: PalPlayer[] }`          |
| `/v1/api/metrics`  | GET     | `PalMetrics`                        |
| `/v1/api/settings` | GET     | `Record<string, unknown>`           |
| `/v1/api/announce` | POST    | `{ message }`                       |
| `/v1/api/save`     | POST    | sauvegarde serveur                  |
| `/v1/api/shutdown` | POST    | `{ waittime, message? }` (gracieux) |
| `/v1/api/stop`     | POST    | arrêt immédiat                      |
| `/v1/api/kick`     | POST    | `{ userid, message? }`              |
| `/v1/api/ban`      | POST    | `{ userid, message? }`              |
| `/v1/api/unban`    | POST    | `{ userid }`                        |

## Config INI Palworld

- **Chemin** : `{serverPath}/Pal/Saved/Config/WindowsServer/PalWorldSettings.ini`
- **Section** : `[/Script/Pal.PalGameWorldSettings]`
- **Format** : `OptionSettings=(key1=val1,key2=val2,...)`
- **170+ paramètres** avec valeurs par défaut dans `PalConfigParser.ts`
- Types : string (quoté), int, float (6 décimales), bool, enum (non quoté), array `(val1,val2)`
- Les définitions d'UI (clés + types) sont dans `games/palworld/pages/Config/fields.ts`, les presets de difficulté dans `presets.ts`, et les labels/descriptions traduits dans `Config/__i18n__/{fr,en}.ts`.

## Arguments de lancement (PalServer.exe)

- Config stockée via electron-store sous `launchArgs: { publicLobby, performanceFlags, customArgs }` (type `LaunchArgsConfig` dans `shared/types.ts`).
- `buildServerArgs(store)` dans `main/ipc/handlers/server.ts` reconstruit le tableau d'args à chaque `start`/`restart` (y compris dans le scheduler).
- IPC : `server:getLaunchArgs` / `server:setLaunchArgs`. UI : section « Arguments de lancement » dans Installation.
- `-publiclobby` active le mode lobby EOS (nécessaire pour le crossplay Xbox — le serveur apparaît dans la liste Communauté sur toutes les plateformes, Lobby ID affiché dans les logs au démarrage).

## Sauvegardes

- Dossier zippé : `{serverPath}/Pal/Saved/SaveGames/`
- Format : ZIP niveau 9, nom `backup-YYYY-MM-DD_HH-MM-SS.zip`
- Dossier cible : configurable (défaut `{userData}/backups`)
- Rotation : garde N dernières (0 = infini)
- Auto : intervalle 0 à 1440 min, **actif uniquement si serveur en cours**

## Redémarrage planifié

- Une heure quotidienne (`HH:MM` 24h), pas de multi-horaires
- Flow : annonce (via `/v1/api/announce`) → attente `warningMinutes` → save → shutdown API
- Scheduler vérifie toutes les 30 secondes
- **Requiert l'API REST activée** — sinon l'arrêt est brutal (`taskkill`) sans save

## Historique des joueurs

- `PlayerHistoryTracker` (`src/main/players/`) poll `/v1/api/players` toutes les 30s **uniquement quand le serveur tourne ET que l'API REST est activée**.
- Stockage : `{userData}/players/history.json` — un fichier JSON unique avec tableau de `PlayerHistoryEntry` (cf. `shared/types.ts`).
- Chaque entrée trace `firstSeen`, `lastSeen`, `lastIp`, `totalPlaytimeMs`, `sessionCount`, `online`, `currentSessionStart` et un tableau `sessions[]` (cap à 50, plus anciennes éjectées).
- Le tracker est démarré/arrêté via une boucle de surveillance dans `handlers.ts` qui vérifie `serverManager.getStatus()` toutes les 5s. À l'arrêt il ferme toutes les sessions ouvertes et persiste.
- IPC : `players:getHistory` / `players:clearHistory` / `players:removeEntry`. UI : page « Joueurs » dans la Sidebar (icône `PeopleIcon`).

## Distribution (proprio, non open-source)

- **Licence** : `package.json` est en `UNLICENSED`. EULA dans [LICENSE.txt](LICENSE.txt) — référencée par NSIS (`nsis.license`) → affichée à l'installation.
- **Sourcemaps** : désactivés en build (`electron.vite.config.ts` → `sourcemap: false` sur main/preload/renderer) + `!**/*.map` dans `electron-builder.yml`. Le code TS n'est pas reconstructible depuis l'asar.
- **Code signing** : pas encore en place (`CSC_IDENTITY_AUTO_DISCOVERY=false` dans le script `build`). Quand un certif sera dispo, retirer ce flag et exposer `CSC_LINK` + `CSC_KEY_PASSWORD` via env.
- **Auto-update** : `AppUpdater` (`src/main/updater/`) wrapping `electron-updater`. Vérification au démarrage uniquement si `app.isPackaged`. Stratégie : `autoDownload = false` (l'utilisateur clique pour télécharger), puis bannière « Redémarrer et installer » via `quitAndInstall`. État exposé via `updater:state` (push) et IPC pull `updater:getState/check/download/install`.
- **UI** : `UpdateBanner` (Alert MUI) au-dessus du contenu principal dans `App.tsx`. S'auto-affiche selon le state, dismissable.
- **Publication** : `publish.provider: github` — un workflow CI doit tagger une release avec les `.exe` + `latest.yml`. Repo peut rester privé tant que les binaires de la release sont publiquement téléchargeables.
