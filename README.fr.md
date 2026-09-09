# ServerForge

🇬🇧 [English](README.md) | 🇫🇷 Français

> ⚠️ **Le nom et le logo actuels sont temporaires.** Le branding définitif du projet n'est pas encore arrêté.

Gestionnaire de bureau pour serveurs dédiés de jeux vidéo. Compatible avec **Palworld**, **Valheim** et **Astroneer**.

![Plateforme](https://img.shields.io/badge/platform-Windows-blue)
![Licence](https://img.shields.io/badge/license-proprietary-red)

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

Téléchargez la dernière version depuis [Releases](https://github.com/THEREALM00D/server-forge/releases) :

- **Installateur** : `server-forge-{version}-setup.exe`
- **Portable** : `server-forge-{version}-portable.exe`

> L'application requiert les **droits administrateur** pour gérer les règles du firewall Windows.

## Démarrage rapide

1. Lancez **ServerForge**
2. Allez dans **Installation**
3. Cliquez sur **Installer SteamCMD** (téléchargement automatique)
4. Choisissez un dossier de destination et installez le serveur du jeu souhaité
5. Allez dans **Dashboard** et cliquez sur **Démarrer**

Voir [docs/installation.fr.md](docs/installation.fr.md) pour le guide complet.

## Documentation

- [Installation](docs/installation.fr.md)
- [Dashboard](docs/dashboard.fr.md)
- [Configuration du serveur](docs/configuration.fr.md)
- [Réseau et firewall](docs/network.fr.md)
- [Sauvegardes](docs/backups.fr.md)
- [Planification](docs/scheduling.fr.md)
- [Logs](docs/logs.fr.md)
- [Architecture technique](CLAUDE.md)

## Stack technique

- Electron 31, React 19, MUI 9, TypeScript 6, Vite 5

## Licence

Propriétaire — tous droits réservés. Voir [LICENSE](LICENSE). Le code n'est pas open-source : le rendre visible publiquement pendant l'alpha ne constitue pas une autorisation d'utilisation, copie ou redistribution.

## Contribuer

La branche `main` est protégée : toute contribution passe par une Pull Request, et seul le mainteneur du projet peut la merger.
