# ServerForge

Gestionnaire de serveurs dédiés de jeux vidéo. Actuellement supporte Palworld.

## Stack

- **Electron 31** (main / preload / renderer)
- **React 19** + **MUI 9** (Material-UI) — pas de Tailwind
- **TypeScript 6** — stricte, types globaux dans `src/preload/index.d.ts`
- **Vite 5** via **electron-vite**
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
├── main/                    # Process principal (Node.js)
│   ├── index.ts             # Création fenêtre, enregistrement IPC
│   ├── ipc/handlers.ts      # Tous les handlers IPC (~60)
│   ├── server/
│   │   ├── ServerManager.ts       # Gestion processus serveur
│   │   └── PalworldApiClient.ts   # Client REST API Palworld
│   ├── config/
│   │   └── PalConfigParser.ts     # Parser INI PalWorldSettings.ini
│   ├── firewall/
│   │   └── FirewallManager.ts     # Règles firewall Windows (netsh)
│   ├── monitor/
│   │   └── SystemMonitor.ts       # Stats CPU/RAM (systeminformation)
│   └── steamcmd/
│       └── SteamCMD.ts            # Installation/MAJ via SteamCMD
│
├── preload/
│   ├── index.ts             # contextBridge → window.api
│   └── index.d.ts           # Types globaux (pas d'import/export = ambient)
│
└── renderer/src/
    ├── App.tsx               # Routage pages, thème MUI dark
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
        │   ├── Dashboard/         # Status, stats, contrôles start/stop
        │   ├── Config/            # Éditeur INI avec presets difficulté
        │   ├── Logs/              # Affichage logs temps réel
        │   └── Network/           # Gestion règles firewall
        ├── hooks/
        │   └── useServerControls.ts
        └── services/              # Wrappers window.api par domaine
```

### Communication IPC

```
Renderer (React) → window.api.xxx() → Preload (contextBridge) → ipcMain.handle() → Main (Node.js)
                 ← event listener    ← ipcRenderer.on()        ← event.sender.send()
```

Les classes du main (`ServerManager`, `PalConfigParser`, etc.) sont instanciées dans `registerIpcHandlers()` — pas ailleurs.

### Structure multi-jeux

Le code spécifique à Palworld est isolé dans `games/palworld/`. Les composants partagés (Sidebar, Titlebar) et services communs (dialog, monitor) restent à la racine. Pattern prévu pour ajouter `games/autreJeu/` plus tard.

## Conventions

- **UI en français** (labels, messages, commentaires)
- **MUI uniquement** — pas de Tailwind, pas de CSS custom sauf `index.css` minimal
- **Notifications** : utiliser `useNotification().notify()` — jamais `alert()`
- **Imports main** : ne jamais importer depuis `src/main/` dans le renderer (passe par IPC)
- **Types globaux** : `src/preload/index.d.ts` est ambient (pas d'import/export) → types dispo partout côté web

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

| Endpoint           | Retour                    | Description                        |
| ------------------ | ------------------------- | ---------------------------------- |
| `/v1/api/info`     | `ServerInfo`              | Nom, version, description, GUID    |
| `/v1/api/players`  | `{ players: Player[] }`   | Liste joueurs connectés            |
| `/v1/api/metrics`  | `ServerMetrics`           | FPS, joueurs, uptime, jours, camps |
| `/v1/api/settings` | `Record<string, unknown>` | Tous les paramètres serveur        |

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

### Types de données

```typescript
interface ServerInfo {
  version: string;
  servername: string;
  description: string;
  worldguid: string;
}

interface Player {
  name: string;
  accountName: string;
  playerId: string;
  userId: string;
  ip: string;
  ping: number;
  location_x: number;
  location_y: number;
  level: number;
  building_count: number;
}

interface ServerMetrics {
  serverfps: number;
  currentplayernum: number;
  serverframetime: number;
  maxplayernum: number;
  uptime: number;
  basecampnum: number;
  days: number;
}
```

## Config INI Palworld

- **Chemin** : `{serverPath}/Pal/Saved/Config/WindowsServer/PalWorldSettings.ini`
- **Section** : `[/Script/Pal.PalGameWorldSettings]`
- **Format** : `OptionSettings=(key1=val1,key2=val2,...)`
- **170+ paramètres** avec valeurs par défaut dans `PalConfigParser.ts`
- Types de valeurs : string (quoté), int, float (6 décimales), bool, enum (non quoté), array `(val1,val2)`
