# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ServerForge

Gestionnaire de serveurs dédiés de jeux vidéo. Supporte Palworld, Valheim et Astroneer.

## Stack

- **Electron 31** (main / preload / renderer)
- **React 19** + **MUI 9** (Material-UI) — pas de Tailwind
- **TypeScript 6** strict — types partagés dans `src/shared/types.ts`
- **Vite 5** via **electron-vite**
- **Yarn** comme gestionnaire de paquets
- **i18n** : `react-i18next` + `i18next` + `i18next-browser-languagedetector` (FR + EN)
- Dépendances-clés : `archiver` + `extract-zip` (backups ZIP), `systeminformation` (CPU/RAM, détection de processus), `date-fns`

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
│   ├── games/
│   │   ├── palworld/      # Code Palworld : PalworldApiClient, PalConfigParser,
│   │   │   ├── handlers/  #   handlers IPC (palapi, players), serverConfig
│   │   │   └── ...
│   │   ├── valheim/       # Code Valheim : handlers IPC (config), serverConfig
│   │   ├── astroneer/     # Code Astroneer : AstroConfigParser (2 fichiers .ini),
│   │   │   ├── handlers/  #   handlers IPC (config), serverConfig
│   │   │   └── ...
│   │   └── registry.ts    # getGameServerConfig, buildGameArgs, getGameStopConfig
│   ├── ipc/
│   │   ├── handlers.ts    # Setup : instancie les services, construit IpcContext
│   │   ├── context.ts     # IpcContext passé aux sous-handlers
│   │   └── handlers/*.ts  # Domaines partagés (server, backup, firewall, etc.)
│   ├── server/            # ServerManager (générique, tous jeux)
│   ├── players/           # PlayerHistoryTracker (poller API Palworld + JSON)
│   ├── backup/, scheduler/, firewall/, monitor/, steamcmd/
├── preload/
│   ├── index.ts           # contextBridge → window.api
│   └── index.d.ts         # Déclare Window.api globalement (importe depuis shared)
└── renderer/src/
    ├── context/           # ServerContext (useReducer), NotificationContext (toasts)
    ├── i18n/              # Setup react-i18next — ne plus éditer manuellement,
    │                      #   les strings sont chargées depuis games/*/index.ts
    ├── hooks/             # useServerControls (partagé entre jeux)
    ├── components/
    │   ├── firewall/      # AdminBanner, StandardRules, CustomRules, RuleStatus
    │   ├── server/        # ServerControls, StatsGrid
    │   ├── Sidebar/       # Sidebar + ServerSwitcher
    │   └── Titlebar/
    ├── games/
    │   ├── types.ts       # Interface GamePlugin
    │   ├── registry.ts    # GAMES[], getGamePlugin() — point d'entrée pour le shell
    │   ├── palworld/
    │   │   ├── index.ts   # Manifest Palworld (pages, supportedPages, i18n)
    │   │   └── pages/<Page>/  # Page.tsx + hooks/ + components/ + __i18n__/{fr,en}.ts
    │   ├── valheim/
    │   │   ├── index.ts   # Manifest Valheim
    │   │   └── pages/<Page>/
    │   └── astroneer/
    │       ├── index.ts   # Manifest Astroneer (pas de page "mods" ni "players")
    │       └── pages/<Page>/
    └── pages/, services/  # Pages globales (Install, Servers) + services partagés
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

### Pattern GamePlugin (multi-jeux)

Chaque jeu expose un manifest typé dans `games/<jeu>/index.ts`. Le shell consomme la liste via le registry — **App.tsx, Sidebar.tsx et i18n/index.ts ne contiennent aucun nom de jeu en dur**.

**Pour ajouter un jeu :**

1. Créer `src/renderer/src/games/<jeu>/` avec la même structure (pages, i18n, `index.ts`)
2. Créer `src/main/games/<jeu>/` avec `serverConfig.ts` et `handlers/`
3. Exporter le manifest `GamePlugin` depuis `games/<jeu>/index.ts` et l'ajouter dans `games/registry.ts` (renderer) et `main/games/registry.ts` (main)
4. Ajouter les types spécifiques dans `src/shared/types.ts` s'ils traversent IPC
5. Wirer les handlers IPC dans `src/main/ipc/handlers.ts`

**Composants partagés entre jeux** → `src/renderer/src/components/firewall/` et `components/server/`. Ne jamais importer depuis `games/<autre-jeu>/`.

### Internationalisation (i18n)

- Langues supportées : **FR** (défaut) + **EN**. Détection initiale via navigateur, choix persisté dans `localStorage.locale`.
- Sélecteur de langue : ToggleButtonGroup FR/EN au bas de la Sidebar.
- **Chaque page a son dossier `__i18n__/` avec `fr.ts` et `en.ts`**. Ces fichiers sont regroupés dans le manifest `games/<jeu>/index.ts` — **ne pas les importer directement dans `i18n/index.ts`**.
- Pour ajouter des strings à une page : éditer `<Page>/__i18n__/fr.ts` ET `en.ts`, puis utiliser `const { t } = useTranslation(); t("page.key")`.
- **Interpolation** : `t("key", { name: "Bob" })` + `"Hello {{name}}"` dans la traduction.
- **Values vs labels** : les `value` des `<Select>` (ex: `Casual`, `ItemAndEquipment` de `Difficulty`/`DeathPenalty`) restent les valeurs INI brutes — seuls les labels UI sont traduits.
- Ce qui n'est **pas** traduit : logs du process serveur, tokens de coloration de logs (`[Manager]`, `[ERR]`), brand « ServerForge » dans la Titlebar.

### Adoption d'un processus existant

Au démarrage, `ServerManager.tryAdopt()` scanne les processus via `systeminformation` pour détecter l'exécutable du jeu en cours (orphelin d'une session précédente) — préfixe par jeu dans `PROCESS_NAME_PREFIXES` (`main/servers/ServerManagerRegistry.ts` : `palserver`, `valheim_server`, `astroserver`). Si trouvé, le statut passe à `running` et on peut stop/restart via l'API REST (Palworld) + `taskkill`. **Les logs stdout/stderr ne sont pas récupérables** pour un processus adopté (le pipe appartenait à l'ancien parent).

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
- **Fichier** : `src/main/games/palworld/PalworldApiClient.ts`

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
- **170+ paramètres** avec valeurs par défaut dans `src/main/games/palworld/PalConfigParser.ts`
- Types : string (quoté), int, float (6 décimales), bool, enum (non quoté), array `(val1,val2)`
- Les définitions d'UI (clés + types) sont dans `games/palworld/pages/Config/fields.ts`, les presets de difficulté dans `presets.ts`, et les labels/descriptions traduits dans `Config/__i18n__/{fr,en}.ts`.

## Config INI Astroneer

> **MVP sans RCON** : Astroneer expose un protocole RCON (TCP, `ConsolePort`, défaut 1234) pour liste de joueurs / save / shutdown gracieux, mais ServerForge ne l'implémente pas (choix produit — voir historique du projet). L'arrêt est donc toujours brutal (`taskkill`), comme Valheim. `ConsolePort`/`ConsolePassword` sont éditables dans la page Config (parité avec le groupe RCON de Palworld) mais **sans usage applicatif**, et **sans règle firewall automatique** — ne jamais exposer ce port publiquement (avertissement officiel Astroneer).

- **2 fichiers INI standards** (contrairement au format Palworld `OptionSettings=(...)` sur une ligne), fusionnés en un seul objet `AstroneerSettings` côté app :
  - `{serverPath}/Astro/Saved/Config/WindowsServer/Engine.ini` → section `[URL]`, clé `Port` (défaut 8777)
  - `{serverPath}/Astro/Saved/Config/WindowsServer/AstroServerSettings.ini` → section `[/Script/Astro.AstroServerSettings]`, ~17 clés (`ServerName`, `MaxPlayerCount`, `OwnerName`, `ConsolePort`, etc.)
- Parser : `src/main/games/astroneer/AstroConfigParser.ts` (`read`/`write` avec backup `.backup` avant écriture, comme `PalConfigParser`).
- ⚠️ Astroneer ne persiste pas les changements de config faits pendant que le serveur tourne — éditer uniquement serveur arrêté (avertissement officiel).
- UI data-driven comme Palworld : `games/astroneer/pages/Config/fields.ts` (`FIELD_GROUPS`) + composants `ConfigGroup`/`ConfigField` (copie locale, pas de presets de difficulté).
- IPC : `astroconfig:read` / `astroconfig:write` (dossier `games/astroneer/handlers/config.ts`).

## Mods Valheim (Thunderstore)

- `ThunderstoreClient.ts` consomme l'endpoint **v1 community package list** (`https://thunderstore.io/c/valheim/api/v1/package/`, ~10 000+ packages, mis en cache 5 min). ⚠️ Ce endpoint **ne renvoie pas de champ `namespace`** (contrairement à ce que le spec OpenAPI expérimental laisse penser) — l'identité de l'auteur y est exposée uniquement via `owner`. Toujours matcher les packages avec `p.owner`, jamais `p.namespace` (qui vaut `undefined` en pratique et fait échouer silencieusement tout `.find()`).
- Le "code" d'un mod (`thunderstoreCode`, format `Auteur-Nom-Version`) est parsé/reconstruit à plusieurs endroits (`ValheimModsManager.installFromThunderstore`, `ThunderstoreClient.checkUpdates`/`getMissingDeps`) — le segment "auteur" de ce code correspond à `owner`, pas à un vrai namespace Thunderstore.
- `ValheimModsManager` (`src/main/games/valheim/`) gère l'install locale (dossier `BepInEx/plugins/<namespace>_<nomSafe>/`, métadonnées dans `{dataDir}/mods.json`). Les mods installés manuellement (hors app) sont détectés par scan du dossier et taggés `source: "manual"` (pas de vérif de mise à jour possible, pas de `thunderstoreCode`).
- Vérif des mises à jour : `checkUpdates(installedCodes)` compare la version installée à `pkg.versions[0].version_number` (le tableau `versions` de l'API est trié du plus récent au plus ancien).
- **Import de profil r2modman/Gale** (`parseThunderstoreProfile`) : un code d'export est un jeton opaque (pas forcément un UUID — le backend Thunderstore actuel génère des clés type `xxx#yyy`), résolu via `GET https://thunderstore.io/api/experimental/legacyprofile/get/<code>/` (⚠️ le `/get/` est obligatoire, absent du spec OpenAPI). La réponse est du **texte brut** (pas du JSON) : `"#r2modman\n" + base64(zip)`. Le zip contient `export.r2x` (YAML avec `name` + `version: {major,minor,patch}` par mod), extrait via `extract-zip` dans un dossier temporaire puis parsé par regex (`extractModRefsFromR2x`, pas de dépendance YAML ajoutée).

## Arguments de lancement

- **Palworld** : config `launchArgs: { publicLobby, performanceFlags, customArgs }` (type `LaunchArgsConfig`). `buildArgs` dans `src/main/games/palworld/serverConfig.ts`.
- **Valheim** : config `valheimConfig: ValheimLaunchConfig`. `buildArgs` dans `src/main/games/valheim/serverConfig.ts`.
- **Astroneer** : config `astroneerConfig: { customArgs }` (type `AstroneerLaunchConfig`) — Astroneer ne prend quasi aucun argument CLI, toute la config passe par les fichiers `.ini` (voir « Config INI Astroneer »). `buildArgs` dans `src/main/games/astroneer/serverConfig.ts`.
- IPC : `server:getLaunchArgs` / `server:setLaunchArgs`. UI : section « Arguments de lancement » dans Installation (Palworld uniquement — Valheim/Astroneer n'affichent pas cette section, leur config passe par leur page Config dédiée).
- `-publiclobby` active le mode lobby EOS Palworld (crossplay Xbox).

## Sauvegardes

- Dossier zippé : `{serverPath}/Pal/Saved/SaveGames/` (Palworld) ou `{serverPath}/Astro/Saved/SaveGames/` (Astroneer, résolu dans `main/ipc/handlers/backup.ts`). Valheim utilise un chemin hors `serverPath` (`%LOCALAPPDATA_LOW%/IronGate/Valheim/worlds_local` ou `savedir` custom).
- Format : ZIP niveau 9, nom `backup-YYYY-MM-DD_HH-MM-SS.zip`
- Dossier cible : configurable (défaut `{userData}/backups`)
- Rotation : garde N dernières (0 = infini)
- Auto : intervalle 0 à 1440 min, **actif uniquement si serveur en cours**

## Redémarrage planifié

- Une heure quotidienne (`HH:MM` 24h), pas de multi-horaires
- Flow (Palworld) : annonce (via `/v1/api/announce`) → attente `warningMinutes` → save → shutdown API
- Scheduler vérifie toutes les 30 secondes
- **Requiert l'API REST activée** (Palworld) — sinon l'arrêt est brutal (`taskkill`) sans save. Valheim et Astroneer n'ont pas ce flow gracieux dans ServerForge : `getStopConfig()` renvoie toujours `restApiEnabled: false`, donc `taskkill` systématique.

## Historique des joueurs

- `PlayerHistoryTracker` (`src/main/players/`) poll `/v1/api/players` toutes les 30s **uniquement quand le serveur tourne ET que l'API REST est activée**.
- Stockage : `{userData}/players/history.json` — un fichier JSON unique avec tableau de `PlayerHistoryEntry` (cf. `shared/types.ts`).
- Chaque entrée trace `firstSeen`, `lastSeen`, `lastIp`, `totalPlaytimeMs`, `sessionCount`, `online`, `currentSessionStart` et un tableau `sessions[]` (cap à 50, plus anciennes éjectées).
- Le tracker est démarré/arrêté via une boucle de surveillance dans `handlers.ts` qui vérifie `serverManager.getStatus()` toutes les 5s. À l'arrêt il ferme toutes les sessions ouvertes et persiste.
- IPC : `players:getHistory` / `players:clearHistory` / `players:removeEntry`. UI : page « Joueurs » dans la Sidebar (icône `PeopleIcon`).
