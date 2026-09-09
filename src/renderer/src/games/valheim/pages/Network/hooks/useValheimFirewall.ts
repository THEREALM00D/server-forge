import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../../../../context/NotificationContext";
import type { FirewallRuleStatus } from "@shared/types";

const RULE_NAMES = (gamePort: number) => [
  { name: "Valheim Server - Game", port: gamePort, protocol: "UDP" as const },
  {
    name: "Valheim Server - Query",
    port: gamePort + 1,
    protocol: "UDP" as const,
  },
];

export function useValheimFirewall(gamePort: number) {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rules, setRules] = useState<FirewallRuleStatus[]>([]);
  const [customRules, setCustomRules] = useState<FirewallRuleStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [admin, custom] = await Promise.all([
        window.api.firewall.isAdmin(),
        window.api.firewall.listCustomRules(),
      ]);
      setIsAdmin(admin);
      const ruleStatuses = await Promise.all(
        RULE_NAMES(gamePort).map(async (r) => ({
          ...r,
          active: await window.api.firewall.checkRule(r.name),
        })),
      );
      setRules(ruleStatuses);
      setCustomRules(custom);
    } catch (e) {
      notify((e as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }, [gamePort, notify]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onToggle = useCallback(
    async (rule: FirewallRuleStatus) => {
      try {
        if (rule.active) {
          const res = await window.api.firewall.disableNamedRule(
            rule.name,
            rule.protocol,
          );
          if (!res.success) notify(res.error ?? t("common.error"), "error");
          else
            notify(
              t("network.standard.ruleRemoved", { name: rule.name }),
              "success",
            );
        } else {
          const res = await window.api.firewall.enableNamedRule(
            rule.name,
            rule.port,
            rule.protocol,
          );
          if (!res.success) notify(res.error ?? t("common.error"), "error");
          else
            notify(
              t("network.standard.ruleAdded", { name: rule.name }),
              "success",
            );
        }
      } catch (e) {
        notify((e as Error).message, "error");
      }
    },
    [notify, t],
  );

  const onApplyAll = useCallback(async () => {
    try {
      const results = await Promise.all(
        RULE_NAMES(gamePort).map((r) =>
          window.api.firewall.enableNamedRule(r.name, r.port, r.protocol),
        ),
      );
      const errors = results
        .map((r, i) =>
          r.success
            ? null
            : `${RULE_NAMES(gamePort)[i].name}: ${r.error ?? ""}`,
        )
        .filter(Boolean);
      if (errors.length) notify(errors.join("\n"), "error");
      else notify(t("network.standard.allApplied"), "success");
    } catch (e) {
      notify((e as Error).message, "error");
    }
  }, [gamePort, notify, t]);

  const onRemoveAll = useCallback(async () => {
    try {
      const results = await Promise.all(
        RULE_NAMES(gamePort).map((r) =>
          window.api.firewall.disableNamedRule(r.name, r.protocol),
        ),
      );
      const errors = results
        .map((r, i) =>
          r.success
            ? null
            : `${RULE_NAMES(gamePort)[i].name}: ${r.error ?? ""}`,
        )
        .filter(Boolean);
      if (errors.length) notify(errors.join("\n"), "error");
      else notify(t("network.standard.allRemoved"), "info");
    } catch (e) {
      notify((e as Error).message, "error");
    }
  }, [gamePort, notify, t]);

  return {
    isAdmin,
    rules,
    customRules,
    loading,
    refresh,
    onToggle,
    onApplyAll,
    onRemoveAll,
  };
}
