import { exec } from "child_process";
import { promisify } from "util";
import Store from "electron-store";

const execAsync = promisify(exec);

export interface FirewallPort {
  name: string;
  port: number;
  protocol: "TCP" | "UDP";
  active: boolean;
}

interface StoredCustomRule {
  name: string;
  port: number;
  protocol: "TCP" | "UDP";
}

interface FWStore {
  customRules: StoredCustomRule[];
}

const RULE_NAMES = {
  game: "Palworld Server - Game",
  rcon: "Palworld Server - RCON",
  restapi: "Palworld Server - REST API",
};

// Game port needs both TCP and UDP; other rules use a single protocol.
function getRuleName(
  key: keyof typeof RULE_NAMES,
  protocol: "TCP" | "UDP",
): string {
  return key === "game" ? `${RULE_NAMES.game} ${protocol}` : RULE_NAMES[key];
}

export class FirewallManager {
  private store = new Store<FWStore>({
    name: "firewall",
    defaults: { customRules: [] },
  });

  async isAdmin(): Promise<boolean> {
    try {
      await execAsync("net session", { timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  async getStatus(
    gamePort: number,
    rconPort: number,
    restApiPort: number,
  ): Promise<FirewallPort[]> {
    const targets = [
      {
        name: getRuleName("game", "UDP"),
        port: gamePort,
        protocol: "UDP" as const,
      },
      {
        name: getRuleName("game", "TCP"),
        port: gamePort,
        protocol: "TCP" as const,
      },
      { name: RULE_NAMES.rcon, port: rconPort, protocol: "TCP" as const },
      { name: RULE_NAMES.restapi, port: restApiPort, protocol: "TCP" as const },
    ];

    return Promise.all(
      targets.map(async (t) => ({
        ...t,
        active: await this.ruleExists(t.name),
      })),
    );
  }

  private async ruleExists(name: string): Promise<boolean> {
    try {
      const { stdout } = await execAsync(
        `netsh advfirewall firewall show rule name="${name}"`,
        { timeout: 5000 },
      );
      return !stdout.includes("No rules match");
    } catch (err: unknown) {
      const out = String((err as { stdout?: string })?.stdout ?? "");
      if (out.includes("No rules match")) return false;
      console.error("[FirewallManager] ruleExists:", name, err);
      return false;
    }
  }

  private async addRule(
    name: string,
    port: number,
    protocol: "TCP" | "UDP",
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await execAsync(
        `netsh advfirewall firewall add rule name="${name}" dir=in action=allow protocol=${protocol} localport=${port}`,
        { timeout: 10000 },
      );
      return { success: true };
    } catch (err) {
      const msg = String(err);
      if (msg.includes("5") || msg.toLowerCase().includes("access")) {
        return {
          success: false,
          error:
            "Droits administrateur requis. Relancez en tant qu'administrateur.",
        };
      }
      return { success: false, error: msg };
    }
  }

  private async deleteRule(
    name: string,
    protocol?: "TCP" | "UDP",
  ): Promise<void> {
    const protoArg = protocol ? ` protocol=${protocol}` : "";
    try {
      await execAsync(
        `netsh advfirewall firewall delete rule name="${name}"${protoArg}`,
        { timeout: 10000 },
      );
    } catch (err: unknown) {
      const out = String((err as { stdout?: string })?.stdout ?? "");
      if (!out.includes("No rules match")) {
        console.error("[FirewallManager] deleteRule:", name, err);
      }
    }
  }

  async enableRule(
    key: "game" | "rcon" | "restapi",
    port: number,
    protocol: "TCP" | "UDP",
  ): Promise<{ success: boolean; error?: string }> {
    const name = getRuleName(key, protocol);
    await this.deleteRule(name);
    return this.addRule(name, port, protocol);
  }

  async disableRule(
    key: "game" | "rcon" | "restapi",
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (key === "game") {
        await this.deleteRule(getRuleName("game", "UDP"));
        await this.deleteRule(getRuleName("game", "TCP"));
      } else {
        await this.deleteRule(RULE_NAMES[key]);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }

  async applyAll(
    gamePort: number,
    rconPort: number,
    restApiPort: number,
  ): Promise<{ success: boolean; errors: string[] }> {
    const rules: [keyof typeof RULE_NAMES, number, "TCP" | "UDP"][] = [
      ["game", gamePort, "UDP"],
      ["game", gamePort, "TCP"],
      ["rcon", rconPort, "TCP"],
      ["restapi", restApiPort, "TCP"],
    ];

    const errors: string[] = [];
    for (const [key, port, proto] of rules) {
      const res = await this.enableRule(key, port, proto);
      if (!res.success && res.error)
        errors.push(`${getRuleName(key, proto)}: ${res.error}`);
    }
    return { success: errors.length === 0, errors };
  }

  async removeAll(): Promise<void> {
    await this.deleteRule(getRuleName("game", "UDP"));
    await this.deleteRule(getRuleName("game", "TCP"));
    await this.deleteRule(RULE_NAMES.rcon);
    await this.deleteRule(RULE_NAMES.restapi);
  }

  async checkRule(name: string): Promise<boolean> {
    return this.ruleExists(name);
  }

  async enableNamedRule(
    name: string,
    port: number,
    protocol: "TCP" | "UDP",
  ): Promise<{ success: boolean; error?: string }> {
    await this.deleteRule(name, protocol);
    return this.addRule(name, port, protocol);
  }

  async disableNamedRule(
    name: string,
    protocol?: "TCP" | "UDP",
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.deleteRule(name, protocol);
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }

  async createCustomRule(
    name: string,
    port: number,
    protocol: "TCP" | "UDP",
  ): Promise<{ success: boolean; error?: string }> {
    const result = await this.addRule(name, port, protocol);
    if (result.success) {
      const existing = this.store.get("customRules");
      const alreadyStored = existing.some(
        (r) => r.name === name && r.protocol === protocol,
      );
      if (!alreadyStored) {
        this.store.set("customRules", [...existing, { name, port, protocol }]);
      }
    }
    return result;
  }

  async deleteCustomRule(
    name: string,
    protocol: "TCP" | "UDP",
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.deleteRule(name, protocol);
      const remaining = this.store
        .get("customRules")
        .filter((r) => !(r.name === name && r.protocol === protocol));
      this.store.set("customRules", remaining);
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }

  async listCustomRules(): Promise<FirewallPort[]> {
    const stored = this.store.get("customRules");
    return Promise.all(
      stored.map(async (r) => ({
        name: r.name,
        port: r.port,
        protocol: r.protocol,
        active: await this.ruleExists(r.name),
      })),
    );
  }
}
