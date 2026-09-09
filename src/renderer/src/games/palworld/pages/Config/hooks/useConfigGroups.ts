import { useConfigGroups as useSharedConfigGroups } from "../../../../../components/config/useConfigGroups";
import { FIELD_GROUPS } from "../fields";

export function useConfigGroups() {
  return useSharedConfigGroups(FIELD_GROUPS, "config.fields");
}
