import https from "https";
import { compareVersions } from "./compareVersions";
import type { AppUpdateCheckResult } from "../../shared/types";

const REPO = "THEREALM00D/server-forge";

interface GithubRelease {
  tag_name: string;
  html_url: string;
  prerelease: boolean;
}

// GET simple sur l'API GitHub (pas d'auth requise pour la lecture de
// releases publiques — soumis au rate-limit anonyme de 60 req/h/IP, très
// suffisant pour un check occasionnel).
function fetchLatestRelease(): Promise<GithubRelease> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      `https://api.github.com/repos/${REPO}/releases?per_page=1`,
      {
        headers: {
          "User-Agent": "ServerForge-UpdateChecker",
          Accept: "application/vnd.github+json",
        },
        timeout: 8000,
      },
      (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`GitHub API a répondu ${res.statusCode}`));
          return;
        }
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            const releases = JSON.parse(body) as GithubRelease[];
            if (!releases[0]) throw new Error("Aucune release trouvée");
            resolve(releases[0]);
          } catch (e) {
            reject(e);
          }
        });
      },
    );
    req.on("timeout", () => req.destroy(new Error("Timeout")));
    req.on("error", reject);
  });
}

export async function checkForUpdate(
  currentVersion: string,
): Promise<AppUpdateCheckResult> {
  const release = await fetchLatestRelease();
  const latestVersion = release.tag_name.replace(/^v/, "");
  return {
    currentVersion,
    latestVersion,
    hasUpdate: compareVersions(latestVersion, currentVersion) > 0,
    url: release.html_url,
  };
}
