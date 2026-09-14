import { useEffect, useState } from "react";
import type { AppUpdateCheckResult } from "@shared/types";

/**
 * Vérifie une fois par session s'il existe une version plus récente sur
 * GitHub Releases — évite d'avoir à checker manuellement le dépôt pendant
 * la phase alpha.
 */
export function useAppUpdate(): AppUpdateCheckResult | null {
  const [result, setResult] = useState<AppUpdateCheckResult | null>(null);

  useEffect(() => {
    window.api.update
      .check()
      .then((res) => {
        if (!("error" in res)) setResult(res);
      })
      .catch(() => {
        // best-effort — pas de connexion, rate-limit GitHub, etc.
      });
  }, []);

  return result;
}
