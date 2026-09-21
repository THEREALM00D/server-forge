import { useMemo } from "react";

export interface ValheimJoinInfo {
  sessionName: string;
  joinCode: string;
  ip: string;
  playerCount: number;
}

// Ligne émise UNE SEULE FOIS au démarrage (avant toute connexion), uniquement
// quand -crossplay est activé, ex:
// `Session "My Server" with join code 978199 and IP 104.192.227.54:27029 is active with 0 player(s)`
// C'est la seule ligne qui donne le code de connexion + l'IP ensemble, mais
// son nombre de joueurs n'est jamais mis à jour après coup.
const SESSION_LINE_RE =
  /Session "(.*)" with join code (\d+) and IP ([\d.]+:\d+) is active with (\d+) player/;

// Le nombre de joueurs, lui, est mis à jour par des lignes séparées à chaque
// connexion/déconnexion, avec un format différent de la ligne ci-dessus :
// `Player joined server "X" that has join code Y, now 1 player(s)`,
// `Player connection lost server "X" that has join code Y, now 1 player(s)`,
// `New session server "X" that has join code , now 0 player(s)`.
const PLAYER_COUNT_RE = /(?:is active with|now) (\d+) player/;

/**
 * Extrait le code de connexion crossplay, l'IP:port et le nombre de joueurs
 * du serveur Valheim à partir des logs déjà reçus — pas d'API REST
 * disponible pour ce jeu, la console est la seule source pour ces infos.
 */
export function useValheimJoinInfo(
  logs: string[],
  onlineCount: number | null = null,
): ValheimJoinInfo | null {
  return useMemo(() => {
    let session: Omit<ValheimJoinInfo, "playerCount"> | null = null;
    let playerCount: number | null = null;

    for (const line of logs) {
      const sessionMatch = line.match(SESSION_LINE_RE);
      if (sessionMatch) {
        session = {
          sessionName: sessionMatch[1],
          joinCode: sessionMatch[2],
          ip: sessionMatch[3],
        };
      }
      const countMatch = line.match(PLAYER_COUNT_RE);
      if (countMatch) playerCount = Number(countMatch[1]);
    }

    if (!session) return null;
    // Odin-Eye (si configuré) est plus fiable que les logs : il reste juste
    // même pour un serveur adopté dont les logs ne sont pas récupérables.
    return { ...session, playerCount: onlineCount ?? playerCount ?? 0 };
  }, [logs, onlineCount]);
}
