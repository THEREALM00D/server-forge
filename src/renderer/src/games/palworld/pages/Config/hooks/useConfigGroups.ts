import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { FIELD_GROUPS, type FieldGroup } from "../fields";

function filterGroups(
  groups: FieldGroup[],
  query: string,
  t: TFunction,
): FieldGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return groups;
  return groups
    .map((group) => {
      const groupLabel = t(group.labelKey).toLowerCase();
      const groupMatches = groupLabel.includes(q);
      const fields = group.fields.filter((f) => {
        if (groupMatches) return true;
        const label = t(`config.fields.${f.key}.label`, {
          defaultValue: f.key,
        }).toLowerCase();
        const description = t(`config.fields.${f.key}.description`, {
          defaultValue: "",
        }).toLowerCase();
        return (
          label.includes(q) ||
          f.key.toLowerCase().includes(q) ||
          description.includes(q)
        );
      });
      return { ...group, fields };
    })
    .filter((g) => g.fields.length > 0);
}

export function useConfigGroups() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const visibleGroups = useMemo(
    () => filterGroups(FIELD_GROUPS, search, t),
    [search, t],
  );

  useEffect(() => {
    if (search) {
      setExpandedGroups(new Set(visibleGroups.map((g) => g.labelKey)));
    }
  }, [search, visibleGroups]);

  const allExpanded =
    visibleGroups.length > 0 &&
    visibleGroups.every((g) => expandedGroups.has(g.labelKey));

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedGroups(new Set());
    } else {
      setExpandedGroups(new Set(visibleGroups.map((g) => g.labelKey)));
    }
  };

  const toggleGroup = (labelKey: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(labelKey)) next.delete(labelKey);
      else next.add(labelKey);
      return next;
    });
  };

  return {
    search,
    setSearch,
    visibleGroups,
    expandedGroups,
    allExpanded,
    toggleAll,
    toggleGroup,
  };
}
