// Parseur/sérialiseur pour le format .cfg généré par BepInEx (ConfigFile).
// Format typique :
//   [Section]
//   ## Description de la clé
//   # Setting type: Boolean
//   # Default value: true
//   MaClef = true
//
// Le parsing extrait la métadonnée (type, valeurs acceptables, plage) pour
// permettre un champ de formulaire adapté (case à cocher, liste déroulante,
// nombre borné) plutôt qu'un éditeur de texte brut — l'utilisateur ne peut
// modifier que la valeur, jamais le reste du fichier.
export interface CfgEntry {
  section: string;
  key: string;
  value: string;
  /** Index de la ligne "Clef = Valeur" dans le fichier original — sert à la réécriture ciblée. */
  lineIndex: number;
  description?: string;
  settingType?: string;
  defaultValue?: string;
  acceptableValues?: string[];
  range?: { min: number; max: number };
}

export interface ParsedCfg {
  entries: CfgEntry[];
  /** Lignes brutes du fichier original — la sérialisation ne modifie que les lignes de valeur. */
  lines: string[];
}

export function parseCfg(text: string): ParsedCfg {
  const lines = text.split(/\r?\n/);
  const entries: CfgEntry[] = [];

  let section = "";
  let descriptionParts: string[] = [];
  let pendingType: string | undefined;
  let pendingDefault: string | undefined;
  let pendingAcceptable: string[] | undefined;
  let pendingRange: { min: number; max: number } | undefined;

  const resetPending = (): void => {
    descriptionParts = [];
    pendingType = undefined;
    pendingDefault = undefined;
    pendingAcceptable = undefined;
    pendingRange = undefined;
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (trimmed === "") {
      resetPending();
      return;
    }

    const sectionMatch = trimmed.match(/^\[(.+)\]$/);
    if (sectionMatch) {
      section = sectionMatch[1];
      resetPending();
      return;
    }

    if (trimmed.startsWith("##")) {
      descriptionParts.push(trimmed.replace(/^##\s?/, ""));
      return;
    }

    if (trimmed.startsWith("#")) {
      const meta = trimmed.replace(/^#\s?/, "");
      const typeMatch = meta.match(/^Setting type:\s*(.+)$/i);
      const defaultMatch = meta.match(/^Default value:\s*(.+)$/i);
      const acceptableMatch = meta.match(/^Acceptable values:\s*(.+)$/i);
      const rangeMatch = meta.match(
        /^Acceptable value range:\s*From\s*(-?[\d.]+)\s*to\s*(-?[\d.]+)/i,
      );
      if (typeMatch) pendingType = typeMatch[1].trim();
      else if (defaultMatch) pendingDefault = defaultMatch[1].trim();
      else if (acceptableMatch)
        pendingAcceptable = acceptableMatch[1].split(",").map((v) => v.trim());
      else if (rangeMatch)
        pendingRange = {
          min: Number(rangeMatch[1]),
          max: Number(rangeMatch[2]),
        };
      return;
    }

    const eq = line.indexOf("=");
    if (eq <= 0) return;

    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim();
    entries.push({
      section,
      key,
      value,
      lineIndex: i,
      description: descriptionParts.length
        ? descriptionParts.join(" ")
        : undefined,
      settingType: pendingType,
      defaultValue: pendingDefault,
      acceptableValues: pendingAcceptable,
      range: pendingRange,
    });
    resetPending();
  });

  return { entries, lines };
}

// Ne réécrit que les lignes "Clef = Valeur" repérées au parsing — tout le
// reste du fichier (commentaires, sections, lignes non reconnues) est
// préservé tel quel.
export function serializeCfg(lines: string[], entries: CfgEntry[]): string {
  const out = [...lines];
  for (const entry of entries) {
    out[entry.lineIndex] = `${entry.key} = ${entry.value}`;
  }
  return out.join("\n");
}
