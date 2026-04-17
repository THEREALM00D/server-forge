import { useCallback, useEffect, useState } from "react";
import { firewallService } from "../../../services/firewallService";
import { configService } from "../../../services/configService";
import type { FirewallRuleStatus } from "@shared/types";

export function useFirewall(serverPath: string) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rules, setRules] = useState<FirewallRuleStatus[]>([]);
  const [customRules, setCustomRules] = useState<FirewallRuleStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const getPorts = useCallback(async () => {
    if (!serverPath)
      return { gamePort: 8211, rconPort: 25575, restApiPort: 8212 };
    const cfg = await configService.readPalConfig();
    return {
      gamePort: Number(cfg.PublicPort ?? 8211),
      rconPort: Number(cfg.RCONPort ?? 25575),
      restApiPort: Number(cfg.RESTAPIPort ?? 8212),
    };
  }, [serverPath]);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [admin, { gamePort, rconPort, restApiPort }] = await Promise.all([
      firewallService.isAdmin(),
      getPorts(),
    ]);
    setIsAdmin(admin);
    const [status, custom] = await Promise.all([
      firewallService.getStatus(gamePort, rconPort, restApiPort),
      firewallService.listCustomRules(),
    ]);
    setRules(status);
    setCustomRules(custom);
    setLoading(false);
  }, [getPorts]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { isAdmin, rules, customRules, loading, refresh, getPorts };
}
