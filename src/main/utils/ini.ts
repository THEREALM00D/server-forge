import { copyFileSync, existsSync, mkdirSync } from "fs";
import { dirname } from "path";

/** Parse une valeur INI brute : True/False, nombre, ou string (quotée ou non). */
export function parseIniValue(raw: string): string | number | boolean {
  if (raw === "True" || raw === "true") return true;
  if (raw === "False" || raw === "false") return false;
  const num = Number(raw);
  if (!isNaN(num) && raw !== "") return num;
  return raw.replace(/^"(.*)"$/, "$1");
}

/**
 * Crée le dossier parent si besoin et sauvegarde le fichier existant en
 * `<path>.backup` avant une écriture destructive.
 */
export function backupBeforeWrite(filePath: string): void {
  mkdirSync(dirname(filePath), { recursive: true });
  if (existsSync(filePath)) {
    copyFileSync(filePath, filePath + ".backup");
  }
}
