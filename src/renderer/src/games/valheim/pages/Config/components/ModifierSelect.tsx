import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function ModifierSelect({
  label,
  value,
  options,
  labelPrefix,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  labelPrefix: string;
  onChange: (v: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <FormControl size="small" sx={{ minWidth: 160 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <MenuItem value="">{t("valheimConfig.modifiers.default")}</MenuItem>
        {options.map((opt) => (
          <MenuItem key={opt} value={opt}>
            {t(`${labelPrefix}.${opt}`)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
