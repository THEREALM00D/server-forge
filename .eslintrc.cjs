module.exports = {
  extends: [
    "@electron-toolkit/eslint-config-ts/recommended",
    "@electron-toolkit/eslint-config-prettier",
  ],
  plugins: ["react-hooks"],
  rules: {
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    // Trop strict pour une base React/TSX existante (types de retour déjà
    // inférés correctement par TS) — désactivée plutôt que retro-annotée
    // sur ~300 fonctions.
    "@typescript-eslint/explicit-function-return-type": "off",
    // Seulement les 2 règles classiques (bugs réels : hooks conditionnels,
    // dépendances manquantes) — le reste du ruleset "recommended" v7 vise le
    // React Compiler (set-state-in-effect, immutability, purity...) et
    // signale en masse des patterns idiomatiques standards (fetch au mount,
    // reset de state à l'ouverture d'un dialog) qu'on n'utilise pas avec le
    // Compiler ici.
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
  },
};
