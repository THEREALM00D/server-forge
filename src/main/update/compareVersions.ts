// Compare deux versions au format "X.Y.Z" ou "X.Y.Z-alphaN" (seul format
// utilisé par ServerForge pour l'instant). Une version sans suffixe de
// pre-release est considérée plus récente qu'une version avec le même
// X.Y.Z mais un suffixe (ex: "0.0.1" > "0.0.1-alpha7").
function parse(version: string): [number, number, number, number] {
  const clean = version.replace(/^v/, "");
  const [base, pre] = clean.split("-");
  const [major, minor, patch] = base
    .split(".")
    .map((n) => parseInt(n, 10) || 0);
  const preNum = pre ? parseInt(pre.replace(/\D/g, ""), 10) || 0 : Infinity;
  return [major, minor, patch, preNum];
}

/** > 0 si `a` est plus récente que `b`, < 0 si plus ancienne, 0 si égale. */
export function compareVersions(a: string, b: string): number {
  const pa = parse(a);
  const pb = parse(b);
  for (let i = 0; i < 4; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}
