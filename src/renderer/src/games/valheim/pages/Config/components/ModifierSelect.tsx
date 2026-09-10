import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tooltip,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "react-i18next";

export default function ModifierSelect({
  label,
  description,
  value,
  options,
  labelPrefix,
  onChange,
}: {
  label: string;
  description?: string;
  value: string;
  options: string[];
  labelPrefix: string;
  onChange: (v: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <Stack direction="row" sx={{ alignItems: "flex-end", gap: 0.5 }}>
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
      {description && (
        <Tooltip title={description} arrow placement="top">
          <InfoOutlinedIcon
            sx={{
              fontSize: 16,
              color: "text.secondary",
              cursor: "help",
              mb: 1,
            }}
          />
        </Tooltip>
      )}
    </Stack>
  );
}
