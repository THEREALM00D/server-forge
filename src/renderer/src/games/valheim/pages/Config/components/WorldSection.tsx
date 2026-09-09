import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ValheimLaunchConfig } from "@shared/types";
import Section from "./Section";

export default function WorldSection({
  config,
  onChange,
}: {
  config: ValheimLaunchConfig;
  onChange: (patch: Partial<ValheimLaunchConfig>) => void;
}) {
  const { t } = useTranslation();
  return (
    <Section label={t("valheimConfig.sections.world")}>
      <TextField
        label={t("valheimConfig.fields.world.label")}
        helperText={t("valheimConfig.fields.world.description")}
        value={config.world}
        onChange={(e) => onChange({ world: e.target.value })}
        size="small"
        fullWidth
      />
      <TextField
        label={t("valheimConfig.fields.savedir.label")}
        helperText={t("valheimConfig.fields.savedir.description")}
        value={config.savedir}
        onChange={(e) => onChange({ savedir: e.target.value })}
        size="small"
        fullWidth
        placeholder="%LOCALAPPDATA%\..\LocalLow\IronGate\Valheim"
      />
      <TextField
        label={t("valheimConfig.fields.worldSeed.label")}
        helperText={t("valheimConfig.fields.worldSeed.description")}
        value={config.worldSeed}
        onChange={(e) => onChange({ worldSeed: e.target.value })}
        size="small"
        fullWidth
      />
      <FormControl size="small" sx={{ maxWidth: 280 }}>
        <InputLabel>{t("valheimConfig.fields.worldSize.label")}</InputLabel>
        <Select
          label={t("valheimConfig.fields.worldSize.label")}
          value={config.worldSize}
          onChange={(e) =>
            onChange({
              worldSize: e.target.value as typeof config.worldSize,
            })
          }
        >
          <MenuItem value="">
            {t("valheimConfig.fields.worldSize.default")}
          </MenuItem>
          <MenuItem value="small">
            {t("valheimConfig.fields.worldSize.small")}
          </MenuItem>
          <MenuItem value="medium">
            {t("valheimConfig.fields.worldSize.medium")}
          </MenuItem>
          <MenuItem value="large">
            {t("valheimConfig.fields.worldSize.large")}
          </MenuItem>
          <MenuItem value="yolo">
            {t("valheimConfig.fields.worldSize.yolo")}
          </MenuItem>
        </Select>
      </FormControl>
    </Section>
  );
}
