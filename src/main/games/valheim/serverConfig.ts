import type { ValheimLaunchConfig } from "../../../shared/types";

export const valheimServerConfig = {
  exeName: "valheim_server.exe",

  buildArgs(cfg: ValheimLaunchConfig): string[] {
    const args = ["-nographics", "-batchmode"];
    args.push("-name", cfg.name, "-world", cfg.world);
    args.push("-port", String(cfg.port));
    args.push("-public", cfg.public ? "1" : "0");
    if (cfg.password) args.push("-password", cfg.password);
    if (cfg.savedir) args.push("-savedir", cfg.savedir);
    if (cfg.crossplay) args.push("-crossplay");
    if (cfg.logFile) args.push("-logFile", cfg.logFile);
    if (cfg.worldSeed) args.push("-worldseed", cfg.worldSeed);
    if (cfg.worldSize) args.push("-worldsize", cfg.worldSize);
    const custom = cfg.customArgs.trim();
    if (custom) args.push(...custom.split(/\s+/));
    return args;
  },

  getStopConfig() {
    return {
      restApiEnabled: false,
      restApiPort: 0,
      adminPassword: "",
      shutdownWaittime: 0,
      shutdownMessage: "",
    };
  },
};
