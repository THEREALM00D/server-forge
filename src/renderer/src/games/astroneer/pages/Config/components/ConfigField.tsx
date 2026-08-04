import {
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "react-i18next";
import type { FieldDef } from "../fields";

interface Props {
  field: FieldDef;
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
}

function FieldLabel({
  label,
  description,
  minWidth,
}: {
  label: string;
  description?: string;
  minWidth?: number;
}) {
  return (
    <Stack
      direction="row"
      sx={{ alignItems: "center", gap: 0.5, minWidth }}
      component="span"
    >
      <Typography variant="body2" component="span">
        {label}
      </Typography>
      {description && (
        <Tooltip title={description} arrow placement="top">
          <InfoOutlinedIcon
            sx={{ fontSize: 16, color: "text.secondary", cursor: "help" }}
          />
        </Tooltip>
      )}
    </Stack>
  );
}

export default function ConfigField({ field, value, onChange }: Props) {
  const { t } = useTranslation();
  const { key, type } = field;
  const label = t(`astroneerConfig.fields.${key}.label`, { defaultValue: key });
  const description = t(`astroneerConfig.fields.${key}.description`, {
    defaultValue: "",
  });

  if (type === "boolean") {
    return (
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
          />
        }
        label={<FieldLabel label={label} description={description} />}
        sx={{
          justifyContent: "space-between",
          ml: 0,
          flexDirection: "row-reverse",
        }}
      />
    );
  }

  return (
    <Stack direction="row" sx={{ alignItems: "center", gap: 2 }}>
      <FieldLabel label={label} description={description} minWidth={200} />
      <TextField
        size="small"
        type={type === "number" ? "number" : "text"}
        slotProps={{
          htmlInput: { step: type === "number" ? "any" : undefined },
        }}
        value={String(value ?? "")}
        onChange={(e) =>
          onChange(type === "number" ? Number(e.target.value) : e.target.value)
        }
        sx={{ flex: 1 }}
      />
    </Stack>
  );
}
