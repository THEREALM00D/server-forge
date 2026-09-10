import type { ValheimModifiers } from "@shared/types";

export const MODIFIER_PRESETS: Record<string, ValheimModifiers> = {
  casual: {
    combat: "easy",
    deathpenalty: "casual",
    resources: "more",
    raids: "none",
    portals: "casual",
  },
  normal: {
    combat: "",
    deathpenalty: "",
    resources: "",
    raids: "",
    portals: "",
  },
  hard: {
    combat: "hard",
    deathpenalty: "hard",
    resources: "less",
    raids: "more",
    portals: "hard",
  },
  hardcore: {
    combat: "veryhard",
    deathpenalty: "hardcore",
    resources: "muchless",
    raids: "more",
    portals: "veryhard",
  },
};
