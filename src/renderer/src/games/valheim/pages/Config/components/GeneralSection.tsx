import { TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ValheimLaunchConfig } from "@shared/types";
import Section from "./Section";

export default function GeneralSection({
  config,
  onChange,
}: {
  config: ValheimLaunchConfig;
  onChange: (patch: Partial<ValheimLaunchConfig>) => void;
}) {
  const { t } = useTranslation();
  return (
    <Section label={t("valheimConfig.sections.general")}>
      <TextField
        label={t("valheimConfig.fields.name.label")}
        helperText={t("valheimConfig.fields.name.description")}
        value={config.name}
        onChange={(e) => onChange({ name: e.target.value })}
        size="small"
        fullWidth
      />
      <TextField
        label={t("valheimConfig.fields.password.label")}
        helperText={t("valheimConfig.fields.password.description")}
        value={config.password}
        onChange={(e) => onChange({ password: e.target.value })}
        size="small"
        fullWidth
        type="password"
      />
    </Section>
  );
}
