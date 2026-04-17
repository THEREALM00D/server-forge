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
│   ├── ipc/
│   │   ├── handlers.ts    # Setup : instancie les services, construit IpcContext
│   │   ├── context.ts     # IpcContext passé aux sous-handlers
│   │   └── handlers/*.ts  # Un fichier par domaine (server, backup, palapi, etc.)
│   ├── server/            # ServerManager, PalworldApiClient
│   ├── backup/, scheduler/, firewall/, monitor/, steamcmd/, config/
├── preload/
│   ├── index.ts           # contextBridge → window.api
│   └── index.d.ts         # Déclare Window.api globalement (importe depuis shared)
└── renderer/src/
    ├── context/           # ServerContext (useReducer), NotificationContext (toasts)
    ├── games/palworld/    # Tout ce qui est spécifique à Palworld
    │   └── pages/<Page>/  # Chaque page a Page.tsx + hooks/ + components/
    └── pages/, components/, services/  # Partagé entre jeux
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

### Adoption d'un processus existant

Au démarrage, `ServerManager.tryAdopt()` scanne les processus via `systeminformation` pour détecter un `PalServer.exe` en cours (orphelin d'une session précédente). Si trouvé, le statut passe à `running` et on peut stop/restart via l'API REST + `taskkill`. **Les logs stdout/stderr ne sont pas récupérables** pour un processus adopté (le pipe appartenait à l'ancien parent).

## Conventions

- **UI en français** (labels, messages, commentaires inclus)
- **MUI uniquement** — pas de Tailwind, pas de CSS custom sauf `index.css` minimal
- **Notifications** : `useNotification().notify()` — jamais `alert()` ni état d'erreur local
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
- Les définitions d'UI et presets de difficulté sont dans `games/palworld/pages/Config/fields.ts` et `presets.ts`

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
