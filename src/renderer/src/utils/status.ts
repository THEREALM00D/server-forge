import type { ServerStatus } from "@shared/types";

export const STATUS_COLOR: Record<
  ServerStatus,
  "success" | "warning" | "error" | "default"
> = {
  running: "success",
  starting: "warning",
  stopping: "warning",
  crashed: "error",
  stopped: "default",
};
