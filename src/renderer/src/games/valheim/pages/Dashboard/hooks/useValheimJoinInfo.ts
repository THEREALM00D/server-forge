import { useMemo } from "react";

export interface ValheimJoinInfo {
  sessionName: string;
  joinCode: string;
  ip: string;
  playerCount: number;
}

// Ligne émise par Valheim uniquement quand -crossplay est activé, ex:
// `Session "My Server" with join code 978199 and IP 104.192.227.54:27029 is active with 2 player(s)`
// Répétée périodiquement (le nombre de joueurs est mis à jour à chaque fois),
// donc on prend la plus récente correspondance dans les logs.
const JOIN_LINE_RE =
  /Session "(.*)" with join code (\d+) and IP ([\d.]+:\d+) is active with (\d+) player/;

/**
 * Extrait le code de connexion crossplay et l'IP:port du serveur Valheim à
 * partir des logs déjà reçus — pas d'API REST disponible pour ce jeu, cette
 * ligne de console est la seule source pour ces informations.
 */
export function useValheimJoinInfo(logs: string[]): ValheimJoinInfo | null {
  return useMemo(() => {
    for (let i = logs.length - 1; i >= 0; i--) {
      const match = logs[i].match(JOIN_LINE_RE);
      if (match) {
        return {
          sessionName: match[1],
          joinCode: match[2],
          ip: match[3],
          playerCount: Number(match[4]),
        };
      }
    }
    return null;
  }, [logs]);
}
