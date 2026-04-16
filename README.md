# ServerForge

Gestionnaire de bureau open-source pour serveurs dédiés de jeux vidéo. Actuellement compatible avec **Palworld**.

![Plateforme](https://img.shields.io/badge/platform-Windows-blue)
![Licence](https://img.shields.io/badge/license-MIT-green)

## Fonctionnalités

- **Installation automatique** de SteamCMD et du serveur Palworld
- **Démarrage / arrêt / redémarrage** avec sauvegarde gracieuse via l'API REST
- **Surveillance temps réel** : CPU, RAM, uptime, FPS serveur, joueurs en ligne
- **Éditeur de configuration** INI avec presets de difficulté (Casual / Normal / Hard)
- **Gestion des joueurs** : kick, ban, unban directement depuis le dashboard
- **Gestion du firewall Windows** (règles automatiques + personnalisées)
- **Sauvegardes** automatiques planifiables avec rotation
- **Redémarrage planifié** quotidien avec annonce et sauvegarde
- **Vérification des mises à jour** Palworld via SteamCMD
- **Logs en temps réel** du processus serveur

## Installation

Téléchargez la dernière version depuis [Releases](https://github.com/) :

- **Installateur** : `server-forge-{version}-setup.exe`

> L'application requiert les **droits administrateur** pour gérer les règles du firewall Windows.

## Démarrage rapide

1. Lancez **ServerForge**
2. Allez dans **Installation**
3. Cliquez sur **Installer SteamCMD** (téléchargement automatique)
4. Choisissez un dossier de destination et installez **Palworld Server**
5. Allez dans **Dashboard** et cliquez sur **Démarrer**

Voir [docs/installation.md](docs/installation.md) pour le guide complet.

## Documentation

- [Installation](docs/installation.md)
- [Dashboard](docs/dashboard.md)
- [Configuration du serveur](docs/configuration.md)
- [Réseau et firewall](docs/network.md)
- [Sauvegardes](docs/backups.md)
- [Planification](docs/scheduling.md)
- [Logs](docs/logs.md)
- [Architecture technique](CLAUDE.md)

## Stack technique

- Electron 31, React 19, MUI 9, TypeScript 6, Vite 5

## Licence

MIT
