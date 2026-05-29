import type { LaunchArgsConfig } from "../../../shared/types";
import type { PalConfigParser } from "./PalConfigParser";

const PERFORMANCE_FLAGS = [
  "-useperfthreads",
  "-NoAsyncLoadingThread",
  "-UseMultithreadForDS",
];

export const palworldServerConfig = {
  exeName: "PalServer.exe",

  buildArgs(cfg: LaunchArgsConfig): string[] {
    const args: string[] = [];
    if (cfg.publicLobby) args.push("-publiclobby");
    if (cfg.performanceFlags) args.push(...PERFORMANCE_FLAGS);
    const custom = cfg.customArgs.trim();
    if (custom) args.push(...custom.split(/\s+/));
    return args;
  },

  getStopConfig(serverPath: string, configParser: PalConfigParser) {
    const cfg = configParser.read(serverPath);
    return {
      restApiEnabled: cfg.RESTAPIEnabled === true,
      restApiPort: Number(cfg.RESTAPIPort ?? 8212),
      adminPassword: String(cfg.AdminPassword ?? ""),
      shutdownWaittime: 0,
      shutdownMessage: "",
    };
  },
};
