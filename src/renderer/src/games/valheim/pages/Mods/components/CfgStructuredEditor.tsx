import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { CfgEntry } from "../utils/cfgParser";

interface Props {
  entries: CfgEntry[];
  onChange: (lineIndex: number, value: string) => void;
}

function FieldLabel({ entry }: { entry: CfgEntry }) {
  return (
    <Box sx={{ width: 200, flexShrink: 0 }}>
      <Typography
        variant="body2"
        sx={{ fontFamily: "monospace", overflowWrap: "break-word" }}
      >
        {entry.key}
      </Typography>
      {entry.description && (
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", overflowWrap: "break-word" }}
        >
          {entry.description}
        </Typography>
      )}
    </Box>
  );
}

function FieldControl({
  entry,
  onChange,
}: {
  entry: CfgEntry;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  const isBoolean = entry.settingType?.toLowerCase() === "boolean";
  const isEnum = !isBoolean && (entry.acceptableValues?.length ?? 0) > 0;
  const isNumeric = !isBoolean && !isEnum && entry.range !== undefined;

  const defaultLabel =
    entry.defaultValue !== undefined
      ? t("valheimMods.configs.default", { value: entry.defaultValue })
      : undefined;

  if (isBoolean) {
    return (
      <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
        <Switch
          size="small"
          checked={entry.value.toLowerCase() === "true"}
          onChange={(e) => onChange(e.target.checked ? "true" : "false")}
        />
        {defaultLabel && (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {defaultLabel}
          </Typography>
        )}
      </Stack>
    );
  }

  if (isEnum) {
    return (
      <FormControl size="small" sx={{ flex: 1 }}>
        <InputLabel>{entry.key}</InputLabel>
        <Select
          label={entry.key}
          value={entry.value}
          onChange={(e) => onChange(e.target.value)}
        >
          {entry.acceptableValues!.map((v) => (
            <MenuItem key={v} value={v}>
              {v}
            </MenuItem>
          ))}
        </Select>
        {defaultLabel && <FormHelperText>{defaultLabel}</FormHelperText>}
      </FormControl>
    );
  }

  const helperParts = [
    isNumeric ? `${entry.range!.min} – ${entry.range!.max}` : undefined,
    defaultLabel,
  ].filter(Boolean);

  return (
    <TextField
      size="small"
      type={isNumeric ? "number" : "text"}
      value={entry.value}
      onChange={(e) => onChange(e.target.value)}
      slotProps={
        isNumeric
          ? { htmlInput: { min: entry.range!.min, max: entry.range!.max } }
          : undefined
      }
      helperText={helperParts.length ? helperParts.join(" — ") : undefined}
      sx={{ flex: 1 }}
    />
  );
}

export default function CfgStructuredEditor({ entries, onChange }: Props) {
  const { t } = useTranslation();
  const sections = new Map<string, CfgEntry[]>();
  for (const entry of entries) {
    const list = sections.get(entry.section) ?? [];
    list.push(entry);
    sections.set(entry.section, list);
  }

  if (entries.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: "text.secondary", py: 2 }}>
        {t("valheimMods.configs.noEntries")}
      </Typography>
    );
  }

  return (
    <Stack spacing={3} sx={{ maxHeight: "60vh", overflowY: "auto", pr: 1 }}>
      {Array.from(sections.entries()).map(([section, sectionEntries]) => (
        <Box key={section || "_"}>
          {section && (
            <Typography
              variant="subtitle2"
              sx={{ color: "primary.main", mb: 1.5 }}
            >
              {section}
            </Typography>
          )}
          <Stack spacing={1.5}>
            {sectionEntries.map((entry) => (
              <Stack
                key={entry.lineIndex}
                direction="row"
                sx={{ alignItems: "flex-start", gap: 2 }}
              >
                <FieldLabel entry={entry} />
                <Box sx={{ flex: 1, minWidth: 0, display: "flex" }}>
                  <FieldControl
                    entry={entry}
                    onChange={(v) => onChange(entry.lineIndex, v)}
                  />
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
