# ServerForge

Gestionnaire de serveurs dédiés de jeux vidéo. Actuellement supporte Palworld.

## Stack

- **Electron 31** (main / preload / renderer)
- **React 19** + **MUI 9** (Material-UI) — pas de Tailwind
- **TypeScript 6** — stricte, types partagés dans `src/shared/types.ts`
- **Vite 5** via **electron-vite**
- **date-fns** pour le formatage de durées
- **archiver** + **extract-zip** pour les sauvegardes ZIP
- **systeminformation** pour CPU/RAM et détection de processus
- **Yarn** comme gestionnaire de paquets

## Commandes

| Commande                   | Description                                   |
| -------------------------- | --------------------------------------------- |
| `yarn dev`                 | Lancer en mode développement (hot reload)     |
| `yarn build`               | Compiler + packager en .exe (NSIS + portable) |
| `yarn typecheck`           | Vérifier les types (node + web)               |
| `yarn lint`                | ESLint avec auto-fix                          |
| `yarn format`              | Prettier sur tout le projet                   |
| `yarn fix:prettier <file>` | Prettier sur un fichier spécifique            |

## Architecture

```
src/
├── shared/
│   └── types.ts             # Types partagés entre main, preload et renderer
│
├── main/                    # Process principal (Node.js)
│   ├── index.ts             # Création fenêtre, enregistrement IPC
│   ├── ipc/
│   │   ├── handlers.ts      # Setup + wiring de tous les handlers
│   │   ├── context.ts       # IpcContext (services partagés)
│   │   └── handlers/        # Un fichier par domaine
│   │       ├── misc.ts           # window, dialog, app, config, monitor
│   │       ├── steam.ts          # steamcmd:*
│   │       ├── server.ts         # server:* + palconfig:*
│   │       ├── palapi.ts         # palapi:* (REST API Palworld)
│   │       ├── firewall.ts       # firewall:*
│   │       ├── backup.ts         # backup:*
│   │       └── schedule.ts       # schedule:*
│   ├── server/
│   │   ├── ServerManager.ts       # Gestion processus + adoption d'une instance existante
│   │   └── PalworldApiClient.ts   # Client REST API Palworld
│   ├── config/
│   │   └── PalConfigParser.ts     # Parser INI PalWorldSettings.ini
│   ├── firewall/
│   │   └── FirewallManager.ts     # Règles firewall Windows (netsh)
│   ├── monitor/
│   │   └── SystemMonitor.ts       # Stats CPU/RAM, uptime serveur (systeminformation)
│   ├── backup/
│   │   └── BackupManager.ts       # ZIP des SaveGames + rotation + scheduler
│   ├── scheduler/
│   │   └── RestartScheduler.ts    # Redémarrage quotidien à heure fixe
│   └── steamcmd/
│       └── SteamCMD.ts            # Installation/MAJ via SteamCMD
│
├── preload/
│   ├── index.ts             # contextBridge → window.api
│   └── index.d.ts           # Déclare window.api globalement (importe depuis shared)
│
└── renderer/src/
    ├── App.tsx              # Routage pages, thème MUI dark
    ├── context/
    │   ├── ServerContext.tsx       # État global serveur (useReducer)
    │   └── NotificationContext.tsx # Toasts Snackbar
    ├── components/
    │   ├── Titlebar/              # Contrôles fenêtre
    │   └── Sidebar/               # Navigation + indicateur status
    ├── pages/
    │   └── Install/               # Installation SteamCMD/Palworld
    ├── services/
    │   ├── monitorService.ts      # Polling stats système
    │   └── dialogService.ts       # Dialogue sélection dossier
    └── games/palworld/
        ├── pages/
        │   ├── Dashboard/
        │   │   ├── Dashboard.tsx         # Composition
        │   │   ├── utils.ts              # formatDuration
        │   │   ├── hooks/usePalApi.ts    # Polling REST API
        │   │   └── components/
        │   │       ├── ServerControls.tsx
        │   │       ├── StatsGrid.tsx
        │   │       ├── ServerInfoPanel.tsx
        │   │       └── PlayersPanel.tsx
        │   ├── Config/
        │   │   ├── Config.tsx            # Composition + form handling
        │   │   ├── fields.ts             # FIELD_GROUPS (170+ params)
        │   │   ├── presets.ts            # DIFFICULTY_PRESETS
        │   │   └── components/
        │   │       ├── ConfigField.tsx   # Rendu d'un champ
        │   │       └── ConfigGroup.tsx
        │   ├── Network/
        │   │   ├── Network.tsx
        │   │   ├── hooks/useFirewall.ts
        │   │   └── components/
        │   │       ├── AdminBanner.tsx
        │   │       ├── StandardRules.tsx
        │   │       ├── CustomRules.tsx
        │   │       └── RuleStatus.tsx
        │   ├── Backup/Backup.tsx
        │   ├── Schedule/Schedule.tsx
        │   └── Logs/Logs.tsx
        ├── hooks/
        │   └── useServerControls.ts
        └── services/              # Wrappers window.api par domaine
```

### Communication IPC

```
Renderer (React) → window.api.xxx() → Preload (contextBridge) → ipcMain.handle() → Main (Node.js)
                 ← event listener    ← ipcRenderer.on()        ← event.sender.send()
```

Les classes du main (`ServerManager`, `BackupManager`, etc.) sont instanciées une fois dans `registerIpcHandlers()` puis passées aux sous-handlers via `IpcContext`.

### Types partagés

`src/shared/types.ts` est la source unique pour tout ce qui traverse IPC :

- `SystemStats`, `ServerStatus`
- `PalServerInfo`, `PalPlayer`, `PalMetrics`
- `BackupEntry`, `BackupConfig`
- `RestartConfig`
- `FirewallRuleStatus`
- `UpdateCheckResult`

Imports :

- **main** : `import type { ... } from "../../shared/types"` (chemin relatif)
- **renderer** : `import type { ... } from "@shared/types"` (alias configuré dans vite + tsconfig)
- **preload/index.d.ts** : importe et déclare `Window.api` globalement

### Structure multi-jeux

Le code spécifique à Palworld est isolé dans `games/palworld/`. Les composants partagés (Sidebar, Titlebar) et services communs (dialog, monitor) restent à la racine. Pattern prévu pour ajouter `games/autreJeu/` plus tard.

### Adoption d'un processus existant

Au démarrage, `ServerManager.tryAdopt()` scanne les processus via `systeminformation` pour détecter un `PalServer.exe` en cours. Si trouvé, le statut passe à `running` et on peut stop/restart via l'API REST + `taskkill`. Les logs stdout/stderr ne sont pas récupérables pour un processus adopté.

## Conventions

- **UI en français** (labels, messages, commentaires)
- **MUI uniquement** — pas de Tailwind, pas de CSS custom sauf `index.css` minimal
- **Notifications** : utiliser `useNotification().notify()` — jamais `alert()`
- **Imports main** : ne jamais importer depuis `src/main/` dans le renderer (passe par IPC)
- **Fichiers < 200 lignes** : dès qu'une page dépasse, extraire hooks/components/data dans des sous-fichiers
- **Types partagés** : si un type traverse IPC, il va dans `src/shared/types.ts`

## Palworld REST API

> **Avertissement** : ces API ne sont pas conçues pour être exposées sur Internet.
> Leur publication directe peut entraîner une manipulation non autorisée du serveur.
> Il est recommandé de les utiliser uniquement sur le réseau local (LAN).

- **Host** : toujours `127.0.0.1` (localhost uniquement)
- **Port** : configurable via `RESTAPIPort` (défaut `8212`)
- **Auth** : HTTP Basic — `admin:{AdminPassword}` (depuis PalWorldSettings.ini)
- **Timeout** : 8 secondes

### Endpoints

#### Lecture (GET)

| Endpoint           | Retour                     | Description                        |
| ------------------ | -------------------------- | ---------------------------------- |
| `/v1/api/info`     | `PalServerInfo`            | Nom, version, description, GUID    |
| `/v1/api/players`  | `{ players: PalPlayer[] }` | Liste joueurs connectés            |
| `/v1/api/metrics`  | `PalMetrics`               | FPS, joueurs, uptime, jours, camps |
| `/v1/api/settings` | `Record<string, unknown>`  | Tous les paramètres serveur        |

#### Gestion serveur (POST)

| Endpoint           | Params                   | Description                           |
| ------------------ | ------------------------ | ------------------------------------- |
| `/v1/api/announce` | `{ message }`            | Envoyer un message à tous les joueurs |
| `/v1/api/save`     | —                        | Sauvegarder le monde                  |
| `/v1/api/shutdown` | `{ waittime, message? }` | Arrêt gracieux avec délai             |
| `/v1/api/stop`     | —                        | Arrêt immédiat                        |

#### Gestion joueurs (POST)

| Endpoint        | Params                 | Description        |
| --------------- | ---------------------- | ------------------ |
| `/v1/api/kick`  | `{ userid, message? }` | Expulser un joueur |
| `/v1/api/ban`   | `{ userid, message? }` | Bannir un joueur   |
| `/v1/api/unban` | `{ userid }`           | Débannir un joueur |

## Config INI Palworld

- **Chemin** : `{serverPath}/Pal/Saved/Config/WindowsServer/PalWorldSettings.ini`
- **Section** : `[/Script/Pal.PalGameWorldSettings]`
- **Format** : `OptionSettings=(key1=val1,key2=val2,...)`
- **170+ paramètres** avec valeurs par défaut dans `PalConfigParser.ts`
- Types de valeurs : string (quoté), int, float (6 décimales), bool, enum (non quoté), array `(val1,val2)`

## Sauvegardes

- Dossier sauvegardé : `{serverPath}/Pal/Saved/SaveGames/`
- Format : ZIP compressé niveau 9
- Nom : `backup-YYYY-MM-DD_HH-MM-SS.zip`
- Dossier cible : configurable via UI (défaut `{userData}/backups`)
- Rotation : garde N dernières (0 = infini)
- Auto : intervalle 0 à 1440 min (désactivé si serveur arrêté)

## Redémarrage planifié

- Heure quotidienne (format `HH:MM` 24h)
- Délai d'avertissement configurable (annonce aux joueurs avant arrêt)
- Utilise l'API REST pour annonce + sauvegarde + shutdown gracieux
- Scheduler vérifie toutes les 30 secondes
