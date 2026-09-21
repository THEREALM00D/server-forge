# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ServerForge

Gestionnaire de serveurs dédiés de jeux vidéo. Supporte Palworld, Valheim et Astroneer.

## Stack

- **Electron 44** (main / preload / renderer) — nécessite **Node.js ≥ 22.12** (`engines` d'`electron`/`@electron/rebuild` l'exige ; `yarn install --frozen-lockfile` échoue sinon, y compris en CI)
- **React 19** + **MUI 9** (Material-UI) — pas de Tailwind
- **TypeScript 6** strict — types partagés dans `src/shared/types.ts`
- **Vite 5** via **electron-vite**
- **Yarn** comme gestionnaire de paquets
- **i18n** : `react-i18next` + `i18next` + `i18next-browser-languagedetector` (FR + EN)
- Dépendances-clés : `archiver` + `extract-zip` (backups ZIP), `electron-store` (config persistée), `electron-updater` (mise à jour in-app), `systeminformation` (CPU/RAM, détection de processus), `date-fns`

⚠️ **`archiver` (v8+) et `electron-store` (v9+) sont en ESM pur** (plus de build CommonJS), alors que le process main est bundlé en CJS. Un `import`/`require` statique classique casse au runtime (`ERR_REQUIRE_ESM` / « X is not a constructor » — le typecheck ne le détecte PAS, seul un vrai lancement le révèle). Pattern obligatoire : `const { default: X } = await import("paquet-esm-only")` au moment de l'utiliser, jamais en haut de fichier. Voir `BackupManager.create()` (archiver → `ZipArchive`) et `ipc/handlers.ts`/`FirewallManager.ts` (electron-store) pour des exemples. Réflexe à avoir à **chaque** bump majeur d'une dépendance qui touche le main process : vérifier `"type"` dans son `package.json`.

Pas de tests unitaires configurés dans ce projet — ne pas en chercher ni en ajouter sans demander.

## Commandes

| Commande                   | Description                                   |
| -------------------------- | --------------------------------------------- |
| `yarn dev`                 | Mode développement (hot reload)               |
| `yarn build`               | Compiler + packager en .exe (NSIS + portable) |
| `yarn typecheck`           | Vérifier les types (node + web)               |
| `yarn lint`                | ESLint avec auto-fix                          |
| `yarn lint:check`          | ESLint sans auto-fix (utilisé en CI)          |
| `yarn format`              | Prettier sur tout le projet                   |
| `yarn fix:prettier <file>` | Prettier sur un fichier spécifique            |

Un hook PostToolUse (`.claude/settings.local.json`) lance automatiquement `fix:prettier` après chaque Write/Edit.

## CI / automatisation

- **`.github/workflows/ci.yml`** : `yarn typecheck` + `yarn lint:check` sur chaque PR/push vers `main` (Node 22, `windows-latest`). `main` est protégée — PR obligatoire.
- **`.github/workflows/release.yml`** : sur un tag `v*`, `yarn build` publie directement la release GitHub (voir `publish.channel: alpha` dans `electron-builder.yml` — nécessaire pour que l'auto-updater trouve le bon fichier `alpha.yml`, voir section Updater plus bas).
- **`.eslintrc.cjs`** : base `@electron-toolkit`, `explicit-function-return-type` désactivée (trop strict pour du TSX), seulement `react-hooks/rules-of-hooks` + `exhaustive-deps` (pas le ruleset v7 complet orienté React Compiler, qui suppose des patterns qu'on n'utilise pas).
- **Dependabot** (`.github/dependabot.yml`) : PR hebdo npm (groupées minor/patch) + GitHub Actions. Un bump majeur qui casse la CI doit être corrigé **sur la branche de la PR** (pas juste mergé en espérant) — voir le pattern ESM ci-dessus pour la cause la plus probable si `yarn typecheck`/`install` échoue après un bump.

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
│   ├── players/           # PlayerHistoryTracker (poller générique + JSON)
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
    │   ├── common/        # Petits composants génériques (SearchField)
    │   ├── firewall/      # AdminBanner, StandardRules, CustomRules, RuleStatus
    │   ├── server/        # ServerControls, StatsGrid
    │   ├── players/       # Page « Joueurs » complète (Palworld + Valheim)
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

**Composants partagés entre jeux** → `src/renderer/src/components/firewall/`, `components/server/` et `components/players/` (page « Joueurs » complète, montée dans le manifest des jeux qui ont une source de données — voir « Historique des joueurs »). Ne jamais importer depuis `games/<autre-jeu>/`.

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
- **Onglet Configs** (`pages/Mods/`) : `ConfigFilesList` (filtre par nom de fichier) → `ConfigFileEditorDialog` (champ de recherche + `CfgStructuredEditor`, filtre section/clé/description avec `useDeferredValue`). Perf sur les gros fichiers (Valheim Plus = centaines de paramètres) : sections en accordéons (`CfgSection`, `unmountOnExit` → les champs MUI ne sont montés qu'à l'ouverture ; une recherche n'auto-ouvre les sections que sous 40 résultats) et lignes (`CfgEntryRow`) en `React.memo` : `updateEntry` ne doit remplacer que l'objet de l'entrée modifiée et `onChange` rester stable. ⚠️ Pas de `content-visibility: auto` sur les lignes (son paint containment rogne le label flottant des Select) ni de `InputLabel` sur les Select (la clé est déjà affichée à gauche).
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
- **Requiert l'API REST activée** (Palworld) — sinon l'arrêt est brutal (`taskkill`) sans save. Astroneer n'a pas de flow gracieux dans ServerForge (`getStopConfig()` renvoie `restApiEnabled: false` → `taskkill` systématique). **Valheim** n'a pas d'API REST mais a son propre mécanisme : `getStopConfig()` renvoie `gracefulSignal: true`, et `ServerManager.stop()` envoie un vrai CTRL+C (`windowsCtrlC.ts`, via `AttachConsole`/`GenerateConsoleCtrlEvent`) avant de retomber sur `taskkill` en dernier recours (timeout 30s) — recommandé par le manuel officiel pour éviter une sauvegarde corrompue.

## Historique des joueurs

- `PlayerHistoryTracker` (`src/main/players/`) est **générique multi-jeux** : il ne connaît que l'interface structurelle `{ getPlayers(): Promise<{ players: TrackedPlayer[] }> }` (voir en tête du fichier), pas les clients concrets. Poll toutes les 30s **uniquement quand le serveur tourne ET qu'une source de données joueurs est configurée pour ce jeu**.
  - **Palworld** : `PalworldApiClient.getPlayers()` (API REST officielle, voir plus haut).
  - **Valheim** : `OdinEyeApiClient.getPlayers()` (`src/main/games/valheim/OdinEyeApiClient.ts`), qui interroge le plugin BepInEx tiers **Odin-Eye** ([sparcopt.github.io/odin-eye](https://sparcopt.github.io/odin-eye/)). ⚠️ La doc en ligne (`GET /v1/players` → `{ entries: [...] }`) ne correspond pas au plugin v1.0.0.0 réellement installé, qui expose `GET /players` (tableau JSON) et répond un **200 au corps vide** sur tout chemin inconnu (donc un 200 ne prouve rien) — le client essaie les deux et échoue si aucun ne renvoie du JSON. Il adapte `steamId`→`userId`/`id`→`playerId` (pas d'IP disponible côté cette API). `odinEyeUrl` (ex: `http://127.0.0.1:21618`) est un champ de `ValheimLaunchConfig`, édité dans la section Réseau de la page Config Valheim — vide = suivi désactivé. **Installation côté serveur** (à faire manuellement par l'utilisateur, ServerForge ne l'automatise pas) : BepInEx requis, copier les `.dll` de la release Odin-Eye dans `Valheim/BepInEx/plugins/`, démarrer une fois pour générer `Valheim/BepInEx/config/org.bepinex.plugins.odineye.cfg`, y renseigner `HttpServerAddress` sur un port ≠ 2456/2457, redémarrer. ⚠️ Comme Palworld, **pas d'authentification** côté plugin à ce jour — ne jamais exposer ce port publiquement.
  - Le compteur « Joueurs connectés » de `JoinInfoCard` (Dashboard Valheim) vient d'Odin-Eye quand `odinEyeUrl` est renseigné (`useOdinEyeOnlineCount` = entrées `online` de l'historique, rafraîchi toutes les 10s ; latence max ~30s du tracker), sinon des regex sur les logs (`useValheimJoinInfo`, faux/à 0 pour un serveur adopté dont les logs sont perdus). Le code de connexion et l'IP restent tirés des logs (absents de l'API).
  - **Astroneer** : pas de source (MVP sans RCON, voir plus haut) — le tracker ne démarre jamais pour ce jeu.
  - Le routage par jeu (`gameType` → bon client) est fait dans `getApiClientForServer` (`main/ipc/handlers.ts`).
- Stockage : `{userData}/servers/<id>/players/history.json` — un fichier JSON par serveur avec tableau de `PlayerHistoryEntry` (cf. `shared/types.ts`).
- Chaque entrée trace `firstSeen`, `lastSeen`, `lastIp`, `totalPlaytimeMs`, `sessionCount`, `online`, `currentSessionStart` et un tableau `sessions[]` (cap à 50, plus anciennes éjectées).
- Le tracker est démarré/arrêté via une boucle de surveillance dans `handlers.ts` qui vérifie `serverManager.getStatus()` toutes les 5s. À l'arrêt il ferme toutes les sessions ouvertes et persiste.
- IPC : `players:getHistory` / `players:clearHistory` / `players:removeEntry` (déjà génériques). UI : page « Joueurs » — composant **partagé** `src/renderer/src/components/players/` (comme `components/firewall/`), montée dans le manifest de chaque jeu qui a une source de données (Palworld, Valheim ; pas Astroneer).

## Mise à jour in-app (electron-updater)

- `src/main/update/AutoUpdater.ts` branche `electron-updater` sur les releases GitHub déjà publiées par `electron-builder` (`publish.channel: alpha` dans `electron-builder.yml`, doit matcher `autoUpdater.channel = "alpha"` fixé explicitement dans le code — sinon `electron-updater` ne trouve pas le fichier `alpha.yml` et échoue silencieusement).
- Vérification auto au démarrage (`checkForUpdateOnStartup`), mais **téléchargement et installation restent des actions manuelles** déclenchées depuis la Sidebar (`UpdateIndicator.tsx`) — pas d'auto-download/install silencieux.
- **Format de version obligatoire : `X.Y.Z-alpha.N` (point avant le numéro)**. Sans le point, `semver.prerelease()` traite `alphaN` comme un identifiant opaque unique par build, et `electron-updater` ne peut alors jamais faire le lien entre deux versions alpha (bug vécu : v0.0.1-alpha10 ne détectait jamais alpha11).
- L'installeur NSIS est en mode assisté (`oneClick: false`, `allowToChangeInstallationDirectory: true`) — nécessaire pour que l'auto-update fonctionne correctement avec un chemin d'installation choisi par l'utilisateur. Le build portable n'a pas d'auto-update (mise à jour manuelle uniquement).
