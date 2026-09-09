# Installation

🇬🇧 English | 🇫🇷 [Français](installation.fr.md)

## Requirements

- **Windows 10 or 11** (64-bit)
- **Administrator rights** (required for firewall management and running the server)
- **~10 GB of disk space** for SteamCMD + the Palworld server
- Internet connection for the initial download

## Installing ServerForge

1. Download `server-forge-{version}-setup.exe` from the [Releases](https://github.com/THEREALM00D/server-forge/releases) page
2. Run the installer (accept the administrator elevation prompt)
3. A shortcut is created on the desktop

## First use

### 1. Install SteamCMD

SteamCMD is Valve's official utility for downloading Steam servers.

- Open ServerForge
- Go to **Install** in the sidebar
- Click **Install SteamCMD**
- ServerForge downloads and configures SteamCMD automatically (logs visible at the bottom)

### 2. Install the Palworld server

- Choose a destination folder (default `C:\PalworldServer`)
  - Avoid protected folders (`Program Files`, `Windows`) which can cause permission issues
  - Prefer a dedicated folder on a fast drive (SSD recommended)
- Click **Install Palworld**
- The download takes about 5-15 minutes depending on your connection (~3 GB)

### 3. Initial configuration (optional but recommended)

Before starting the server for the first time:

- Go to **Configuration**
- Set:
  - **Server name** (`ServerName`)
  - **Admin password** (`AdminPassword`) — important for the REST API
  - **Server password** (`ServerPassword`) — optional, for a private server
- Enable **REST API** (`RESTAPIEnabled`) to get graceful shutdown and player management

> See [configuration.md](configuration.md) for the full list of options.

### 4. Enable the firewall

- Go to **Network**
- Click **Enable all** to create the firewall rules (Game UDP, RCON, REST API)

### 5. First start

- Go to **Dashboard**
- Click **Start**
- The status switches to **Online** once the server is ready

## Updating the Palworld server

When a Palworld update is available:

- Go to **Install**
- Click **Check** to compare the installed version against the Steam version
- If an update is available, click **Update Palworld**

## Uninstalling

Use the Windows Control Panel or run `Uninstall ServerForge.exe` from the installation folder.

> Palworld server files and backups are **not** removed automatically.
